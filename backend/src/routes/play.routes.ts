import { Router } from "express";
import {
  submitQuest,
  getMyAttempts,
  getAttemptById,
} from "../controllers/play.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/quests/:id/submit", requireAuth, submitQuest);
router.get("/attempts/mine", requireAuth, getMyAttempts);
router.get("/attempts/:id", requireAuth, getAttemptById);

export default router;