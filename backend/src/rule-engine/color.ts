import {
    ClothingSlot,
    ColorFamily,
    DislikedColor,
    ExplorationLevel,
    FavoriteColorPalette,
    SkinUndertone,
    WardrobePalette,
} from "../../generated/prisma/client"
import type { RecommendationContext } from "./context"

const DISLIKED_TO_FAMILIES: Record<DislikedColor, ColorFamily[]> = {
    [DislikedColor.BLACK]: [ColorFamily.BLACK, ColorFamily.DARK],
    [DislikedColor.WHITE_AND_CREAMY]: [ColorFamily.WHITE_CREAM, ColorFamily.CREAM_BEIGE],
    [DislikedColor.BROWN]: [ColorFamily.BROWN, ColorFamily.KHAKI_EARTH],
    [DislikedColor.RED_AND_ORANGE]: [ColorFamily.RED_ORANGE],
    [DislikedColor.PINK]: [ColorFamily.PINK],
    [DislikedColor.YELLOW]: [ColorFamily.YELLOW],
    [DislikedColor.GREEN]: [ColorFamily.GREEN_OLIVE],
    [DislikedColor.BLUE]: [ColorFamily.BLUE, ColorFamily.NAVY],
    [DislikedColor.PURPLE]: [ColorFamily.PURPLE],
}

const FAVORITE_PALETTE_TO_FAMILIES: Record<FavoriteColorPalette, ColorFamily[]> = {
    [FavoriteColorPalette.NEUTRAL_BLACK_WHITE_GRAY]: [
        ColorFamily.BLACK,
        ColorFamily.WHITE_CREAM,
        ColorFamily.GRAY,
    ],
    [FavoriteColorPalette.CREAM_AND_BROWN]: [
        ColorFamily.CREAM_BEIGE,
        ColorFamily.BROWN,
        ColorFamily.KHAKI_EARTH,
    ],
    [FavoriteColorPalette.PASTELS]: [ColorFamily.PASTEL, ColorFamily.PINK, ColorFamily.BLUE],
    [FavoriteColorPalette.DARK]: [ColorFamily.DARK, ColorFamily.BLACK, ColorFamily.NAVY],
    [FavoriteColorPalette.LIGHT_AND_BRIGHT]: [
        ColorFamily.BRIGHT,
        ColorFamily.WHITE_CREAM,
        ColorFamily.YELLOW,
    ],
    [FavoriteColorPalette.MALE_BLUE_AND_NAVY_BLUES]: [ColorFamily.BLUE, ColorFamily.NAVY],
    [FavoriteColorPalette.MALE_GREEN_AND_OLIVE]: [ColorFamily.GREEN_OLIVE],
    [FavoriteColorPalette.MALE_WARM_AND_KHAKI]: [
        ColorFamily.KHAKI_EARTH,
        ColorFamily.BROWN,
        ColorFamily.CREAM_BEIGE,
    ],
    [FavoriteColorPalette.FEMALE_WARM_RED_ORANGE_BRIGHT_ORANGE]: [
        ColorFamily.RED_ORANGE,
        ColorFamily.BRIGHT,
        ColorFamily.YELLOW,
    ],
    [FavoriteColorPalette.FEMALE_COLD_BLUE_PURPLE_GREEN]: [
        ColorFamily.BLUE,
        ColorFamily.PURPLE,
        ColorFamily.GREEN_OLIVE,
        ColorFamily.NAVY,
    ],
}

