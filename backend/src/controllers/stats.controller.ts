import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getMyStats = async (req: any, res: Response) => {
  const userId = req.user.id;

  const attempts = await prisma.attempt.findMany({
    where: { studentId: userId },
    include: { quest: true },
  });

  const totalAttempts = attempts.length;
  const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);

  res.json({
    totalAttempts,
    totalScore,
    totalQuestions,
    averageScore:
      totalQuestions === 0 ? 0 : (totalScore / totalQuestions) * 100,
    attempts,
  });
};