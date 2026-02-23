import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/products.model.js";

const recalculateCart = (cart) => {
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subTotal, 0);
};

// ✅ Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { farmerId, productId, quantity = 1 } = req.body;

    if (!farmerId || !productId) {
      return res.status(400).json({ success: false, message: "farmerId and productId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(farmerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not available" });
    }

    const currentPrice = product.pricing?.displayPriceWithGst;
    if (!currentPrice) {
      return res.status(400).json({ success: false, message: "Product price information is missing" });
    }

    let cart = await Cart.findOne({ farmerId });
    if (!cart) {
      cart = new Cart({ farmerId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].unitPrice = currentPrice;
      cart.items[itemIndex].subTotal = cart.items[itemIndex].quantity * currentPrice;
    } else {
      cart.items.push({
        productId,
        quantity,
        unitPrice: currentPrice,
        subTotal: quantity * currentPrice,
      });
    }

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "productName productImages pricing productCategory",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: populatedCart,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get cart by farmerId
export const getCartByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ success: false, message: "Invalid farmerId" });
    }

    const cart = await Cart.findOne({ farmerId }).populate({
      path: "items.productId",
      select: "productName productImages pricing productCategory isActive",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], totalItems: 0, totalPrice: 0 },
      });
    }

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error("getCartByFarmer error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Increase quantity by 1
export const increaseQuantity = async (req, res) => {
  try {
    const { farmerId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(farmerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const cart = await Cart.findOne({ farmerId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    // Fetch latest price
    const product = await Product.findById(productId);
    const currentPrice = product?.pricing?.displayPriceWithGst || cart.items[itemIndex].unitPrice;

    cart.items[itemIndex].quantity += 1;
    cart.items[itemIndex].unitPrice = currentPrice;
    cart.items[itemIndex].subTotal = cart.items[itemIndex].quantity * currentPrice;

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "productName productImages pricing productCategory",
    });

    return res.status(200).json({ success: true, message: "Quantity increased", data: populatedCart });
  } catch (error) {
    console.error("increaseQuantity error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Decrease quantity by 1 (removes item if quantity reaches 0)
export const decreaseQuantity = async (req, res) => {
  try {
    const { farmerId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(farmerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const cart = await Cart.findOne({ farmerId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    if (cart.items[itemIndex].quantity <= 1) {
      // Remove item if quantity would go below 1
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity -= 1;
      cart.items[itemIndex].subTotal =
        cart.items[itemIndex].quantity * cart.items[itemIndex].unitPrice;
    }

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "productName productImages pricing productCategory",
    });

    return res.status(200).json({ success: true, message: "Quantity decreased", data: populatedCart });
  } catch (error) {
    console.error("decreaseQuantity error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update quantity directly (set exact value)
export const updateCartQuantity = async (req, res) => {
  try {
    const { farmerId, productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(farmerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ farmerId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subTotal = quantity * cart.items[itemIndex].unitPrice;

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "productName productImages pricing productCategory",
    });

    return res.status(200).json({ success: true, message: "Cart updated", data: populatedCart });
  } catch (error) {
    console.error("updateCartQuantity error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Remove single item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { farmerId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(farmerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const cart = await Cart.findOne({ farmerId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const beforeCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    if (cart.items.length === beforeCount) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "productName productImages pricing productCategory",
    });

    return res.status(200).json({ success: true, message: "Item removed from cart", data: populatedCart });
  } catch (error) {
    console.error("removeCartItem error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ success: false, message: "Invalid farmerId" });
    }

    const cart = await Cart.findOne({ farmerId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    return res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};