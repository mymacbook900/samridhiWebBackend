import express from "express";
import {
  createOurTeam,
  getAllOurTeam,
  deleteOurTeam,
  updateOurTeam,
} from "../controllers/ourteam.controller.js";
import upload from "../middlewares/upload.middleware.js"

const router = express.Router();

router.post("/", upload.single("image"), createOurTeam);
router.get("/", getAllOurTeam);
router.put("/:id", upload.single("image"), updateOurTeam);
router.delete("/:id", deleteOurTeam);

export default router;