import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import { generateOrderId } from "../utils/genrateOrderId.js";

const validateLocation = (location) => {
  if (!location || typeof location !== "object") {
    return "Location is required";
  }
  const required = ["street", "city", "district", "state", "pincode"];
  for (const field of required) {
    if (!location[field] || !String(location[field]).trim()) {
      return `Location '${field}' is required`;
    }
  }
  if (!/^\d{6}$/.test(location.pincode)) {
    return "Pincode must be a valid 6-digit number";
  }
  return null; // no error
};

export const createOrder = async (req, res) => {
  try {
    const {
      farmerId,
      selectedProductIds,
      paymentMethod,
      utrId,
      paymentProof,
      location,
    } = req.body;

    // ✅ Validate farmerId
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ success: false, message: "Invalid farmerId" });
    }

    // ✅ Validate selectedProductIds
    if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products selected for order",
      });
    }

    const allValid = selectedProductIds.every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (!allValid) {
      return res.status(400).json({
        success: false,
        message: "One or more selected product IDs are invalid",
      });
    }

    // ✅ Validate paymentMethod
    if (!["online", "cash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Must be 'online' or 'cash'",
      });
    }

    // ✅ For online payment, utrId is required
    if (paymentMethod === "online" && !utrId) {
      return res.status(400).json({
        success: false,
        message: "UTR ID is required for online payment",
      });
    }

    // ✅ Validate full location
    const locationError = validateLocation(location);
    if (locationError) {
      return res.status(400).json({ success: false, message: locationError });
    }

    // ✅ Find cart
    const cart = await Cart.findOne({ farmerId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // ✅ Filter selected items from cart
    const selectedItems = cart.items.filter((item) =>
      selectedProductIds.includes(item.productId.toString())
    );

    if (selectedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected items not found in cart",
      });
    }

    // ✅ Calculate totals
    const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.subTotal, 0);

    // ✅ Build structured location
    const structuredLocation = {
      street: location.street.trim(),
      village: location.village ? location.village.trim() : null,
      city: location.city.trim(),
      district: location.district.trim(),
      state: location.state.trim(),
      pincode: location.pincode.trim(),
      country: location.country ? location.country.trim() : "India",
    };

    // ✅ Create order
    const order = new Order({
      orderId: generateOrderId(),
      farmerId,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subTotal: item.subTotal,
      })),
      totalItems,
      totalPrice,
      paymentMethod,
      utrId: paymentMethod === "online" ? utrId : null,
      paymentProof: paymentMethod === "online" ? paymentProof : null,
      location: structuredLocation,
    });

    await order.save();

    // ✅ Remove only ordered items from cart
    cart.items = cart.items.filter(
      (item) => !selectedProductIds.includes(item.productId.toString())
    );
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subTotal, 0);

    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      data: order,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate("farmerId", "farmerName mobileNumber")
      .populate("items.productId", "productName productImages");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("getOrderByOrderId error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // ✅ Optional filters
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.pincode) filter["location.pincode"] = req.query.pincode;
    if (req.query.state) filter["location.state"] = new RegExp(req.query.state, "i");

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("farmerId", "farmerName mobileNumber")
        .populate("items.productId", "productName productImages")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: orders,
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrdersByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ success: false, message: "Invalid farmerId" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ farmerId })
        .populate("items.productId", "productName productImages")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ farmerId }),
    ]);

    return res.status(200).json({
      success: true,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: orders,
    });
  } catch (error) {
    console.error("getOrdersByFarmer error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["placed", "confirmed", "delivered", "cancelled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be updated",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be updated",
      });
    }

    // ✅ Prevent backward status transitions
    const statusFlow = { placed: 0, confirmed: 1, delivered: 2 };
    if (
      status !== "cancelled" &&
      statusFlow[status] < statusFlow[order.orderStatus]
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from '${order.orderStatus}' back to '${status}'`,
      });
    }

    order.orderStatus = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrderAndRestoreCart = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ success: false, message: "Order already cancelled" });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });
    }

    // ✅ Find or create cart
    let cart = await Cart.findOne({ farmerId: order.farmerId });
    if (!cart) {
      cart = new Cart({ farmerId: order.farmerId, items: [], totalItems: 0, totalPrice: 0 });
    }

    // ✅ Restore items to cart
    for (const orderItem of order.items) {
      const cartItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === orderItem.productId.toString()
      );

      if (cartItemIndex > -1) {
        cart.items[cartItemIndex].quantity += orderItem.quantity;
        cart.items[cartItemIndex].subTotal =
          cart.items[cartItemIndex].quantity * cart.items[cartItemIndex].unitPrice;
      } else {
        cart.items.push({
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          subTotal: orderItem.subTotal,
        });
      }
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subTotal, 0);

    await cart.save();

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled and cart restored successfully",
    });
  } catch (error) {
    console.error("cancelOrderAndRestoreCart error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};