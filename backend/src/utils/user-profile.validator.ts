import {
    AgeGroup,
    BodyShape,
    DislikedColor,
    FavoriteColorPalette,
    FavoriteStyle,
    Gender,
    SkinTone,
    SkinUndertone,
} from "../../generated/prisma/client";

export type UpdateUserProfileBody = {
    firstName?: string
    lastName?: string
    gender?: Gender
    ageGroup?: AgeGroup
    skinTone?: SkinTone
    skinUndertone?: SkinUndertone
    bodyShape?: BodyShape
    favoriteStyles?: FavoriteStyle[]
    favoriteColorPalettes?: FavoriteColorPalette[]
    dislikedColors?: DislikedColor[]
}

// TODO: could use zod for this
export class UserProfileValidator {
    private static readonly MAX_FAVORITE_STYLES = 2
    private static readonly MAX_FAVORITE_COLOR_PALETTES = 3
    private static readonly MAX_DISLIKED_COLORS = 3

    private static readonly MALE_BODY_SHAPES = new Set<BodyShape>([
        BodyShape.MALE_TRAPEZOID,
        BodyShape.MALE_TRIANGLE,
        BodyShape.MALE_RECTANGLE,
        BodyShape.MALE_OVAL,
        BodyShape.MALE_INVERTED_TRIANGLE,
        BodyShape.UNSURE,
    ])

    private static readonly FEMALE_BODY_SHAPES = new Set<BodyShape>([
        BodyShape.FEMALE_HOURGLASS,
        BodyShape.FEMALE_APPLE,
        BodyShape.FEMALE_PEAR,
        BodyShape.FEMALE_RECTANGLE,
        BodyShape.FEMALE_INVERTED_TRIANGLE,
        BodyShape.UNSURE,
    ])

    private static readonly SHARED_FAVORITE_STYLES = new Set<FavoriteStyle>([
        FavoriteStyle.CASUAL_AND_DAILY,
        FavoriteStyle.MINIMAL,
        FavoriteStyle.CLASSIC,
        FavoriteStyle.FORMAL,
        FavoriteStyle.SPORT,
        FavoriteStyle.STREET,
    ])

    private static readonly MALE_FAVORITE_STYLES = new Set<FavoriteStyle>([
        ...UserProfileValidator.SHARED_FAVORITE_STYLES,
        FavoriteStyle.MALE_SMART_AND_CASUAL,
        FavoriteStyle.MALE_ROMANTIC_AND_DIFFERENT,
    ])

    private static readonly FEMALE_FAVORITE_STYLES = new Set<FavoriteStyle>([
        ...UserProfileValidator.SHARED_FAVORITE_STYLES,
        FavoriteStyle.FEMALE_ARITISTIC_AND_CREATIVE,
        FavoriteStyle.FEMALE_ROMANTIC_AND_ELEGANT,
    ])

    private static readonly SHARED_FAVORITE_COLOR_PALETTES = new Set<FavoriteColorPalette>([
        FavoriteColorPalette.NEUTRAL_BLACK_WHITE_GRAY,
        FavoriteColorPalette.CREAM_AND_BROWN,
        FavoriteColorPalette.PASTELS,
        FavoriteColorPalette.DARK,
        FavoriteColorPalette.LIGHT_AND_BRIGHT,
    ])

    private static readonly MALE_FAVORITE_COLOR_PALETTES = new Set<FavoriteColorPalette>([
        ...UserProfileValidator.SHARED_FAVORITE_COLOR_PALETTES,
        FavoriteColorPalette.MALE_BLUE_AND_NAVY_BLUES,
        FavoriteColorPalette.MALE_GREEN_AND_OLIVE,
        FavoriteColorPalette.MALE_WARM_AND_KHAKI,
    ])

    private static readonly FEMALE_FAVORITE_COLOR_PALETTES = new Set<FavoriteColorPalette>([
        ...UserProfileValidator.SHARED_FAVORITE_COLOR_PALETTES,
        FavoriteColorPalette.FEMALE_WARM_RED_ORANGE_BRIGHT_ORANGE,
        FavoriteColorPalette.FEMALE_COLD_BLUE_PURPLE_GREEN,
    ])

    public static isValidUpdateBody(body: UpdateUserProfileBody, effectiveGender: Gender | null): boolean {
        if (body.firstName !== undefined && typeof body.firstName !== "string") {
            return false
        }
        if (body.lastName !== undefined && typeof body.lastName !== "string") {
            return false
        }
        if (body.gender !== undefined && !UserProfileValidator.isEnumValue(Gender, body.gender)) {
            return false
        }
        if (body.ageGroup !== undefined && !UserProfileValidator.isEnumValue(AgeGroup, body.ageGroup)) {
            return false
        }
        if (body.skinTone !== undefined && !UserProfileValidator.isEnumValue(SkinTone, body.skinTone)) {
            return false
        }
        if (body.skinUndertone !== undefined && !UserProfileValidator.isEnumValue(SkinUndertone, body.skinUndertone)) {
            return false
        }
        if (body.bodyShape !== undefined && !UserProfileValidator.isEnumValue(BodyShape, body.bodyShape)) {
            return false
        }
        if (body.favoriteStyles !== undefined) {
            if (!UserProfileValidator.isEnumValueArray(FavoriteStyle, body.favoriteStyles)) {
                return false
            }
            if (body.favoriteStyles.length > UserProfileValidator.MAX_FAVORITE_STYLES) {
                return false
            }
        }
        if (body.favoriteColorPalettes !== undefined) {
            if (!UserProfileValidator.isEnumValueArray(FavoriteColorPalette, body.favoriteColorPalettes)) {
                return false
            }
            if (body.favoriteColorPalettes.length > UserProfileValidator.MAX_FAVORITE_COLOR_PALETTES) {
                return false
            }
        }
        if (body.dislikedColors !== undefined) {
            if (!UserProfileValidator.isEnumValueArray(DislikedColor, body.dislikedColors)) {
                return false
            }
            if (body.dislikedColors.length > UserProfileValidator.MAX_DISLIKED_COLORS) {
                return false
            }
        }

        if (effectiveGender === Gender.MALE) {
            if (body.bodyShape !== undefined && !UserProfileValidator.MALE_BODY_SHAPES.has(body.bodyShape)) {
                return false
            }
            if (body.favoriteStyles?.some((style) => !UserProfileValidator.MALE_FAVORITE_STYLES.has(style))) {
                return false
            }
            if (body.favoriteColorPalettes?.some((palette) => !UserProfileValidator.MALE_FAVORITE_COLOR_PALETTES.has(palette))) {
                return false
            }
        }

        if (effectiveGender === Gender.FEMALE) {
            if (body.bodyShape !== undefined && !UserProfileValidator.FEMALE_BODY_SHAPES.has(body.bodyShape)) {
                return false
            }
            if (body.favoriteStyles?.some((style) => !UserProfileValidator.FEMALE_FAVORITE_STYLES.has(style))) {
                return false
            }
            if (body.favoriteColorPalettes?.some((palette) => !UserProfileValidator.FEMALE_FAVORITE_COLOR_PALETTES.has(palette))) {
                return false
            }
        }

        return true
    }

    private static isEnumValue<T extends Record<string, string>>(enumObject: T, value: unknown): value is T[keyof T] {
        return typeof value === "string" && Object.values(enumObject).includes(value)
    }

    private static isEnumValueArray<T extends Record<string, string>>(enumObject: T, value: unknown): value is Array<T[keyof T]> {
        return Array.isArray(value) && value.every((item) => UserProfileValidator.isEnumValue(enumObject, item))
    }
}
