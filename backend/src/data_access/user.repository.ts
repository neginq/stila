import { db } from "./prisma"
import type { Prisma, User } from "../../generated/prisma/client"
import type { Signup, UpdateUserProfile } from "../app"

export type UserWithStyleProfile = Prisma.UserGetPayload<{
    include: { styleProfile: true }
}>

export class UserRepository {

    constructor() { }

    public async retrieveUserById(userId: number): Promise<User | null> {
        return await db.user.findUnique({
            where: { id: userId },
        })
    }

    public async retrieveUserWithStyleProfile(userId: number): Promise<UserWithStyleProfile | null> {
        return await db.user.findUnique({
            where: { id: userId },
            include: { styleProfile: true },
        })
    }

    // TODO: input and return types could be separate
    // TODO: needs error handling
    public async createUserWithAuth(newUser: Signup): Promise<{ userId: number }> {
        const user = await db.user.create({
            data: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                mobileNumber: newUser.mobileNumber,
                createdAt: newUser.createdAt,
                auth: {
                    create: {
                        passwordHash: newUser.passwordHash,
                        lastLoginAt: newUser.lastLoginAt,
                        attempts: newUser.attempts,
                        status: newUser.status
                    }
                }
            },
            
        })

        return {
            userId: user.id
        }
    }

    public async updateUserProfile(userId: number, data: UpdateUserProfile): Promise<void> {
        const userData = {
            ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
            ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
            ...(data.gender !== undefined ? { gender: data.gender } : {}),
            ...(data.ageGroup !== undefined ? { ageGroup: data.ageGroup } : {}),
        }

        const styleProfileData = {
            ...(data.skinTone !== undefined ? { skinTone: data.skinTone } : {}),
            ...(data.skinUndertone !== undefined ? { skinUndertone: data.skinUndertone } : {}),
            ...(data.bodyShape !== undefined ? { bodyShape: data.bodyShape } : {}),
            ...(data.favoriteStyles !== undefined ? { favoriteStyles: data.favoriteStyles } : {}),
            ...(data.favoriteColorPalettes !== undefined ? { favoriteColorPalettes: data.favoriteColorPalettes } : {}),
            ...(data.dislikedColors !== undefined ? { dislikedColors: data.dislikedColors } : {}),
        }

        const hasUserData = Object.keys(userData).length > 0
        const hasStyleProfileData = Object.keys(styleProfileData).length > 0

        if (!hasUserData && !hasStyleProfileData) {
            return
        }

        await db.$transaction(async (tx) => {
            if (hasUserData) {
                await tx.user.update({
                    where: { id: userId },
                    data: userData,
                })
            }

            if (hasStyleProfileData) {
                await tx.userStyleProfile.upsert({
                    where: { userId },
                    create: {
                        userId,
                        ...styleProfileData,
                    },
                    update: styleProfileData,
                })
            }
        })
    }
}
