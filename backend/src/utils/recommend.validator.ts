import {
    CoverageLevel,
    ExplorationLevel,
    FitPreference,
    FormalityLevel,
    Gender,
    Occasion,
    Season,
    WardrobeItemType,
    WardrobePalette,
} from "../../generated/prisma/client";

export type RecommendSessionBody = {
    occasion: Occasion
    season: Season
    fitPreference: FitPreference
    coverageLevel?: CoverageLevel
    formalityLevel?: FormalityLevel
    wardrobePalette: WardrobePalette
    wardrobeItems: WardrobeItemType[]
    explorationLevel: ExplorationLevel
}

// TODO: could use zod for this
export class RecommendValidator {
    private static readonly MAX_WARDROBE_ITEMS = 5

    private static readonly SHARED_FIT_PREFERENCES = new Set<FitPreference>([
        FitPreference.LOOSE,
        FitPreference.SEMI_LOOSE,
        FitPreference.BALANCED,
        FitPreference.FITTED,
    ])

    private static readonly FEMALE_FIT_PREFERENCES = new Set<FitPreference>([
        ...RecommendValidator.SHARED_FIT_PREFERENCES,
        FitPreference.LOOSE_TOP_FITTED_BOTTOM,
        FitPreference.FITTED_TOP_LOOSE_BOTTOM,
    ])

    private static readonly MALE_FIT_PREFERENCES = new Set<FitPreference>([
        ...RecommendValidator.SHARED_FIT_PREFERENCES,
        FitPreference.LOOSE_TOP_BALANCED_BOTTOM,
        FitPreference.BALANCED_TOP_LOOSE_BOTTOM,
    ])

    private static readonly SHARED_WARDROBE_PALETTES = new Set<WardrobePalette>([
        WardrobePalette.BLACK_WHITE_GRAY,
        WardrobePalette.CREAM_BEIGE_BROWN,
        WardrobePalette.MIXED_ALL,
    ])

    private static readonly FEMALE_WARDROBE_PALETTES = new Set<WardrobePalette>([
        ...RecommendValidator.SHARED_WARDROBE_PALETTES,
        WardrobePalette.FEMALE_BLUE_AND_NAVY,
        WardrobePalette.FEMALE_PASTELS,
        WardrobePalette.FEMALE_WARM_AND_EARTHY,
        WardrobePalette.FEMALE_BRIGHT_AND_VARIED,
    ])

    private static readonly MALE_WARDROBE_PALETTES = new Set<WardrobePalette>([
        ...RecommendValidator.SHARED_WARDROBE_PALETTES,
        WardrobePalette.MALE_BLUE_NAVY_GRAY,
        WardrobePalette.MALE_GREEN_OLIVE_EARTHY,
        WardrobePalette.MALE_DARK,
        WardrobePalette.MALE_LIGHT_AND_BRIGHT,
    ])

    private static readonly SHARED_WARDROBE_ITEMS = new Set<WardrobeItemType>([
        WardrobeItemType.PREFER_ALL_NEW,
        WardrobeItemType.JEANS,
        WardrobeItemType.TROUSERS,
        WardrobeItemType.SNEAKERS,
        WardrobeItemType.BLAZER_OR_COAT,
    ])

    private static readonly FEMALE_WARDROBE_ITEMS = new Set<WardrobeItemType>([
        ...RecommendValidator.SHARED_WARDROBE_ITEMS,
        WardrobeItemType.MANTO_OR_LONG_COAT,
        WardrobeItemType.BLOUSE_OR_SHIRT,
        WardrobeItemType.TSHIRT_OR_TOP,
        WardrobeItemType.SKIRT,
        WardrobeItemType.FORMAL_OR_HEELS,
        WardrobeItemType.CASUAL_BAG,
    ])

    private static readonly MALE_WARDROBE_ITEMS = new Set<WardrobeItemType>([
        ...RecommendValidator.SHARED_WARDROBE_ITEMS,
        WardrobeItemType.TSHIRT,
        WardrobeItemType.POLO,
        WardrobeItemType.DRESS_SHIRT,
        WardrobeItemType.HOODIE_OR_SWEATSHIRT,
        WardrobeItemType.KNIT_OR_SWEATER,
        WardrobeItemType.DENIM_JACKET_OR_OVERSHIRT,
        WardrobeItemType.CARGO_PANTS,
        WardrobeItemType.FORMAL_OR_LOAFERS,
    ])

