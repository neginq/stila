/**
 * Offline evaluation harness for the rule engine.
 *
 * Runs recommendOutfits() over a full factorial grid of session answers against
 * the seed catalog (no database, no HTTP) and reports aggregate metrics.
 *
 * Usage: npx tsx scripts/evaluate-engine.ts
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

function toCatalog(items: Prisma.ClothingItemCreateInput[], startId: number): ClothingItem[] {
    return items.map((item, index) => ({
        id: startId + index,
        slug: item.slug,
        nameEn: item.nameEn,
        nameFa: item.nameFa,
        gender: item.gender,
        slot: item.slot,
        itemType: item.itemType,
        styles: (item.styles ?? []) as FavoriteStyle[],
        occasions: (item.occasions ?? []) as Occasion[],
        seasons: (item.seasons ?? []) as Season[],
        fit: item.fit,
        coverage: item.coverage ?? null,
        formality: item.formality,
        bodyShapes: (item.bodyShapes ?? []) as BodyShape[],
        silhouetteTags: (item.silhouetteTags ?? []) as ClothingItem["silhouetteTags"],
        novelty: item.novelty,
        createdAt: now,
        updatedAt: now,
    })) as ClothingItem[]
}

const femaleCatalog = toCatalog(womenClothingItems, 1)
const maleCatalog = toCatalog(menClothingItems, 1000)

const OCCASIONS = Object.values(Occasion)
const SEASONS = Object.values(Season)
const COVERAGES = Object.values(CoverageLevel)
const FORMALITIES = Object.values(FormalityLevel)

const FEMALE_EXPLORATION: ExplorationLevel[] = [
    ExplorationLevel.FAMILIAR,
    ExplorationLevel.SLIGHTLY_NEW,
    ExplorationLevel.MIXED,
    ExplorationLevel.CREATIVE,
    ExplorationLevel.UNSURE,
]
const MALE_EXPLORATION: ExplorationLevel[] = [
    ExplorationLevel.FAMILIAR,
    ExplorationLevel.SLIGHTLY_NEW,
    ExplorationLevel.MIXED,
    ExplorationLevel.CREATIVE,
    ExplorationLevel.BOLD,
]

const FEMALE_FITS: FitPreference[] = [
    FitPreference.LOOSE,
    FitPreference.BALANCED,
    FitPreference.FITTED,
    FitPreference.LOOSE_TOP_FITTED_BOTTOM,
]
const MALE_FITS: FitPreference[] = [
    FitPreference.LOOSE,
    FitPreference.BALANCED,
    FitPreference.FITTED,
    FitPreference.LOOSE_TOP_BALANCED_BOTTOM,
]

const FEMALE_WARDROBE_SETS: WardrobeItemType[][] = [
    [WardrobeItemType.PREFER_ALL_NEW],
    [WardrobeItemType.JEANS, WardrobeItemType.SNEAKERS],
    [
        WardrobeItemType.MANTO_OR_LONG_COAT,
        WardrobeItemType.BLOUSE_OR_SHIRT,
        WardrobeItemType.TROUSERS,
    ],
]
const MALE_WARDROBE_SETS: WardrobeItemType[][] = [
    [WardrobeItemType.PREFER_ALL_NEW],
    [WardrobeItemType.JEANS, WardrobeItemType.SNEAKERS],
    [
        WardrobeItemType.DRESS_SHIRT,
        WardrobeItemType.TROUSERS,
        WardrobeItemType.FORMAL_OR_LOAFERS,
    ],
]

type Scenario = { ctx: RecommendationContext; catalog: ClothingItem[] }

function femaleScenarios(): Scenario[] {
    const out: Scenario[] = []
    let wardrobeCursor = 0
    let fitCursor = 0
    for (const occasion of OCCASIONS) {
        for (const season of SEASONS) {
            for (const coverageLevel of COVERAGES) {
                for (const explorationLevel of FEMALE_EXPLORATION) {
                    const wardrobeItems = FEMALE_WARDROBE_SETS[wardrobeCursor++ % FEMALE_WARDROBE_SETS.length]!
                    const fitPreference = FEMALE_FITS[fitCursor++ % FEMALE_FITS.length]!
                    out.push({
                        catalog: femaleCatalog,
                        ctx: {
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
                            fitPreference,
                            coverageLevel,
                            formalityLevel: null,
                            wardrobePalette: WardrobePalette.BLACK_WHITE_GRAY,
                            wardrobeItems,
                            explorationLevel,
                        },
                    })
                }
            }
        }
    }
    return out
}

function maleScenarios(): Scenario[] {
    const out: Scenario[] = []
    let wardrobeCursor = 0
    let fitCursor = 0
    for (const occasion of OCCASIONS) {
        for (const season of SEASONS) {
            for (const formalityLevel of FORMALITIES) {
                for (const explorationLevel of MALE_EXPLORATION) {
                    const wardrobeItems = MALE_WARDROBE_SETS[wardrobeCursor++ % MALE_WARDROBE_SETS.length]!
                    const fitPreference = MALE_FITS[fitCursor++ % MALE_FITS.length]!
                    out.push({
                        catalog: maleCatalog,
                        ctx: {
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
                            fitPreference,
                            coverageLevel: null,
                            formalityLevel,
                            wardrobePalette: WardrobePalette.MALE_BLUE_NAVY_GRAY,
                            wardrobeItems,
                            explorationLevel,
                        },
                    })
                }
            }
        }
    }
    return out
}

type Metrics = {
    label: string
    scenarios: number
    catalogSize: number
    filteredTotal: number
    threeOutfits: number
    someOutfits: number
    zeroOutfits: number
    candidatesTotal: number
    vetoedTotal: number
    incompleteRequiredTotal: number
    scenariosWithIncomplete: number
    altSharedRatioSum: number
    altCount: number
    advNoveltyHigherOrEqual: number
    advCount: number
    scoreSum: number
    scoreCount: number
    itemsPerOutfitSum: number
    reuseOutfits: number
    reuseEligibleOutfits: number
    latencyMs: number
    failures: string[]
}

function emptyMetrics(label: string, catalogSize: number): Metrics {
    return {
        label,
        scenarios: 0,
        catalogSize,
        filteredTotal: 0,
        threeOutfits: 0,
        someOutfits: 0,
        zeroOutfits: 0,
        candidatesTotal: 0,
        vetoedTotal: 0,
        incompleteRequiredTotal: 0,
        scenariosWithIncomplete: 0,
        altSharedRatioSum: 0,
        altCount: 0,
        advNoveltyHigherOrEqual: 0,
        advCount: 0,
        scoreSum: 0,
        scoreCount: 0,
        itemsPerOutfitSum: 0,
        reuseOutfits: 0,
        reuseEligibleOutfits: 0,
        latencyMs: 0,
        failures: [],
    }
}

const NOVELTY_ORDER = ["FAMILIAR", "SLIGHTLY_NEW", "MIXED", "CREATIVE", "BOLD"]

function run(label: string, scenarios: Scenario[], catalogSize: number): Metrics {
    const m = emptyMetrics(label, catalogSize)

    for (const { ctx, catalog } of scenarios) {
        m.scenarios += 1

        const start = performance.now()
        const { outfits, failure } = recommendOutfits(catalog, ctx)
        m.latencyMs += performance.now() - start

        // instrumented re-run of the intermediate stages
        const filtered = applyHardFilters(catalog, ctx)
        const scored = scoreItems(filtered, ctx)
        const template = resolveOutfitTemplate(ctx)
        const candidates = assembleCandidateOutfits(scored, ctx, template)
        const ranked = rankCompatibleOutfits(candidates, ctx)

        m.filteredTotal += filtered.length
        m.candidatesTotal += candidates.length
        m.vetoedTotal += candidates.length - ranked.length

        let incompleteHere = 0
        for (const candidate of candidates) {
            const slots = new Set(candidate.items.map((entry) => entry.slot))
            const missing = template.required.filter((slot) => !slots.has(slot))
            if (missing.length > 0) {
                incompleteHere += 1
            }
        }
        m.incompleteRequiredTotal += incompleteHere
        if (incompleteHere > 0) {
            m.scenariosWithIncomplete += 1
        }

        if (outfits.length === 0) {
            m.zeroOutfits += 1
            const cause = failure?.cause ?? "unknown"
            m.failures.push(
                `${cause}/${ctx.gender}/${ctx.occasion}/${ctx.season}/${ctx.coverageLevel ?? ctx.formalityLevel}/${ctx.explorationLevel}`,
            )
            continue
        }
        m.someOutfits += 1
        if (outfits.length === 3) {
            m.threeOutfits += 1
        }

        for (const outfit of outfits) {
            m.scoreSum += outfit.score
            m.scoreCount += 1
            m.itemsPerOutfitSum += outfit.items.length
            if (outfit.items.some((entry) => entry.isOwnedReuse)) {
                m.reuseOutfits += 1
            }
            if (!ctx.wardrobeItems.includes(WardrobeItemType.PREFER_ALL_NEW)) {
                m.reuseEligibleOutfits += 1
            }
        }

        const best = outfits[0]!
        const bestIds = new Set(best.items.map((entry) => entry.scored.item.id))

        const alternative = outfits.find((o) => o.intent === "ALTERNATIVE")
        if (alternative) {
            const shared = alternative.items.filter((entry) => bestIds.has(entry.scored.item.id)).length
            m.altSharedRatioSum += shared / Math.max(alternative.items.length, 1)
            m.altCount += 1
        }

        const adventurous = outfits.find((o) => o.intent === "ADVENTUROUS")
        if (adventurous) {
            m.advCount += 1
            if (
                NOVELTY_ORDER.indexOf(adventurous.noveltyLevel) >=
                NOVELTY_ORDER.indexOf(best.noveltyLevel)
            ) {
                m.advNoveltyHigherOrEqual += 1
            }
        }

        // determinism check: identical inputs must produce identical output
        const again = recommendOutfits(catalog, ctx)
        const sigA = outfits
            .map((o) => `${o.rank}:${o.intent}:${o.score.toFixed(4)}:${o.items.map((i) => i.scored.item.id).join(",")}`)
            .join("|")
        const sigB = again.outfits
            .map((o) => `${o.rank}:${o.intent}:${o.score.toFixed(4)}:${o.items.map((i) => i.scored.item.id).join(",")}`)
            .join("|")
        if (sigA !== sigB) {
            m.failures.push(`NON_DETERMINISTIC ${ctx.occasion}/${ctx.season}`)
        }
    }

    return m
}

function pct(part: number, whole: number): string {
    if (whole === 0) return "-"
    return ((part / whole) * 100).toFixed(1) + "%"
}

function report(m: Metrics): void {
    console.log(`\n===== ${m.label} =====`)
    console.log(`catalog size .................. ${m.catalogSize}`)
    console.log(`scenarios ..................... ${m.scenarios}`)
    console.log(`avg items surviving filters ... ${(m.filteredTotal / m.scenarios).toFixed(1)} (${pct(m.filteredTotal / m.scenarios, m.catalogSize)} of catalog)`)
    console.log(`scenarios with >=1 outfit ..... ${m.someOutfits} (${pct(m.someOutfits, m.scenarios)})`)
    console.log(`scenarios with exactly 3 ...... ${m.threeOutfits} (${pct(m.threeOutfits, m.scenarios)})`)
    console.log(`scenarios with 0 outfits ...... ${m.zeroOutfits} (${pct(m.zeroOutfits, m.scenarios)})`)
    console.log(`avg candidate outfits ......... ${(m.candidatesTotal / m.scenarios).toFixed(1)}`)
    console.log(`formality-veto rate ........... ${pct(m.vetoedTotal, m.candidatesTotal)} (${m.vetoedTotal}/${m.candidatesTotal})`)
    console.log(`candidates missing a required slot .. ${pct(m.incompleteRequiredTotal, m.candidatesTotal)} (${m.incompleteRequiredTotal}/${m.candidatesTotal})`)
    console.log(`scenarios affected by that .... ${m.scenariosWithIncomplete} (${pct(m.scenariosWithIncomplete, m.scenarios)})`)
    console.log(`avg pieces per outfit ......... ${(m.itemsPerOutfitSum / Math.max(m.scoreCount, 1)).toFixed(2)}`)
    console.log(`avg final score ............... ${(m.scoreSum / Math.max(m.scoreCount, 1)).toFixed(1)}`)
    console.log(`alt-vs-best avg item overlap .. ${((m.altSharedRatioSum / Math.max(m.altCount, 1)) * 100).toFixed(1)}%`)
    console.log(`adventurous novelty >= best ... ${pct(m.advNoveltyHigherOrEqual, m.advCount)}`)
    console.log(`outfits reusing wardrobe ...... ${pct(m.reuseOutfits, m.reuseEligibleOutfits)} (of outfits where wardrobe was declared)`)
    console.log(`avg latency per request ....... ${(m.latencyMs / m.scenarios).toFixed(2)} ms`)
    const uniqueFailures = [...new Set(m.failures)]
    console.log(`distinct failure signatures ... ${uniqueFailures.length}`)
    for (const failure of uniqueFailures.slice(0, 25)) {
        console.log(`   - ${failure}`)
    }
    if (uniqueFailures.length > 25) {
        console.log(`   ... and ${uniqueFailures.length - 25} more`)
    }
}

const female = run("FEMALE", femaleScenarios(), femaleCatalog.length)
const male = run("MALE", maleScenarios(), maleCatalog.length)
report(female)
report(male)

// ---- slot inventory per gender (explains failure modes) ----
for (const [label, catalog] of [
    ["FEMALE", femaleCatalog],
    ["MALE", maleCatalog],
] as const) {
    const bySlot = new Map<ClothingSlot, number>()
    for (const item of catalog) {
        bySlot.set(item.slot, (bySlot.get(item.slot) ?? 0) + 1)
    }
    console.log(`\n${label} slot inventory: ` + [...bySlot.entries()].map(([s, n]) => `${s}=${n}`).join(", "))
}
