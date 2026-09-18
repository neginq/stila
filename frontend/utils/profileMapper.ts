import type { QuestionnaireAnswers } from "@/types/questionnaire";

export type ProfileUpdatePayload = {
  gender: "MALE" | "FEMALE";
  ageGroup:
    | "UNDER_18"
    | "EIGHTEEN_TO_24"
    | "TWENTY_FIVE_TO_34"
    | "THIRTY_FIVE_TO_44"
    | "FORTY_FIVE_OR_OLDER";
  skinTone:
    | "VERY_LIGHT"
    | "LIGHT"
    | "LIGHT_TO_MEDIUM"
    | "WHEATISH"
    | "OLIVE"
    | "DARK"
    | "UNSURE";
  skinUndertone: "WARM" | "COOL" | "NEUTRAL" | "UNSURE";
  bodyShape: string;
  favoriteStyles: string[];
  favoriteColorPalettes: string[];
  dislikedColors: string[];
};

const genderMap = {
  female: "FEMALE",
  male: "MALE",
} as const;

const ageGroupMap = {
  under_18: "UNDER_18",
  "18_24": "EIGHTEEN_TO_24",
  "25_34": "TWENTY_FIVE_TO_34",
  "35_44": "THIRTY_FIVE_TO_44",
  "45_plus": "FORTY_FIVE_OR_OLDER",
} as const;

const skinToneMap = {
  very_fair: "VERY_LIGHT",
  fair: "LIGHT",
  light_medium: "LIGHT_TO_MEDIUM",
  medium: "WHEATISH",
  olive: "OLIVE",
  deep: "DARK",
  unsure: "UNSURE",
} as const;

const skinUndertoneMap = {
  warm: "WARM",
  cool: "COOL",
  neutral: "NEUTRAL",
  unsure: "UNSURE",
} as const;

const femaleBodyShapeMap = {
  hourglass: "FEMALE_HOURGLASS",
  pear: "FEMALE_PEAR",
  apple: "FEMALE_APPLE",
  rectangle: "FEMALE_RECTANGLE",
  inverted_triangle: "FEMALE_INVERTED_TRIANGLE",
  unsure: "UNSURE",
} as const;

const maleBodyShapeMap = {
  trapezoid: "MALE_TRAPEZOID",
  rectangle: "MALE_RECTANGLE",
  triangle: "MALE_TRIANGLE",
  oval: "MALE_OVAL",
  inverted_triangle: "MALE_INVERTED_TRIANGLE",
  unsure: "UNSURE",
} as const;

const sharedStyleMap = {
  casual: "CASUAL_AND_DAILY",
  minimal: "MINIMAL",
  classic: "CLASSIC",
  formal: "FORMAL",
  sporty: "SPORT",
  streetwear: "STREET",
} as const;

const femaleStyleMap = {
  ...sharedStyleMap,
  creative: "FEMALE_ARITISTIC_AND_CREATIVE",
  romantic: "FEMALE_ROMANTIC_AND_ELEGANT",
} as const;

const maleStyleMap = {
  ...sharedStyleMap,
  smart_casual: "MALE_SMART_AND_CASUAL",
  creative: "MALE_ROMANTIC_AND_DIFFERENT",
} as const;

const sharedFavoritePaletteMap = {
  neutral: "NEUTRAL_BLACK_WHITE_GRAY",
  cream_brown: "CREAM_AND_BROWN",
  pastel: "PASTELS",
  dark: "DARK",
  bright: "LIGHT_AND_BRIGHT",
} as const;

const femaleFavoritePaletteMap = {
  ...sharedFavoritePaletteMap,
  warm: "FEMALE_WARM_RED_ORANGE_BRIGHT_ORANGE",
  cool: "FEMALE_COLD_BLUE_PURPLE_GREEN",
} as const;

const maleFavoritePaletteMap = {
  ...sharedFavoritePaletteMap,
  blue_navy: "MALE_BLUE_AND_NAVY_BLUES",
  green_olive: "MALE_GREEN_AND_OLIVE",
  warm_earthy: "MALE_WARM_AND_KHAKI",
} as const;

