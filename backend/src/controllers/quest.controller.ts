import { Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const questionSchema = z.object({
  prompt: z.string().min(1),
  choices: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
  correctIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  explanation: z.string().min(1),
});

const createQuestSchema = z.object({
  title: z.string().min(1),
  questions: z.array(questionSchema).min(1),
});

const updateQuestSchema = createQuestSchema;

type FrontendQuestionInput = {
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

function mapQuestionForFrontend(question: {
  prompt: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctIndex: number;
  explanation: string;
}) {
  return {
    prompt: question.prompt,
    choices: [
      question.choiceA,
      question.choiceB,
      question.choiceC,
      question.choiceD,
    ] as [string, string, string, string],
    correctIndex: question.correctIndex as 0 | 1 | 2 | 3,
    explanation: question.explanation,
  };
}

export const createQuest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = createQuestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid quest data",
        errors: parsed.error.flatten(),
      });
    }

    const { title, questions } = parsed.data;

    const quest = await prisma.quest.create({
      data: {
        title,
        ownerId: req.user.userId,
        questions: {
          create: questions.map((question: FrontendQuestionInput) => ({
            prompt: question.prompt,
            choiceA: question.choices[0],
            choiceB: question.choices[1],
            choiceC: question.choices[2],
            choiceD: question.choices[3],
            correctIndex: question.correctIndex,
            explanation: question.explanation,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return res.status(201).json({
      message: "Quest created successfully",
      quest,
    });
  } catch (error) {
    console.error("CREATE QUEST ERROR:", error);
    return res.status(500).json({ message: "Server error while creating quest" });
  }
};

export const getMyQuests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const quests = await prisma.quest.findMany({
      where: {
        ownerId: req.user.userId,
      },
      include: {
        questions: {
          select: { id: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ quests });
  } catch (error) {
    console.error("GET MY QUESTS ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching quests" });
  }
};

export const getAllQuests = async (req: AuthRequest, res: Response) => {
  try {
    const quests = await prisma.quest.findMany({
      include: {
        owner: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ quests });
  } catch (error) {
    console.error("GET ALL QUESTS ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching all quests" });
  }
};

export const getQuestById = async (req: AuthRequest, res: Response) => {
  try {
    const questId = Number(req.params.id);

    if (Number.isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest id" });
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
        questions: true,
      },
    });

    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    if (req.user?.role === "TEACHER") {
      if (quest.ownerId !== req.user.userId) {
        return res.status(403).json({ message: "You do not have access to this quest" });
      }

      return res.status(200).json({
        quest: {
          id: quest.id,
          title: quest.title,
          ownerId: quest.ownerId,
          createdAt: quest.createdAt,
          questions: quest.questions.map((question: {
            id: number;
            prompt: string;
            choiceA: string;
            choiceB: string;
            choiceC: string;
            choiceD: string;
            correctIndex: number;
            explanation: string;
          }) => ({
            id: question.id,
            ...mapQuestionForFrontend(question),
          })),
        },
      });
    }

    return res.status(200).json({
      quest: {
        id: quest.id,
        title: quest.title,
        owner: quest.owner,
        createdAt: quest.createdAt,
        questions: quest.questions.map((question: {
          id: number;
          prompt: string;
          choiceA: string;
          choiceB: string;
          choiceC: string;
          choiceD: string;
        }) => ({
          id: question.id,
          prompt: question.prompt,
          choices: [
            question.choiceA,
            question.choiceB,
            question.choiceC,
            question.choiceD,
          ],
        })),
      },
    });
  } catch (error) {
    console.error("GET QUEST BY ID ERROR:", error);
    return res.status(500).json({ message: "Server error while fetching quest" });
  }
};

export const updateQuest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const questId = Number(req.params.id);

    if (Number.isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest id" });
    }

    const parsed = updateQuestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid quest data",
        errors: parsed.error.flatten(),
      });
    }

    const existingQuest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!existingQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    if (existingQuest.ownerId !== req.user.userId) {
      return res.status(403).json({ message: "You do not have permission to edit this quest" });
    }

    const { title, questions } = parsed.data;

    const updatedQuest = await prisma.quest.update({
      where: { id: questId },
      data: {
        title,
        questions: {
          deleteMany: {},
          create: questions.map((question: FrontendQuestionInput) => ({
            prompt: question.prompt,
            choiceA: question.choices[0],
            choiceB: question.choices[1],
            choiceC: question.choices[2],
            choiceD: question.choices[3],
            correctIndex: question.correctIndex,
            explanation: question.explanation,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return res.status(200).json({
      message: "Quest updated successfully",
      quest: updatedQuest,
    });
  } catch (error) {
    console.error("UPDATE QUEST ERROR:", error);
    return res.status(500).json({ message: "Server error while updating quest" });
  }
};

export const deleteQuest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const questId = Number(req.params.id);

    if (Number.isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest id" });
    }

    const existingQuest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!existingQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }

    if (existingQuest.ownerId !== req.user.userId) {
      return res.status(403).json({ message: "You do not have permission to delete this quest" });
    }

    await prisma.quest.delete({
      where: { id: questId },
    });

    return res.status(200).json({ message: "Quest deleted successfully" });
  } catch (error) {
    console.error("DELETE QUEST ERROR:", error);
    return res.status(500).json({ message: "Server error while deleting quest" });
  }
};