const WARDROBE_PALETTE_TO_FAMILIES: Record<WardrobePalette, ColorFamily[]> = {
    [WardrobePalette.BLACK_WHITE_GRAY]: [
        ColorFamily.BLACK,
        ColorFamily.WHITE_CREAM,
        ColorFamily.GRAY,
    ],
    [WardrobePalette.CREAM_BEIGE_BROWN]: [
        ColorFamily.CREAM_BEIGE,
        ColorFamily.BROWN,
        ColorFamily.KHAKI_EARTH,
    ],
    [WardrobePalette.MIXED_ALL]: Object.values(ColorFamily),
    [WardrobePalette.FEMALE_BLUE_AND_NAVY]: [ColorFamily.BLUE, ColorFamily.NAVY],
    [WardrobePalette.FEMALE_PASTELS]: [ColorFamily.PASTEL, ColorFamily.PINK],
    [WardrobePalette.FEMALE_WARM_AND_EARTHY]: [
        ColorFamily.KHAKI_EARTH,
        ColorFamily.BROWN,
        ColorFamily.CREAM_BEIGE,
        ColorFamily.RED_ORANGE,
    ],
    [WardrobePalette.FEMALE_BRIGHT_AND_VARIED]: [
        ColorFamily.BRIGHT,
        ColorFamily.YELLOW,
        ColorFamily.RED_ORANGE,
        ColorFamily.PINK,
    ],
    [WardrobePalette.MALE_BLUE_NAVY_GRAY]: [
        ColorFamily.BLUE,
        ColorFamily.NAVY,
        ColorFamily.GRAY,
    ],
    [WardrobePalette.MALE_GREEN_OLIVE_EARTHY]: [
        ColorFamily.GREEN_OLIVE,
        ColorFamily.KHAKI_EARTH,
    ],
    [WardrobePalette.MALE_DARK]: [ColorFamily.DARK, ColorFamily.BLACK, ColorFamily.NAVY],
    [WardrobePalette.MALE_LIGHT_AND_BRIGHT]: [
        ColorFamily.BRIGHT,
        ColorFamily.WHITE_CREAM,
        ColorFamily.BLUE,
    ],
}

const WARM_UNDERTONE_FAMILIES: ColorFamily[] = [
    ColorFamily.CREAM_BEIGE,
    ColorFamily.BROWN,
    ColorFamily.KHAKI_EARTH,
    ColorFamily.RED_ORANGE,
    ColorFamily.YELLOW,
    ColorFamily.GREEN_OLIVE,
]

const COOL_UNDERTONE_FAMILIES: ColorFamily[] = [
    ColorFamily.NAVY,
    ColorFamily.BLUE,
    ColorFamily.GRAY,
    ColorFamily.PURPLE,
    ColorFamily.PINK,
    ColorFamily.WHITE_CREAM,
]

const SAFE_NEUTRALS: ColorFamily[] = [
    ColorFamily.BLACK,
    ColorFamily.WHITE_CREAM,
    ColorFamily.GRAY,
    ColorFamily.NAVY,
    ColorFamily.CREAM_BEIGE,
]

/** Maps the user's disliked colors to the color families that should be excluded. */
export function dislikedColorFamilies(disliked: DislikedColor[]): Set<ColorFamily> {
    const blocked = new Set<ColorFamily>()
    for (const color of disliked) {
        for (const family of DISLIKED_TO_FAMILIES[color] ?? []) {
            blocked.add(family)
        }
    }
    return blocked
}

/** Returns color families that typically flatter the given skin undertone. */
export function undertoneAffinityFamilies(undertone: SkinUndertone): ColorFamily[] {
    if (undertone === SkinUndertone.WARM) {
        return WARM_UNDERTONE_FAMILIES
    }
    if (undertone === SkinUndertone.COOL) {
        return COOL_UNDERTONE_FAMILIES
    }
    // NEUTRAL / UNSURE — both groups work
    return [...new Set([...WARM_UNDERTONE_FAMILIES, ...COOL_UNDERTONE_FAMILIES])]
}

/** Deduplicate ColorFamily values while keeping first-seen order (priority sources stay first).
 * That’s useful here because favorites, wardrobe, and undertone lists can repeat the same family.
 */
function uniquePreserveOrder(families: ColorFamily[]): ColorFamily[] {
    const seen = new Set<ColorFamily>()
    const result: ColorFamily[] = []
    for (const family of families) {
        if (!seen.has(family)) {
            seen.add(family)
            result.push(family)
        }
    }
    return result
}

