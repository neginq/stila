import type {
    AgeGroup,
    BodyShape,
    CoverageLevel,
    DislikedColor,
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
} from "../../generated/prisma/client"
import type { UserWithStyleProfile } from "../data_access/user.repository"
import type { RecommendSessionBody } from "../utils/recommend.validator"

/** Merged profile + session inputs for the rule engine. */
export type RecommendationContext = {
    userId: number
    gender: Gender
    ageGroup: AgeGroup | null

    skinTone: SkinTone
    skinUndertone: SkinUndertone
    bodyShape: BodyShape
    favoriteStyles: FavoriteStyle[]
    favoriteColorPalettes: FavoriteColorPalette[]
    dislikedColors: DislikedColor[]

    occasion: Occasion
    season: Season
    fitPreference: FitPreference
    coverageLevel: CoverageLevel | null
    formalityLevel: FormalityLevel | null
    wardrobePalette: WardrobePalette
    wardrobeItems: WardrobeItemType[]
    explorationLevel: ExplorationLevel
}

/** Returns true when the user has the style-profile fields required for recommendations. */
export function isProfileReadyForRecommend(user: UserWithStyleProfile): boolean {
    if (user.gender === null) {
        return false
    }
    const profile = user.styleProfile
    if (!profile) {
        return false
    }
    if (profile.skinTone === null || profile.skinUndertone === null || profile.bodyShape === null) {
        return false
    }
    if (profile.favoriteStyles.length < 1) {
        return false
    }
    if (profile.favoriteColorPalettes.length < 1) {
        return false
    }
    return true
}

/**
 * Merge validated session answers with a ready user profile.
 * Returns null if the profile gate fails (caller should respond 400).
 */
export function buildRecommendationContext(
    user: UserWithStyleProfile,
    session: RecommendSessionBody,
): RecommendationContext | null {
    if (!isProfileReadyForRecommend(user)) {
        return null
    }

    const profile = user.styleProfile!
    return {
        userId: user.id,
        gender: user.gender!,
        ageGroup: user.ageGroup,

        skinTone: profile.skinTone!,
        skinUndertone: profile.skinUndertone!,
        bodyShape: profile.bodyShape!,
        favoriteStyles: profile.favoriteStyles,
        favoriteColorPalettes: profile.favoriteColorPalettes,
        dislikedColors: profile.dislikedColors,

        occasion: session.occasion,
        season: session.season,
        fitPreference: session.fitPreference,
        coverageLevel: session.coverageLevel ?? null,
        formalityLevel: session.formalityLevel ?? null,
        wardrobePalette: session.wardrobePalette,
        wardrobeItems: session.wardrobeItems,
        explorationLevel: session.explorationLevel,
    }
}
