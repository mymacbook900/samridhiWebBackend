import express from "express"
import { getAllComplaintsForAdmin, createComplaint, getComplaintsForSalesOfficer, updateComplaint } from "../controllers/complaint.controller.js"

const router = express.Router();
router.get("/all", getAllComplaintsForAdmin);
router.get("/sales-officer" , getComplaintsForSalesOfficer),
router.post("/create", createComplaint),
router.put("/update/:complaintId" , updateComplaint)

export default router;
