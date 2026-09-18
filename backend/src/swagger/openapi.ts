import {
    AgeGroup,
    BodyShape,
    ClothingItemType,
    ClothingSlot,
    ColorFamily,
    CoverageLevel,
    DislikedColor,
    ExplorationLevel,
    FavoriteColorPalette,
    FavoriteStyle,
    FitPreference,
    FormalityLevel,
    Gender,
    ItemFit,
    NoveltyLevel,
    Occasion,
    OutfitIntent,
    Season,
    SkinTone,
    SkinUndertone,
    WardrobeItemType,
    WardrobePalette,
} from "../../generated/prisma/client"

type StringEnumSchema = {
    type: "string"
    enum: string[]
    description?: string
}

function stringEnum(values: readonly string[], description?: string): StringEnumSchema {
    const schema: StringEnumSchema = {
        type: "string",
        enum: [...values],
    }
    if (description !== undefined) {
        schema.description = description
    }
    return schema
}

function valuesOf(enumObject: { readonly [key: string]: string }): string[] {
    return Object.values(enumObject)
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })

const bodyShapeMale = [
    BodyShape.MALE_TRAPEZOID,
    BodyShape.MALE_TRIANGLE,
    BodyShape.MALE_RECTANGLE,
    BodyShape.MALE_OVAL,
    BodyShape.MALE_INVERTED_TRIANGLE,
    BodyShape.UNSURE,
]

const bodyShapeFemale = [
    BodyShape.FEMALE_HOURGLASS,
    BodyShape.FEMALE_APPLE,
    BodyShape.FEMALE_PEAR,
    BodyShape.FEMALE_RECTANGLE,
    BodyShape.FEMALE_INVERTED_TRIANGLE,
    BodyShape.UNSURE,
]

const favoriteStyleShared = [
    FavoriteStyle.CASUAL_AND_DAILY,
    FavoriteStyle.MINIMAL,
    FavoriteStyle.CLASSIC,
    FavoriteStyle.FORMAL,
    FavoriteStyle.SPORT,
    FavoriteStyle.STREET,
]

const favoriteStyleMale = [
    ...favoriteStyleShared,
    FavoriteStyle.MALE_SMART_AND_CASUAL,
    FavoriteStyle.MALE_ROMANTIC_AND_DIFFERENT,
]

const favoriteStyleFemale = [
    ...favoriteStyleShared,
    FavoriteStyle.FEMALE_ARITISTIC_AND_CREATIVE,
    FavoriteStyle.FEMALE_ROMANTIC_AND_ELEGANT,
]

const favoriteColorPaletteShared = [
    FavoriteColorPalette.NEUTRAL_BLACK_WHITE_GRAY,
    FavoriteColorPalette.CREAM_AND_BROWN,
    FavoriteColorPalette.PASTELS,
    FavoriteColorPalette.DARK,
    FavoriteColorPalette.LIGHT_AND_BRIGHT,
]

const favoriteColorPaletteMale = [
    ...favoriteColorPaletteShared,
    FavoriteColorPalette.MALE_BLUE_AND_NAVY_BLUES,
    FavoriteColorPalette.MALE_GREEN_AND_OLIVE,
    FavoriteColorPalette.MALE_WARM_AND_KHAKI,
]

const favoriteColorPaletteFemale = [
    ...favoriteColorPaletteShared,
    FavoriteColorPalette.FEMALE_WARM_RED_ORANGE_BRIGHT_ORANGE,
    FavoriteColorPalette.FEMALE_COLD_BLUE_PURPLE_GREEN,
]

const fitPreferenceShared = [
    FitPreference.LOOSE,
    FitPreference.SEMI_LOOSE,
    FitPreference.BALANCED,
    FitPreference.FITTED,
]

const fitPreferenceMale = [
    ...fitPreferenceShared,
    FitPreference.LOOSE_TOP_BALANCED_BOTTOM,
    FitPreference.BALANCED_TOP_LOOSE_BOTTOM,
]

const fitPreferenceFemale = [
    ...fitPreferenceShared,
    FitPreference.LOOSE_TOP_FITTED_BOTTOM,
    FitPreference.FITTED_TOP_LOOSE_BOTTOM,
]

