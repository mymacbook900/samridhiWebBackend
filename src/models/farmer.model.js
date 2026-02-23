import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    profileImage: {
      url: String,
      public_id: String,
    },
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },
    farmerFatherName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[6-9]\d{9}$/,
    },
    whatsappNumber: {
      type: String,
      match: /^[6-9]\d{9}$/,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetOTP: { type: String, default: null },
    resetOTPExpires: { type: Date, default: null },
    crops: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Block"],
      default: "Active",
    },
    sizeOfLand: {
      type: String,
    },
    address: {
      pincode: {
        type: String,
        required: true,
        match: /^\d{6}$/,
      },
      state: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      city: { type: String },
      tehsil: { type: String },
      village: { type: String },
      fullAddress: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("farmer", farmerSchema);