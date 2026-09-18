/** Tunable scoring weights for the rule engine. Soft factors only. */
export const SCORE_WEIGHTS = {
    occasion: 25,
    season: 20,
    style: 20,
    coverageOrFormality: 20,
    fit: 15,
    undertone: 15,
    favoriteColors: 15,
    wardrobeItems: 15,
    bodyShape: 10,
    wardrobePalette: 10,
    exploration: 10,
    skinTone: 5,
    age: 2,
} as const

export type ScoreWeightKey = keyof typeof SCORE_WEIGHTS
