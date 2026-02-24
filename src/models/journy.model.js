import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    // ─── Year ───────────────────────────────────────────
    year: {
      type: String,
      required: [true, "Year is required"],
      trim: true,
      unique: true,
    },

    // ─── Bilingual Title ────────────────────────────────
    titleHi: {
      type: String,
      required: [true, "Hindi title is required"],
      trim: true,
    },
    titleEn: {
      type: String,
      required: [true, "English title is required"],
      trim: true,
    },

    // ─── Bilingual Subtitle ─────────────────────────────
    subtitleHi: {
      type: String,
      required: [true, "Hindi subtitle is required"],
      trim: true,
    },
    subtitleEn: {
      type: String,
      required: [true, "English subtitle is required"],
      trim: true,
    },

    // ─── Bilingual Description ──────────────────────────
    descHi: {
      type: String,
      required: [true, "Hindi description is required"],
      trim: true,
    },
    descEn: {
      type: String,
      required: [true, "English description is required"],
      trim: true,
    },

    // ─── Visual / UI Fields ─────────────────────────────
    icon: {
      type: String,
      required: [true, "Icon name is required"],
      trim: true,
      // frontend pe icon name string store hogi e.g. "Sprout", "Leaf", "Award"
    },
    accent: {
      type: String,
      required: [true, "Accent color is required"],
      trim: true,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Accent must be a valid hex color e.g. #65a30d"],
    },
    bg: {
      type: String,
      required: [true, "Background gradient class is required"],
      trim: true,
      // e.g. "from-lime-50 to-green-50"
    },
    side: {
      type: String,
      enum: {
        values: ["left", "right"],
        message: "side must be 'left' or 'right'",
      },
      required: [true, "Side is required"],
      default: "right",
    },

    // ─── Stat Fields ────────────────────────────────────
    stat: {
      type: String,
      required: [true, "Stat value is required"],
      trim: true,
      // e.g. "500+", "30%", "10K+"
    },
    statUnit: {
      type: String,
      required: [true, "Stat unit is required"],
      trim: true,
      // e.g. "किसान / Farmers"
    },
    statLabel: {
      type: String,
      required: [true, "Stat label is required"],
      trim: true,
      // e.g. "जुड़े • Joined"
    },

    // ─── System Fields ───────────────────────────────────
    order: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
      // soft delete ke liye
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto
  }
);

// ✅ Year unique index — duplicate year nahi aayega
milestoneSchema.index({ year: 1 }, { unique: true });

// ✅ Order index — timeline sort fast hoga
milestoneSchema.index({ order: 1 });

export default mongoose.model("Milestone", milestoneSchema);