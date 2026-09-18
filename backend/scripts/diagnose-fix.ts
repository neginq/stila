/**
 * Root-cause diagnostics for the failures found by evaluate-engine.ts.
 *
 *  A) coverage tag distribution per slot in the women catalog
 *  B) female sweep against current data vs. data with the old shoe-coverage bug
 *     reintroduced, as a regression guard
 *  C) stage-by-stage trace of the failing male scenarios
 *
 * Usage: npx tsx scripts/diagnose-fix.ts
 */
import {
    AgeGroup,
    BodyShape,
    ClothingSlot,
    CoverageLevel,
    ExplorationLevel,
    FavoriteColorPalette,
    FavoriteStyle,
    FitPreference,
    FormalityLevel,
    Gender,
    Occasion,
    Season,
    SkinTone,
    SkinUndertone,
    WardrobeItemType,
    WardrobePalette,
    type ClothingItem,
    type Prisma,
} from "../generated/prisma/client"
import { menClothingItems } from "../prisma/seed-data/men-clothing"
import { womenClothingItems } from "../prisma/seed-data/women-clothing"
import type { RecommendationContext } from "../src/rule-engine/context"
import { recommendOutfits } from "../src/rule-engine/engine"
import { applyHardFilters } from "../src/rule-engine/filters"
import { scoreItems } from "../src/rule-engine/item-scorer"
import { resolveOutfitTemplate } from "../src/rule-engine/templates"
import { assembleCandidateOutfits } from "../src/rule-engine/outfit-assembler"
import { rankCompatibleOutfits } from "../src/rule-engine/compatibility"

const now = new Date()

/**
 * When regressShoeCoverage is true, footwear is put back on the coverage ladder
 * at its lowest rung, reproducing the bug that used to empty the shoes slot.
 */
function build(
    items: Prisma.ClothingItemCreateInput[],
    startId: number,
    regressShoeCoverage: boolean,
): ClothingItem[] {
    return items.map((item, index) => ({
        ...item,
        id: startId + index,
        coverage:
            regressShoeCoverage && item.slot === ClothingSlot.SHOES
                ? CoverageLevel.UNRESTRICTED
                : (item.coverage ?? null),
        silhouetteTags: item.silhouetteTags ?? [],
        createdAt: now,
        updatedAt: now,
    })) as unknown as ClothingItem[]
}

function femaleCtx(
    occasion: Occasion,
    season: Season,
    coverageLevel: CoverageLevel,
    explorationLevel: ExplorationLevel,
): RecommendationContext {
    return {
        userId: 1,
        gender: Gender.FEMALE,
        ageGroup: AgeGroup.TWENTY_FIVE_TO_34,
        skinTone: SkinTone.LIGHT_TO_MEDIUM,
        skinUndertone: SkinUndertone.WARM,
        bodyShape: BodyShape.FEMALE_HOURGLASS,
        favoriteStyles: [FavoriteStyle.CLASSIC, FavoriteStyle.MINIMAL],
        favoriteColorPalettes: [FavoriteColorPalette.NEUTRAL_BLACK_WHITE_GRAY],
        dislikedColors: [],
        occasion,
        season,
        fitPreference: FitPreference.BALANCED,
        coverageLevel,
        formalityLevel: null,
        wardrobePalette: WardrobePalette.BLACK_WHITE_GRAY,
        wardrobeItems: [WardrobeItemType.JEANS],
        explorationLevel,
    }
}

function sweepFemale(catalog: ClothingItem[]): { total: number; ok: number; three: number } {
    let total = 0
    let ok = 0
    let three = 0
    for (const occasion of Object.values(Occasion)) {
        for (const season of Object.values(Season)) {
            for (const coverage of Object.values(CoverageLevel)) {
                for (const exploration of [
                    ExplorationLevel.FAMILIAR,
                    ExplorationLevel.SLIGHTLY_NEW,
                    ExplorationLevel.MIXED,
                    ExplorationLevel.CREATIVE,
                    ExplorationLevel.UNSURE,
                ]) {
                    total += 1
                    const { outfits } = recommendOutfits(catalog, femaleCtx(occasion, season, coverage, exploration))
                    if (outfits.length > 0) ok += 1
                    if (outfits.length === 3) three += 1
                }
            }
        }
    }
    return { total, ok, three }
}

