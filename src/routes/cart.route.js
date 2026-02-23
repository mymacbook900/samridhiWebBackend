import express from "express";
import {
  addToCart,
  getCartByFarmer,
  increaseQuantity,
  decreaseQuantity,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add", addToCart);                      
router.get("/:farmerId", getCartByFarmer);          
router.put("/increase", increaseQuantity);           
router.put("/decrease", decreaseQuantity);           
router.put("/update-quantity", updateCartQuantity);  
router.delete("/remove-item", removeCartItem);       
router.delete("/clear/:farmerId", clearCart);        

export default router;