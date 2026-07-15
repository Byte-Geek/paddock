/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ATHLETE', 'COACH', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('REGISTERED', 'COMPETED', 'DISQUALIFIED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ScoringAlgorithm" AS ENUM ('SUM', 'AVERAGE', 'AVERAGE_DROP_HIGH_LOW', 'WEIGHTED_SUM');

-- CreateEnum
CREATE TYPE "ScoringMethod" AS ENUM ('NUMERIC_0_10', 'NUMERIC_0_6', 'PASS_FAIL');

-- CreateEnum
CREATE TYPE "ElementType" AS ENUM ('MOVEMENT', 'COLLECTIVE');

-- CreateEnum
CREATE TYPE "ErrorType" AS ENUM ('COURSE_ERROR', 'TECHNICAL_ERROR');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ATHLETE';

-- DropEnum
DROP TYPE "UserRoles";

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_athletes" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "group_athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_secretaries" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_secretaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "description" TEXT,
    "compositionYear" INTEGER,
    "revisionYear" INTEGER,
    "estimatedTimeSeconds" INTEGER,
    "scoringAlgorithm" "ScoringAlgorithm" NOT NULL DEFAULT 'SUM',
    "algorithmConfig" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_elements" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "number" INTEGER,
    "letters" TEXT,
    "name" TEXT NOT NULL,
    "judgingCriteria" TEXT,
    "elementType" "ElementType" NOT NULL DEFAULT 'MOVEMENT',
    "scoringMethod" "ScoringMethod" NOT NULL DEFAULT 'NUMERIC_0_10',
    "maxScore" DECIMAL(4,2) NOT NULL DEFAULT 10,
    "scoreStep" DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    "coefficient" DECIMAL(3,1) NOT NULL DEFAULT 1,

    CONSTRAINT "protocol_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "protocolTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_referees" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "letterCode" TEXT NOT NULL,
    "position" TEXT,

    CONSTRAINT "category_referees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participations" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "horseName" TEXT,
    "participationNumber" INTEGER NOT NULL DEFAULT 1,
    "finalScore" DECIMAL(6,2),
    "percentage" DECIMAL(5,2),
    "rank" INTEGER,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "categoryRefereeId" TEXT NOT NULL,
    "enteredByUserId" TEXT,
    "finalScore" DECIMAL(6,2),
    "percentage" DECIMAL(5,2),
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "value" DECIMAL(4,2),
    "correction" DECIMAL(4,2),
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_errors" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "errorType" "ErrorType" NOT NULL,
    "occurrence" INTEGER NOT NULL,
    "deductionPercent" DECIMAL(4,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "athletes_userId_key" ON "athletes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "coaches_userId_key" ON "coaches"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_athletes_groupId_athleteId_key" ON "group_athletes"("groupId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "event_secretaries_eventId_userId_key" ON "event_secretaries"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "category_referees_categoryId_letterCode_key" ON "category_referees"("categoryId", "letterCode");

-- CreateIndex
CREATE UNIQUE INDEX "participations_athleteId_categoryId_participationNumber_key" ON "participations"("athleteId", "categoryId", "participationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_participationId_categoryRefereeId_key" ON "evaluations"("participationId", "categoryRefereeId");

-- CreateIndex
CREATE UNIQUE INDEX "scores_evaluationId_elementId_key" ON "scores"("evaluationId", "elementId");

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_athletes" ADD CONSTRAINT "group_athletes_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_athletes" ADD CONSTRAINT "group_athletes_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_secretaries" ADD CONSTRAINT "event_secretaries_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_secretaries" ADD CONSTRAINT "event_secretaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_elements" ADD CONSTRAINT "protocol_elements_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "protocol_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_protocolTemplateId_fkey" FOREIGN KEY ("protocolTemplateId") REFERENCES "protocol_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_referees" ADD CONSTRAINT "category_referees_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_categoryRefereeId_fkey" FOREIGN KEY ("categoryRefereeId") REFERENCES "category_referees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_enteredByUserId_fkey" FOREIGN KEY ("enteredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "protocol_elements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_errors" ADD CONSTRAINT "evaluation_errors_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
