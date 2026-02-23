import Product from "../models/products.model.js";
import { generateProductId } from "../utils/genrateProductId.js";
import { getPublicId } from "../utils/getPublicId.js";
import cloudinary from "../config/cloudinary.js";


export const createProduct = async (req, res) => {
  try {
    const parseField = (field) => {
      if (!field) return [];
      if (typeof field === "string") return JSON.parse(field);
      return field;
    };

    const insectData = parseField(req.body.insect);
    const fungisideData = parseField(req.body.fungiside);
    const weedData = parseField(req.body.weed);

    // Map insect images
    if (req.files?.insectImages) {
      req.files.insectImages.forEach((file, index) => {
        if (insectData[index]) {
          insectData[index].image = file.path;
        }
      });
    }

    if (req.files?.fungisideImages) {
      req.files.fungisideImages.forEach((file, index) => {
        if (fungisideData[index]) {
          fungisideData[index].image = file.path;
        }
      });
    }

    if (req.files?.weedImages) {
      req.files.weedImages.forEach((file, index) => {
        if (weedData[index]) {
          weedData[index].image = file.path;
        }
      });
    }

    // 🔥 SAFE ACCESS HERE
    const product = await Product.create({
      ...req.body,
      productId: generateProductId(),

      pricing: parseField(req.body.pricing),
      crops: parseField(req.body.crops),
      skuPacking: parseField(req.body.skuPacking),
      sellingCertificates: parseField(req.body.sellingCertificates),
      socialMediaVideoLinks: parseField(req.body.socialMediaVideoLinks),

      insect: insectData,
      fungiside: fungisideData,
      weed: weedData,

      productImages: req.files?.productImages?.map(f => f.path) || [],
      productLabelPdf: req.files?.productLabelPdf?.[0]?.path || "",
      labReports: req.files?.labReports?.map(f => f.path) || [],
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    const query = {
      isActive: true,
      ...(category && { productCategory: category }),
      ...(search && {
        productName: { $regex: search, $options: "i" },
      }),
    };

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  let {productId} = req.params;
  try {
    const product = await Product.findOne(productId);

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const updateData = { ...req.body };

    // Handle file uploads if provided
    if (req.files?.productImages?.length) {
      updateData.productImages = req.files.productImages.map(f => f.path);
    }
    if (req.files?.productLabelPdf?.length) {
      updateData.productLabelPdf = req.files.productLabelPdf[0].path;
    }
    if (req.files?.labReports?.length) {
      updateData.labReports = req.files.labReports.map(f => f.path);
    }

    const product = await Product.findOneAndUpdate(
      { productId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product updated successfully", data: product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndDelete( productId );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔥 Delete product images
    if (product.productImages?.length) {
      for (const img of product.productImages) {
        const publicId = getPublicId(img);
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 🔥 Delete label PDF
    if (product.productLabelPdf) {
      const pdfPublicId = getPublicId(product.productLabelPdf);
      await cloudinary.uploader.destroy(pdfPublicId, { resource_type: "raw" });
    }

    // 🔥 Delete lab reports
    if (product.labReports?.length) {
      for (const report of product.labReports) {
        const publicId = getPublicId(report);
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      }
    }

    res.status(200).json({
      success: true,
      message: "Product and associated files deleted successfully",
    });

  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};