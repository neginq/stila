import {
    ClothingSlot,
    ColorFamily,
    ExplorationLevel,
    FormalityLevel,
    WardrobeItemType,
} from "../../generated/prisma/client"
import { assignColorsToSlots, buildOutfitPalette } from "./color"
import type { RecommendationContext } from "./context"
import { isOwnedWardrobeItem, type ScoredItem } from "./item-scorer"
import type { OutfitTemplate } from "./templates"

const CANDIDATES_PER_SLOT = 4
const MAX_OUTFIT_CANDIDATES = 24

const FORMALITY_ORDER: FormalityLevel[] = [
    FormalityLevel.VERY_CASUAL,
    FormalityLevel.MOSTLY_CASUAL,
    FormalityLevel.BALANCED,
    FormalityLevel.SMART_CASUAL,
    FormalityLevel.FORMAL,
]
/**
 * Ceiling on the raw cartesian product before diversity filtering. Sized to hold
 * the entire product for the most demanding template (four required slots), so
 * the option-budget trimming acts purely as a safety valve if the caps grow.
 */
const MAX_RAW_COMBINATIONS = CANDIDATES_PER_SLOT ** 4

export type AssembledOutfitItem = {
    scored: ScoredItem
    slot: ClothingSlot
    colorFamily: ColorFamily
    isOwnedReuse: boolean
}

export type AssembledOutfit = {
    items: AssembledOutfitItem[]
    /** Average of the selected items' individual scores. */
    itemScoreAverage: number
    reasons: string[]
}

/** Groups scored items by clothing slot (top, bottom, shoes, etc.). */
function groupBySlot(scoredItems: ScoredItem[]): Map<ClothingSlot, ScoredItem[]> {
    const map = new Map<ClothingSlot, ScoredItem[]>()
    for (const scored of scoredItems) {
        const slot = scored.item.slot
        const list = map.get(slot) ?? []
        list.push(scored)
        map.set(slot, list)
    }
    return map
}

/** Returns true when the session prefers reusing owned wardrobe items over all-new pieces. */
function prefersWardrobeReuse(ctx: RecommendationContext): boolean {
    if (ctx.wardrobeItems.includes(WardrobeItemType.PREFER_ALL_NEW)) {
        return false
    }
    if (ctx.wardrobeItems.length === 0) {
        return false
    }
    return (
        ctx.explorationLevel === ExplorationLevel.FAMILIAR ||
        ctx.explorationLevel === ExplorationLevel.UNSURE ||
        ctx.explorationLevel === ExplorationLevel.SLIGHTLY_NEW ||
        ctx.explorationLevel === ExplorationLevel.MIXED
    )
}

/**
 * Rank slot candidates: when reuse is preferred, owned wardrobe types float upward
 * without discarding higher-scoring new pieces entirely.
 */
function rankSlotCandidates(
    candidates: ScoredItem[],
    ctx: RecommendationContext,
): ScoredItem[] {
    const reuse = prefersWardrobeReuse(ctx)
    return [...candidates].sort((a, b) => {
        if (reuse) {
            const aOwned = isOwnedWardrobeItem(a.item, ctx) ? 1 : 0
            const bOwned = isOwnedWardrobeItem(b.item, ctx) ? 1 : 0
            if (aOwned !== bOwned) {
                return bOwned - aOwned
            }
        }
        return b.score - a.score || a.item.id - b.item.id
    })
}

function formalityDistance(a: FormalityLevel, b: FormalityLevel): number {
    return Math.abs(FORMALITY_ORDER.indexOf(a) - FORMALITY_ORDER.indexOf(b))
}

/**
 * Best formality match in this slot for the session target.
 * chooses compatible pieces (forexxmaple formal shoes for FORMAL requests).
 */
function bestFormalityMatch(
    candidates: ScoredItem[],
    target: FormalityLevel,
): ScoredItem | null {
    if (candidates.length === 0) {
        return null
    }
    return [...candidates].sort((a, b) => {
        const distanceDiff =
            formalityDistance(a.item.formality, target) -
            formalityDistance(b.item.formality, target)
        if (distanceDiff !== 0) {
            return distanceDiff
        }
        return b.score - a.score || a.item.id - b.item.id
    })[0]!
}

