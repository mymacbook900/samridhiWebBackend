import express from "express";
import {
  createContact,
  getAllContacts,
  deleteContact,
} from "../controllers/contact.controller.js";

const router = express.Router();

// User
router.post("/", createContact);

// Admin
router.get("/", getAllContacts);
router.delete("/:id", deleteContact);

export default router;