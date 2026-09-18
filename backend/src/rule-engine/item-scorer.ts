import {
    AgeGroup,
    ClothingItemType,
    ClothingSlot,
    ExplorationLevel,
    FitPreference,
    FormalityLevel,
    Gender,
    ItemFit,
    NoveltyLevel,
    Season,
    WardrobeItemType,
    type ClothingItem,
} from "../../generated/prisma/client"
import type { RecommendationContext } from "./context"
import { SCORE_WEIGHTS } from "./weights"

export type ScoredItem = {
    item: ClothingItem
    score: number
    reasons: string[]
}

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

const ITEM_FIT_ORDER: ItemFit[] = [
    ItemFit.LOOSE,
    ItemFit.SEMI_LOOSE,
    ItemFit.BALANCED,
    ItemFit.FITTED,
]

const WARDROBE_TO_ITEM_TYPES: Partial<Record<WardrobeItemType, ClothingItemType[]>> = {
    [WardrobeItemType.JEANS]: [ClothingItemType.JEANS],
    [WardrobeItemType.TROUSERS]: [ClothingItemType.TROUSERS],
    [WardrobeItemType.SNEAKERS]: [ClothingItemType.SNEAKERS],
    [WardrobeItemType.BLAZER_OR_COAT]: [ClothingItemType.BLAZER, ClothingItemType.LONG_COAT],
    [WardrobeItemType.MANTO_OR_LONG_COAT]: [ClothingItemType.MANTO, ClothingItemType.LONG_COAT],
    [WardrobeItemType.BLOUSE_OR_SHIRT]: [ClothingItemType.BLOUSE, ClothingItemType.SHIRT],
    [WardrobeItemType.TSHIRT_OR_TOP]: [ClothingItemType.TSHIRT, ClothingItemType.TOP],
    [WardrobeItemType.SKIRT]: [ClothingItemType.SKIRT],
    [WardrobeItemType.FORMAL_OR_HEELS]: [ClothingItemType.HEELS, ClothingItemType.FORMAL_SHOES],
    [WardrobeItemType.CASUAL_BAG]: [ClothingItemType.CASUAL_BAG, ClothingItemType.BAG],
    [WardrobeItemType.TSHIRT]: [ClothingItemType.TSHIRT],
    [WardrobeItemType.POLO]: [ClothingItemType.POLO],
    [WardrobeItemType.DRESS_SHIRT]: [ClothingItemType.SHIRT],
    [WardrobeItemType.HOODIE_OR_SWEATSHIRT]: [ClothingItemType.HOODIE, ClothingItemType.SWEATSHIRT],
    [WardrobeItemType.KNIT_OR_SWEATER]: [ClothingItemType.KNIT, ClothingItemType.SWEATER],
    [WardrobeItemType.DENIM_JACKET_OR_OVERSHIRT]: [
        ClothingItemType.DENIM_JACKET,
        ClothingItemType.OVERSHIRT,
    ],
    [WardrobeItemType.CARGO_PANTS]: [ClothingItemType.CARGO_PANTS],
    [WardrobeItemType.FORMAL_OR_LOAFERS]: [ClothingItemType.LOAFERS, ClothingItemType.FORMAL_SHOES],
}

/** Returns the distance between two values on an ordered enum scale. */
function enumDistance<T extends string>(order: T[], a: T, b: T): number {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    if (ia < 0 || ib < 0) {
        return 2
    }
    return Math.abs(ia - ib)
}

/** Converts an enum distance into a decaying point value (exact, near, far, or zero). */
function scoreByDistance(maxPoints: number, distance: number): number {
    if (distance === 0) {
        return maxPoints
    }
    if (distance === 1) {
        return Math.round(maxPoints * 0.5)
    }
    if (distance === 2) {
        return Math.round(maxPoints * 0.2)
    }
    return 0
}

