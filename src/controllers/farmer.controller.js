import farmerModel from "../models/farmer.model.js";
import mongoose from "mongoose";
import crypto from "crypto";             // ✅ missing import
import bcrypt from "bcryptjs";           // ✅ missing import
import { generateToken } from "../utils/token.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await farmerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset OTP</h2>
        <p>Hello <strong>${user.farmerName}</strong>,</p>
        <p>Your OTP for password reset is:</p>
        <div style="background: #f4f4f4; padding: 10px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #2e7d32;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>— KrishiNet Team</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "KrishiNet — Password Reset OTP",
        message,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to your registered email",
      });
    } catch (emailError) {
      user.resetOTP = null;
      user.resetOTPExpires = null;
      await user.save();
      console.error("Email sending failed:", emailError.message);
      return res.status(500).json({ success: false, message: "Failed to send OTP email. Please try again." });
    }
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await farmerModel.findOne({
      email,
      resetOTP: hashedOTP,
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await farmerModel.findOne({
      email,
      resetOTP: hashedOTP,
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  try {
    let {
      farmerName, farmerFatherName, mobileNumber,
      whatsappNumber, email, password, crops, sizeOfLand, address,
    } = req.body;

    if (typeof address === "string") {
      address = JSON.parse(address);
    }

    if (!address || !address.pincode || !address.state || !address.district || !address.fullAddress) {
      return res.status(400).json({ success: false, message: "Required address fields are missing" });
    }

    const existingFarmer = await farmerModel.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existingFarmer) {
      return res.status(400).json({ success: false, message: "Farmer already registered" });
    }

    const hashedPassword = await hashPassword(password);

    const farmer = await farmerModel.create({
      farmerName, farmerFatherName, mobileNumber, whatsappNumber,
      email, password: hashedPassword, crops, sizeOfLand, address,
    });

    const token = generateToken({ id: farmer._id, farmerName: farmer.farmerName });

    return res.status(201).json({ success: true, message: "Farmer signup successful", token, data: farmer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await farmerModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken({ id: user._id, farmerName: user.farmerName });

    return res.status(200).json({ success: true, message: "Login successful", token, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyFarmers = async (req, res) => {
  try {
    const farmers = await farmerModel.find({ referenceId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: farmers.length, data: farmers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch farmers" });
  }
};

export const getAllFarmers = async (req, res) => {
  try {
    const farmers = await farmerModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: farmers.length, data: farmers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch farmers" });
  }
};

export const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid farmer ID" });
    }
    const farmer = await farmerModel.findById(id);
    if (!farmer) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }
    return res.status(200).json({ success: true, data: farmer });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch farmer" });
  }
};

export const updateFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid farmer ID" });
    }

    if (req.file) {
      const existingFarmer = await farmerModel.findById(id);
      if (existingFarmer?.profileImage?.public_id) {
        try { await cloudinary.uploader.destroy(existingFarmer.profileImage.public_id); }
        catch (err) { console.log("Failed to delete old image:", err); }
      }
      req.body.profileImage = { url: req.file.path, public_id: req.file.filename };
    }

    const farmer = await farmerModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!farmer) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }
    return res.status(200).json({ success: true, message: "Farmer updated successfully", data: farmer });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Invalid update data", errors: Object.values(error.errors).map(e => e.message) });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate value not allowed", field: Object.keys(error.keyValue) });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid farmer ID" });
    }

    const farmer = await farmerModel.findByIdAndDelete(id);
    if (!farmer) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    if (farmer.profileImage?.public_id) {
      try { await cloudinary.uploader.destroy(farmer.profileImage.public_id); }
      catch (err) { console.log("Failed to delete image from cloud:", err); }
    }

    return res.status(200).json({ success: true, message: "Farmer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};