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
          create: questions.map((question) => ({
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
        questions: true,
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