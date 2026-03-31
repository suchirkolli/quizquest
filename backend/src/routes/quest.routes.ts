import { Router } from "express";
import { createQuest, getMyQuests } from "../controllers/quest.controller";
import { requireAuth, requireTeacher } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, requireTeacher, createQuest);
router.get("/mine", requireAuth, requireTeacher, getMyQuests);

export default router;