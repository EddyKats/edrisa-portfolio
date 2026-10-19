-- AlterTable
ALTER TABLE "HomeContent" ADD COLUMN "aboutMode" TEXT NOT NULL DEFAULT 'single';
ALTER TABLE "HomeContent" ADD COLUMN "servicesMode" TEXT NOT NULL DEFAULT 'single';
ALTER TABLE "HomeContent" ADD COLUMN "contactMode" TEXT NOT NULL DEFAULT 'single';
ALTER TABLE "HomeContent" ADD COLUMN "portfolioMode" TEXT NOT NULL DEFAULT 'single';

-- AlterTable
ALTER TABLE "HomePortrait" ADD COLUMN "surface" TEXT NOT NULL DEFAULT 'hero';
ALTER TABLE "HomePortrait" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "HomePortrait" ADD COLUMN "mimeType" TEXT;

-- CreateIndex
CREATE INDEX "HomePortrait_homeId_surface_sortOrder_idx" ON "HomePortrait"("homeId", "surface", "sortOrder");