/**
 * Build an ordered candidate palette from favorites, wardrobe, and undertone,
 * with disliked families removed. Exploration nudges toward safer vs bolder colors.
 */
export function buildOutfitPalette(ctx: RecommendationContext): ColorFamily[] {
    const blocked = dislikedColorFamilies(ctx.dislikedColors)

    const fromFavorites = ctx.favoriteColorPalettes.flatMap(
        (palette) => FAVORITE_PALETTE_TO_FAMILIES[palette] ?? [],
    )
    const fromWardrobe = WARDROBE_PALETTE_TO_FAMILIES[ctx.wardrobePalette] ?? []
    const fromUndertone = undertoneAffinityFamilies(ctx.skinUndertone)

    let ranked = uniquePreserveOrder([
        ...fromFavorites,
        ...fromWardrobe,
        ...fromUndertone,
        ...SAFE_NEUTRALS,
    ]).filter((family) => !blocked.has(family))

    if (ranked.length === 0) {
        ranked = SAFE_NEUTRALS.filter((family) => !blocked.has(family))
    }
    if (ranked.length === 0) {
        ranked = [ColorFamily.GRAY, ColorFamily.NAVY, ColorFamily.WHITE_CREAM]
    }

    const exploration = ctx.explorationLevel
    if (
        exploration === ExplorationLevel.FAMILIAR ||
        exploration === ExplorationLevel.UNSURE
    ) {
        const neutralsFirst = ranked.filter((f) => SAFE_NEUTRALS.includes(f))
        const rest = ranked.filter((f) => !SAFE_NEUTRALS.includes(f))
        ranked = uniquePreserveOrder([...neutralsFirst, ...rest])
    } else if (
        exploration === ExplorationLevel.CREATIVE ||
        exploration === ExplorationLevel.BOLD
    ) {
        const accents = ranked.filter((f) => !SAFE_NEUTRALS.includes(f))
        const neutrals = ranked.filter((f) => SAFE_NEUTRALS.includes(f))
        ranked = uniquePreserveOrder([...accents, ...neutrals])
    }

    return ranked
}

const SLOT_COLOR_PRIORITY: ClothingSlot[] = [
    ClothingSlot.OUTERWEAR,
    ClothingSlot.TOP,
    ClothingSlot.BOTTOM,
    ClothingSlot.SHOES,
    ClothingSlot.ACCESSORY,
]

/**
 * Assign a color family to each outfit slot from the palette.
 * Prefers variety across main garments; shoes/accessories may reuse neutrals.
 */
export function assignColorsToSlots(
    slots: ClothingSlot[],
    palette: ColorFamily[],
): Record<ClothingSlot, ColorFamily> {
    const pool = palette.length > 0 ? palette : SAFE_NEUTRALS
    const assignment = {} as Record<ClothingSlot, ColorFamily>
    const used = new Set<ColorFamily>()

    const orderedSlots = [...slots].sort(
        (a, b) => SLOT_COLOR_PRIORITY.indexOf(a) - SLOT_COLOR_PRIORITY.indexOf(b),
    )

    for (const slot of orderedSlots) {
        if (slot === ClothingSlot.SHOES || slot === ClothingSlot.ACCESSORY) {
            const neutral = pool.find((f) => SAFE_NEUTRALS.includes(f)) ?? pool[0]!
            assignment[slot] = neutral
            continue
        }

        const unused = pool.find((f) => !used.has(f))
        const chosen = unused ?? pool[used.size % pool.length]!
        assignment[slot] = chosen
        used.add(chosen)
    }

    return assignment
}

/** Returns true if this color family is blocked by the user's disliked colors. */
export function isColorFamilyBlocked(
    family: ColorFamily,
    disliked: DislikedColor[],
): boolean {
    return dislikedColorFamilies(disliked).has(family)
}
