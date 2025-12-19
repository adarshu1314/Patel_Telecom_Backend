
import { Request, Response } from "express";
import prisma from "../utils/dbConnection";
import { order_status_enum, quotation_status_enum } from "../../prisma-client";

export const AddOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { quotationId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!quotationId) {
            return res.status(400).json({ message: "Quotation ID is required" });
        }

        // 1. Fetch Quotation and its details
        const quotation = await prisma.quotation.findUnique({
            where: {
                quotation_id: quotationId,
                customer_id: userId // Ensure it belongs to the user
            },
            include: {
                quotation_details: true
            }
        });

        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found or does not belong to user" });
        }

        if (!quotation.quotation_details || quotation.quotation_details.length === 0) {
            return res.status(400).json({ message: "Quotation has no items" });
        }

        if (quotation.status !== quotation_status_enum.approved) {
            return res.status(400).json({ message: "Quotation must be approved before creating an order" });
        }

        // 2. Create Order and Order Details in a transaction
        const result = await prisma.$transaction(async (prismaTx) => {
            // Create Order
            const newOrder = await prismaTx.order.create({
                data: {
                    customer_id: userId,
                    quotation_id: quotationId,
                    status: order_status_enum.pending,
                    total_price: quotation.total_amount,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });

            // Prepare Order Details
            const orderDetailsData = quotation.quotation_details.map(detail => ({
                order_id: newOrder.order_id,
                product_id: detail.product_id,
                quantity: detail.quantity,
                price: detail.price || 0 // Handle potential null price, though schema says Decimal?
            }));

            // Create Order Details
            await prismaTx.order_details.createMany({
                data: orderDetailsData
            });

            // Optional: Update Quotation status, e.g. to 'approved' or closed if needed.
            // Keeping it simple as per request, but good practice to mark it generally.
            // Not strictly required by prompt, so leaving as is.

            return newOrder;
        });

        return res.status(201).json({
            message: "Order created successfully",
            order: result
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const GetOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const orders = await prisma.order.findMany({
            where: {
                customer_id: userId
            },
            include: {
                order_details: {
                    include: {
                        product: true
                    }
                },
                quotation: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.status(200).json({
            message: "Orders retrieved successfully",
            orders: orders
        });

    } catch (error) {
        console.error("Error retrieving orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};