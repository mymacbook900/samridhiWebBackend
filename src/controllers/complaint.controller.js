import complaintModel from "../models/complaint.model.js";
import farmerModel from "../models/farmer.model.js";

export const createComplaint = async (req, res) => {
  try {
    const {  } = req.body;
 
    const farmer = await farmerModel.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const complaint = await complaintModel.create({
      title,
      description,
      farmerId,
      farmerName : farmer.farmerName,
      salesOfficerId: farmer.referenceId,
      status :"in_progress",
      priority
    });

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: complaint
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, priority } = req.body;

    const complaint = await complaintModel.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
 
    if (
      req.user.designation !== "admin" &&
      complaint.salesOfficerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (status) {
      if (!["in_progress", "resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      complaint.status = status;
    }

    if (priority) {
      if (!["high", "medium", "low"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
      }
      complaint.priority = priority;
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getComplaintsForSalesOfficer = async (req, res) => {
  try { 
    if (req.user.designation !== "Senior Sales Officer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaints = await complaintModel.find({
      salesOfficerId:  req.user.id
    })
      .populate("farmerId", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllComplaintsForAdmin = async (req, res) => {
  try {
    const complaints = await complaintModel.find()
      .populate("farmerId", "name")
      .populate("salesOfficerId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

