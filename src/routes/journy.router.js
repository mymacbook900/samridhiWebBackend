import express from "express";
import {
  createMilestone,
  getAllMilestones,
  updateMilestone,
  hardDeleteMilestone,
} from "../controllers/journy.controller.js";

const router = express.Router();

router.get("/", getAllMilestones);
router.post("/", createMilestone);
router.put("/:id", updateMilestone);
router.delete("/:id/permanent", hardDeleteMilestone);

export default router;