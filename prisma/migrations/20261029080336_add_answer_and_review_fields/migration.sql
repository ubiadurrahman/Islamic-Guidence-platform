-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "clarificationNote" TEXT,
ADD COLUMN     "scholarId" INTEGER;

-- CreateTable
CREATE TABLE "answers" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "scholarId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "references" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "answers_questionId_key" ON "answers"("questionId");

-- CreateIndex
CREATE INDEX "answers_scholarId_idx" ON "answers"("scholarId");

-- CreateIndex
CREATE INDEX "questions_scholarId_idx" ON "questions"("scholarId");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
