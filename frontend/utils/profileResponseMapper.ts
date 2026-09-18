import type { QuestionnaireAnswers } from "@/types/questionnaire";

export type BackendStyleProfile = {
  skinTone: string | null;
  skinUndertone: string | null;
  bodyShape: string | null;
  favoriteStyles: string[];
  favoriteColorPalettes: string[];
  dislikedColors: string[];
};

export type BackendUserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  gender: string | null;
  ageGroup: string | null;
  createdAt: string;
  styleProfile: BackendStyleProfile | null;
};

const genderMap: Record<string, string> = {
  MALE: "male",
  FEMALE: "female",
};

const ageGroupMap: Record<string, string> = {
  UNDER_18: "under_18",
  EIGHTEEN_TO_24: "18_24",
  TWENTY_FIVE_TO_34: "25_34",
  THIRTY_FIVE_TO_44: "35_44",
  FORTY_FIVE_OR_OLDER: "45_plus",
};

const skinToneMap: Record<string, string> = {
  VERY_LIGHT: "very_fair",
  LIGHT: "fair",
  LIGHT_TO_MEDIUM: "light_medium",
  WHEATISH: "medium",
  OLIVE: "olive",
  DARK: "deep",
  UNSURE: "unsure",
};

const skinUndertoneMap: Record<string, string> = {
  WARM: "warm",
  COOL: "cool",
  NEUTRAL: "neutral",
  UNSURE: "unsure",
};

const femaleBodyShapeMap: Record<string, string> = {
  FEMALE_HOURGLASS: "hourglass",
  FEMALE_PEAR: "pear",
  FEMALE_APPLE: "apple",
  FEMALE_RECTANGLE: "rectangle",
  FEMALE_INVERTED_TRIANGLE: "inverted_triangle",
  UNSURE: "unsure",
};

const maleBodyShapeMap: Record<string, string> = {
  MALE_TRAPEZOID: "trapezoid",
  MALE_RECTANGLE: "rectangle",
  MALE_TRIANGLE: "triangle",
  MALE_OVAL: "oval",
  MALE_INVERTED_TRIANGLE: "inverted_triangle",
  UNSURE: "unsure",
};

const femaleStyleMap: Record<string, string> = {
  CASUAL_AND_DAILY: "casual",
  MINIMAL: "minimal",
  CLASSIC: "classic",
  FORMAL: "formal",
  SPORT: "sporty",
  STREET: "streetwear",
  FEMALE_ARITISTIC_AND_CREATIVE: "creative",
  FEMALE_ROMANTIC_AND_ELEGANT: "romantic",
};

const maleStyleMap: Record<string, string> = {
  CASUAL_AND_DAILY: "casual",
  MINIMAL: "minimal",
  CLASSIC: "classic",
  FORMAL: "formal",
  SPORT: "sporty",
  STREET: "streetwear",
  MALE_SMART_AND_CASUAL: "smart_casual",
  MALE_ROMANTIC_AND_DIFFERENT: "creative",
};

const femaleFavoritePaletteMap: Record<string, string> = {
  NEUTRAL_BLACK_WHITE_GRAY: "neutral",
  CREAM_AND_BROWN: "cream_brown",
  PASTELS: "pastel",
  DARK: "dark",
  LIGHT_AND_BRIGHT: "bright",
  FEMALE_WARM_RED_ORANGE_BRIGHT_ORANGE: "warm",
  FEMALE_COLD_BLUE_PURPLE_GREEN: "cool",
};

const maleFavoritePaletteMap: Record<string, string> = {
  NEUTRAL_BLACK_WHITE_GRAY: "neutral",
  CREAM_AND_BROWN: "cream_brown",
  PASTELS: "pastel",
  DARK: "dark",
  LIGHT_AND_BRIGHT: "bright",
  MALE_BLUE_AND_NAVY_BLUES: "blue_navy",
  MALE_GREEN_AND_OLIVE: "green_olive",
  MALE_WARM_AND_KHAKI: "warm_earthy",
};

const dislikedColorMap: Record<string, string> = {
  BLACK: "black",
  WHITE_AND_CREAMY: "white_cream",
  BROWN: "brown",
  RED_AND_ORANGE: "red_orange",
  PINK: "pink",
  YELLOW: "yellow",
  GREEN: "green",
  BLUE: "blue",
  PURPLE: "purple",
};

function mapSingleValue(
  value: string | null,
  map: Record<string, string>,
): string[] {
  if (!value) {
    return [];
  }

  const mappedValue = map[value];

  return mappedValue ? [mappedValue] : [];
}

function mapMultipleValues(
  values: string[],
  map: Record<string, string>,
): string[] {
  return values
    .map((value) => map[value])
    .filter((value): value is string => Boolean(value));
}

export function mapBackendProfileToAnswers(
  profile: BackendUserProfile,
): QuestionnaireAnswers {
  const answers: QuestionnaireAnswers = {};

  const frontendGender = profile.gender ? genderMap[profile.gender] : undefined;

  if (frontendGender) {
    answers.gender = [frontendGender];
  }

  if (profile.ageGroup) {
    answers.age_group = mapSingleValue(profile.ageGroup, ageGroupMap);
  }

  if (!profile.styleProfile) {
    return answers;
  }

  const styleProfile = profile.styleProfile;

  answers.skin_tone = mapSingleValue(styleProfile.skinTone, skinToneMap);

  answers.skin_undertone = mapSingleValue(
    styleProfile.skinUndertone,
    skinUndertoneMap,
  );

  if (frontendGender === "female") {
    answers.female_body_shape = mapSingleValue(
      styleProfile.bodyShape,
      femaleBodyShapeMap,
    );

    answers.female_style_preferences = mapMultipleValues(
      styleProfile.favoriteStyles,
      femaleStyleMap,
    );

    answers.female_favorite_color_palettes = mapMultipleValues(
      styleProfile.favoriteColorPalettes,
      femaleFavoritePaletteMap,
    );
  }

  if (frontendGender === "male") {
    answers.male_body_shape = mapSingleValue(
      styleProfile.bodyShape,
      maleBodyShapeMap,
    );

    answers.male_style_preferences = mapMultipleValues(
      styleProfile.favoriteStyles,
      maleStyleMap,
    );

    answers.male_favorite_color_palettes = mapMultipleValues(
      styleProfile.favoriteColorPalettes,
      maleFavoritePaletteMap,
    );
  }

  const mappedDislikedColors = mapMultipleValues(
    styleProfile.dislikedColors,
    dislikedColorMap,
  );

  answers.colors_disliked =
    mappedDislikedColors.length > 0 ? mappedDislikedColors : ["none"];

  return answers;
}
