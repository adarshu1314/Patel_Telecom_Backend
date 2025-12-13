import { PrismaClient, Role, TaskStatus, AttendanceStatus } from '../prisma-client';
import { departments, users, clients, tasks, attendance } from './data';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data (optional - useful for development)
    console.log('🧹 Clearing existing data...');
    await prisma.attendance.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.client.deleteMany();
    await prisma.department.deleteMany();

    // Seed Departments
    console.log('🏢 Seeding departments...');
    const createdDepartments = await Promise.all(
        departments.map(dept =>
            prisma.department.create({ data: dept })
        )
    );

    // Seed Users
    console.log('👥 Seeding users...');
    const createdUsers = await Promise.all(
        users.map(user =>
            prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    role: user.role as Role,
                    ...(user.department && {
                        department: {
                            connect: {
                                id: createdDepartments.find(d => d.name === user.department)?.id
                            }
                        }
                    })
                }
            })
        )
    );

    // Seed Clients
    console.log('🏢 Seeding clients...');
    const createdClients = await Promise.all(
        clients.map(client =>
            prisma.client.create({ data: client })
        )
    );

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
                                id: createdUsers.find(u => u.email === task.assignedUser)?.id
                            }
                        }
                    }),
                    ...(task.client && {
                        client: {
                            connect: {
                                id: createdClients.find(c => c.name === task.client)?.id
                            }
                        }
                    })
                }
            })
        )
    );

    // Seed Attendance
    console.log('📅 Seeding attendance...');
    await Promise.all(
        attendance.map(record =>
            prisma.attendance.create({
                data: {
                    date: record.date,
                    status: record.status as AttendanceStatus,
                    location: record.location,
                    remarks: record.remarks,
                    user: {
                        connect: {
                            id: createdUsers.find(u => u.email === record.user)?.id
                        }
                    }
                }
            })
        )
    );

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Seeded data summary:`);
    console.log(`   - ${createdDepartments.length} departments`);
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdClients.length} clients`);
    console.log(`   - ${tasks.length} tasks`);
    console.log(`   - ${attendance.length} attendance records`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });