-- AlterTable
ALTER TABLE "HomeContent" ADD COLUMN "portraitMode" TEXT NOT NULL DEFAULT 'single';

-- CreateTable
CREATE TABLE "HomePortrait" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL DEFAULT 'home',
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HomePortrait_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomePortrait_homeId_sortOrder_idx" ON "HomePortrait"("homeId", "sortOrder");

-- AddForeignKey
ALTER TABLE "HomePortrait" ADD CONSTRAINT "HomePortrait_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "HomeContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
