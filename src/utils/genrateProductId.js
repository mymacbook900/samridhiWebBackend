export const generateProductId = () => {
  const timePart = Date.now().toString(36);        // time-based
  const randomPart = Math.random().toString(36).substring(2, 8); // randomness
  return `PRODUCT-${timePart}-${randomPart}`.toUpperCase();
};
