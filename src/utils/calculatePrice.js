import Product from "../models/products.model.js";

export const calculateTotalPrice = async (items) => {
  let total = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    total += product.pricing.displayPriceWithGst * item.quantity;
  }

  return total;
};
