-- CreateEnum
CREATE TYPE "Method" AS ENUM ('GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD');

-- AlterTable
ALTER TABLE "Feature_Flag" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RouteFlag" (
    "id" TEXT NOT NULL,
    "method" "Method" NOT NULL,
    "path" TEXT NOT NULL,
    "flagName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RouteFlag_method_path_key" ON "RouteFlag"("method", "path");

-- AddForeignKey
ALTER TABLE "RouteFlag" ADD CONSTRAINT "RouteFlag_flagName_fkey" FOREIGN KEY ("flagName") REFERENCES "Feature_Flag"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
