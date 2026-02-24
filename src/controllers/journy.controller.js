import Milestone from "../models/journy.model.js";

export const createMilestone = async (req, res) => {
  try {
    const {
      year, titleHi, titleEn, subtitleHi, subtitleEn,
      descHi, descEn, icon, accent, bg, side,
      stat, statUnit, statLabel, order,
    } = req.body;
    console.log("body-----",req.body);
    

    const existing = await Milestone.findOne({ year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Milestone for year ${year} already exists`,
      });
    }

    const milestone = await Milestone.create({
      year, titleHi, titleEn, subtitleHi, subtitleEn,
      descHi, descEn, icon, accent, bg, side,
      stat, statUnit, statLabel, order,
    });

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      data: milestone,
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllMilestones = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const milestones = await Milestone.find(filter)
      .sort({ order: 1 }) 
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    if (req.body.year) {
      const existing = await Milestone.findOne({
        year: req.body.year,
        _id: { $ne: req.params.id }, 
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another milestone with year ${req.body.year} already exists`,
        });
      }
    }

    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,           
        runValidators: true, 
      }
    ).select("-__v");

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      data: milestone,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    ).select("-__v");

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Milestone deactivated (soft deleted) successfully",
      data: milestone,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const hardDeleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndDelete(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Milestone permanently deleted",
      deletedId: req.params.id,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
