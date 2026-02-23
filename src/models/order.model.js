import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
});

// ✅ Full structured location schema
const locationSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    village: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be a valid 6-digit number"],
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
  },
  { _id: false } // No separate _id for embedded subdoc
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    items: [orderItemSchema],

    totalItems: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      required: true,
    },

    utrId: {
      type: String,
      default: null,
    },

    paymentProof: {
      type: String, // Cloudinary URL
      default: null,
    },

    // ✅ Full structured location (replaces plain String)
    location: {
      type: locationSchema,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

// ✅ Indexes for faster queries
orderSchema.index({ farmerId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "location.pincode": 1 });

export default mongoose.model("Order", orderSchema);