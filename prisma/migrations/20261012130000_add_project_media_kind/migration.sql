-- CreateEnum
CREATE TYPE "ProjectMediaKind" AS ENUM ('IMAGE', 'GIF', 'VIDEO');

-- AlterTable
ALTER TABLE "ProjectImage" ADD COLUMN "kind" "ProjectMediaKind" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "originalName" TEXT;
