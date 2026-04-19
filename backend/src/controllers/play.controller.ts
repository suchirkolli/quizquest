// References:
// Express routing guide: https://expressjs.com/en/guide/routing.html
// Prisma CRUD docs: https://www.prisma.io/docs/orm/prisma-client/queries/crud
// Zod docs: https://zod.dev/
import { Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const checkQuestionSchema = z.object({
  selectedIndex: z.number().int().min(0).max(3).nullable(),
});

const submitQuestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int(),
      selectedIndex: z.number().int().min(0).max(3),
    })
  ),
});

export const checkQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can play quests" });
    }

    const questId = Number(req.params.id);
    const questionId = Number(req.params.questionId);

    if (Number.isNaN(questId) || Number.isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid quest or question id" });
    }

    const parsed = checkQuestionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid question check data",
        errors: parsed.error.flatten(),
      });
    }

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        questId: questId,
      },
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found for this quest" });
    }

    const selectedIndex = parsed.data.selectedIndex;

    const isCorrect =
      selectedIndex !== null && selectedIndex === question.correctIndex;

    return res.status(200).json({
      message: "Question checked successfully",
      result: {
        questionId: question.id,
        selectedIndex: selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect: isCorrect,
        explanation: question.explanation,
      },
    });
  } catch (error) {
    console.error("CHECK QUESTION ERROR:", error);
    return res.status(500).json({ message: "Server error while checking question" });
  }
};

export const getFiftyFiftyChoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can use powerups here" });
    }

    const questId = Number(req.params.id);
    const questionId = Number(req.params.questionId);

    if (Number.isNaN(questId) || Number.isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid quest or question id" });
    }

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        questId: questId,
      },
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found for this quest" });
    }

    const wrongIndexes = [0, 1, 2, 3].filter(
      (index) => index !== question.correctIndex
    );

    const hideIndexes = wrongIndexes.slice(0, 2);

    return res.status(200).json({
      message: "50/50 works yay!",
      result: {
        questionId: question.id,
        hideIndexes: hideIndexes,
      },
    });
  } catch (error) {
    console.error("FIFTY FIFTY ERROR:", error);
    return res.status(500).json({ message: "Server error while using 50/50" });
  }
};

export const submitQuest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can submit quests" });
    }

    const questId = Number(req.params.id);

    if (Number.isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest id" });
    }

    const parsed = submitQuestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid submission data",
        errors: parsed.error.flatten(),
      });
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: {
        questions: true,
      },
    });

    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    const answerMap = new Map(
      parsed.data.answers.map((answer) => [answer.questionId, answer.selectedIndex])
    );

    let score = 0;

    const gradedAnswers = quest.questions.map((question) => {
      const selectedIndex = answerMap.get(question.id);

      const isCorrect =
        selectedIndex !== undefined && selectedIndex === question.correctIndex;

      if (isCorrect) {
        score += 1;
      }

      return {
        questionId: question.id,
        prompt: question.prompt,
        selectedIndex: selectedIndex ?? null,
        correctIndex: question.correctIndex,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const attempt = await prisma.attempt.create({
      data: {
        studentId: req.user.userId,
        questId: quest.id,
        score,
        totalQuestions: quest.questions.length,
        answers: {
          create: gradedAnswers
            .filter((answer) => answer.selectedIndex !== null)
            .map((answer) => ({
              questionId: answer.questionId,
              selectedIndex: answer.selectedIndex as number,
              isCorrect: answer.isCorrect,
            })),
        },
      },
    });

    return res.status(200).json({
      message: "Quest submitted successfully",
      result: {
        attemptId: attempt.id,
        questId: quest.id,
        score,
        totalQuestions: quest.questions.length,
        answers: gradedAnswers,
      },
    });
  } catch (error) {
    console.error("SUBMIT QUEST ERROR:", error);
    return res.status(500).json({ message: "Server error while submitting quest" });
  }
};

export const getMyAttempts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        studentId: req.user.userId,
      },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ attempts });
  } catch (error) {
    console.error("GET MY ATTEMPTS ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching attempts" });
  }
};

export const getAttemptById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const attemptId = Number(req.params.id);

    if (Number.isNaN(attemptId)) {
      return res.status(400).json({ message: "Invalid attempt id" });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                prompt: true,
                explanation: true,
                correctIndex: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.studentId !== req.user.userId) {
      return res.status(403).json({ message: "You do not have access to this attempt" });
    }

    return res.status(200).json({ attempt });
  } catch (error) {
    console.error("GET ATTEMPT BY ID ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching attempt" });
  }
};