/** Returns the top-ranked candidates for a single clothing slot. */
function pickTopForSlot(
    bySlot: Map<ClothingSlot, ScoredItem[]>,
    slot: ClothingSlot,
    ctx: RecommendationContext,
): ScoredItem[] {
    const candidates = bySlot.get(slot) ?? []
    if (candidates.length === 0) {
        return []
    }

    const ranked = rankSlotCandidates(candidates, ctx)
    if (ctx.formalityLevel === null) {
        return ranked.slice(0, CANDIDATES_PER_SLOT)
    }

    const picked: ScoredItem[] = []
    const seenIds = new Set<number>()

    const anchor = bestFormalityMatch(candidates, ctx.formalityLevel)
    if (anchor) {
        picked.push(anchor)
        seenIds.add(anchor.item.id)
    }

    for (const candidate of ranked) {
        if (picked.length >= CANDIDATES_PER_SLOT) {
            break
        }
        if (seenIds.has(candidate.item.id)) {
            continue
        }
        picked.push(candidate)
        seenIds.add(candidate.item.id)
    }

    return picked
}

/**
 * Caps how many ranked options each slot may contribute so the complete product
 * fits inside the limit. Trimming the widest slot keeps variety spread across
 * slots instead of starving one, and ties resolve toward the later slots so the
 * more prominent early slots (top, bottom) keep their choices longest.
 */
function allocateOptionBudget(optionCounts: number[], limit: number): number[] {
    const budget = [...optionCounts]
    const product = (): number => budget.reduce((total, count) => total * count, 1)

    while (product() > limit) {
        let widest = 0
        let widestCount = budget[0] ?? 0
        for (let index = 1; index < budget.length; index += 1) {
            const count = budget[index] ?? 0
            if (count >= widestCount) {
                widest = index
                widestCount = count
            }
        }
        if (widestCount <= 1) {
            break
        }
        budget[widest] = widestCount - 1
    }

    return budget
}

/**
 * Builds the cartesian product of slot options, bounded by trimming each slot's
 * option count rather than by cutting the expansion short. Stopping mid-expansion
 * would emit combinations that never received their remaining slots, so every
 * combination returned here covers every slot it was asked for.
 */
function cartesianLimited(
    slotLists: { slot: ClothingSlot; options: ScoredItem[] }[],
    limit: number,
): { slot: ClothingSlot; scored: ScoredItem }[][] {
    if (slotLists.length === 0) {
        return []
    }
    if (slotLists.some((entry) => entry.options.length === 0)) {
        return []
    }

    const budget = allocateOptionBudget(
        slotLists.map((entry) => entry.options.length),
        limit,
    )

    let combinations: { slot: ClothingSlot; scored: ScoredItem }[][] = [[]]

    for (const [index, entry] of slotLists.entries()) {
        const allowed = entry.options.slice(0, budget[index] ?? entry.options.length)
        const next: { slot: ClothingSlot; scored: ScoredItem }[][] = []
        for (const partial of combinations) {
            for (const option of allowed) {
                next.push([...partial, { slot: entry.slot, scored: option }])
            }
        }
        combinations = next
    }

    return combinations
}

/** Builds a stable id string from the sorted item ids in a combination. */
function outfitSignature(parts: { scored: ScoredItem }[]): string {
    return parts
        .map((part) => part.scored.item.id)
        .sort((a, b) => a - b)
        .join("-")
}

/** Rejects a combination that is nearly identical to an already accepted outfit. */
function isDiverseEnough(
    candidate: { scored: ScoredItem }[],
    accepted: { scored: ScoredItem }[][],
): boolean {
    if (accepted.length === 0) {
        return true
    }
    const candidateTypes = new Set(candidate.map((part) => part.scored.item.itemType))
    for (const existing of accepted) {
        const existingTypes = new Set(existing.map((part) => part.scored.item.itemType))
        let shared = 0
        for (const type of candidateTypes) {
            if (existingTypes.has(type)) {
                shared += 1
            }
        }
        const overlapRatio = shared / Math.max(candidateTypes.size, 1)
        // Reject near-duplicates that reuse almost the same garment types
        if (overlapRatio >= 0.8) {
            const sharedIds = candidate.filter((part) =>
                existing.some((e) => e.scored.item.id === part.scored.item.id),
            ).length
            if (sharedIds >= candidate.length - 1) {
                return false
            }
        }
    }
    return true
}

