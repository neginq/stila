import type { Authentication, User } from "../../generated/prisma/client";
import { db } from "./prisma"

// Define a custom type for the login result
type AuthWithUser = Authentication & { user: User };

export class AuthRepository {
    constructor() {}

    public async retrieveAuthByMobileNumber(mobileNumber: string): Promise<AuthWithUser | null> {
        return await db.authentication.findFirst({
            where: {
                user: {
                    mobileNumber: mobileNumber
                }
            },
            include: {
                user: true
            }
        }) as AuthWithUser | null;
    }

    public async updateAuth(userId: number, data: Partial<Authentication>): Promise<void> {
        await db.authentication.update({
            where: {
                userId: userId
            },
            data: data
        })
    }
}