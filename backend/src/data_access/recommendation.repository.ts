import { db } from "./prisma"
import type { Prisma } from "../../generated/prisma/client"
import type { RecommendSessionBody } from "../utils/recommend.validator"
import type { RecommendedOutfit } from "../rule-engine/engine"

export type RecommendationWithOutfits = Prisma.RecommendationRequestGetPayload<{
    include: {
        outfits: {
            include: {
                items: {
                    include: { clothingItem: true }
                }
            }
        }
    }
}>

export class RecommendationRepository {
    constructor() { }

    private static readonly historyInclude = {
        outfits: {
            include: {
                items: {
                    include: { clothingItem: true },
                },
            },
            orderBy: { rank: "asc" as const },
        },
    }

    public async createWithOutfits(
        userId: number,
        session: RecommendSessionBody,
        outfits: RecommendedOutfit[],
    ): Promise<RecommendationWithOutfits> {
        return await db.$transaction(async (tx) => {
            const request = await tx.recommendationRequest.create({
                data: {
                    userId,
                    occasion: session.occasion,
                    season: session.season,
                    fitPreference: session.fitPreference,
                    coverageLevel: session.coverageLevel ?? null,
                    formalityLevel: session.formalityLevel ?? null,
                    wardrobePalette: session.wardrobePalette,
                    wardrobeItems: session.wardrobeItems,
                    explorationLevel: session.explorationLevel,
                    outfits: {
                        create: outfits.map((outfit) => ({
                            rank: outfit.rank,
                            intent: outfit.intent,
                            score: outfit.score,
                            explanation: outfit.explanation,
                            noveltyLevel: outfit.noveltyLevel,
                            items: {
                                create: outfit.items.map((entry) => ({
                                    clothingItemId: entry.scored.item.id,
                                    slot: entry.slot,
                                    colorFamily: entry.colorFamily,
                                    isOwnedReuse: entry.isOwnedReuse,
                                })),
                            },
                        })),
                    },
                },
                include: RecommendationRepository.historyInclude,
            })

            return request
        })
    }

    public async retrieveByUser(
        userId: number,
        options?: { limit?: number; offset?: number },
    ): Promise<{ items: RecommendationWithOutfits[]; total: number }> {
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100)
        const offset = Math.max(options?.offset ?? 0, 0)

        const [items, total] = await Promise.all([
            db.recommendationRequest.findMany({
                where: { userId },
                include: RecommendationRepository.historyInclude,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
            }),
            db.recommendationRequest.count({
                where: { userId },
            }),
        ])

        return { items, total }
    }
}
