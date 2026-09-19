-- CreateEnum
CREATE TYPE "Role" AS ENUM ('READER', 'WRITER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('FICTION', 'ROMANCE', 'THRILLER', 'SCIFI', 'HORROR', 'DRAMA', 'POETRY', 'NONFICTION', 'FOLKTALE', 'OTHER');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "MobileMoneyNetwork" AS ENUM ('MTN', 'AIRTEL');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LedgerEntryStatus" AS ENUM ('HELD', 'ELIGIBLE', 'PAID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'READER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WriterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "payoutPhone" TEXT,
    "payoutNetwork" "MobileMoneyNetwork",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "genre" "Genre" NOT NULL,
    "priceNgwee" INTEGER NOT NULL,
    "coverText" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "previewCutoff" INTEGER NOT NULL,
    "readTimeMinutes" INTEGER NOT NULL,
    "status" "StoryStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "rejectionNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAction" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "amountNgwee" INTEGER NOT NULL,
    "platformCutNgwee" INTEGER NOT NULL,
    "writerCutNgwee" INTEGER NOT NULL,
    "network" "MobileMoneyNetwork" NOT NULL,
    "phone" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutLedgerEntry" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "writerProfileId" TEXT NOT NULL,
    "amountNgwee" INTEGER NOT NULL,
    "status" "LedgerEntryStatus" NOT NULL DEFAULT 'HELD',
    "eligibleAt" TIMESTAMP(3) NOT NULL,
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "writerProfileId" TEXT NOT NULL,
    "totalAmountNgwee" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "network" "MobileMoneyNetwork" NOT NULL,
    "phone" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "failureReason" TEXT,
    "triggeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnthologyTitle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverText" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "previewCutoff" INTEGER NOT NULL,
    "priceNgwee" INTEGER NOT NULL,
    "readTimeMinutes" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnthologyTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnthologyPurchase" (
    "id" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "anthologyId" TEXT NOT NULL,
    "amountNgwee" INTEGER NOT NULL,
    "network" "MobileMoneyNetwork" NOT NULL,
    "phone" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AnthologyPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "WriterProfile_userId_key" ON "WriterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_status_idx" ON "Story"("status");

-- CreateIndex
CREATE INDEX "Story_genre_idx" ON "Story"("genre");

-- CreateIndex
CREATE INDEX "Story_writerId_idx" ON "Story"("writerId");

-- CreateIndex
CREATE INDEX "ReviewAction_storyId_idx" ON "ReviewAction"("storyId");

-- CreateIndex
CREATE INDEX "Purchase_readerId_idx" ON "Purchase"("readerId");

-- CreateIndex
CREATE INDEX "Purchase_storyId_idx" ON "Purchase"("storyId");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutLedgerEntry_purchaseId_key" ON "PayoutLedgerEntry"("purchaseId");

-- CreateIndex
CREATE INDEX "PayoutLedgerEntry_writerProfileId_status_idx" ON "PayoutLedgerEntry"("writerProfileId", "status");

-- CreateIndex
CREATE INDEX "Payout_writerProfileId_status_idx" ON "Payout"("writerProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AnthologyTitle_slug_key" ON "AnthologyTitle"("slug");

-- CreateIndex
CREATE INDEX "AnthologyTitle_published_idx" ON "AnthologyTitle"("published");

-- CreateIndex
CREATE INDEX "AnthologyPurchase_readerId_idx" ON "AnthologyPurchase"("readerId");

-- CreateIndex
CREATE INDEX "AnthologyPurchase_anthologyId_idx" ON "AnthologyPurchase"("anthologyId");

-- AddForeignKey
ALTER TABLE "WriterProfile" ADD CONSTRAINT "WriterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAction" ADD CONSTRAINT "ReviewAction_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAction" ADD CONSTRAINT "ReviewAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutLedgerEntry" ADD CONSTRAINT "PayoutLedgerEntry_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutLedgerEntry" ADD CONSTRAINT "PayoutLedgerEntry_writerProfileId_fkey" FOREIGN KEY ("writerProfileId") REFERENCES "WriterProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutLedgerEntry" ADD CONSTRAINT "PayoutLedgerEntry_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_writerProfileId_fkey" FOREIGN KEY ("writerProfileId") REFERENCES "WriterProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnthologyPurchase" ADD CONSTRAINT "AnthologyPurchase_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnthologyPurchase" ADD CONSTRAINT "AnthologyPurchase_anthologyId_fkey" FOREIGN KEY ("anthologyId") REFERENCES "AnthologyTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
