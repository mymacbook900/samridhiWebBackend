import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // References your Product Schema
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true // Stores the single unit price (e.g. 500)
  },
  subTotal: { 
    type: Number, 
    required: true // Stores quantity * unitPrice (e.g. 2 * 500 = 1000)
  }
});

const cartSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer", 
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);