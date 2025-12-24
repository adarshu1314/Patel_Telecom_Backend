import { Request, Response } from "express";
import { searchProducts } from "../utils/typesenseActions";
import prisma from "../utils/dbConnection";

export const SearchProducts = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) {
            const products = await prisma.product.findMany({ take: 20 });
            return res.json({ products });
        }

        const searchResults = await searchProducts(q as string);
        // TypeSense returns hits, we need to extract the documents
        const products = (searchResults as any).hits?.map((hit: any) => ({
            ...hit.document,
            product_id: parseInt(hit.document.product_id),
            price: hit.document.price
        })) || [];

        res.json({ products });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const GetAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json({ products });
    } catch (error) {
        console.error("Get all products error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const GetProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { product_id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error("Get product by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
