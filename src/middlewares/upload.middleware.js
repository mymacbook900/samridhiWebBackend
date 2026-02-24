import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "coupon-management", 
    allowed_formats: ["jpg","pdf", "png", "jpeg", "webp","docx"],
  },
});

const upload = multer({ storage });

export default upload;
