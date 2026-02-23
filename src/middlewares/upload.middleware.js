import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "coupon-management", // project folder
    allowed_formats: ["jpg","pdf", "png", "jpeg", "webp","docx"],
    // transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

export default upload;

// import jwt from "jsonwebtoken";
// import SalesOfficer from "../models/salesOfficer.model.js";

// export const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Not authorized"
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = await SalesOfficer.findById(decoded.id);

//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: "Invalid token"
//     });
//   }
// };
