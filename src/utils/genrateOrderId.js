export const generateOrderId = () => {
  return "ORD-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
};
