-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('DRESSAGE', 'SHOW_JUMPING');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "discipline" "Discipline";