    private static readonly SHARED_EXPLORATION_LEVELS = new Set<ExplorationLevel>([
        ExplorationLevel.FAMILIAR,
        ExplorationLevel.SLIGHTLY_NEW,
        ExplorationLevel.MIXED,
        ExplorationLevel.CREATIVE,
    ])

    private static readonly FEMALE_EXPLORATION_LEVELS = new Set<ExplorationLevel>([
        ...RecommendValidator.SHARED_EXPLORATION_LEVELS,
        ExplorationLevel.UNSURE,
    ])

    private static readonly MALE_EXPLORATION_LEVELS = new Set<ExplorationLevel>([
        ...RecommendValidator.SHARED_EXPLORATION_LEVELS,
        ExplorationLevel.BOLD,
    ])

    public static isValidSessionBody(body: RecommendSessionBody, gender: Gender): boolean {
        if (!RecommendValidator.isEnumValue(Occasion, body.occasion)) {
            return false
        }
        if (!RecommendValidator.isEnumValue(Season, body.season)) {
            return false
        }
        if (!RecommendValidator.isEnumValue(FitPreference, body.fitPreference)) {
            return false
        }
        if (!RecommendValidator.isEnumValue(WardrobePalette, body.wardrobePalette)) {
            return false
        }
        if (!RecommendValidator.isEnumValue(ExplorationLevel, body.explorationLevel)) {
            return false
        }
        if (!Array.isArray(body.wardrobeItems)) {
            return false
        }
        if (body.wardrobeItems.length > RecommendValidator.MAX_WARDROBE_ITEMS) {
            return false
        }
        if (!RecommendValidator.isEnumValueArray(WardrobeItemType, body.wardrobeItems)) {
            return false
        }
        if (
            body.wardrobeItems.includes(WardrobeItemType.PREFER_ALL_NEW) &&
            body.wardrobeItems.length > 1
        ) {
            return false
        }

        if (gender === Gender.FEMALE) {
            if (!RecommendValidator.isEnumValue(CoverageLevel, body.coverageLevel)) {
                return false
            }
            if (body.formalityLevel !== undefined) {
                return false
            }
            if (!RecommendValidator.FEMALE_FIT_PREFERENCES.has(body.fitPreference)) {
                return false
            }
            if (!RecommendValidator.FEMALE_WARDROBE_PALETTES.has(body.wardrobePalette)) {
                return false
            }
            if (body.wardrobeItems.some((item) => !RecommendValidator.FEMALE_WARDROBE_ITEMS.has(item))) {
                return false
            }
            if (!RecommendValidator.FEMALE_EXPLORATION_LEVELS.has(body.explorationLevel)) {
                return false
            }
        }

        if (gender === Gender.MALE) {
            if (!RecommendValidator.isEnumValue(FormalityLevel, body.formalityLevel)) {
                return false
            }
            if (body.coverageLevel !== undefined) {
                return false
            }
            if (!RecommendValidator.MALE_FIT_PREFERENCES.has(body.fitPreference)) {
                return false
            }
            if (!RecommendValidator.MALE_WARDROBE_PALETTES.has(body.wardrobePalette)) {
                return false
            }
            if (body.wardrobeItems.some((item) => !RecommendValidator.MALE_WARDROBE_ITEMS.has(item))) {
                return false
            }
            if (!RecommendValidator.MALE_EXPLORATION_LEVELS.has(body.explorationLevel)) {
                return false
            }
        }

        return true
    }

    private static isEnumValue<T extends Record<string, string>>(enumObject: T, value: unknown): value is T[keyof T] {
        return typeof value === "string" && Object.values(enumObject).includes(value)
    }

    private static isEnumValueArray<T extends Record<string, string>>(enumObject: T, value: unknown): value is Array<T[keyof T]> {
        return Array.isArray(value) && value.every((item) => RecommendValidator.isEnumValue(enumObject, item))
    }
}
