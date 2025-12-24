import { PrismaClient } from '@prisma/client';
import { createProductCollection, indexProduct } from '../utils/typesenseActions';

const prisma = new PrismaClient();

const sync = async () => {
    try {
        await createProductCollection();

        const products = await prisma.product.findMany();
        console.log(`Found ${products.length} products to sync...`);

        for (const product of products) {
            await indexProduct(product);
        }

        console.log('Sync completed successfully.');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await prisma.$disconnect();
    }
};

sync();
