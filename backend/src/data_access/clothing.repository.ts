import { db } from "./prisma"
import type { ClothingItem, Gender } from "../../generated/prisma/client"

export class ClothingRepository {
    constructor() { }

    public async listByGender(gender: Gender): Promise<ClothingItem[]> {
        return await db.clothingItem.findMany({
            where: { gender },
            orderBy: [{ slot: "asc" }, { id: "asc" }],
        })
    }
}
