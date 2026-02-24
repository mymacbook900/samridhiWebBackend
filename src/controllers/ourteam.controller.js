import OurteamModel from "../models/Ourteam.model.js";

export const createOurTeam = async (req, res) => {
  try {
    const { name, title, email, linkedIn, expertise, teamType } = req.body; 

    if (!teamType || !["manager", "member"].includes(teamType)) {
      return res.status(400).json({ message: "teamType must be 'manager' or 'member'" });
    }

    if (teamType === "manager") {
      if (!name || !title || !email || !linkedIn || !expertise) {
        return res.status(400).json({ message: "All fields are required for manager" });
      }
      const existing = await OurteamModel.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (teamType === "member") {
      if (!name || !title) {
        return res.status(400).json({ message: "name and title are required for member" });
      }
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newMember = await OurteamModel.create({
      name,
      title,
      teamType, 
      image: req.file.path,
      ...(teamType === "manager" && { email, linkedIn, expertise }),
    });

    res.status(201).json({
      success: true,
      message: `${teamType === "manager" ? "Manager" : "Team member"} created successfully`,
      data: newMember,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllOurTeam = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.type) {
      if (!["manager", "member"].includes(req.query.type)) {
        return res.status(400).json({ message: "type must be 'manager' or 'member'" });
      }
      filter.teamType = req.query.type;
    }

    const members = await OurteamModel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOurTeam = async (req, res) => {
  try {
    const member = await OurteamModel.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOurTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (email) {
      const existing = await OurteamModel.findOne({ email });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (req.file) {
      req.body.image = req.file.path;
    }

    const updatedMember = await OurteamModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};