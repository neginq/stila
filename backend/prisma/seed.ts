import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
    ClothingSlot,
    CoverageLevel,
    PrismaClient,
    type Prisma,
} from "../generated/prisma/client";
import { COVERAGE_RANK } from "../src/rule-engine/filters";
import { menClothingItems } from "./seed-data/men-clothing";
import { womenClothingItems } from "./seed-data/women-clothing";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

/** Slots an outfit template can mark as required, so they must never run dry. */
const REQUIRABLE_SLOTS: ClothingSlot[] = [
    ClothingSlot.TOP,
    ClothingSlot.BOTTOM,
    ClothingSlot.SHOES,
    ClothingSlot.OUTERWEAR,
];

/**
 * Guards the coverage ladder before anything reaches the database.
 *
 * A non-null coverage tag places an item on the ladder that the hard filter
 * compares against the user's requested level, so a tag that reads harmlessly
 * in prose can silently empty a whole slot.
 */
function assertCatalogIntegrity(
    items: Prisma.ClothingItemCreateInput[],
    label: string,
): void {
    const problems: string[] = [];

    // Footwear does not cover the body, so it must stay off the ladder entirely.
    for (const item of items) {
        if (item.slot === ClothingSlot.SHOES && item.coverage != null) {
            problems.push(
                `${item.slug}: SHOES must have coverage null, found ${item.coverage}`,
            );
        }
    }

    // Every requirable slot must still be fillable at every coverage level,
    // otherwise the pipeline dead-ends and returns zero outfits.
    for (const level of Object.values(CoverageLevel)) {
        for (const slot of REQUIRABLE_SLOTS) {
            const survivors = items.filter(
                (item) =>
                    item.slot === slot &&
                    (item.coverage == null ||
                        COVERAGE_RANK[item.coverage] >= COVERAGE_RANK[level]),
            ).length;
            if (survivors === 0) {
                problems.push(`${slot} has no item left at coverage ${level}`);
            }
        }
    }

    if (problems.length > 0) {
        throw new Error(
            `${label} catalog integrity check failed:\n  - ${problems.join("\n  - ")}`,
        );
    }
    console.log(`${label} catalog integrity check passed.`);
}

async function upsertClothingItems(
    items: Prisma.ClothingItemCreateInput[],
    label: string,
): Promise<number> {
    let count = 0;
    for (const item of items) {
        const { slug, ...data } = item;
        await db.clothingItem.upsert({
            where: { slug },
            create: item,
            update: data,
        });
        count += 1;
    }
    console.log(`Upserted ${count} ${label} clothing items.`);
    return count;
}

async function main() {
    assertCatalogIntegrity(womenClothingItems, "women");
    assertCatalogIntegrity(menClothingItems, "men");
    await db.$connect();
    await upsertClothingItems(womenClothingItems, "women");
    await upsertClothingItems(menClothingItems, "men");
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });
