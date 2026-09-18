import type { QuestionnaireAnswers } from "@/types/questionnaire";

export type RecommendationRequestPayload = {
  occasion: string;
  season: string;
  fitPreference: string;
  coverageLevel?: string;
  formalityLevel?: string;
  wardrobePalette: string;
  wardrobeItems: string[];
  explorationLevel: string;
};

function getSingleAnswer(
  answers: QuestionnaireAnswers,
  questionId: string,
): string {
  const value = answers[questionId]?.[0];

  if (!value) {
    throw new Error(`Missing answer for ${questionId}`);
  }

  return value;
}

function getMultipleAnswers(
  answers: QuestionnaireAnswers,
  questionId: string,
): string[] {
  return answers[questionId] ?? [];
}

// ------------------------------------
// Occasion
// ------------------------------------

const occasionMap: Record<string, string> = {
  daily: "DAILY",
  university: "UNIVERSITY",
  work: "WORK",
  friends: "FRIENDS_GATHERING",
  party: "PARTY",
  date_cafe: "DATE_CAFE",
  formal_event: "FORMAL_EVENT",
  travel: "TRAVEL",
};

// ------------------------------------
// Season
// ------------------------------------

const seasonMap: Record<string, string> = {
  spring: "SPRING",
  summer: "SUMMER",
  autumn: "FALL",
  winter: "WINTER",
  all_seasons: "ALL_SEASON",
};

// ------------------------------------
// Fit Preference
// ------------------------------------

const femaleFitMap: Record<string, string> = {
  loose: "LOOSE",
  semi_loose: "SEMI_LOOSE",
  regular: "BALANCED",
  fitted: "FITTED",

  loose_top_fitted_bottom: "LOOSE_TOP_FITTED_BOTTOM",

  fitted_top_loose_bottom: "FITTED_TOP_LOOSE_BOTTOM",
};

const maleFitMap: Record<string, string> = {
  loose: "LOOSE",
  semi_loose: "SEMI_LOOSE",
  regular: "BALANCED",
  fitted: "FITTED",

  loose_top_regular_pants: "LOOSE_TOP_BALANCED_BOTTOM",

  regular_top_loose_pants: "BALANCED_TOP_LOOSE_BOTTOM",
};

// ------------------------------------
// Female Coverage
// ------------------------------------

const coverageMap: Record<string, string> = {
  fully_covered: "FULLY_COVERED",

  covered_comfortable: "COVERED_COMFORTABLE",

  balanced: "BALANCED",

  no_specific_limit: "UNRESTRICTED",
};

// ------------------------------------
// Male Formality
// ------------------------------------

const formalityMap: Record<string, string> = {
  very_casual: "VERY_CASUAL",

  casual: "MOSTLY_CASUAL",

  balanced: "BALANCED",

  smart_casual: "SMART_CASUAL",

  formal: "FORMAL",
};

// ------------------------------------
// Wardrobe Palette
// ------------------------------------

const femaleWardrobePaletteMap: Record<string, string> = {
  black_white_gray: "BLACK_WHITE_GRAY",

  cream_beige_brown: "CREAM_BEIGE_BROWN",

  blue_navy: "FEMALE_BLUE_AND_NAVY",

  pastel: "FEMALE_PASTELS",

  warm_earthy: "FEMALE_WARM_AND_EARTHY",

  bright_varied: "FEMALE_BRIGHT_AND_VARIED",

  mixed: "MIXED_ALL",
};

const maleWardrobePaletteMap: Record<string, string> = {
  black_white_gray: "BLACK_WHITE_GRAY",

  cream_beige_brown: "CREAM_BEIGE_BROWN",

  blue_navy_gray: "MALE_BLUE_NAVY_GRAY",

  green_olive_earthy: "MALE_GREEN_OLIVE_EARTHY",

  dark: "MALE_DARK",

  bright: "MALE_LIGHT_AND_BRIGHT",

  mixed: "MIXED_ALL",
};

// ------------------------------------
// Wardrobe Items
// ------------------------------------

