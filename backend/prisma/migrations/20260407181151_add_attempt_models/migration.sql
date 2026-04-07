-- CreateTable
CREATE TABLE "Attempt" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" SERIAL NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
