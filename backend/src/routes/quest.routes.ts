import { Router } from "express";
import {
  createQuest,
  getMyQuests,
  getAllQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
} from "../controllers/quest.controller";
import { requireAuth, requireTeacher } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, requireTeacher, createQuest);
router.get("/mine", requireAuth, requireTeacher, getMyQuests);
router.get("/all", requireAuth, getAllQuests);
router.get("/:id", requireAuth, getQuestById);
router.put("/:id", requireAuth, requireTeacher, updateQuest);
router.delete("/:id", requireAuth, requireTeacher, deleteQuest);

export default router;