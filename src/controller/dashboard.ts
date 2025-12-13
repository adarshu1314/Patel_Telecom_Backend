import { Request, Response } from "express";
import prisma from '../utils/dbConnection';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        // Build base where clause for filtering
        const baseWhere: any = {};

        // Non-admin users can only see their own data
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            baseWhere.assignedUserId = userId;
        }

        // Get task statistics
        const [totalTasks, assignedTasks, inProgressTasks, completedTasks, overdueTasks] = await Promise.all([
            prisma.task.count({ where: baseWhere }),
            prisma.task.count({ where: { ...baseWhere, status: 'ASSIGNED' } }),
            prisma.task.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
            prisma.task.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
            prisma.task.count({
                where: {
                    ...baseWhere,
                    status: { not: 'COMPLETED' },
                    dueDate: { lte: new Date() }
                }
            })
        ]);

        // Get user statistics
        const [totalUsers, activeUsers] = await Promise.all([
            prisma.user.count({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : { id: userId }
            }),
            prisma.user.count({
                where: {
                    ...(userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : { id: userId }),
                    tasks: {
                        some: {
                            status: { not: 'COMPLETED' }
                        }
                    }
                }
            })
        ]);

        // Get client statistics
        const [totalClients, activeClients] = await Promise.all([
            prisma.client.count({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : {}
            }),
            prisma.client.count({
                where: {
                    ...(userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : {}),
                    tasks: {
                        some: {
                            status: { not: 'COMPLETED' }
                        }
                    }
                }
            })
        ]);

        // Get department statistics
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Get top 5 clients by task count
        const topClients = await prisma.task.groupBy({
            by: ['clientId'],
            where: {
                ...baseWhere,
                clientId: { not: null }
            },
            _count: { clientId: true },
            orderBy: { _count: { clientId: 'desc' } },
            take: 5
        });

        // Get client details for top clients
        const topClientIds = topClients.map(client => client.clientId).filter((id): id is number => id !== null);
        const clientDetails = await prisma.client.findMany({
            where: { id: { in: topClientIds } },
            select: { id: true, name: true }
        });

        // Map top clients with their names
        const topClientsWithNames = topClients.map(client => {
            const clientDetail = clientDetails.find(c => c.id === client.clientId);
            return {
                clientId: client.clientId,
                clientName: clientDetail?.name || 'Unknown Client',
                count: client._count.clientId
            };
        });

        // Get recent tasks (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentTasks = await prisma.task.findMany({
            where: {
                ...baseWhere,
                createdAt: { gte: sevenDaysAgo }
            },
            include: {
                assignedUser: {
                    select: { id: true, name: true, email: true }
                },
                client: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Get tasks by status for chart data
        const tasksByStatus = await prisma.task.groupBy({
            by: ['status'],
            where: baseWhere,
            _count: { status: true }
        });

        // Get tasks by priority for chart data
        const tasksByPriority = await prisma.task.groupBy({
            by: ['priority'],
            where: baseWhere,
            _count: { priority: true }
        });

        // Get tasks by user for assignment distribution
        const tasksByUser = await prisma.task.findMany({
            where: baseWhere,
            select: {
                assignedUserId: true,
                assignedUser: {
                    select: { id: true, name: true }
                }
            }
        });

        // Group tasks by user
        const userTaskCounts: Record<string, { userId: number | null; userName: string; count: number }> = {};
        tasksByUser.forEach(task => {
            const userId = task.assignedUserId;
            const userName = task.assignedUser?.name || 'Unassigned';
            const key = userId !== null ? userId.toString() : 'null';
            if (!userTaskCounts[key]) {
                userTaskCounts[key] = { userId, userName, count: 0 };
            }
            userTaskCounts[key].count++;
        });

        // Get tasks by client for client distribution
        const tasksByClient = await prisma.task.findMany({
            where: baseWhere,
            select: {
                clientId: true,
                client: {
                    select: { id: true, name: true }
                }
            }
        });

        // Group tasks by client
        const clientTaskCounts: Record<string, { clientId: number | null; clientName: string; count: number }> = {};
        tasksByClient.forEach(task => {
            const clientId = task.clientId;
            const clientName = task.client?.name || 'No Client';
            const key = clientId !== null ? clientId.toString() : 'null';
            if (!clientTaskCounts[key]) {
                clientTaskCounts[key] = { clientId, clientName, count: 0 };
            }
            clientTaskCounts[key].count++;
        });

        // Get department-wise employee count
        const departmentEmployeeCounts = departments.map(dept => ({
            departmentId: dept.id,
            departmentName: dept.name,
            employeeCount: dept._count.users
        }));

        return res.json({
            success: true,
            data: {
                stats: {
                    totalTasks,
                    assignedTasks,
                    inProgressTasks,
                    completedTasks,
                    overdueTasks,
                    totalUsers,
                    activeUsers,
                    totalClients,
                    activeClients,
                    totalDepartments: departments.length,
                    totalEmployees: totalUsers
                },
                recentTasks,
                charts: {
                    tasksByStatus: tasksByStatus.map(item => ({
                        status: item.status,
                        count: item._count.status
                    })),
                    tasksByPriority: tasksByPriority.map(item => ({
                        priority: item.priority,
                        count: item._count.priority
                    })),
                    tasksByUser: Object.values(userTaskCounts).map(item => ({
                        userId: item.userId,
                        userName: item.userName,
                        count: item.count
                    })),
                    tasksByClient: Object.values(clientTaskCounts).map(item => ({
                        clientId: item.clientId,
                        clientName: item.clientName,
                        count: item.count
                    })),
                    topClients: topClientsWithNames,
                    departmentEmployeeCounts
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
        });
    }
}

export const getFilteredTasks = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status,
            priority,
            assignedUserId,
            clientId,
            search,
            startDate,
            endDate
        } = req.body;

        const pageNum = parseInt(page);
        const pageSz = parseInt(pageSize);
        const sortField = sortBy;
        const order = sortOrder.toUpperCase() === 'ASC' ? 'asc' : 'desc';
        const userRole = req.user?.role;
        const userId = req.user?.userId;

        if (!pageNum || pageNum < 1) {
            return res.status(400).json({ success: false, error: 'Invalid page number' });
        }
        if (!pageSz || pageSz < 1 || pageSz > 100) {
            return res.status(400).json({ success: false, error: 'Invalid page size (1-100)' });
        }

        // Build where clause for filtering
        const where: any = {};

        // Non-admin users can only see their own tasks
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            where.assignedUserId = userId;
        }

        // Apply filters
        if (status) {
            if (Array.isArray(status)) {
                where.status = { in: status };
            } else {
                where.status = status;
            }
        }
        if (priority) {
            if (Array.isArray(priority)) {
                where.priority = { in: priority };
            } else {
                where.priority = priority;
            }
        }
        if (assignedUserId) {
            if (Array.isArray(assignedUserId)) {
                where.assignedUserId = { in: assignedUserId.map(id => parseInt(id)) };
            } else {
                where.assignedUserId = parseInt(assignedUserId);
            }
        }
        if (clientId) {
            if (Array.isArray(clientId)) {
                where.clientId = { in: clientId.map(id => parseInt(id)) };
            } else {
                where.clientId = parseInt(clientId);
            }
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { assignedUser: { name: { contains: search, mode: 'insensitive' } } },
                { client: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }
        if (startDate) {
            where.createdAt = { gte: new Date(startDate) };
        }
        if (endDate) {
            where.createdAt = {
                ...where.createdAt,
                lte: new Date(endDate)
            };
        }

        // Get total count for pagination
        const total = await prisma.task.count({ where });

        // Get tasks with sorting and pagination
        const tasks = await prisma.task.findMany({
            skip: (pageNum - 1) * pageSz,
            take: pageSz,
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            where,
            orderBy: {
                [sortField]: order
            }
        });

        return res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page: pageNum,
                    pageSize: pageSz,
                    total,
                    totalPages: Math.ceil(total / pageSz)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching filtered tasks:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
        });
    }
}

export const getDashboardFilters = async (req: Request, res: Response) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.userId;

        // Build base where clause for filtering
        const baseWhere: any = {};

        // Non-admin users can only see their own data
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            baseWhere.assignedUserId = userId;
        }

        // Get unique values for filters
        const [users, clients, statuses, priorities] = await Promise.all([
            prisma.user.findMany({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : { id: userId },
                select: { id: true, name: true, email: true }
            }),
            prisma.client.findMany({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : {},
                select: { id: true, name: true }
            }),
            prisma.task.findMany({
                where: baseWhere,
                select: { status: true }
            }),
            prisma.task.findMany({
                where: baseWhere,
                select: { priority: true }
            })
        ]);

        // Get unique statuses and priorities
        const uniqueStatuses = Array.from(new Set(statuses.map(s => s.status)));
        const uniquePriorities = Array.from(new Set(priorities.map(p => p.priority)));

        return res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email
                })),
                clients: clients.map(client => ({
                    id: client.id,
                    name: client.name
                })),
                statuses: uniqueStatuses,
                priorities: uniquePriorities
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard filters:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
        });
    }
}