const dislikedColorMap = {
  black: "BLACK",
  white_cream: "WHITE_AND_CREAMY",
  brown: "BROWN",
  red_orange: "RED_AND_ORANGE",
  pink: "PINK",
  yellow: "YELLOW",
  green: "GREEN",
  blue: "BLUE",
  purple: "PURPLE",
} as const;

function getSingleAnswer(
  answers: QuestionnaireAnswers,
  questionId: string,
): string {
  const values = answers[questionId];

  if (!values || values.length === 0) {
    throw new Error(`Missing answer for ${questionId}`);
  }

  return values[0];
}

function getMultipleAnswers(
  answers: QuestionnaireAnswers,
  questionId: string,
): string[] {
  return answers[questionId] ?? [];
}

function mapValue(
  value: string,
  map: Record<string, string>,
  fieldName: string,
): string {
  const mappedValue = map[value];

  if (!mappedValue) {
    throw new Error(`Invalid ${fieldName} value: ${value}`);
  }

  return mappedValue;
}

export function mapProfileAnswersToBackend(
  answers: QuestionnaireAnswers,
): ProfileUpdatePayload {
  const frontendGender = getSingleAnswer(answers, "gender");

  const gender = mapValue(
    frontendGender,
    genderMap,
    "gender",
  ) as ProfileUpdatePayload["gender"];

  const ageGroup = mapValue(
    getSingleAnswer(answers, "age_group"),
    ageGroupMap,
    "ageGroup",
  ) as ProfileUpdatePayload["ageGroup"];

  const skinTone = mapValue(
    getSingleAnswer(answers, "skin_tone"),
    skinToneMap,
    "skinTone",
  ) as ProfileUpdatePayload["skinTone"];

  const skinUndertone = mapValue(
    getSingleAnswer(answers, "skin_undertone"),
    skinUndertoneMap,
    "skinUndertone",
  ) as ProfileUpdatePayload["skinUndertone"];

  if (frontendGender === "female") {
    const bodyShape = mapValue(
      getSingleAnswer(answers, "female_body_shape"),
      femaleBodyShapeMap,
      "bodyShape",
    );

    const favoriteStyles = getMultipleAnswers(
      answers,
      "female_style_preferences",
    ).map((value) => mapValue(value, femaleStyleMap, "favoriteStyle"));

    const favoriteColorPalettes = getMultipleAnswers(
      answers,
      "female_favorite_color_palettes",
    ).map((value) =>
      mapValue(value, femaleFavoritePaletteMap, "favoriteColorPalette"),
    );

    const dislikedColors = getMultipleAnswers(answers, "colors_disliked")
      .filter((value) => value !== "none")
      .map((value) => mapValue(value, dislikedColorMap, "dislikedColor"));

    return {
      gender,
      ageGroup,
      skinTone,
      skinUndertone,
      bodyShape,
      favoriteStyles,
      favoriteColorPalettes,
      dislikedColors,
    };
  }

  const bodyShape = mapValue(
    getSingleAnswer(answers, "male_body_shape"),
    maleBodyShapeMap,
    "bodyShape",
  );

  const favoriteStyles = getMultipleAnswers(
    answers,
    "male_style_preferences",
  ).map((value) => mapValue(value, maleStyleMap, "favoriteStyle"));

  const favoriteColorPalettes = getMultipleAnswers(
    answers,
    "male_favorite_color_palettes",
  ).map((value) =>
    mapValue(value, maleFavoritePaletteMap, "favoriteColorPalette"),
  );

  const dislikedColors = getMultipleAnswers(answers, "colors_disliked")
    .filter((value) => value !== "none")
    .map((value) => mapValue(value, dislikedColorMap, "dislikedColor"));

  return {
    gender,
    ageGroup,
    skinTone,
    skinUndertone,
    bodyShape,
    favoriteStyles,
    favoriteColorPalettes,
    dislikedColors,
  };
}
