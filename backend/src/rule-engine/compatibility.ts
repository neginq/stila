import {
    ClothingSlot,
    ExplorationLevel,
    FormalityLevel,
    NoveltyLevel,
    Season,
} from "../../generated/prisma/client"
import type { RecommendationContext } from "./context"
import type { AssembledOutfit } from "./outfit-assembler"

const FORMALITY_ORDER: FormalityLevel[] = [
    FormalityLevel.VERY_CASUAL,
    FormalityLevel.MOSTLY_CASUAL,
    FormalityLevel.BALANCED,
    FormalityLevel.SMART_CASUAL,
    FormalityLevel.FORMAL,
]

const NOVELTY_ORDER: NoveltyLevel[] = [
    NoveltyLevel.FAMILIAR,
    NoveltyLevel.SLIGHTLY_NEW,
    NoveltyLevel.MIXED,
    NoveltyLevel.CREATIVE,
    NoveltyLevel.BOLD,
]

/** Extreme formality gap (e.g. sneakers + formal suit) — hard veto. */
const FORMALITY_HARD_VETO_DISTANCE = 3

export type RankedOutfit = AssembledOutfit & {
    compatibilityScore: number
    wardrobeReuseBonus: number
    explorationMatchBonus: number
    finalScore: number
    vetoed: boolean
    vetoReasons: string[]
    compatibilityReasons: string[]
}

/** Returns how many steps apart two formality levels are on the ordered scale. */
function formalityDistance(a: FormalityLevel, b: FormalityLevel): number {
    return Math.abs(FORMALITY_ORDER.indexOf(a) - FORMALITY_ORDER.indexOf(b))
}

/** Returns how many steps apart two novelty levels are on the ordered scale. */
function noveltyDistance(a: NoveltyLevel, b: NoveltyLevel): number {
    return Math.abs(NOVELTY_ORDER.indexOf(a) - NOVELTY_ORDER.indexOf(b))
}

/** Maps the user's exploration preference to a target novelty level. */
function explorationToNovelty(level: ExplorationLevel): NoveltyLevel {
    switch (level) {
        case ExplorationLevel.FAMILIAR:
        case ExplorationLevel.UNSURE:
            return NoveltyLevel.FAMILIAR
        case ExplorationLevel.SLIGHTLY_NEW:
            return NoveltyLevel.SLIGHTLY_NEW
        case ExplorationLevel.MIXED:
            return NoveltyLevel.MIXED
        case ExplorationLevel.CREATIVE:
            return NoveltyLevel.CREATIVE
        case ExplorationLevel.BOLD:
            return NoveltyLevel.BOLD
        default:
            return NoveltyLevel.MIXED
    }
}

/** Returns the outfit's main garments (top, bottom, outerwear, shoes), excluding accessories. */
function mainGarments(outfit: AssembledOutfit) {
    return outfit.items.filter(
        (entry) =>
            entry.slot === ClothingSlot.TOP ||
            entry.slot === ClothingSlot.BOTTOM ||
            entry.slot === ClothingSlot.OUTERWEAR ||
            entry.slot === ClothingSlot.SHOES,
    )
}

/**
 * Hard veto: any two main garments whose formality differs by >= 3 steps.
 * Example: FORMAL blazer vs VERY_CASUAL sneakers.
 */
function hasFormalityHardVeto(outfit: AssembledOutfit): string | null {
    const garments = mainGarments(outfit)
    for (let i = 0; i < garments.length; i++) {
        for (let j = i + 1; j < garments.length; j++) {
            const a = garments[i]!
            const b = garments[j]!
            const distance = formalityDistance(a.scored.item.formality, b.scored.item.formality)
            if (distance >= FORMALITY_HARD_VETO_DISTANCE) {
                return `formality_clash:${a.slot}/${b.slot}`
            }
        }
    }
    return null
}

