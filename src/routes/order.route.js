import express from "express";
import {
  createOrder,
  getOrderByOrderId,
  getAllOrders,
  getOrdersByFarmer,
  updateOrderStatus,
  cancelOrderAndRestoreCart,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/farmer/:farmerId", getOrdersByFarmer);
router.get("/:orderId", getOrderByOrderId);
router.patch("/:orderId/status", updateOrderStatus);
router.patch("/:orderId/cancel", cancelOrderAndRestoreCart);

export default router;