const wardrobePaletteShared = [
    WardrobePalette.BLACK_WHITE_GRAY,
    WardrobePalette.CREAM_BEIGE_BROWN,
    WardrobePalette.MIXED_ALL,
]

const wardrobePaletteMale = [
    ...wardrobePaletteShared,
    WardrobePalette.MALE_BLUE_NAVY_GRAY,
    WardrobePalette.MALE_GREEN_OLIVE_EARTHY,
    WardrobePalette.MALE_DARK,
    WardrobePalette.MALE_LIGHT_AND_BRIGHT,
]

const wardrobePaletteFemale = [
    ...wardrobePaletteShared,
    WardrobePalette.FEMALE_BLUE_AND_NAVY,
    WardrobePalette.FEMALE_PASTELS,
    WardrobePalette.FEMALE_WARM_AND_EARTHY,
    WardrobePalette.FEMALE_BRIGHT_AND_VARIED,
]

const wardrobeItemShared = [
    WardrobeItemType.PREFER_ALL_NEW,
    WardrobeItemType.JEANS,
    WardrobeItemType.TROUSERS,
    WardrobeItemType.SNEAKERS,
    WardrobeItemType.BLAZER_OR_COAT,
]

const wardrobeItemMale = [
    ...wardrobeItemShared,
    WardrobeItemType.TSHIRT,
    WardrobeItemType.POLO,
    WardrobeItemType.DRESS_SHIRT,
    WardrobeItemType.HOODIE_OR_SWEATSHIRT,
    WardrobeItemType.KNIT_OR_SWEATER,
    WardrobeItemType.DENIM_JACKET_OR_OVERSHIRT,
    WardrobeItemType.CARGO_PANTS,
    WardrobeItemType.FORMAL_OR_LOAFERS,
]

const wardrobeItemFemale = [
    ...wardrobeItemShared,
    WardrobeItemType.MANTO_OR_LONG_COAT,
    WardrobeItemType.BLOUSE_OR_SHIRT,
    WardrobeItemType.TSHIRT_OR_TOP,
    WardrobeItemType.SKIRT,
    WardrobeItemType.FORMAL_OR_HEELS,
    WardrobeItemType.CASUAL_BAG,
]

const explorationLevelShared = [
    ExplorationLevel.FAMILIAR,
    ExplorationLevel.SLIGHTLY_NEW,
    ExplorationLevel.MIXED,
    ExplorationLevel.CREATIVE,
]

const explorationLevelMale = [...explorationLevelShared, ExplorationLevel.BOLD]
const explorationLevelFemale = [...explorationLevelShared, ExplorationLevel.UNSURE]

const bearerHeader = {
    Authorization: {
        type: "apiKey" as const,
        in: "header" as const,
        name: "Authorization",
        description:
            "Full token from signup/login, including the Bearer prefix. Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`",
    },
}

const unauthorized = {
    description: "Missing or invalid Authorization header. Empty body.",
}

const notFound = {
    description: "User not found. Empty body.",
}

const invalidBody = {
    description: "Request body failed validation. Empty body.",
}

