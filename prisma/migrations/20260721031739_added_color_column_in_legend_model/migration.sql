/*
  Warnings:

  - Added the required column `color` to the `legend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "legend" ADD COLUMN     "color" TEXT NOT NULL;
