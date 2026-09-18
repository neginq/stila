-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('daily', 'university', 'work', 'friends_gathering', 'party', 'date_cafe', 'formal_event', 'travel');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('spring', 'summer', 'fall', 'winter', 'all_season');

-- CreateEnum
CREATE TYPE "FitPreference" AS ENUM ('loose', 'semi_loose', 'balanced', 'fitted', 'loose_top_fitted_bottom', 'fitted_top_loose_bottom', 'loose_top_balanced_bottom', 'balanced_top_loose_bottom');

-- CreateEnum
CREATE TYPE "CoverageLevel" AS ENUM ('fully_covered', 'covered_comfortable', 'balanced', 'unrestricted');

-- CreateEnum
CREATE TYPE "FormalityLevel" AS ENUM ('very_casual', 'mostly_casual', 'balanced', 'smart_casual', 'formal');

-- CreateEnum
CREATE TYPE "WardrobePalette" AS ENUM ('black_white_gray', 'cream_beige_brown', 'mixed_all', 'female_blue_and_navy', 'female_pastels', 'female_warm_and_earthy', 'female_bright_and_varied', 'male_blue_navy_gray', 'male_green_olive_earthy', 'male_dark', 'male_light_and_bright');

-- CreateEnum
CREATE TYPE "WardrobeItemType" AS ENUM ('prefer_all_new', 'jeans', 'trousers', 'sneakers', 'blazer_or_coat', 'manto_or_long_coat', 'blouse_or_shirt', 'tshirt_or_top', 'skirt', 'formal_or_heels', 'casual_bag', 'tshirt', 'polo', 'dress_shirt', 'hoodie_or_sweatshirt', 'knit_or_sweater', 'denim_jacket_or_overshirt', 'cargo_pants', 'formal_or_loafers');

-- CreateEnum
CREATE TYPE "ExplorationLevel" AS ENUM ('familiar', 'slightly_new', 'mixed', 'creative', 'unsure', 'bold');

-- CreateEnum
CREATE TYPE "ClothingSlot" AS ENUM ('top', 'bottom', 'outerwear', 'shoes', 'accessory');

-- CreateEnum
CREATE TYPE "ColorFamily" AS ENUM ('black', 'white_cream', 'gray', 'cream_beige', 'brown', 'navy', 'blue', 'green_olive', 'khaki_earth', 'red_orange', 'pink', 'yellow', 'purple', 'pastel', 'bright', 'dark');

-- CreateEnum
CREATE TYPE "ItemFit" AS ENUM ('loose', 'semi_loose', 'balanced', 'fitted');

-- CreateEnum
CREATE TYPE "ClothingItemType" AS ENUM ('manto', 'long_coat', 'blouse', 'top', 'skirt', 'heels', 'casual_bag', 'blazer', 'shirt', 'tshirt', 'jeans', 'trousers', 'sneakers', 'formal_shoes', 'polo', 'hoodie', 'sweatshirt', 'knit', 'sweater', 'denim_jacket', 'overshirt', 'cargo_pants', 'loafers', 'watch', 'belt', 'glasses', 'hat', 'bag', 'jewelry', 'tie_or_bow', 'scarf');

-- CreateEnum
CREATE TYPE "SilhouetteTag" AS ENUM ('a_line', 'wide_leg', 'straight_leg', 'tapered', 'structured_shoulder', 'soft_shoulder', 'defined_waist', 'relaxed_waist', 'long_line', 'cropped', 'fitted_top', 'loose_top', 'layerable', 'volume_bottom', 'slim_bottom');

-- CreateEnum
CREATE TYPE "NoveltyLevel" AS ENUM ('familiar', 'slightly_new', 'mixed', 'creative', 'bold');

-- CreateTable
CREATE TABLE "clothing_item" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name_en" VARCHAR(150) NOT NULL,
    "name_fa" VARCHAR(150) NOT NULL,
    "gender" "Gender" NOT NULL,
    "slot" "ClothingSlot" NOT NULL,
    "item_type" "ClothingItemType" NOT NULL,
    "styles" "FavoriteStyle"[],
    "occasions" "Occasion"[],
    "seasons" "Season"[],
    "fit" "ItemFit" NOT NULL,
    "coverage" "CoverageLevel",
    "formality" "FormalityLevel" NOT NULL,
    "body_shapes" "BodyShape"[],
    "silhouette_tags" "SilhouetteTag"[] DEFAULT ARRAY[]::"SilhouetteTag"[],
    "novelty" "NoveltyLevel" NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "clothing_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clothing_item_slug_key" ON "clothing_item"("slug");

-- CreateIndex
CREATE INDEX "clothing_item_gender_idx" ON "clothing_item"("gender");