/** Scores how closely the main garments match each other in formality. */
function scoreFormalityConsistency(outfit: AssembledOutfit): { points: number; reason?: string } {
    const garments = mainGarments(outfit)
    if (garments.length < 2) {
        return { points: 10 }
    }
    let totalDistance = 0
    let pairs = 0
    for (let i = 0; i < garments.length; i++) {
        for (let j = i + 1; j < garments.length; j++) {
            totalDistance += formalityDistance(
                garments[i]!.scored.item.formality,
                garments[j]!.scored.item.formality,
            )
            pairs += 1
        }
    }
    const avg = totalDistance / Math.max(pairs, 1)
    if (avg === 0) {
        return { points: 20, reason: "formality_coherent" }
    }
    if (avg <= 1) {
        return { points: 12, reason: "formality_near" }
    }
    if (avg <= 1.5) {
        return { points: 5, reason: "formality_loose" }
    }
    return { points: 0 }
}

/** Scores how often garment pairs share at least one style tag. */
function scoreStyleCoherence(outfit: AssembledOutfit): { points: number; reason?: string } {
    const styleSets = outfit.items
        .filter((entry) => entry.slot !== ClothingSlot.ACCESSORY)
        .map((entry) => new Set(entry.scored.item.styles))
    if (styleSets.length < 2) {
        return { points: 8 }
    }

    let sharedPairs = 0
    let pairs = 0
    for (let i = 0; i < styleSets.length; i++) {
        for (let j = i + 1; j < styleSets.length; j++) {
            pairs += 1
            const a = styleSets[i]!
            const b = styleSets[j]!
            for (const style of a) {
                if (b.has(style)) {
                    sharedPairs += 1
                    break
                }
            }
        }
    }
    const ratio = sharedPairs / Math.max(pairs, 1)
    if (ratio >= 0.66) {
        return { points: 15, reason: "style_coherent" }
    }
    if (ratio >= 0.33) {
        return { points: 8, reason: "style_partial" }
    }
    return { points: 0 }
}

/** Scores how many garments are tagged for the requested season (or all-season). */
function scoreSeasonConsistency(
    outfit: AssembledOutfit,
    ctx: RecommendationContext,
): { points: number; reason?: string } {
    const garments = outfit.items.filter((entry) => entry.slot !== ClothingSlot.ACCESSORY)
    let matching = 0
    for (const entry of garments) {
        const seasons = entry.scored.item.seasons
        if (seasons.includes(Season.ALL_SEASON) || seasons.includes(ctx.season)) {
            matching += 1
        }
    }
    const ratio = matching / Math.max(garments.length, 1)
    if (ratio === 1) {
        return { points: 10, reason: "season_consistent" }
    }
    if (ratio >= 0.66) {
        return { points: 5, reason: "season_mostly_ok" }
    }
    return { points: 0 }
}

/** Scores whether top and bottom fits align or form a complementary contrast. */
function scoreFitBalance(outfit: AssembledOutfit): { points: number; reason?: string } {
    const top = outfit.items.find((entry) => entry.slot === ClothingSlot.TOP)
    const bottom = outfit.items.find((entry) => entry.slot === ClothingSlot.BOTTOM)
    if (!top || !bottom) {
        return { points: 5 }
    }
    // Complementary extremes are fine (loose top + fitted bottom); identical extremes also ok.
    // Penalize only chaotic mismatch of fitted outer signals later — keep soft for v1.
    if (top.scored.item.fit === bottom.scored.item.fit) {
        return { points: 8, reason: "fit_aligned" }
    }
    return { points: 10, reason: "fit_balanced_contrast" }
}

/** Scores how well the outfit's average novelty matches the user's exploration level. */
function scoreOutfitNovelty(
    outfit: AssembledOutfit,
    ctx: RecommendationContext,
): { points: number; novelty: NoveltyLevel; reason?: string } {
    const garments = mainGarments(outfit)
    const indices = garments.map((entry) => NOVELTY_ORDER.indexOf(entry.scored.item.novelty))
    const avgIndex = Math.round(
        indices.reduce((sum, value) => sum + value, 0) / Math.max(indices.length, 1),
    )
    const outfitNovelty = NOVELTY_ORDER[Math.min(Math.max(avgIndex, 0), NOVELTY_ORDER.length - 1)]!
    const target = explorationToNovelty(ctx.explorationLevel)
    const distance = noveltyDistance(outfitNovelty, target)
    if (distance === 0) {
        return { points: 10, novelty: outfitNovelty, reason: "exploration_match" }
    }
    if (distance === 1) {
        return { points: 5, novelty: outfitNovelty, reason: "exploration_near" }
    }
    return { points: 0, novelty: outfitNovelty }
}