export const openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "Stylist Backend",
        version: "1.0.0",
        description: [
            "Outfit recommendation API.",
            "",
            "Send Prisma enum names (for example `MALE`, `DAILY`), not database `@map` values.",
            "Signup and login return `token` already prefixed with `Bearer `. Use that exact value in the Authorize dialog.",
            "Gender-specific request fields only accept the values listed on that field.",
        ].join("\n"),
    },
    servers: [{ url: "/", description: "Current host" }],
    tags: [
        { name: "Auth", description: "Signup and login" },
        { name: "User", description: "Authenticated profile retrieve and update" },
        { name: "Recommend", description: "Outfit recommendation session and history" },
    ],
    paths: {
        "/auth/signup": {
            post: {
                tags: ["Auth"],
                summary: "Sign up",
                operationId: "signup",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: ref("SignupBody"),
                            example: {
                                firstName: "Ali",
                                lastName: "Rezaei",
                                mobileNumber: "09121234567",
                                password: "secret123",
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User created.",
                        content: {
                            "application/json": {
                                schema: ref("AuthResponse"),
                            },
                        },
                    },
                    "409": {
                        description: "Mobile number already registered. Empty body.",
                    },
                },
            },
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Log in",
                operationId: "login",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: ref("LoginBody"),
                            example: {
                                mobileNumber: "09121234567",
                                password: "secret123",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Login succeeded.",
                        content: {
                            "application/json": {
                                schema: ref("AuthResponse"),
                            },
                        },
                    },
                    "401": {
                        description: "Unknown mobile number or wrong password. Empty body.",
                    },
                },
            },
        },
        "/user/profile": {
            get: {
                tags: ["User"],
                summary: "Get profile",
                description:
                    "Returns the authenticated user plus their style profile. `styleProfile` is null until style fields have been saved.",
                operationId: "getUserProfile",
                security: [{ Authorization: [] }],
                responses: {
                    "200": {
                        description: "Authenticated user and optional style profile.",
                        content: {
                            "application/json": {
                                schema: ref("UserProfileResponse"),
                                examples: {
                                    withStyleProfile: {
                                        summary: "User with style profile",
                                        value: {
                                            id: 1,
                                            firstName: "Ali",
                                            lastName: "Rezaei",
                                            mobileNumber: "09121234567",
                                            gender: "MALE",
                                            ageGroup: "TWENTY_FIVE_TO_34",
                                            createdAt: "2026-08-24T17:21:00.000Z",
                                            styleProfile: {
                                                skinTone: "WHEATISH",
                                                skinUndertone: "WARM",
                                                bodyShape: "MALE_TRAPEZOID",
                                                favoriteStyles: ["CASUAL_AND_DAILY", "MALE_SMART_AND_CASUAL"],
                                                favoriteColorPalettes: [
                                                    "NEUTRAL_BLACK_WHITE_GRAY",
                                                    "MALE_BLUE_AND_NAVY_BLUES",
                                                ],
                                                dislikedColors: ["PINK", "YELLOW"],
                                            },
                                        },
                                    },
                                    withoutStyleProfile: {
                                        summary: "User without style profile",
                                        value: {
                                            id: 2,
                                            firstName: "Sara",
                                            lastName: "Ahmadi",
                                            mobileNumber: "09129876543",
                                            gender: null,
                                            ageGroup: null,
                                            createdAt: "2026-08-24T17:21:00.000Z",
                                            styleProfile: null,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": unauthorized,
                    "404": notFound,
                },
            },
            patch: {
                tags: ["User"],
                summary: "Update profile",
                description:
                    "Partial update. All fields are optional. Gender-specific values must match the effective gender (body `gender` if sent, otherwise the stored user gender).",
                operationId: "updateUserProfile",
                security: [{ Authorization: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                oneOf: [
                                    ref("UpdateUserProfileMaleBody"),
                                    ref("UpdateUserProfileFemaleBody"),
                                ],
                            },
                            examples: {
                                male: {
                                    summary: "Male profile",
                                    value: {
                                        firstName: "Ali",
                                        lastName: "Rezaei",
                                        gender: "MALE",
                                        ageGroup: "TWENTY_FIVE_TO_34",
                                        skinTone: "WHEATISH",
                                        skinUndertone: "WARM",
                                        bodyShape: "MALE_TRAPEZOID",
                                        favoriteStyles: ["CASUAL_AND_DAILY", "MALE_SMART_AND_CASUAL"],
                                        favoriteColorPalettes: ["NEUTRAL_BLACK_WHITE_GRAY", "MALE_BLUE_AND_NAVY_BLUES"],
                                        dislikedColors: ["PINK", "YELLOW"],
                                    },
                                },
                                female: {
                                    summary: "Female profile",
                                    value: {
                                        firstName: "Sara",
                                        lastName: "Ahmadi",
                                        gender: "FEMALE",
                                        ageGroup: "EIGHTEEN_TO_24",
                                        skinTone: "LIGHT_TO_MEDIUM",
                                        skinUndertone: "COOL",
                                        bodyShape: "FEMALE_HOURGLASS",
                                        favoriteStyles: ["MINIMAL", "FEMALE_ROMANTIC_AND_ELEGANT"],
                                        favoriteColorPalettes: ["PASTELS", "FEMALE_COLD_BLUE_PURPLE_GREEN"],
                                        dislikedColors: ["BROWN"],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "204": { description: "Profile updated. Empty body." },
                    "400": invalidBody,
                    "401": unauthorized,
                    "404": notFound,
                },
            },
        },
        "/recommend": {
            post: {
                tags: ["Recommend"],
                summary: "Create recommendation",
                description: [
                    "Builds and stores outfits for the authenticated user.",
                    "Gender comes from the user profile, not the request body.",
                    "Male: `formalityLevel` is required and `coverageLevel` must be omitted.",
                    "Female: `coverageLevel` is required and `formalityLevel` must be omitted.",
                    "Style profile must be complete or the API returns `profile_incomplete`.",
                ].join("\n"),
                operationId: "createRecommendation",
                security: [{ Authorization: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                oneOf: [
                                    ref("RecommendSessionMaleBody"),
                                    ref("RecommendSessionFemaleBody"),
                                ],
                            },
                            examples: {
                                male: {
                                    summary: "Male session",
                                    value: {
                                        occasion: "WORK",
                                        season: "FALL",
                                        fitPreference: "BALANCED",
                                        formalityLevel: "SMART_CASUAL",
                                        wardrobePalette: "MALE_BLUE_NAVY_GRAY",
                                        wardrobeItems: ["JEANS", "DRESS_SHIRT", "SNEAKERS"],
                                        explorationLevel: "SLIGHTLY_NEW",
                                    },
                                },
                                female: {
                                    summary: "Female session",
                                    value: {
                                        occasion: "DATE_CAFE",
                                        season: "SPRING",
                                        fitPreference: "LOOSE_TOP_FITTED_BOTTOM",
                                        coverageLevel: "COVERED_COMFORTABLE",
                                        wardrobePalette: "FEMALE_PASTELS",
                                        wardrobeItems: ["BLOUSE_OR_SHIRT", "JEANS", "CASUAL_BAG"],
                                        explorationLevel: "MIXED",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Recommendation stored.",
                        content: {
                            "application/json": {
                                schema: ref("RecommendEndpointResponse"),
                            },
                        },
                    },
                    "400": {
                        description:
                            "Invalid body (empty) or incomplete profile (`profile_incomplete` JSON).",
                        content: {
                            "application/json": {
                                schema: ref("ErrorResponse"),
                                examples: {
                                    missingGender: {
                                        value: {
                                            error: "profile_incomplete",
                                            message: "gender is required",
                                        },
                                    },
                                    incompleteProfile: {
                                        value: {
                                            error: "profile_incomplete",
                                            message: "complete style profile before requesting recommendations",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": unauthorized,
                    "404": notFound,
                    "422": {
                        description:
                            "No outfits could be built. `diagnostic.cause` is `empty_required_slot` (a required clothing slot had no items after filters) or `all_candidates_vetoed` (combinations were built, then all failed the formality veto).",
                        content: {
                            "application/json": {
                                schema: ref("NoOutfitsErrorResponse"),
                                examples: {
                                    emptyRequiredSlot: {
                                        summary: "A required slot had no surviving items",
                                        value: {
                                            error: "no_outfits",
                                            message: "could not build outfits for the given preferences",
                                            diagnostic: {
                                                cause: "empty_required_slot",
                                                requiredSlots: ["TOP", "BOTTOM", "SHOES", "OUTERWEAR"],
                                                remainingBySlot: {
                                                    TOP: 4,
                                                    BOTTOM: 3,
                                                    SHOES: 0,
                                                    OUTERWEAR: 7,
                                                },
                                                filteredItemCount: 22,
                                                missingSlots: ["SHOES"],
                                                candidateCount: 0,
                                                vetoReasons: [],
                                            },
                                        },
                                    },
                                    allCandidatesVetoed: {
                                        summary: "Candidates existed; every combo failed formality",
                                        value: {
                                            error: "no_outfits",
                                            message: "could not build outfits for the given preferences",
                                            diagnostic: {
                                                cause: "all_candidates_vetoed",
                                                requiredSlots: ["TOP", "BOTTOM", "SHOES"],
                                                remainingBySlot: {
                                                    TOP: 11,
                                                    BOTTOM: 8,
                                                    SHOES: 7,
                                                },
                                                filteredItemCount: 51,
                                                missingSlots: [],
                                                candidateCount: 16,
                                                vetoReasons: ["formality_clash:TOP/SHOES"],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/recommend/history": {
            get: {
                tags: ["Recommend"],
                summary: "Recommendation history",
                operationId: "getRecommendationHistory",
                security: [{ Authorization: [] }],
                parameters: [
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 0,
                            default: 20,
                        },
                        description: "Page size. Non-numeric or negative values fall back to 20.",
                    },
                    {
                        name: "offset",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 0,
                            default: 0,
                        },
                        description: "Items to skip. Non-numeric or negative values fall back to 0.",
                    },
                ],
                responses: {
                    "200": {
                        description: "Paged history, newest first.",
                        content: {
                            "application/json": {
                                schema: ref("RecommendHistoryEndpointResponse"),
                            },
                        },
                    },
                    "401": unauthorized,
                },
            },
        },
    },
    components: {
        securitySchemes: bearerHeader,
        schemas: {
            Gender: stringEnum(valuesOf(Gender)),
            AgeGroup: stringEnum(valuesOf(AgeGroup)),
            SkinTone: stringEnum(valuesOf(SkinTone)),
            SkinUndertone: stringEnum(valuesOf(SkinUndertone)),
            BodyShape: stringEnum(valuesOf(BodyShape), "Full set. Requests must use the gender-specific schema."),
            BodyShapeMale: stringEnum(bodyShapeMale, "Allowed when effective gender is MALE."),
            BodyShapeFemale: stringEnum(bodyShapeFemale, "Allowed when effective gender is FEMALE."),
            FavoriteStyle: stringEnum(valuesOf(FavoriteStyle), "Full set. Requests must use the gender-specific schema."),
            FavoriteStyleMale: stringEnum(favoriteStyleMale, "Allowed when effective gender is MALE."),
            FavoriteStyleFemale: stringEnum(favoriteStyleFemale, "Allowed when effective gender is FEMALE."),
            FavoriteColorPalette: stringEnum(
                valuesOf(FavoriteColorPalette),
                "Full set. Requests must use the gender-specific schema.",
            ),
            FavoriteColorPaletteMale: stringEnum(
                favoriteColorPaletteMale,
                "Allowed when effective gender is MALE.",
            ),
            FavoriteColorPaletteFemale: stringEnum(
                favoriteColorPaletteFemale,
                "Allowed when effective gender is FEMALE.",
            ),
            DislikedColor: stringEnum(valuesOf(DislikedColor)),
            Occasion: stringEnum(valuesOf(Occasion), "Same values for men and women."),
            Season: stringEnum(valuesOf(Season), "Same values for men and women."),
            FitPreference: stringEnum(valuesOf(FitPreference), "Full set. Requests must use the gender-specific schema."),
            FitPreferenceMale: stringEnum(fitPreferenceMale, "Allowed when user gender is MALE."),
            FitPreferenceFemale: stringEnum(fitPreferenceFemale, "Allowed when user gender is FEMALE."),
            CoverageLevel: stringEnum(valuesOf(CoverageLevel), "Required for female recommend sessions. Must be omitted for male."),
            FormalityLevel: stringEnum(valuesOf(FormalityLevel), "Required for male recommend sessions. Must be omitted for female."),
            WardrobePalette: stringEnum(valuesOf(WardrobePalette), "Full set. Requests must use the gender-specific schema."),
            WardrobePaletteMale: stringEnum(wardrobePaletteMale, "Allowed when user gender is MALE."),
            WardrobePaletteFemale: stringEnum(wardrobePaletteFemale, "Allowed when user gender is FEMALE."),
            WardrobeItemType: stringEnum(valuesOf(WardrobeItemType), "Full set. Requests must use the gender-specific schema."),
            WardrobeItemTypeMale: stringEnum(
                wardrobeItemMale,
                "Allowed when user gender is MALE. If PREFER_ALL_NEW is sent it must be the only item.",
            ),
            WardrobeItemTypeFemale: stringEnum(
                wardrobeItemFemale,
                "Allowed when user gender is FEMALE. If PREFER_ALL_NEW is sent it must be the only item.",
            ),
            ExplorationLevel: stringEnum(valuesOf(ExplorationLevel), "Full set. Requests must use the gender-specific schema."),
            ExplorationLevelMale: stringEnum(explorationLevelMale, "Allowed when user gender is MALE."),
            ExplorationLevelFemale: stringEnum(explorationLevelFemale, "Allowed when user gender is FEMALE."),
            ClothingSlot: stringEnum(valuesOf(ClothingSlot)),
            ColorFamily: stringEnum(valuesOf(ColorFamily)),
            ClothingItemType: stringEnum(valuesOf(ClothingItemType)),
            ItemFit: stringEnum(valuesOf(ItemFit)),
            NoveltyLevel: stringEnum(valuesOf(NoveltyLevel)),
            OutfitIntent: stringEnum(valuesOf(OutfitIntent)),

            SignupBody: {
                type: "object",
                additionalProperties: false,
                required: ["firstName", "lastName", "mobileNumber", "password"],
                properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    mobileNumber: { type: "string" },
                    password: { type: "string", format: "password" },
                },
            },
            LoginBody: {
                type: "object",
                additionalProperties: false,
                required: ["mobileNumber", "password"],
                properties: {
                    mobileNumber: { type: "string" },
                    password: { type: "string", format: "password" },
                },
            },
            AuthResponse: {
                type: "object",
                additionalProperties: false,
                required: ["token"],
                properties: {
                    token: {
                        type: "string",
                        description: "JWT already prefixed with `Bearer `. Send this exact value as the Authorization header.",
                        example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                },
            },

            UserStyleProfileResponse: {
                type: "object",
                additionalProperties: false,
                required: [
                    "skinTone",
                    "skinUndertone",
                    "bodyShape",
                    "favoriteStyles",
                    "favoriteColorPalettes",
                    "dislikedColors",
                ],
                properties: {
                    skinTone: {
                        nullable: true,
                        allOf: [ref("SkinTone")],
                    },
                    skinUndertone: {
                        nullable: true,
                        allOf: [ref("SkinUndertone")],
                    },
                    bodyShape: {
                        nullable: true,
                        allOf: [ref("BodyShape")],
                    },
                    favoriteStyles: {
                        type: "array",
                        items: ref("FavoriteStyle"),
                    },
                    favoriteColorPalettes: {
                        type: "array",
                        items: ref("FavoriteColorPalette"),
                    },
                    dislikedColors: {
                        type: "array",
                        items: ref("DislikedColor"),
                    },
                },
            },
            UserProfileResponse: {
                type: "object",
                additionalProperties: false,
                required: [
                    "id",
                    "firstName",
                    "lastName",
                    "mobileNumber",
                    "gender",
                    "ageGroup",
                    "createdAt",
                    "styleProfile",
                ],
                properties: {
                    id: { type: "integer" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    mobileNumber: { type: "string" },
                    gender: {
                        nullable: true,
                        allOf: [ref("Gender")],
                    },
                    ageGroup: {
                        nullable: true,
                        allOf: [ref("AgeGroup")],
                    },
                    createdAt: { type: "string", format: "date-time" },
                    styleProfile: {
                        nullable: true,
                        allOf: [ref("UserStyleProfileResponse")],
                        description: "Null until the user has saved style fields.",
                    },
                },
            },

            UpdateUserProfileMaleBody: {
                type: "object",
                additionalProperties: false,
                description: "All fields optional. Gender-specific fields must be male-compatible.",
                properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    gender: {
                        allOf: [ref("Gender")],
                        description: "Set to MALE for this schema.",
                    },
                    ageGroup: ref("AgeGroup"),
                    skinTone: ref("SkinTone"),
                    skinUndertone: ref("SkinUndertone"),
                    bodyShape: ref("BodyShapeMale"),
                    favoriteStyles: {
                        type: "array",
                        maxItems: 2,
                        items: ref("FavoriteStyleMale"),
                        description: "Max 2. Male-allowed styles only.",
                    },
                    favoriteColorPalettes: {
                        type: "array",
                        maxItems: 3,
                        items: ref("FavoriteColorPaletteMale"),
                        description: "Max 3. Male-allowed palettes only.",
                    },
                    dislikedColors: {
                        type: "array",
                        maxItems: 3,
                        items: ref("DislikedColor"),
                        description: "Max 3.",
                    },
                },
            },
            UpdateUserProfileFemaleBody: {
                type: "object",
                additionalProperties: false,
                description: "All fields optional. Gender-specific fields must be female-compatible.",
                properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    gender: {
                        allOf: [ref("Gender")],
                        description: "Set to FEMALE for this schema.",
                    },
                    ageGroup: ref("AgeGroup"),
                    skinTone: ref("SkinTone"),
                    skinUndertone: ref("SkinUndertone"),
                    bodyShape: ref("BodyShapeFemale"),
                    favoriteStyles: {
                        type: "array",
                        maxItems: 2,
                        items: ref("FavoriteStyleFemale"),
                        description: "Max 2. Female-allowed styles only.",
                    },
                    favoriteColorPalettes: {
                        type: "array",
                        maxItems: 3,
                        items: ref("FavoriteColorPaletteFemale"),
                        description: "Max 3. Female-allowed palettes only.",
                    },
                    dislikedColors: {
                        type: "array",
                        maxItems: 3,
                        items: ref("DislikedColor"),
                        description: "Max 3.",
                    },
                },
            },

            RecommendSessionMaleBody: {
                type: "object",
                additionalProperties: false,
                required: [
                    "occasion",
                    "season",
                    "fitPreference",
                    "formalityLevel",
                    "wardrobePalette",
                    "wardrobeItems",
                    "explorationLevel",
                ],
                description: "Male recommend session. Do not send coverageLevel.",
                properties: {
                    occasion: ref("Occasion"),
                    season: ref("Season"),
                    fitPreference: ref("FitPreferenceMale"),
                    formalityLevel: ref("FormalityLevel"),
                    wardrobePalette: ref("WardrobePaletteMale"),
                    wardrobeItems: {
                        type: "array",
                        maxItems: 5,
                        items: ref("WardrobeItemTypeMale"),
                        description: "Max 5. If PREFER_ALL_NEW is included it must be the only item.",
                    },
                    explorationLevel: ref("ExplorationLevelMale"),
                },
            },
            RecommendSessionFemaleBody: {
                type: "object",
                additionalProperties: false,
                required: [
                    "occasion",
                    "season",
                    "fitPreference",
                    "coverageLevel",
                    "wardrobePalette",
                    "wardrobeItems",
                    "explorationLevel",
                ],
                description: "Female recommend session. Do not send formalityLevel.",
                properties: {
                    occasion: ref("Occasion"),
                    season: ref("Season"),
                    fitPreference: ref("FitPreferenceFemale"),
                    coverageLevel: ref("CoverageLevel"),
                    wardrobePalette: ref("WardrobePaletteFemale"),
                    wardrobeItems: {
                        type: "array",
                        maxItems: 5,
                        items: ref("WardrobeItemTypeFemale"),
                        description: "Max 5. If PREFER_ALL_NEW is included it must be the only item.",
                    },
                    explorationLevel: ref("ExplorationLevelFemale"),
                },
            },

            RecommendClothingItemResponse: {
                type: "object",
                additionalProperties: false,
                required: ["id", "slug", "nameEn", "nameFa", "itemType", "fit", "formality", "coverage", "novelty"],
                properties: {
                    id: { type: "integer" },
                    slug: { type: "string" },
                    nameEn: { type: "string" },
                    nameFa: { type: "string" },
                    itemType: ref("ClothingItemType"),
                    fit: ref("ItemFit"),
                    formality: ref("FormalityLevel"),
                    coverage: {
                        nullable: true,
                        allOf: [ref("CoverageLevel")],
                        description: "May be null.",
                    },
                    novelty: ref("NoveltyLevel"),
                },
            },
            RecommendOutfitItemResponse: {
                type: "object",
                additionalProperties: false,
                required: ["slot", "colorFamily", "isOwnedReuse", "clothingItem"],
                properties: {
                    slot: ref("ClothingSlot"),
                    colorFamily: ref("ColorFamily"),
                    isOwnedReuse: { type: "boolean" },
                    clothingItem: ref("RecommendClothingItemResponse"),
                },
            },
            RecommendOutfitResponse: {
                type: "object",
                additionalProperties: false,
                required: ["rank", "intent", "score", "noveltyLevel", "explanation", "items"],
                properties: {
                    rank: { type: "integer" },
                    intent: ref("OutfitIntent"),
                    score: { type: "number" },
                    noveltyLevel: ref("NoveltyLevel"),
                    explanation: { type: "string" },
                    items: {
                        type: "array",
                        items: ref("RecommendOutfitItemResponse"),
                    },
                },
            },
            RecommendEndpointResponse: {
                type: "object",
                additionalProperties: false,
                required: ["requestId", "createdAt", "outfits"],
                properties: {
                    requestId: { type: "integer" },
                    createdAt: { type: "string", format: "date-time" },
                    outfits: {
                        type: "array",
                        items: ref("RecommendOutfitResponse"),
                    },
                },
            },
            RecommendHistoryItemResponse: {
                type: "object",
                additionalProperties: false,
                required: [
                    "requestId",
                    "createdAt",
                    "occasion",
                    "season",
                    "fitPreference",
                    "coverageLevel",
                    "formalityLevel",
                    "wardrobePalette",
                    "wardrobeItems",
                    "explorationLevel",
                    "outfits",
                ],
                properties: {
                    requestId: { type: "integer" },
                    createdAt: { type: "string", format: "date-time" },
                    occasion: ref("Occasion"),
                    season: ref("Season"),
                    fitPreference: ref("FitPreference"),
                    coverageLevel: {
                        nullable: true,
                        allOf: [ref("CoverageLevel")],
                        description: "Set for female sessions; null for male.",
                    },
                    formalityLevel: {
                        nullable: true,
                        allOf: [ref("FormalityLevel")],
                        description: "Set for male sessions; null for female.",
                    },
                    wardrobePalette: ref("WardrobePalette"),
                    wardrobeItems: {
                        type: "array",
                        items: ref("WardrobeItemType"),
                    },
                    explorationLevel: ref("ExplorationLevel"),
                    outfits: {
                        type: "array",
                        items: ref("RecommendOutfitResponse"),
                    },
                },
            },
            RecommendHistoryEndpointResponse: {
                type: "object",
                additionalProperties: false,
                required: ["total", "limit", "offset", "items"],
                properties: {
                    total: { type: "integer" },
                    limit: { type: "integer" },
                    offset: { type: "integer" },
                    items: {
                        type: "array",
                        items: ref("RecommendHistoryItemResponse"),
                    },
                },
            },
            ErrorResponse: {
                type: "object",
                additionalProperties: false,
                required: ["error", "message"],
                properties: {
                    error: {
                        type: "string",
                        enum: ["profile_incomplete", "no_outfits"],
                    },
                    message: { type: "string" },
                },
            },
            NoOutfitsDiagnostic: {
                type: "object",
                additionalProperties: false,
                required: [
                    "cause",
                    "requiredSlots",
                    "remainingBySlot",
                    "filteredItemCount",
                    "missingSlots",
                    "candidateCount",
                    "vetoReasons",
                ],
                properties: {
                    cause: {
                        type: "string",
                        enum: ["empty_required_slot", "all_candidates_vetoed"],
                        description:
                            "empty_required_slot: a required template slot had no items after hard filters. all_candidates_vetoed: outfits were assembled, then every combination failed the formality hard veto.",
                    },
                    requiredSlots: {
                        type: "array",
                        items: ref("ClothingSlot"),
                    },
                    remainingBySlot: {
                        type: "object",
                        additionalProperties: { type: "integer" },
                        description: "Items remaining after hard filters, keyed by required slot.",
                    },
                    filteredItemCount: { type: "integer" },
                    missingSlots: {
                        type: "array",
                        items: ref("ClothingSlot"),
                        description: "Required slots with zero remaining items. Empty when cause is all_candidates_vetoed.",
                    },
                    candidateCount: {
                        type: "integer",
                        description: "Assembled combinations. Zero when a required slot was empty.",
                    },
                    vetoReasons: {
                        type: "array",
                        items: { type: "string" },
                        description: "Distinct formality-veto labels. Empty when no candidates were built.",
                    },
                },
            },
            NoOutfitsErrorResponse: {
                type: "object",
                additionalProperties: false,
                required: ["error", "message", "diagnostic"],
                properties: {
                    error: {
                        type: "string",
                        enum: ["no_outfits"],
                    },
                    message: { type: "string" },
                    diagnostic: ref("NoOutfitsDiagnostic"),
                },
            },
        },
    },
}
