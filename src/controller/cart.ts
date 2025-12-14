
import { Request, Response } from "express";
import prisma from "../utils/dbConnection";
export const AddToCart = async (req: Request, res: Response) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user?.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const product = await prisma.product.findUnique({
        where: { product_id: productId },
      });
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      const cartItem = await prisma.cartItem.create({
        data: {
          productId: productId,
          userId: userId,
          quantity,
        },
      });
  
      return res.status(201).json({ message: "Product added to cart", cartItem });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

export const RemoveFromCart = async (req: Request, res: Response) => {
    try {
      const { cartItemId } = req.body;
      const userId = req.user?.userId;  
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const cartItem = await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
  
      return res.status(200).json({ message: "Product removed from cart", cartItem });
    } catch (error) {
      console.error("Error removing product from cart:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
export const ViewCart = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: userId },
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              product_id: true,
              name: true,
              description: true,
              image_url: true,
            },
          },    
          }
      });
  
      return res.status(200).json({ message: "Cart items", cartItems });
    } catch (error) {
      console.error("Error retrieving cart items:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  export const updateQuantity = async (req: Request, res: Response) => {
    try {
      const { cartItemId, quantity } = req.body;
      const userId = req.user?.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const cartItem = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
  
      return res.status(200).json({ message: "Cart item quantity updated", cartItem });
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }; 
export const ClearCart = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const cartItems = await prisma.cartItem.deleteMany({
        where: { userId: userId },
      });
  
      return res.status(200).json({ message: "Cart cleared", cartItems });
    } catch (error) {
      console.error("Error clearing cart:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };