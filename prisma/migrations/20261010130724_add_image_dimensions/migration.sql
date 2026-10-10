-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "coverImageHeight" INTEGER,
ADD COLUMN     "coverImageWidth" INTEGER,
ADD COLUMN     "heroImageHeight" INTEGER,
ADD COLUMN     "heroImageWidth" INTEGER;

-- AlterTable
ALTER TABLE "ProjectImage" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER;
