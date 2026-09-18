import express from "express";
import cors from "cors";
import {
    AuthStatus,
    type Authentication,
    type ClothingItemType,
    type ClothingSlot,
    type ColorFamily,
    type CoverageLevel,
    type ExplorationLevel,
    type FitPreference,
    type FormalityLevel,
    type ItemFit,
    type NoveltyLevel,
    type Occasion,
    type OutfitIntent,
    type Season,
    type User,
    type UserStyleProfile,
    type WardrobeItemType,
    type WardrobePalette,
} from "../generated/prisma/client";
import { UserRepository } from "./data_access/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { AuthRepository } from "./data_access/auth.repository";
import { UserProfileValidator, type UpdateUserProfileBody } from "./utils/user-profile.validator";
import { RecommendValidator, type RecommendSessionBody } from "./utils/recommend.validator";
import { buildRecommendationContext } from "./rule-engine/context";
import { ClothingRepository } from "./data_access/clothing.repository";
import { recommendOutfits } from "./rule-engine/engine";
import { RecommendationRepository } from "./data_access/recommendation.repository";
import type { RecommendationWithOutfits } from "./data_access/recommendation.repository";
import { setupSwagger } from "./swagger/setup";

const app = express()
app.use(cors())
app.use(express.json());
setupSwagger(app)
const port = process.env.PORT;
const jwtSecret = process.env.JWT_SECRET!

app.listen(port, () => console.log("Express App is running on PORT: " + port));

// TODO: Following routes are now just for keeping things simple,
// could separate them in their specific layers to make things more clear and readable
app.post("/auth/signup", async (req, res) => {
    const body = req.body as SignupEndointBody;
    const currentTime = new Date();

    // check if the user has already signed up
    const userAuthData = await new AuthRepository().retrieveAuthByMobileNumber(body.mobileNumber);

    if (userAuthData) {
        // user exists, should login instead
        return res.sendStatus(409)
    }

    // user does not exist, let's insert it in db
    const signupDBData: Signup = {
        firstName: body.firstName,
        lastName: body.lastName,
        mobileNumber: body.mobileNumber,
        passwordHash: bcrypt.hashSync(body.password, 10),
        attempts: 1,
        status: AuthStatus.LOGGED_IN,
        createdAt: currentTime,
        lastLoginAt: currentTime
    }

    const userData = await new UserRepository().createUserWithAuth(signupDBData);

    const response: AuthEndpointsResponse = {
        token: buildUserToken(userData.userId)
    }

    return res.status(201).json(response)
})

app.post("/auth/login", async (req, res) => {
    const body = req.body as LoginEndpointBody;
    const currentTime = new Date();
    const authRepo = new AuthRepository();

    // check if the user has already signed up
    const userAuthData = await authRepo.retrieveAuthByMobileNumber(body.mobileNumber);

    if (!userAuthData) {
        // user does not exist, should signup instead
        return res.sendStatus(401)
    }

    const isPasswordCorrect = bcrypt.compareSync(body.password, userAuthData.passwordHash);

    if (!isPasswordCorrect) {
        await authRepo.updateAuth(userAuthData.userId, {
            status: AuthStatus.FAILED
        })
        return res.sendStatus(401)
    }

    await authRepo.updateAuth(userAuthData.userId, {
        lastLoginAt: currentTime,
        status: AuthStatus.LOGGED_IN
    })

    const response: AuthEndpointsResponse = {
        token: buildUserToken(userAuthData.userId)
    }

    return res.status(200).json(response)
})

app.get("/user/profile", async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.header("Authorization"))
    if (userId === null) {
        return res.sendStatus(401)
    }

    const user = await new UserRepository().retrieveUserWithStyleProfile(userId)
    if (!user) {
        return res.sendStatus(404)
    }

    const response: UserProfileEndpointResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        ageGroup: user.ageGroup,
        createdAt: user.createdAt,
        styleProfile: user.styleProfile === null
            ? null
            : {
                skinTone: user.styleProfile.skinTone,
                skinUndertone: user.styleProfile.skinUndertone,
                bodyShape: user.styleProfile.bodyShape,
                favoriteStyles: user.styleProfile.favoriteStyles,
                favoriteColorPalettes: user.styleProfile.favoriteColorPalettes,
                dislikedColors: user.styleProfile.dislikedColors,
            },
    }

    return res.status(200).json(response)
})

