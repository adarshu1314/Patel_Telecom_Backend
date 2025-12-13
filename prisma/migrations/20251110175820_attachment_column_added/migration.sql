/*
  Warnings:

  - You are about to drop the `uploads` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."uploads" DROP CONSTRAINT "uploads_ticketId_fkey";

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "attachments" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- DropTable
DROP TABLE "public"."uploads";
