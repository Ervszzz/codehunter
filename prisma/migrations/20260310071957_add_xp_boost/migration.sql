-- CreateTable
CREATE TABLE "XPBoost" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPBoost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XPBoost_expiresAt_idx" ON "XPBoost"("expiresAt");
