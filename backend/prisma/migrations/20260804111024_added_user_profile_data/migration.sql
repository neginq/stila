/*
  Warnings:

  - The values [LOGGED_IN,FAILED,BLOCKED] on the enum `AuthStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[mobile_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('under_18', 'eighteen_to_24', 'twenty_five_to_34', 'thirty_five_to_44', 'forty_five_or_older');

-- CreateEnum
CREATE TYPE "SkinTone" AS ENUM ('very_light', 'light', 'light_to_medium', 'wheatish', 'olive', 'dark', 'unsure');

-- CreateEnum
CREATE TYPE "SkinUndertone" AS ENUM ('warm', 'cool', 'neutral', 'unsure');

-- CreateEnum
CREATE TYPE "BodyShape" AS ENUM ('male_trapezoid', 'male_triangle', 'male_rectangle', 'male_oval', 'male_inverted_triangle', 'female_hourglass', 'female_apple', 'female_pear', 'female_rectangle', 'female_inverted_triangle', 'unsure');

-- CreateEnum
CREATE TYPE "FavoriteStyle" AS ENUM ('casual_and_daily', 'minimal', 'classic', 'formal', 'sport', 'street', 'female_artistic_and_creative', 'female_romantic_and_elegant', 'male_smart_and_casual', 'male_romantic_and_different');

-- CreateEnum
CREATE TYPE "DislikedColor" AS ENUM ('black', 'white_and_creamy', 'brown', 'red_and_orange', 'pink', 'yellow', 'green', 'blue', 'purple');

-- CreateEnum
CREATE TYPE "FavoriteColorPalette" AS ENUM ('neutral_black_white_gray', 'cream_and_brown', 'pastels', 'male_dark', 'male_light_and_bright', 'male_blue_and_navy_blues', 'male_green_and_olive', 'male_warm_and_khaki', 'female_warm_red_orange_bright_orange', 'female_cold_blue_purple_green');

-- AlterEnum
BEGIN;
CREATE TYPE "AuthStatus_new" AS ENUM ('logged_in', 'failed', 'blocked');
ALTER TABLE "authentication" ALTER COLUMN "status" TYPE "AuthStatus_new" USING ("status"::text::"AuthStatus_new");
ALTER TYPE "AuthStatus" RENAME TO "AuthStatus_old";
ALTER TYPE "AuthStatus_new" RENAME TO "AuthStatus";
DROP TYPE "stylist"."AuthStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "age_group" "AgeGroup",
ADD COLUMN     "gender" "Gender";

-- CreateTable
CREATE TABLE "user_style_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "skin_tone" "SkinTone",
    "skin_undertone" "SkinUndertone",
    "body_shape" "BodyShape",
    "favorite_styles" "FavoriteStyle"[],
    "favorite_color_palettes" "FavoriteColorPalette"[],
    "disliked_colors" "DislikedColor"[] DEFAULT ARRAY[]::"DislikedColor"[],
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "user_style_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_style_profile_user_id_key" ON "user_style_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_mobile_number_key" ON "user"("mobile_number");

-- AddForeignKey
ALTER TABLE "user_style_profile" ADD CONSTRAINT "user_style_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
