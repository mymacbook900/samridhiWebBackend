import express from "express";
import { createProduct,  getAllProducts,  getProductById,  updateProduct,  deleteProduct, } from "../controllers/product.controller.js";
import upload from "../middlewares/upload.middleware.js"

const router = express.Router();


router.post(
  "/createProduct",
  upload.fields([
    { name: "productImages", maxCount: 5 },
    { name: "productLabelPdf", maxCount: 1 },
    { name: "labReports", maxCount: 2 },

    { name: "insectImages", maxCount: 10 },
    { name: "fungisideImages", maxCount: 10 }, 
    { name: "weedImages", maxCount: 10 }, 
  ]),
  createProduct
);
router.get("/getAll", getAllProducts);
router.get("/getOne/:productId", getProductById);
router.put("/update/:productId",upload.fields([
    { name: "productImages", maxCount: 5 },
    { name: "productLabelPdf", maxCount: 1 },
    { name: "labReports", maxCount: 2 },

    { name: "insectImages", maxCount: 10 },
    { name: "fungisideImages", maxCount: 10 },
    { name: "weedImages", maxCount: 10 }, 
  ]), updateProduct);
router.delete("/delete/:productId", deleteProduct);

export default router;