app.patch("/user/profile", async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.header("Authorization"))
    if (userId === null) {
        return res.sendStatus(401)
    }

    const userRepo = new UserRepository()
    const user = await userRepo.retrieveUserById(userId)
    if (!user) {
        return res.sendStatus(404)
    }

    const body = req.body as UpdateUserProfileBody
    const effectiveGender = body.gender !== undefined ? body.gender : user.gender
    if (!UserProfileValidator.isValidUpdateBody(body, effectiveGender)) {
        return res.sendStatus(400)
    }

    await userRepo.updateUserProfile(userId, body)
    return res.sendStatus(204)
})

app.post("/recommend", async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.header("Authorization"))
    if (userId === null) {
        return res.sendStatus(401)
    }

    const userRepo = new UserRepository()
    const user = await userRepo.retrieveUserWithStyleProfile(userId)
    if (!user) {
        return res.sendStatus(404)
    }
    if (user.gender === null) {
        return res.status(400).json({ error: "profile_incomplete", message: "gender is required" })
    }

    const body = req.body as RecommendSessionBody
    if (!RecommendValidator.isValidSessionBody(body, user.gender)) {
        return res.sendStatus(400)
    }

    const ctx = buildRecommendationContext(user, body)
    if (ctx === null) {
        return res.status(400).json({
            error: "profile_incomplete",
            message: "complete style profile before requesting recommendations",
        })
    }

    const catalog = await new ClothingRepository().listByGender(user.gender)
    const { outfits, failure } = recommendOutfits(catalog, ctx)
    if (outfits.length === 0) {
        return res.status(422).json({
            error: "no_outfits",
            message: "could not build outfits for the given preferences",
            diagnostic: failure,
        })
    }

    const saved = await new RecommendationRepository().createWithOutfits(userId, body, outfits)

    const response: RecommendEndpointResponse = {
        requestId: saved.id,
        createdAt: saved.createdAt,
        outfits: mapOutfitsToResponse(saved.outfits),
    }

    return res.status(201).json(response)
})

app.get("/recommend/history", async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.header("Authorization"))
    if (userId === null) {
        return res.sendStatus(401)
    }

    const limit = parsePositiveInt(req.query.limit, 20)
    const offset = parsePositiveInt(req.query.offset, 0)

    const { items, total } = await new RecommendationRepository().retrieveByUser(userId, {
        limit,
        offset,
    })

    const response: RecommendHistoryEndpointResponse = {
        total,
        limit,
        offset,
        items: items.map((request) => ({
            requestId: request.id,
            createdAt: request.createdAt,
            occasion: request.occasion,
            season: request.season,
            fitPreference: request.fitPreference,
            coverageLevel: request.coverageLevel,
            formalityLevel: request.formalityLevel,
            wardrobePalette: request.wardrobePalette,
            wardrobeItems: request.wardrobeItems,
            explorationLevel: request.explorationLevel,
            outfits: mapOutfitsToResponse(request.outfits),
        })),
    }

    return res.status(200).json(response)
})

function mapOutfitsToResponse(
    outfits: RecommendationWithOutfits["outfits"],
): RecommendOutfitResponse[] {
    return outfits.map((outfit) => ({
        rank: outfit.rank,
        intent: outfit.intent,
        score: outfit.score,
        noveltyLevel: outfit.noveltyLevel,
        explanation: outfit.explanation,
        items: outfit.items.map((item) => ({
            slot: item.slot,
            colorFamily: item.colorFamily,
            isOwnedReuse: item.isOwnedReuse,
            clothingItem: {
                id: item.clothingItem.id,
                slug: item.clothingItem.slug,
                nameEn: item.clothingItem.nameEn,
                nameFa: item.clothingItem.nameFa,
                itemType: item.clothingItem.itemType,
                fit: item.clothingItem.fit,
                formality: item.clothingItem.formality,
                coverage: item.clothingItem.coverage,
                novelty: item.clothingItem.novelty,
            },
        })),
    }))
}