const femaleWardrobeItemMap: Record<string, string> = {
  long_coat: "MANTO_OR_LONG_COAT",

  blazer: "BLAZER_OR_COAT",

  blouse: "BLOUSE_OR_SHIRT",

  tshirt_top: "TSHIRT_OR_TOP",

  jeans: "JEANS",

  trousers: "TROUSERS",

  skirt: "SKIRT",

  sneakers: "SNEAKERS",

  formal_shoes: "FORMAL_OR_HEELS",

  bag: "CASUAL_BAG",

  new_outfit: "PREFER_ALL_NEW",
};

const maleWardrobeItemMap: Record<string, string> = {
  tshirt: "TSHIRT",

  polo: "POLO",

  shirt: "DRESS_SHIRT",

  hoodie: "HOODIE_OR_SWEATSHIRT",

  knitwear: "KNIT_OR_SWEATER",

  blazer: "BLAZER_OR_COAT",

  overshirt: "DENIM_JACKET_OR_OVERSHIRT",

  jeans: "JEANS",

  trousers: "TROUSERS",

  cargo: "CARGO_PANTS",

  sneakers: "SNEAKERS",

  formal_shoes: "FORMAL_OR_LOAFERS",

  new_outfit: "PREFER_ALL_NEW",
};

// ------------------------------------
// Exploration Level
// ------------------------------------

const explorationMap: Record<string, string> = {
  very_familiar: "FAMILIAR",

  slightly_different: "SLIGHTLY_NEW",

  balanced_exploration: "MIXED",

  creative: "CREATIVE",

  unsure: "UNSURE",

  bold: "BOLD",
};

// ------------------------------------
// Helper
// ------------------------------------

function mapValue(
  map: Record<string, string>,
  value: string,
  fieldName: string,
): string {
  const mappedValue = map[value];

  if (!mappedValue) {
    throw new Error(`Invalid value "${value}" for ${fieldName}`);
  }

  return mappedValue;
}

// ------------------------------------
// Main Mapper
// ------------------------------------

export function mapRequestAnswersToBackend(
  answers: QuestionnaireAnswers,
  gender: "female" | "male",
): RecommendationRequestPayload {
  const occasion = mapValue(
    occasionMap,
    getSingleAnswer(answers, "occasion"),
    "occasion",
  );

  const season = mapValue(
    seasonMap,
    getSingleAnswer(answers, "season"),
    "season",
  );

  if (gender === "female") {
    const wardrobeItems = getMultipleAnswers(
      answers,
      "female_wardrobe_items",
    ).map((item) =>
      mapValue(femaleWardrobeItemMap, item, "female wardrobe item"),
    );

    return {
      occasion,

      season,

      fitPreference: mapValue(
        femaleFitMap,
        getSingleAnswer(answers, "female_fit_preference"),
        "female fit preference",
      ),

      coverageLevel: mapValue(
        coverageMap,
        getSingleAnswer(answers, "female_coverage_preference"),
        "coverage level",
      ),

      wardrobePalette: mapValue(
        femaleWardrobePaletteMap,
        getSingleAnswer(answers, "female_wardrobe_palette"),
        "female wardrobe palette",
      ),

      wardrobeItems,

      explorationLevel: mapValue(
        explorationMap,
        getSingleAnswer(answers, "female_exploration_level"),
        "exploration level",
      ),
    };
  }

  const wardrobeItems = getMultipleAnswers(answers, "male_wardrobe_items").map(
    (item) => mapValue(maleWardrobeItemMap, item, "male wardrobe item"),
  );

  return {
    occasion,

    season,

    fitPreference: mapValue(
      maleFitMap,
      getSingleAnswer(answers, "male_fit_preference"),
      "male fit preference",
    ),

    formalityLevel: mapValue(
      formalityMap,
      getSingleAnswer(answers, "male_formality_level"),
      "formality level",
    ),

    wardrobePalette: mapValue(
      maleWardrobePaletteMap,
      getSingleAnswer(answers, "male_wardrobe_palette"),
      "male wardrobe palette",
    ),

    wardrobeItems,

    explorationLevel: mapValue(
      explorationMap,
      getSingleAnswer(answers, "male_exploration_level"),
      "exploration level",
    ),
  };
}
