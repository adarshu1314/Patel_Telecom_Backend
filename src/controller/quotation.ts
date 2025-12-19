
import { Request, Response } from "express";
import prisma from "../utils/dbConnection";

export const CreateQuotation = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 1. Fetch Cart Items with Product Details
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: userId },
            include: {
                product: true
            }
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty. Cannot create quotation." });
        }

        // 2. Calculate Total Amount
        let totalAmount = 0;
        const quotationDetailsData = cartItems.map(item => {
            const price = Number(item.product.price);
            const quantity = item.quantity;
            const itemTotal = price * quantity;
            totalAmount += itemTotal;

            return {
                product_id: item.productId,
                quantity: quantity,
                price: item.product.price // Store the unit price at the time of quotation
            };
        });

        // 3. Create Quotation and Details
        // We use a transaction to ensure both are created or neither
        const result = await prisma.$transaction(async (prismaTx) => {
            // Create the main quotation record
            const quotation = await prismaTx.quotation.create({
                data: {
                    customer_id: userId,
                    status: 'draft',
                    total_amount: totalAmount,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });

            // Create details for each item
            // Note: createMany is supported in recent Prisma versions for most DBs
            const detailsDataWithId = quotationDetailsData.map(detail => ({
                ...detail,
                quotation_id: quotation.quotation_id
            }));

            await prismaTx.quotation_details.createMany({
                data: detailsDataWithId
            });

            return quotation;
        });

        return res.status(201).json({
            message: "Quotation created successfully",
            quotationId: result.quotation_id,
            quotation: result
        });

    } catch (error) {
        console.error("Error creating quotation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
