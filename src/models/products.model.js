import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },

        productCategory: String,
        productSubCategory: String,

        productImages: [{ type: String, required: true }],

        productName: { type: String, required: true, trim: true },
        hindiName: { type: String, required: true, trim: true },
        technicalName: { type: String, required: true },

        productDescription: String,
        hsnSacCode: String,
        batchNumber: String,

        productLabelPdf: { type: String, required: true },

        sellingCertificates: [String],
        labReports: [String],
        socialMediaVideoLinks: [String],
        crops: [String],

        skuPacking: [
            {
                sku: String,
                unit: String,
                packingSize: String,
            },
        ],

        insect: [
            {
                name: String,
                image: String,
                desc: String,
            },
        ],

        fungiside: [
            {
                name: String,
                image: String,
                desc: String,
            },
        ],
        weed: [
            {
                name: String,
                image: String,
                desc: String,
            }
        ],

        pricing: {
            mrpWithGst: Number,
            amountWithoutGst: Number,
            taxPercent: Number,
            taxAmount: Number,
            displayPriceWithGst: Number,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
