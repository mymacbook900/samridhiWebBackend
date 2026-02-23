import express from "express";
import {
  signup, login, getAllFarmers, getFarmerById,
  updateFarmer, deleteFarmer, forgotPassword,
  verifyOTP, resetPassword
} from "../controllers/farmer.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);        // ✅ new route
router.post("/reset-password", resetPassword);
router.get("/getAll", getAllFarmers);
router.get("/getOne/:id", getFarmerById);
router.put("/update/:id", upload.single("profileImage"), updateFarmer);
router.delete("/delete/:id", deleteFarmer);   // ✅ was missing

export default router;