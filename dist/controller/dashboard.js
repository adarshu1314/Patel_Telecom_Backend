"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardFilters = exports.getFilteredTasks = exports.getDashboardStats = void 0;
const dbConnection_1 = __importDefault(require("../utils/dbConnection"));
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        // Build base where clause for filtering
        const baseWhere = {};
        // Non-admin users can only see their own data
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            baseWhere.assignedUserId = userId;
        }
        // Get task statistics
        const [totalTasks, assignedTasks, inProgressTasks, completedTasks, overdueTasks] = await Promise.all([
            dbConnection_1.default.task.count({ where: baseWhere }),
            dbConnection_1.default.task.count({ where: { ...baseWhere, status: 'ASSIGNED' } }),
            dbConnection_1.default.task.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
            dbConnection_1.default.task.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
            dbConnection_1.default.task.count({
                where: {
                    ...baseWhere,
                    status: { not: 'COMPLETED' },
                    dueDate: { lte: new Date() }
                }
            })
        ]);
        // Get user statistics
        const [totalUsers, activeUsers] = await Promise.all([
            dbConnection_1.default.user.count({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : { id: userId }
            }),
            dbConnection_1.default.user.count({
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
            dbConnection_1.default.client.count({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : {}
            }),
            dbConnection_1.default.client.count({
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
        const departments = await dbConnection_1.default.department.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        // Get top 5 clients by task count
        const topClients = await dbConnection_1.default.task.groupBy({
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
        const topClientIds = topClients.map(client => client.clientId).filter((id) => id !== null);
        const clientDetails = await dbConnection_1.default.client.findMany({
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
        const recentTasks = await dbConnection_1.default.task.findMany({
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
        const tasksByStatus = await dbConnection_1.default.task.groupBy({
            by: ['status'],
            where: baseWhere,
            _count: { status: true }
        });
        // Get tasks by priority for chart data
        const tasksByPriority = await dbConnection_1.default.task.groupBy({
            by: ['priority'],
            where: baseWhere,
            _count: { priority: true }
        });
        // Get tasks by user for assignment distribution
        const tasksByUser = await dbConnection_1.default.task.findMany({
            where: baseWhere,
            select: {
                assignedUserId: true,
                assignedUser: {
                    select: { id: true, name: true }
                }
            }
        });
        // Group tasks by user
        const userTaskCounts = {};
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
        const tasksByClient = await dbConnection_1.default.task.findMany({
            where: baseWhere,
            select: {
                clientId: true,
                client: {
                    select: { id: true, name: true }
                }
            }
        });
        // Group tasks by client
        const clientTaskCounts = {};
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
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getFilteredTasks = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc', status, priority, assignedUserId, clientId, search, startDate, endDate } = req.body;
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
        const where = {};
        // Non-admin users can only see their own tasks
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            where.assignedUserId = userId;
        }
        // Apply filters
        if (status) {
            if (Array.isArray(status)) {
                where.status = { in: status };
            }
            else {
                where.status = status;
            }
        }
        if (priority) {
            if (Array.isArray(priority)) {
                where.priority = { in: priority };
            }
            else {
                where.priority = priority;
            }
        }
        if (assignedUserId) {
            if (Array.isArray(assignedUserId)) {
                where.assignedUserId = { in: assignedUserId.map(id => parseInt(id)) };
            }
            else {
                where.assignedUserId = parseInt(assignedUserId);
            }
        }
        if (clientId) {
            if (Array.isArray(clientId)) {
                where.clientId = { in: clientId.map(id => parseInt(id)) };
            }
            else {
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
        const total = await dbConnection_1.default.task.count({ where });
        // Get tasks with sorting and pagination
        const tasks = await dbConnection_1.default.task.findMany({
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
    }
    catch (error) {
        console.error('Error fetching filtered tasks:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};
exports.getFilteredTasks = getFilteredTasks;
const getDashboardFilters = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.userId;
        // Build base where clause for filtering
        const baseWhere = {};
        // Non-admin users can only see their own data
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            baseWhere.assignedUserId = userId;
        }
        // Get unique values for filters
        const [users, clients, statuses, priorities] = await Promise.all([
            dbConnection_1.default.user.findMany({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : { id: userId },
                select: { id: true, name: true, email: true }
            }),
            dbConnection_1.default.client.findMany({
                where: userRole === "ADMIN" || userRole === "SUPERADMIN" ? {} : {},
                select: { id: true, name: true }
            }),
            dbConnection_1.default.task.findMany({
                where: baseWhere,
                select: { status: true }
            }),
            dbConnection_1.default.task.findMany({
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
    }
    catch (error) {
        console.error('Error fetching dashboard filters:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};
exports.getDashboardFilters = getDashboardFilters;
//# sourceMappingURL=dashboard.js.map