/** Maps the user's fit preference to the desired fit for a given clothing slot. */
function desiredFitForSlot(preference: FitPreference, slot: ClothingSlot): ItemFit {
    switch (preference) {
        case FitPreference.LOOSE:
            return ItemFit.LOOSE
        case FitPreference.SEMI_LOOSE:
            return ItemFit.SEMI_LOOSE
        case FitPreference.BALANCED:
            return ItemFit.BALANCED
        case FitPreference.FITTED:
            return ItemFit.FITTED
        case FitPreference.LOOSE_TOP_FITTED_BOTTOM:
            if (slot === ClothingSlot.TOP || slot === ClothingSlot.OUTERWEAR) {
                return ItemFit.LOOSE
            }
            if (slot === ClothingSlot.BOTTOM) {
                return ItemFit.FITTED
            }
            return ItemFit.BALANCED
        case FitPreference.FITTED_TOP_LOOSE_BOTTOM:
            if (slot === ClothingSlot.TOP || slot === ClothingSlot.OUTERWEAR) {
                return ItemFit.FITTED
            }
            if (slot === ClothingSlot.BOTTOM) {
                return ItemFit.LOOSE
            }
            return ItemFit.BALANCED
        case FitPreference.LOOSE_TOP_BALANCED_BOTTOM:
            if (slot === ClothingSlot.TOP || slot === ClothingSlot.OUTERWEAR) {
                return ItemFit.LOOSE
            }
            if (slot === ClothingSlot.BOTTOM) {
                return ItemFit.BALANCED
            }
            return ItemFit.BALANCED
        case FitPreference.BALANCED_TOP_LOOSE_BOTTOM:
            if (slot === ClothingSlot.TOP || slot === ClothingSlot.OUTERWEAR) {
                return ItemFit.BALANCED
            }
            if (slot === ClothingSlot.BOTTOM) {
                return ItemFit.LOOSE
            }
            return ItemFit.BALANCED
        default:
            return ItemFit.BALANCED
    }
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

/** Collects catalog item types that correspond to items the user said they already own. */
function ownedItemTypes(ctx: RecommendationContext): Set<ClothingItemType> {
    const types = new Set<ClothingItemType>()
    if (ctx.wardrobeItems.includes(WardrobeItemType.PREFER_ALL_NEW)) {
        return types
    }
    for (const wardrobeItem of ctx.wardrobeItems) {
        for (const itemType of WARDROBE_TO_ITEM_TYPES[wardrobeItem] ?? []) {
            types.add(itemType)
        }
    }
    return types
}

/** Scores a single clothing item against the recommendation context and records reasons. */
export function scoreItem(item: ClothingItem, ctx: RecommendationContext): ScoredItem {
    let score = 0
    const reasons: string[] = []

    // Occasion
    if (item.occasions.includes(ctx.occasion)) {
        score += SCORE_WEIGHTS.occasion
        reasons.push("occasion_match")
    }

    // Season
    if (item.seasons.includes(Season.ALL_SEASON) || item.seasons.includes(ctx.season)) {
        score += SCORE_WEIGHTS.season
        reasons.push("season_match")
    } else if (
        (ctx.season === Season.SPRING && item.seasons.includes(Season.FALL)) ||
        (ctx.season === Season.FALL && item.seasons.includes(Season.SPRING))
    ) {
        score += Math.round(SCORE_WEIGHTS.season * 0.4)
        reasons.push("season_adjacent")
    }

    // Style overlap
    const styleMatches = item.styles.filter((style) => ctx.favoriteStyles.includes(style))
    if (styleMatches.length > 0) {
        const ratio = Math.min(1, styleMatches.length / Math.max(1, ctx.favoriteStyles.length))
        const points = Math.round(SCORE_WEIGHTS.style * ratio)
        score += points
        reasons.push(`style_match_${styleMatches.length}`)
    }

    // Fit
    const desiredFit = desiredFitForSlot(ctx.fitPreference, item.slot)
    const fitDistance = enumDistance(ITEM_FIT_ORDER, item.fit, desiredFit)
    const fitPoints = scoreByDistance(SCORE_WEIGHTS.fit, fitDistance)
    if (fitPoints > 0) {
        score += fitPoints
        reasons.push(fitDistance === 0 ? "fit_exact" : "fit_near")
    }

    // Coverage (women soft boost for exact/near — hard filter already applied)
    if (ctx.gender === Gender.FEMALE && ctx.coverageLevel !== null && item.coverage !== null) {
        if (item.coverage === ctx.coverageLevel) {
            score += SCORE_WEIGHTS.coverageOrFormality
            reasons.push("coverage_exact")
        } else {
            score += Math.round(SCORE_WEIGHTS.coverageOrFormality * 0.4)
            reasons.push("coverage_ok")
        }
    }

    // Formality (men — and useful soft signal for women items too when formality set)
    if (ctx.formalityLevel !== null) {
        const formalityDistance = enumDistance(FORMALITY_ORDER, item.formality, ctx.formalityLevel)
        const formalityPoints = scoreByDistance(SCORE_WEIGHTS.coverageOrFormality, formalityDistance)
        if (formalityPoints > 0) {
            // Women already may have gotten coverage points; for men this is the main Q10 signal.
            const points =
                ctx.gender === Gender.MALE
                    ? formalityPoints
                    : Math.round(formalityPoints * 0.35)
            score += points
            if (ctx.gender === Gender.MALE) {
                reasons.push(formalityDistance === 0 ? "formality_exact" : "formality_near")
            }
        }
    }

    // Body shape soft boost
    if (item.bodyShapes.includes(ctx.bodyShape)) {
        score += SCORE_WEIGHTS.bodyShape
        reasons.push("body_shape_match")
    }

    // Wardrobe item reuse boost
    const owned = ownedItemTypes(ctx)
    if (owned.has(item.itemType)) {
        score += SCORE_WEIGHTS.wardrobeItems
        reasons.push("wardrobe_item_reuse")
    }

    // Exploration vs item novelty
    const targetNovelty = explorationToNovelty(ctx.explorationLevel)
    const noveltyDistance = enumDistance(NOVELTY_ORDER, item.novelty, targetNovelty)
    const noveltyPoints = scoreByDistance(SCORE_WEIGHTS.exploration, noveltyDistance)
    if (noveltyPoints > 0) {
        score += noveltyPoints
        reasons.push(noveltyDistance === 0 ? "novelty_match" : "novelty_near")
    }

    // Age — tiny nudge only
    if (ctx.ageGroup !== null) {
        const younger =
            ctx.ageGroup === AgeGroup.UNDER_18 || ctx.ageGroup === AgeGroup.EIGHTEEN_TO_24
        const older =
            ctx.ageGroup === AgeGroup.THIRTY_FIVE_TO_44 ||
            ctx.ageGroup === AgeGroup.FORTY_FIVE_OR_OLDER
        if (younger && (item.novelty === NoveltyLevel.CREATIVE || item.novelty === NoveltyLevel.BOLD)) {
            score += SCORE_WEIGHTS.age
            reasons.push("age_trend_nudge")
        } else if (
            older &&
            (item.novelty === NoveltyLevel.FAMILIAR || item.novelty === NoveltyLevel.SLIGHTLY_NEW)
        ) {
            score += SCORE_WEIGHTS.age
            reasons.push("age_classic_nudge")
        }
    }

    // Note: undertone / favoriteColors / wardrobePalette / skinTone apply via color.ts, not catalog rows.

    return { item, score, reasons }
}

/** Scores all items and sorts them from highest score to lowest. */
export function scoreItems(items: ClothingItem[], ctx: RecommendationContext): ScoredItem[] {
    return items
        .map((item) => scoreItem(item, ctx))
        .sort((a, b) => b.score - a.score || a.item.id - b.item.id)
}

/** Returns true if the item type matches something in the user's current wardrobe. */
export function isOwnedWardrobeItem(item: ClothingItem, ctx: RecommendationContext): boolean {
    return ownedItemTypes(ctx).has(item.itemType)
}
