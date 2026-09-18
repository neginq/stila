import {
    ClothingSlot,
    OutfitIntent,
    type ClothingItem,
    type NoveltyLevel,
} from "../../generated/prisma/client"
import {
    evaluateOutfitCompatibility,
    outfitNoveltyLevel,
    rankCompatibleOutfits,
    type RankedOutfit,
} from "./compatibility"
import type { RecommendationContext } from "./context"
import { applyHardFilters } from "./filters"
import { scoreItems, type ScoredItem } from "./item-scorer"
import { assembleCandidateOutfits, type AssembledOutfit } from "./outfit-assembler"
import { resolveOutfitTemplate, type OutfitTemplate } from "./templates"

export type RecommendedOutfit = {
    rank: 1 | 2 | 3
    intent: OutfitIntent
    score: number
    noveltyLevel: NoveltyLevel
    explanation: string
    items: RankedOutfit["items"]
    reasons: string[]
}

export type OutfitAssemblyFailure = {
    cause: "empty_required_slot" | "all_candidates_vetoed"
    requiredSlots: ClothingSlot[]
    remainingBySlot: Partial<Record<ClothingSlot, number>>
    filteredItemCount: number
    /** Required slots with zero items after hard filters. Empty when cause is all_candidates_vetoed. */
    missingSlots: ClothingSlot[]
    /** Combinations the assembler produced. Zero when a required slot was empty. */
    candidateCount: number
    /** Distinct formality-veto labels. Empty when no candidates were built. */
    vetoReasons: string[]
}

export type RecommendResult = {
    outfits: RecommendedOutfit[]
    /** Set only when `outfits` is empty; names which choke point produced the miss. */
    failure: OutfitAssemblyFailure | null
}

/** Builds a Persian explanation of why this outfit was chosen for the given intent. */
function buildExplanation(outfit: RankedOutfit, intent: OutfitIntent): string {
    const parts: string[] = []

    if (intent === OutfitIntent.BEST_MATCH) {
        parts.push("بهترین تطبیق کلی با مناسبت، استایل و ترجیحات شما.")
    } else if (intent === OutfitIntent.ALTERNATIVE) {
        parts.push("گزینه‌ای جایگزین و قوی با ترکیب متفاوتی از لباس‌ها.")
    } else {
        parts.push("گزینه‌ای جسورانه‌تر که به امتحان چیزی جدید نزدیک‌تر است.")
    }

    const owned = outfit.items.filter((item) => item.isOwnedReuse).length
    if (owned > 0) {
        parts.push(`از ${owned} نوع لباس موجود در پاسخ‌های کمد شما دوباره استفاده می‌کند.`)
    }

    if (outfit.compatibilityReasons.includes("formality_coherent")) {
        parts.push("قطعات از نظر رسمیت هماهنگ‌اند و به‌عنوان یک استایل واحد کار می‌کنند.")
    }
    if (outfit.compatibilityReasons.includes("style_coherent")) {
        parts.push("استایل قطعات در کل ست هماهنگ است.")
    }
    if (outfit.compatibilityReasons.some((reason) => reason.startsWith("exploration"))) {
        parts.push("سطح تازگی با میزان جسارتی که می‌خواستید هم‌خوان است.")
    }

    return parts.join(" ")
}

/** Returns true when two outfits share enough items to count as near-duplicates. */
function sharesTooManyItems(a: RankedOutfit, b: RankedOutfit): boolean {
    const aIds = new Set(a.items.map((entry) => entry.scored.item.id))
    let shared = 0
    for (const entry of b.items) {
        if (aIds.has(entry.scored.item.id)) {
            shared += 1
        }
    }
    return shared >= Math.max(2, Math.ceil(a.items.length * 0.6))
}

