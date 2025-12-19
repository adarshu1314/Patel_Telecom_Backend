import { PrismaClient } from '../prisma-client';
import { products } from './data';

const prisma = new PrismaClient();

async function main() {
    console.log('📦 Seeding products...');

    // Clear existing products
    console.log('🧹 Clearing existing products...');
    await prisma.product.deleteMany();

    // Seed products
    console.log('📦 Inserting product records...');
    await Promise.all(
        products.map(product =>
            prisma.product.create({
                data: {
                    name: product.name,
                    min_stock_limit: product.min_stock_limit ?? 10,
                    description: product.description,
                    specifications: product.specifications,
                    image_url: product.image_url,
                    price: product.price,
                    updated_at: new Date()
                }
            })
        )
    );

    console.log('✅ Products seeded successfully!');
    console.log(`📊 Seeded ${products.length} products`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding products:', e);
        //process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
