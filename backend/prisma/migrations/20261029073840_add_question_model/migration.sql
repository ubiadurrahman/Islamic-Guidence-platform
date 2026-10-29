-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'NEEDS_CLARIFICATION', 'ANSWERED', 'CLOSED');

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "QuestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_authorId_idx" ON "questions"("authorId");

-- CreateIndex
CREATE INDEX "questions_status_idx" ON "questions"("status");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
