import { PrismaClient } from '../prisma-client';
import { admins, customers, products } from './data';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Clear existing data
    // Delete in reverse order of dependencies to avoid foreign key constraint violations
    console.log('🧹 Clearing existing data...');
    try {
        await prisma.cartItem.deleteMany();
        await prisma.inventory_inflow_outflow.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.order_details.deleteMany();
        await prisma.order.deleteMany();
        await prisma.quotation_details.deleteMany();
        await prisma.quotation.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.credit.deleteMany();

        // Main entities
        await prisma.product.deleteMany();
        await prisma.customer.deleteMany();
        await prisma.admin.deleteMany();
    } catch (error) {
        console.warn('⚠️  Warning during cleanup (might be empty tables):', error);
    }

    // 2. Seed Admins
    console.log('🔒 Seeding Admins...');
    for (const admin of admins) {
        await prisma.admin.create({
            data: admin
        });
    }

    // 3. Seed Products
    console.log('📱 Seeding Products...');
    const createdProducts = [];
    for (const product of products) {
        const p = await prisma.product.create({
            data: product
        });
        createdProducts.push(p);
    }

    // 4. Seed Customers
    console.log('👥 Seeding Customers...');
    const createdCustomers = [];
    for (const customer of customers) {
        const c = await prisma.customer.create({
            data: customer
        });
        createdCustomers.push(c);

        // Initialize credit record for customer (optional but good for consistency)
        await prisma.credit.create({
            data: {
                customer_id: c.customer_id,
                total_credit_limit: Math.floor(Number(c.credit_limit)),
                available_credit_limit: Math.floor(Number(c.remaining_credit)),
                credit_amount: 0,
                status: 'receivable'
            }
        });
    }

    // 5. Seed Cart Items
    console.log('🛒 Seeding Cart Items...');
    // Add some random items to first customer's cart
    if (createdCustomers.length > 0 && createdProducts.length > 0) {
        const customer = createdCustomers[0];
        const product1 = createdProducts[0];
        const product2 = createdProducts[1];

        await prisma.cartItem.create({
            data: {
                userId: customer.customer_id,
                productId: product1.product_id,
                quantity: 1
            }
        });

        await prisma.cartItem.create({
            data: {
                userId: customer.customer_id,
                productId: product2.product_id,
                quantity: 2
            }
        });
    }

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${admins.length} Admins`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - ${customers.length} Customers`);
    console.log(`   - 2 Cart Items`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        //  process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });