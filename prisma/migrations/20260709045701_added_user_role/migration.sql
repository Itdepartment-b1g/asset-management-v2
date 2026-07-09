/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin', 'employee');

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT;

-- DropTable
DROP TABLE "categories";
