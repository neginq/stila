import {
    ClothingSlot,
    CoverageLevel,
    Gender,
    Season,
    type ClothingItem,
} from "../../generated/prisma/client"
import type { RecommendationContext } from "./context"

export const COVERAGE_RANK: Record<CoverageLevel, number> = {
    [CoverageLevel.FULLY_COVERED]: 3,
    [CoverageLevel.COVERED_COMFORTABLE]: 2,
    [CoverageLevel.BALANCED]: 1,
    [CoverageLevel.UNRESTRICTED]: 0,
}

/** Returns true if the item's gender does not match the user's gender. */
function failsGenderFilter(item: ClothingItem, ctx: RecommendationContext): boolean {
    return item.gender !== ctx.gender
}

/**
 * Women: reject items less covered than the user's coverage preference.
 * Items with null coverage (e.g. many accessories) pass.
 */
function failsCoverageFilter(item: ClothingItem, ctx: RecommendationContext): boolean {
    if (ctx.gender !== Gender.FEMALE || ctx.coverageLevel === null) {
        return false
    }
    if (item.coverage === null) {
        return false
    }
    return COVERAGE_RANK[item.coverage] < COVERAGE_RANK[ctx.coverageLevel]
}

/**
 * Reject only clear season impossibilities (e.g. winter-only piece for summer).
 * Multi-season / all_season items always pass.
 */
function failsExtremeSeasonFilter(item: ClothingItem, ctx: RecommendationContext): boolean {
    const seasons = item.seasons
    if (seasons.includes(Season.ALL_SEASON) || seasons.includes(ctx.season)) {
        return false
    }

    const onlyWinter = seasons.length > 0 && seasons.every((s) => s === Season.WINTER)
    const onlySummer = seasons.length > 0 && seasons.every((s) => s === Season.SUMMER)

    if (ctx.season === Season.SUMMER && onlyWinter) {
        return true
    }
    if (ctx.season === Season.WINTER && onlySummer) {
        return true
    }

    // Heavy winter outerwear tagged fall+winter only vs peak summer
    if (
        ctx.season === Season.SUMMER &&
        item.slot === ClothingSlot.OUTERWEAR &&
        seasons.every((s) => s === Season.WINTER || s === Season.FALL)
    ) {
        return true
    }

    return false
}

/** Returns true if the item passes all hard filters (gender, coverage, and extreme season). */
export function passesHardFilters(item: ClothingItem, ctx: RecommendationContext): boolean {
    if (failsGenderFilter(item, ctx)) {
        return false
    }
    if (failsCoverageFilter(item, ctx)) {
        return false
    }
    if (failsExtremeSeasonFilter(item, ctx)) {
        return false
    }
    return true
}

/** Apply hard filters; disliked colors are handled by the color engine, not catalog rows. */
export function applyHardFilters(
    items: ClothingItem[],
    ctx: RecommendationContext,
): ClothingItem[] {
    return items.filter((item) => passesHardFilters(item, ctx))
}
