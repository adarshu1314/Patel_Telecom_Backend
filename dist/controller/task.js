"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.getActiveTasks = exports.getOverdueTasks = exports.getTaskCounts = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const dbConnection_1 = __importDefault(require("../utils/dbConnection"));
const getTasks = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc', status, priority, assignedUserId, clientId, search } = req.body;
        const pageNum = parseInt(page);
        const pageSz = parseInt(pageSize);
        const sortField = sortBy;
        const order = sortOrder.toUpperCase() === 'ASC' ? 'asc' : 'desc';
        const id = req.user?.userId;
        if (!pageNum || pageNum < 1) {
            return res.status(400).json({ error: 'Invalid page number' });
        }
        if (!pageSz || pageSz < 1 || pageSz > 100) {
            return res.status(400).json({ error: 'Invalid page size (1-100)' });
        }
        // Build where clause for filtering
        const where = {};
        // Non-admin users can only see their own tasks
        if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
            where.assignedUserId = id;
        }
        // Apply filters with support for multiple values
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
            tasks,
            pagination: {
                page: pageNum,
                pageSize: pageSz,
                total,
                totalPages: Math.ceil(total / pageSz)
            }
        });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    const transaction = await dbConnection_1.default.$transaction(async (tx) => {
        try {
            // 1. Destructure and extract the expected data from the request body
            const { title, description, status, priority, assignedUserId, clientId, dueDate, } = req.body;
            // 2. Basic Validation: Ensure required fields are present
            if (!title || !assignedUserId || !clientId || !status || !priority) {
                return res.status(400).json({
                    error: 'Missing required fields: title, assignedUserId, clientId, status, and priority are required.',
                });
            }
            // 3. Create the task first
            const newTask = await tx.task.create({
                data: {
                    title,
                    description: description || null,
                    status,
                    priority,
                    assignedUserId,
                    clientId,
                    dueDate: dueDate ? new Date(dueDate) : null,
                },
            });
            // 4. Handle file uploads if they exist
            if (req.body.uploadRecords && req.body.uploadRecords.length > 0) {
                await tx.upload.createMany({
                    data: req.body.uploadRecords.map((upload) => ({
                        ...upload,
                        ticketId: newTask.id,
                    }))
                });
            }
            return newTask;
        }
        catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    });
    // 5. Respond with a 201 "Created" status and the newly created task object
    return res.status(201).json(transaction);
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const { id, title, description, status, priority, assignedUserId, clientId, comments, dueDate, } = req.body;
        if (!id || !title || !status || !priority || !assignedUserId || !clientId) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const user = await dbConnection_1.default.user.findUnique({
            where: { id: assignedUserId },
        });
        const client = await dbConnection_1.default.client.findUnique({
            where: { id: clientId },
        });
        if (client == null) {
            return res.status(400).json({ error: 'Client not found' });
        }
        if (user == null) {
            return res.status(400).json({ error: 'User not found' });
        }
        const updatedTask = await dbConnection_1.default.task.update({
            where: { id: Number(id) },
            data: {
                title,
                description: description || null, // Handle optional description
                status,
                priority,
                assignedUserId: assignedUserId ? Number(assignedUserId) : null,
                clientId: clientId ? Number(clientId) : null,
                comments: comments || [],
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });
        res.status(201).json(updatedTask);
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(400).json({ error: 'Internal Server Error' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const deletedTask = await dbConnection_1.default.task.delete({
            where: { id: Number(id) },
        });
        res.status(201).json(deletedTask);
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteTask = deleteTask;
const getTaskCounts = async (req, res) => {
    try {
        const id = req.user?.userId;
        // Build where clause for filtering
        const where = {};
        // Non-admin users can only see their own tasks
        if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
            where.assignedUserId = id;
        }
        // Get counts for each status
        const [assignedCount, inProgressCount, completedCount, overdueCount] = await Promise.all([
            dbConnection_1.default.task.count({
                where: {
                    ...where,
                    status: 'ASSIGNED'
                }
            }),
            dbConnection_1.default.task.count({
                where: {
                    ...where,
                    status: 'IN_PROGRESS'
                }
            }),
            dbConnection_1.default.task.count({
                where: {
                    ...where,
                    status: 'COMPLETED'
                }
            }),
            dbConnection_1.default.task.count({
                where: {
                    ...where,
                    status: { not: 'COMPLETED' },
                    dueDate: {
                        lte: new Date() // Tasks that are due or overdue
                    }
                }
            })
        ]);
        return res.json({
            assigned: assignedCount,
            inProgress: inProgressCount,
            completed: completedCount,
            overdue: overdueCount
        });
    }
    catch (error) {
        console.error('Error fetching task counts:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTaskCounts = getTaskCounts;
const getOverdueTasks = async (req, res) => {
    try {
        const id = req.user?.userId;
        // Build where clause for filtering
        const where = {
            status: { not: 'COMPLETED' },
            dueDate: {
                lte: new Date() // Tasks that are due or overdue
            }
        };
        // Non-admin users can only see their own tasks
        if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
            where.assignedUserId = id;
        }
        // Get overdue tasks with sorting: overdue first, then by status
        const tasks = await dbConnection_1.default.task.findMany({
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
            orderBy: [
                { dueDate: 'asc' }, // Sort by due date (earliest first)
                { status: 'asc' } // Then by status (ASSIGNED, IN_PROGRESS)
            ]
        });
        return res.json(tasks);
    }
    catch (error) {
        console.error('Error fetching overdue tasks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getOverdueTasks = getOverdueTasks;
const getActiveTasks = async (req, res) => {
    try {
        const id = req.user?.userId;
        // Build where clause for filtering
        const where = {
            status: { not: 'COMPLETED' }
        };
        // Non-admin users can only see their own tasks
        if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
            where.assignedUserId = id;
        }
        // Get active tasks with sorting: overdue first, then by status
        const tasks = await dbConnection_1.default.task.findMany({
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
            orderBy: [
                { dueDate: 'asc' }, // Sort by due date (earliest first)
                { status: 'asc' } // Then by status (ASSIGNED, IN_PROGRESS)
            ]
        });
        return res.json(tasks);
    }
    catch (error) {
        console.error('Error fetching active tasks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getActiveTasks = getActiveTasks;
const updateTaskStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: 'Task ID and status are required' });
        }
        const validStatuses = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const updatedTask = await dbConnection_1.default.task.update({
            where: { id: Number(id) },
            data: { status },
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
            }
        });
        return res.json(updatedTask);
    }
    catch (error) {
        console.error('Error updating task status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateTaskStatus = updateTaskStatus;
//# sourceMappingURL=task.js.map