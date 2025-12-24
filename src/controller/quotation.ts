
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

        // 4. Send Notification to Admin
        console.log(`🔔 NOTIFICATION: New Quotation ${result.quotation_id} created by Customer ${userId}. Amount: ₹${totalAmount}`);

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

export const GetQuotation = async (req: Request, res: Response) => {

    try {

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const quotation = await prisma.quotation.findMany({
            where: {
                customer_id: userId
            },
            include: {
                quotation_details: true
            }
        })

        return res.status(200).json({
            message: "Quotation fetched successfully",
            quotation
        })

    } catch (error) {
        console.error("Error fetching quotation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const GetQuotationById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const quotation = await prisma.quotation.findFirst({
            where: {
                quotation_id: parseInt(id),
                customer_id: userId
            },
            include: {
                quotation_details: {
                    include: {
                        product: true
                    }
                },
                customer: true
            }
        });

        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        res.json(quotation);
    } catch (error) {
        console.error("Get quotation by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const GetQuotationAdmin = async (req: Request, res: Response) => {

    try {
        const customer_id = Number(req.headers.customer_id);
        console.log("customer_id :", customer_id);
        let quotation: any;
        if (customer_id) {
            quotation = await GetCustomerQuotationById(customer_id)
        }
        else {
            quotation = await GetAllQuotation();
        }
        console.log("quotation :", quotation);
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }
        else {
            return res.status(200).json({
                message: "Quotation fetched successfully",
                quotation
            })
        }

    } catch (error) {
        console.error("Error fetching quotation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const UpdateQuotationAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, items, credit_period, payment_mode } = req.body;

        // items is expected to be an array of { quotation_item_id, price }

        const result = await prisma.$transaction(async (prismaTx) => {
            // 1. Update individual item prices
            if (items && Array.isArray(items)) {
                for (const item of items) {
                    await prismaTx.quotation_details.update({
                        where: { quotation_item_id: item.quotation_item_id },
                        data: { price: item.price }
                    });
                }
            }

            // 2. Recalculate total amount from items
            const allItems = await prismaTx.quotation_details.findMany({
                where: { quotation_id: parseInt(id) }
            });

            const newTotal = allItems.reduce((acc, item) => {
                return acc + (Number(item.price || 0) * item.quantity);
            }, 0);

            // 3. Update main quotation
            const updatedQuotation = await prismaTx.quotation.update({
                where: { quotation_id: parseInt(id) },
                data: {
                    status: status || undefined,
                    total_amount: newTotal,
                    credit_period: credit_period || undefined,
                    payment_mode: payment_mode || undefined,
                    updated_at: new Date()
                }
            });

            return updatedQuotation;
        });

        res.json({
            success: true,
            message: "Quotation updated successfully",
            quotation: result
        });

    } catch (error) {
        console.error("Update quotation admin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

async function GetAllQuotation() {

    try {
        const quotation = await prisma.quotation.findMany({
            select: {
                quotation_id: true,
                customer_id: true,
                admin_id: true,
                status: true,
                total_amount: true,
                credit_period: true,
                payment_mode: true,
                created_at: true,
                updated_at: true,
                quotation_details: {
                    select: {
                        product_id: true,
                        quantity: true,
                        price: true,
                        quotation_id: true,
                        product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                                image_url: true,
                                description: true,
                            }
                        }
                    }
                }
            }
        });
        return quotation;

    } catch (error) {
        console.error("Error fetching quotation:", error);
        return error
    }
}

async function GetCustomerQuotationById(customerid: any) {
    try {
        const quotation = await prisma.quotation.findMany({
            where: {
                customer_id: customerid,
            },
            select: {
                quotation_id: true,
                customer_id: true,
                admin_id: true,
                status: true,
                total_amount: true,
                credit_period: true,
                payment_mode: true,
                created_at: true,
                updated_at: true,
                quotation_details: {
                    select: {
                        product_id: true,
                        quantity: true,
                        price: true,
                        quotation_id: true,
                        product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                                image_url: true,
                                description: true,
                            }
                        }
                    }
                }
            }
        });
        return quotation;
    } catch (error) {
        console.error("Error fetching quotation:", error);
        return error;
    }
}