console.log("A) women catalog: coverage tag per slot")
const coverageTable = new Map<string, number>()
for (const item of build(womenClothingItems, 1, false)) {
    const key = `${item.slot} / ${item.coverage ?? "NULL"}`
    coverageTable.set(key, (coverageTable.get(key) ?? 0) + 1)
}
for (const [key, count] of [...coverageTable.entries()].sort()) {
    console.log(`   ${key.padEnd(34)} ${count}`)
}
console.log()

const regressed = sweepFemale(build(womenClothingItems, 1, true))
const current = sweepFemale(build(womenClothingItems, 1, false))
console.log("B) FEMALE sweep, shoes forced back onto the ladder (old bug):")
console.log(`   success ${regressed.ok}/${regressed.total} = ${((regressed.ok / regressed.total) * 100).toFixed(1)}%  |  full-3 ${((regressed.three / regressed.total) * 100).toFixed(1)}%`)
console.log("B) FEMALE sweep, current seed data:")
console.log(`   success ${current.ok}/${current.total} = ${((current.ok / current.total) * 100).toFixed(1)}%  |  full-3 ${((current.three / current.total) * 100).toFixed(1)}%`)
if (current.ok !== current.total) {
    console.log("   REGRESSION: current data no longer covers the whole female grid")
}

// ---------- B) male failures ----------
const maleCatalog = build(menClothingItems, 1000, false)
const maleFailures: [Occasion, Season, FormalityLevel, ExplorationLevel][] = [
    [Occasion.UNIVERSITY, Season.SUMMER, FormalityLevel.VERY_CASUAL, ExplorationLevel.MIXED],
    [Occasion.WORK, Season.ALL_SEASON, FormalityLevel.FORMAL, ExplorationLevel.FAMILIAR],
    [Occasion.DATE_CAFE, Season.SUMMER, FormalityLevel.FORMAL, ExplorationLevel.FAMILIAR],
    [Occasion.TRAVEL, Season.SPRING, FormalityLevel.FORMAL, ExplorationLevel.FAMILIAR],
    [Occasion.TRAVEL, Season.SUMMER, FormalityLevel.VERY_CASUAL, ExplorationLevel.MIXED],
]

console.log("\nC) MALE failing scenarios, stage-by-stage:")
for (const [occasion, season, formalityLevel, explorationLevel] of maleFailures) {
    const ctx: RecommendationContext = {
        userId: 2,
        gender: Gender.MALE,
        ageGroup: AgeGroup.TWENTY_FIVE_TO_34,
        skinTone: SkinTone.WHEATISH,
        skinUndertone: SkinUndertone.NEUTRAL,
        bodyShape: BodyShape.MALE_TRAPEZOID,
        favoriteStyles: [FavoriteStyle.CLASSIC, FavoriteStyle.MALE_SMART_AND_CASUAL],
        favoriteColorPalettes: [FavoriteColorPalette.MALE_BLUE_AND_NAVY_BLUES],
        dislikedColors: [],
        occasion,
        season,
        fitPreference: FitPreference.BALANCED,
        coverageLevel: null,
        formalityLevel,
        wardrobePalette: WardrobePalette.MALE_BLUE_NAVY_GRAY,
        wardrobeItems: [WardrobeItemType.JEANS, WardrobeItemType.SNEAKERS],
        explorationLevel,
    }
    const filtered = applyHardFilters(maleCatalog, ctx)
    const scored = scoreItems(filtered, ctx)
    const template = resolveOutfitTemplate(ctx)
    const candidates = assembleCandidateOutfits(scored, ctx, template)
    const ranked = rankCompatibleOutfits(candidates, ctx)
    const perSlot = template.required
        .map((slot) => `${slot}=${filtered.filter((i) => i.slot === slot).length}`)
        .join(",")
    console.log(
        `  ${occasion}/${season}/${formalityLevel}/${explorationLevel}: filtered=${filtered.length} [${perSlot}] candidates=${candidates.length} survived=${ranked.length}`,
    )
}