function parsePositiveInt(value: unknown, fallback: number): number {
    if (typeof value !== "string" && typeof value !== "number") {
        return fallback
    }
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallback
    }
    return Math.floor(parsed)
}

function buildUserToken(userId: number): string {
    return "Bearer " + jwt.sign({ userId: userId }, jwtSecret)
}

function getUserIdFromAuthHeader(authHeader: string | undefined): number | null {
    if (!authHeader?.startsWith("Bearer ")) {
        return null
    }

    const token = authHeader.slice("Bearer ".length).trim()
    if (!token) {
        return null
    }

    try {
        const payload = jwt.verify(token, jwtSecret) as { userId?: unknown }
        if (typeof payload.userId !== "number") {
            return null
        }
        return payload.userId
    } catch {
        return null
    }
}

type SignupEndointBody = {
    firstName: string,
    lastName: string,
    mobileNumber: string,
    password: string
}

type LoginEndpointBody = {
    mobileNumber: string,
    password: string
}

type AuthEndpointsResponse = {
    token: string
}

export type RecommendClothingItemResponse = {
    id: number
    slug: string
    nameEn: string
    nameFa: string
    itemType: ClothingItemType
    fit: ItemFit
    formality: FormalityLevel
    coverage: CoverageLevel | null
    novelty: NoveltyLevel
}

export type RecommendOutfitItemResponse = {
    slot: ClothingSlot
    colorFamily: ColorFamily
    isOwnedReuse: boolean
    clothingItem: RecommendClothingItemResponse
}

export type RecommendOutfitResponse = {
    rank: number
    intent: OutfitIntent
    score: number
    noveltyLevel: NoveltyLevel
    explanation: string
    items: RecommendOutfitItemResponse[]
}

export type RecommendEndpointResponse = {
    requestId: number
    createdAt: Date
    outfits: RecommendOutfitResponse[]
}

export type RecommendHistoryItemResponse = {
    requestId: number
    createdAt: Date
    occasion: Occasion
    season: Season
    fitPreference: FitPreference
    coverageLevel: CoverageLevel | null
    formalityLevel: FormalityLevel | null
    wardrobePalette: WardrobePalette
    wardrobeItems: WardrobeItemType[]
    explorationLevel: ExplorationLevel
    outfits: RecommendOutfitResponse[]
}

export type RecommendHistoryEndpointResponse = {
    total: number
    limit: number
    offset: number
    items: RecommendHistoryItemResponse[]
}

export type UserStyleProfileResponse = {
    skinTone: UserStyleProfile["skinTone"]
    skinUndertone: UserStyleProfile["skinUndertone"]
    bodyShape: UserStyleProfile["bodyShape"]
    favoriteStyles: UserStyleProfile["favoriteStyles"]
    favoriteColorPalettes: UserStyleProfile["favoriteColorPalettes"]
    dislikedColors: UserStyleProfile["dislikedColors"]
}

export type UserProfileEndpointResponse = {
    id: number
    firstName: string
    lastName: string
    mobileNumber: string
    gender: User["gender"]
    ageGroup: User["ageGroup"]
    createdAt: Date
    styleProfile: UserStyleProfileResponse | null
}

export type Signup = Omit<User, "id" | "gender" | "ageGroup"> & Omit<Authentication, "id" | "userId" | "lockedUntil">

export type UpdateUserProfile = Partial<
    Omit<User, "id" | "mobileNumber" | "createdAt" | "auth" | "styleProfile"> &
    Omit<UserStyleProfile, "id" | "userId" | "createdAt" | "updatedAt" | "user">
>
