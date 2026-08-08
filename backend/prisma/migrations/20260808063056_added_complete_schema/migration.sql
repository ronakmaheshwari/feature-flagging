-- CreateEnum
CREATE TYPE "USER_STATUS" AS ENUM ('ACTIVE', 'DELETED', 'UNVERIFIED', 'LOCKED');

-- CreateEnum
CREATE TYPE "STATUS_TYPE" AS ENUM ('DRAFT', 'POSTED', 'DELETED');

-- CreateEnum
CREATE TYPE "ENVIRONMENT_TYPE" AS ENUM ('PRODUCTION', 'DEVELOPMENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_status" "USER_STATUS" NOT NULL DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "JWT_Token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpire" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JWT_Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "platform" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "STATUS_TYPE" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAudit" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "old_value" JSONB NOT NULL,
    "new_value" JSONB NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_users" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature_Flag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "environment" "ENVIRONMENT_TYPE" NOT NULL DEFAULT 'DEVELOPMENT',
    "rules" JSONB NOT NULL DEFAULT '{}',
    "rollout" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_Flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature_Flag_Audit" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "old_value" JSONB NOT NULL,
    "new_value" JSONB NOT NULL,
    "updatedBy" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature_Flag_Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JWT_Token_userId_key" ON "JWT_Token"("userId");

-- CreateIndex
CREATE INDEX "Content_userId_idx" ON "Content"("userId");

-- CreateIndex
CREATE INDEX "ContentAudit_contentId_idx" ON "ContentAudit"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE INDEX "Group_name_userId_idx" ON "Group"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_Flag_name_key" ON "Feature_Flag"("name");

-- CreateIndex
CREATE INDEX "Feature_Flag_name_idx" ON "Feature_Flag"("name");

-- CreateIndex
CREATE INDEX "Feature_Flag_Audit_flagId_updatedBy_idx" ON "Feature_Flag_Audit"("flagId", "updatedBy");

-- AddForeignKey
ALTER TABLE "JWT_Token" ADD CONSTRAINT "JWT_Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAudit" ADD CONSTRAINT "ContentAudit_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature_Flag_Audit" ADD CONSTRAINT "Feature_Flag_Audit_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature_Flag_Audit" ADD CONSTRAINT "Feature_Flag_Audit_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "Feature_Flag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
