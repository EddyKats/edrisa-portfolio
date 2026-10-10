-- CreateEnum
CREATE TYPE "ProjectSize" AS ENUM ('STANDARD', 'LARGE', 'WIDE', 'TALL');

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "siteName" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "homepagePortraitUrl" TEXT,
    "logoUrl" TEXT,
    "behanceUrl" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "whatsappUrl" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "location" TEXT,
    "footerText" TEXT,
    "footerSecondaryText" TEXT,
    "defaultSeoTitle" TEXT,
    "defaultSeoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeContent" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "portraitUrl" TEXT,
    "logoUrl" TEXT,
    "aboutTileLabel" TEXT NOT NULL,
    "servicesTileLabel" TEXT NOT NULL,
    "contactTileLabel" TEXT NOT NULL,
    "portfolioTileLabel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" TEXT NOT NULL DEFAULT 'about',
    "pageTitle" TEXT NOT NULL,
    "introHeading" TEXT NOT NULL,
    "introParagraph" TEXT NOT NULL,
    "storyHeading" TEXT NOT NULL,
    "storyBody" TEXT NOT NULL,
    "featureMediaUrl" TEXT,
    "featureMediaType" TEXT,
    "ctaHeading" TEXT,
    "ctaText" TEXT,
    "ctaButtonLabel" TEXT,
    "ctaButtonHref" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutStat" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AboutStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "microcopy" TEXT,
    "imageUrl" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapabilityPackage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "buttonLabel" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CapabilityPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapabilityItem" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CapabilityItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PortfolioCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "year" INTEGER,
    "role" TEXT,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "coverImageUrl" TEXT,
    "heroImageUrl" TEXT,
    "size" "ProjectSize" NOT NULL DEFAULT 'STANDARD',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectService" (
    "projectId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectService_pkey" PRIMARY KEY ("projectId","serviceId")
);

-- CreateTable
CREATE TABLE "Software" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Software_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSoftware" (
    "projectId" TEXT NOT NULL,
    "softwareId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectSoftware_pkey" PRIMARY KEY ("projectId","softwareId")
);

-- CreateTable
CREATE TABLE "ProjectCredit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactContent" (
    "id" TEXT NOT NULL DEFAULT 'contact',
    "pageTitle" TEXT NOT NULL,
    "subtitle" TEXT,
    "location" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "formHeading" TEXT,
    "socialHeading" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CTA" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "buttonLabel" TEXT NOT NULL,
    "buttonHref" TEXT NOT NULL,

    CONSTRAINT "CTA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AboutStat_published_sortOrder_idx" ON "AboutStat"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "Experience_published_sortOrder_idx" ON "Experience"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_published_sortOrder_idx" ON "Service"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "CapabilityPackage_published_sortOrder_idx" ON "CapabilityPackage"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "CapabilityItem_packageId_sortOrder_idx" ON "CapabilityItem"("packageId", "sortOrder");

-- CreateIndex
CREATE INDEX "Client_published_sortOrder_idx" ON "Client"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioCategory_name_key" ON "PortfolioCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioCategory_slug_key" ON "PortfolioCategory"("slug");

-- CreateIndex
CREATE INDEX "PortfolioCategory_published_sortOrder_idx" ON "PortfolioCategory"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_sortOrder_idx" ON "Project"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "Project_categoryId_idx" ON "Project"("categoryId");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_sortOrder_idx" ON "ProjectImage"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectService_projectId_sortOrder_idx" ON "ProjectService"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Software_key_key" ON "Software"("key");

-- CreateIndex
CREATE INDEX "Software_published_sortOrder_idx" ON "Software"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectSoftware_projectId_sortOrder_idx" ON "ProjectSoftware"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectCredit_projectId_sortOrder_idx" ON "ProjectCredit"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CTA_key_key" ON "CTA"("key");

-- AddForeignKey
ALTER TABLE "CapabilityItem" ADD CONSTRAINT "CapabilityItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "CapabilityPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PortfolioCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectService" ADD CONSTRAINT "ProjectService_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectService" ADD CONSTRAINT "ProjectService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSoftware" ADD CONSTRAINT "ProjectSoftware_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSoftware" ADD CONSTRAINT "ProjectSoftware_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCredit" ADD CONSTRAINT "ProjectCredit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
