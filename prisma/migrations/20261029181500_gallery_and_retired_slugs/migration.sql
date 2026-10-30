-- CreateTable
CREATE TABLE "ProjectRedirect" (
    "slug" TEXT NOT NULL,
    "projectId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectRedirect_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE INDEX "ProjectRedirect_projectId_idx" ON "ProjectRedirect"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectRedirect" ADD CONSTRAINT "ProjectRedirect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "category" TEXT,
    "imageUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPhoto_slug_key" ON "GalleryPhoto"("slug");

-- CreateIndex
CREATE INDEX "GalleryPhoto_published_sortOrder_idx" ON "GalleryPhoto"("published", "sortOrder");
