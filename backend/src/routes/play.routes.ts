import { Router } from "express";
import {
  checkQuestion,
  submitQuest,
  getMyAttempts,
  getAttemptById,
} from "../controllers/play.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/quests/:id/questions/:questionId/check", requireAuth, checkQuestion);
router.post("/quests/:id/submit", requireAuth, submitQuest);
router.get("/attempts/mine", requireAuth, getMyAttempts);
router.get("/attempts/:id", requireAuth, getAttemptById);

export default router;