/*
  Warnings:

  - Added the required column `name` to the `skill_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "skill_categories" ADD COLUMN     "name" TEXT NOT NULL;
