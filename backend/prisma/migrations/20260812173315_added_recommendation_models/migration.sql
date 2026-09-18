-- CreateEnum
CREATE TYPE "OutfitIntent" AS ENUM ('best_match', 'alternative', 'adventurous');

-- CreateTable
CREATE TABLE "recommendation_request" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "occasion" "Occasion" NOT NULL,
    "season" "Season" NOT NULL,
    "fit_preference" "FitPreference" NOT NULL,
    "coverage_level" "CoverageLevel",
    "formality_level" "FormalityLevel",
    "wardrobe_palette" "WardrobePalette" NOT NULL,
    "wardrobe_items" "WardrobeItemType"[],
    "exploration_level" "ExplorationLevel" NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_outfit" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "rank" SMALLINT NOT NULL,
    "intent" "OutfitIntent" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "novelty_level" "NoveltyLevel" NOT NULL,

    CONSTRAINT "recommendation_outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_outfit_item" (
    "id" SERIAL NOT NULL,
    "outfit_id" INTEGER NOT NULL,
    "clothing_item_id" INTEGER NOT NULL,
    "slot" "ClothingSlot" NOT NULL,
    "color_family" "ColorFamily" NOT NULL,
    "is_owned_reuse" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "recommendation_outfit_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recommendation_request_user_id_created_at_idx" ON "recommendation_request"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_outfit_request_id_rank_key" ON "recommendation_outfit"("request_id", "rank");

-- CreateIndex
CREATE INDEX "recommendation_outfit_item_outfit_id_idx" ON "recommendation_outfit_item"("outfit_id");

-- AddForeignKey
ALTER TABLE "recommendation_request" ADD CONSTRAINT "recommendation_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_outfit" ADD CONSTRAINT "recommendation_outfit_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "recommendation_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_outfit_item" ADD CONSTRAINT "recommendation_outfit_item_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "recommendation_outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_outfit_item" ADD CONSTRAINT "recommendation_outfit_item_clothing_item_id_fkey" FOREIGN KEY ("clothing_item_id") REFERENCES "clothing_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
