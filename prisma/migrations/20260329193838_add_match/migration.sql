-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('GROUP', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL');

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "stage" "Stage" NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "kickoffAt" TIMESTAMP(3) NOT NULL,
    "resultHome" INTEGER,
    "resultAway" INTEGER,
    "qualifiedTeam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_matchNumber_key" ON "Match"("matchNumber");
