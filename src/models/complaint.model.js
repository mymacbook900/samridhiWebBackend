import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "farmer",
      required: true
    },
    farmerName: {
      type: String,
      required: true
    },
    salesOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOfficer",
      required: true
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low"
    },
    status: {
      type: String,
      enum: ["in_progress", "resolved"],
      default: "inprogress"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