/** Adds the best optional-slot item if it scores well enough versus the required pieces. */
function maybeAddOptionalSlot(
    base: { slot: ClothingSlot; scored: ScoredItem }[],
    optionalSlot: ClothingSlot,
    bySlot: Map<ClothingSlot, ScoredItem[]>,
    ctx: RecommendationContext,
    usedIds: Set<number>,
): { slot: ClothingSlot; scored: ScoredItem }[] {
    const options = pickTopForSlot(bySlot, optionalSlot, ctx).filter(
        (option) => !usedIds.has(option.item.id),
    )
    if (options.length === 0) {
        return base
    }
    // Only add optional if it scores reasonably vs required average
    const requiredAvg =
        base.reduce((sum, part) => sum + part.scored.score, 0) / Math.max(base.length, 1)
    const best = options[0]!
    if (best.score < requiredAvg * 0.45) {
        return base
    }
    return [...base, { slot: optionalSlot, scored: best }]
}

/** Build candidate outfits from scored items + template. */
export function assembleCandidateOutfits(
    scoredItems: ScoredItem[],
    ctx: RecommendationContext,
    template: OutfitTemplate,
): AssembledOutfit[] {
    const bySlot = groupBySlot(scoredItems)
    const palette = buildOutfitPalette(ctx)

    const requiredLists = template.required.map((slot) => ({
        slot,
        options: pickTopForSlot(bySlot, slot, ctx),
    }))

    if (requiredLists.some((entry) => entry.options.length === 0)) {
        return []
    }

    const rawCombos = cartesianLimited(requiredLists, MAX_RAW_COMBINATIONS)
    const acceptedCombos: { slot: ClothingSlot; scored: ScoredItem }[][] = []
    const seenSignatures = new Set<string>()

    for (const combo of rawCombos) {
        const signature = outfitSignature(combo)
        if (seenSignatures.has(signature)) {
            continue
        }
        if (!isDiverseEnough(combo, acceptedCombos)) {
            continue
        }
        seenSignatures.add(signature)

        const usedIds = new Set(combo.map((part) => part.scored.item.id))
        let expanded = combo
        for (const optionalSlot of template.optional) {
            expanded = maybeAddOptionalSlot(expanded, optionalSlot, bySlot, ctx, usedIds)
            for (const part of expanded) {
                usedIds.add(part.scored.item.id)
            }
        }

        acceptedCombos.push(expanded)
        if (acceptedCombos.length >= MAX_OUTFIT_CANDIDATES) {
            break
        }
    }

    return acceptedCombos.map((combo) => {
        const slots = combo.map((part) => part.slot)
        const colors = assignColorsToSlots(slots, palette)
        const reasons: string[] = []
        let ownedCount = 0

        const items: AssembledOutfitItem[] = combo.map((part) => {
            const isOwnedReuse = isOwnedWardrobeItem(part.scored.item, ctx)
            if (isOwnedReuse) {
                ownedCount += 1
            }
            return {
                scored: part.scored,
                slot: part.slot,
                colorFamily: colors[part.slot],
                isOwnedReuse,
            }
        })

        if (ownedCount > 0) {
            reasons.push(`wardrobe_reuse_${ownedCount}`)
        }
        for (const part of combo) {
            reasons.push(...part.scored.reasons.map((r) => `${part.slot.toLowerCase()}:${r}`))
        }

        const itemScoreAverage =
            items.reduce((sum, entry) => sum + entry.scored.score, 0) / Math.max(items.length, 1)

        return {
            items,
            itemScoreAverage,
            reasons,
        }
    })
}
