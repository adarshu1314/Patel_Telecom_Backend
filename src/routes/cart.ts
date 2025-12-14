import express, { Request, Response } from 'express';
import { AddToCart,RemoveFromCart, updateQuantity, ViewCart, ClearCart} from '../controller/cart';

const router = express.Router();


// Cart route
router.post('/AddToCart', AddToCart);
router.post('/RemoveFromCart', RemoveFromCart);
router.post('/updateQuantity', updateQuantity);
router.get('/ViewCart', ViewCart);
router.post('/ClearCart', ClearCart);

export default router;