/** Picks up to three outfits labeled BEST_MATCH, ALTERNATIVE, and ADVENTUROUS. */
function pickTopThreeIntents(ranked: RankedOutfit[]): RecommendedOutfit[] {
    if (ranked.length === 0) {
        return []
    }

    const best = ranked[0]!
    const selected: { outfit: RankedOutfit; intent: OutfitIntent }[] = [
        { outfit: best, intent: OutfitIntent.BEST_MATCH },
    ]

    // Alternative: next best that is not nearly identical
    const alternative = ranked.find(
        (outfit, index) => index > 0 && !sharesTooManyItems(best, outfit),
    )
    if (alternative) {
        selected.push({ outfit: alternative, intent: OutfitIntent.ALTERNATIVE })
    } else if (ranked[1]) {
        selected.push({ outfit: ranked[1], intent: OutfitIntent.ALTERNATIVE })
    }

    // Adventurous: highest novelty among remaining, else next best unused
    const used = new Set(selected.map((entry) => entry.outfit.items.map((i) => i.scored.item.id).join("-")))
    const remaining = ranked.filter((outfit) => {
        const key = outfit.items.map((i) => i.scored.item.id).join("-")
        return !used.has(key)
    })

    const adventurous =
        [...remaining].sort((a, b) => {
            const noveltyOrder = ["FAMILIAR", "SLIGHTLY_NEW", "MIXED", "CREATIVE", "BOLD"]
            return (
                noveltyOrder.indexOf(outfitNoveltyLevel(b)) -
                noveltyOrder.indexOf(outfitNoveltyLevel(a)) ||
                b.finalScore - a.finalScore
            )
        })[0] ?? remaining[0]

    if (adventurous) {
        selected.push({ outfit: adventurous, intent: OutfitIntent.ADVENTUROUS })
    }

    return selected.slice(0, 3).map((entry, index) => ({
        rank: (index + 1) as 1 | 2 | 3,
        intent: entry.intent,
        score: entry.outfit.finalScore,
        noveltyLevel: outfitNoveltyLevel(entry.outfit),
        explanation: buildExplanation(entry.outfit, entry.intent),
        items: entry.outfit.items,
        reasons: entry.outfit.reasons,
    }))
}

/** Counts scored items still available for each required template slot. */
function remainingRequiredBySlot(
    scored: ScoredItem[],
    required: ClothingSlot[],
): Partial<Record<ClothingSlot, number>> {
    const remaining: Partial<Record<ClothingSlot, number>> = {}
    for (const slot of required) {
        remaining[slot] = 0
    }
    for (const entry of scored) {
        const slot = entry.item.slot
        const current = remaining[slot]
        if (current !== undefined) {
            remaining[slot] = current + 1
        }
    }
    return remaining
}

/**
 * Names the choke point that left the pipeline with zero outfits.
 * Ranking is unchanged; compatibility is re-read only to collect veto labels.
 */
function diagnoseEmptyResult(
    filteredItemCount: number,
    scored: ScoredItem[],
    template: OutfitTemplate,
    candidates: AssembledOutfit[],
    ctx: RecommendationContext,
): OutfitAssemblyFailure {
    const remainingBySlot = remainingRequiredBySlot(scored, template.required)
    const missingSlots = template.required.filter((slot) => (remainingBySlot[slot] ?? 0) === 0)

    if (missingSlots.length > 0 || candidates.length === 0) {
        return {
            cause: "empty_required_slot",
            requiredSlots: [...template.required],
            remainingBySlot,
            filteredItemCount,
            missingSlots,
            candidateCount: 0,
            vetoReasons: [],
        }
    }

    const vetoReasons = [
        ...new Set(
            candidates
                .map((outfit) => evaluateOutfitCompatibility(outfit, ctx))
                .filter((outfit) => outfit.vetoed)
                .flatMap((outfit) => outfit.vetoReasons),
        ),
    ].sort()

    return {
        cause: "all_candidates_vetoed",
        requiredSlots: [...template.required],
        remainingBySlot,
        filteredItemCount,
        missingSlots: [],
        candidateCount: candidates.length,
        vetoReasons,
    }
}

/**
 * In-memory recommendation pipeline (no HTTP / persistence yet).
 */
export function recommendOutfits(
    catalog: ClothingItem[],
    ctx: RecommendationContext,
): RecommendResult {
    const filtered = applyHardFilters(catalog, ctx)
    const scored = scoreItems(filtered, ctx)
    const template = resolveOutfitTemplate(ctx)
    const candidates = assembleCandidateOutfits(scored, ctx, template)
    const ranked = rankCompatibleOutfits(candidates, ctx)
    const outfits = pickTopThreeIntents(ranked)

    return {
        outfits,
        failure:
            outfits.length === 0
                ? diagnoseEmptyResult(filtered.length, scored, template, candidates, ctx)
                : null,
    }
}