/** Awards bonus points when the outfit reuses items the user already owns. */
function wardrobeReuseBonus(outfit: AssembledOutfit): { points: number; reason?: string } {
    const owned = outfit.items.filter((entry) => entry.isOwnedReuse).length
    if (owned <= 0) {
        return { points: 0 }
    }
    const points = Math.min(15, owned * 6)
    return { points, reason: `wardrobe_reuse_bonus_${owned}` }
}

/** Evaluates an assembled outfit for hard vetoes, compatibility bonuses, and a final score. */
export function evaluateOutfitCompatibility(
    outfit: AssembledOutfit,
    ctx: RecommendationContext,
): RankedOutfit {
    const vetoReasons: string[] = []
    const formalityVeto = hasFormalityHardVeto(outfit)
    if (formalityVeto) {
        vetoReasons.push(formalityVeto)
    }

    if (vetoReasons.length > 0) {
        return {
            ...outfit,
            compatibilityScore: 0,
            wardrobeReuseBonus: 0,
            explorationMatchBonus: 0,
            finalScore: Number.NEGATIVE_INFINITY,
            vetoed: true,
            vetoReasons,
            compatibilityReasons: [],
        }
    }

    const compatibilityReasons: string[] = []
    let compatibilityScore = 0

    const formality = scoreFormalityConsistency(outfit)
    compatibilityScore += formality.points
    if (formality.reason) {
        compatibilityReasons.push(formality.reason)
    }

    const style = scoreStyleCoherence(outfit)
    compatibilityScore += style.points
    if (style.reason) {
        compatibilityReasons.push(style.reason)
    }

    const season = scoreSeasonConsistency(outfit, ctx)
    compatibilityScore += season.points
    if (season.reason) {
        compatibilityReasons.push(season.reason)
    }

    const fit = scoreFitBalance(outfit)
    compatibilityScore += fit.points
    if (fit.reason) {
        compatibilityReasons.push(fit.reason)
    }

    const novelty = scoreOutfitNovelty(outfit, ctx)
    const explorationMatchBonus = novelty.points
    if (novelty.reason) {
        compatibilityReasons.push(novelty.reason)
    }

    const reuse = wardrobeReuseBonus(outfit)
    if (reuse.reason) {
        compatibilityReasons.push(reuse.reason)
    }

    const finalScore =
        outfit.itemScoreAverage +
        compatibilityScore +
        reuse.points +
        explorationMatchBonus

    return {
        ...outfit,
        compatibilityScore,
        wardrobeReuseBonus: reuse.points,
        explorationMatchBonus,
        finalScore,
        vetoed: false,
        vetoReasons: [],
        compatibilityReasons,
        reasons: [...outfit.reasons, ...compatibilityReasons],
    }
}

/**
 * Score outfits, drop hard-vetoed combinations, sort by finalScore.
 */
export function rankCompatibleOutfits(
    outfits: AssembledOutfit[],
    ctx: RecommendationContext,
): RankedOutfit[] {
    return outfits
        .map((outfit) => evaluateOutfitCompatibility(outfit, ctx))
        .filter((outfit) => !outfit.vetoed)
        .sort((a, b) => b.finalScore - a.finalScore)
}

/** Computes the outfit's overall novelty from the average of its main garments. */
export function outfitNoveltyLevel(outfit: AssembledOutfit): NoveltyLevel {
    const garments = mainGarments(outfit)
    if (garments.length === 0) {
        return NoveltyLevel.MIXED
    }
    const indices = garments.map((entry) => NOVELTY_ORDER.indexOf(entry.scored.item.novelty))
    const avgIndex = Math.round(
        indices.reduce((sum, value) => sum + value, 0) / indices.length,
    )
    return NOVELTY_ORDER[Math.min(Math.max(avgIndex, 0), NOVELTY_ORDER.length - 1)]!
}
