import mongoose from "mongoose";

const ourteamSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    email: {
      type: String,
      required: function () { return this.teamType === "manager"; },
      lowercase: true,
      trim: true,
      // ✅ unique/sparse यहाँ नहीं
    },
    linkedIn: {
      type: String,
      required: function () { return this.teamType === "manager"; },
      trim: true,
    },
    image: { type: String, required: [true, "Image URL is required"], trim: true },
    expertise: {
      type: String,
      required: function () { return this.teamType === "manager"; },
      trim: true,
    },
    teamType: {
      type: String,
      enum: { values: ["manager", "member"], message: "teamType must be 'manager' or 'member'" },
      required: [true, "teamType is required"],
      default: "member",
    },
  },
  { timestamps: true }
);

// ✅ sparse index — null values ignore होंगी, duplicate नहीं होगा
ourteamSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.model("OurTeam", ourteamSchema);