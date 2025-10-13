/*
  Warnings:

  - You are about to drop the column `data_snapshot` on the `post_revisions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "post_revisions" DROP COLUMN "data_snapshot",
ADD COLUMN     "edited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
