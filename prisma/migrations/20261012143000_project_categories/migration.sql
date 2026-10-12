-- CreateTable
CREATE TABLE "ProjectCategory" (
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectCategory_pkey" PRIMARY KEY ("projectId","categoryId")
);

-- CreateIndex
CREATE INDEX "ProjectCategory_projectId_sortOrder_idx" ON "ProjectCategory"("projectId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PortfolioCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Canonical public categories. "All" is a filter, not a record.
INSERT INTO "PortfolioCategory" ("id", "name", "slug", "sortOrder", "published")
VALUES
    ('cat_graphic_design', 'Graphic Design', 'graphic-design', 0, true),
    ('cat_web_development', 'Web Development', 'web-development', 2, true),
    ('cat_app_development', 'App Development', 'app-development', 3, true)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "PortfolioCategory"
SET "published" = true
WHERE "name" IN ('Graphic Design', 'Branding', 'Web Development', 'App Development');

-- Keep an existing assignment only when the stored category name already matches a canonical category.
INSERT INTO "ProjectCategory" ("projectId", "categoryId", "sortOrder")
SELECT "Project"."id", "PortfolioCategory"."id", 0
FROM "Project"
JOIN "PortfolioCategory" ON "PortfolioCategory"."id" = "Project"."categoryId"
WHERE "PortfolioCategory"."name" IN ('Graphic Design', 'Branding', 'Web Development', 'App Development')
ON CONFLICT ("projectId", "categoryId") DO NOTHING;

-- The single category column remains as a legacy label. Public taxonomy is ProjectCategory.
ALTER TABLE "Project" ALTER COLUMN "categoryId" DROP NOT NULL;
