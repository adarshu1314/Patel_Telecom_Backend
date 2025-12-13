import { PrismaClient, TaskStatus } from '../prisma-client';
import { tasks } from './data';

const prisma = new PrismaClient();

async function main() {
    console.log('📋 Seeding tasks...');

    // Clear existing tasks
    console.log('🧹 Clearing existing tasks...');
    await prisma.task.deleteMany();

    // Get all existing users and clients
    const users = await prisma.user.findMany();
    const clients = await prisma.client.findMany();

    // Seed Tasks
    console.log('📋 Seeding tasks...');
    await Promise.all(
        tasks.map(task =>
            prisma.task.create({
                data: {
                    title: task.title,
                    description: task.description,
                    status: task.status as TaskStatus,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    ...(task.assignedUser && {
                        assignedUser: {
                            connect: {
                                id: users.find(u => u.email === task.assignedUser)?.id
                            }
                        }
                    }),
                    ...(task.client && {
                        client: {
                            connect: {
                                id: clients.find(c => c.name === task.client)?.id
                            }
                        }
                    })
                }
            })
        )
    );

    console.log('✅ Tasks seeded successfully!');
    console.log(`📊 Seeded ${tasks.length} tasks`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding tasks:', e);

    })
    .finally(async () => {
        await prisma.$disconnect();
    });