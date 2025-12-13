import { Request, Response } from "express";

import prisma from '../utils/dbConnection';

export const getTasks = async (req: Request, res: Response) => {
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
            search
        } = req.body;

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
        const where: any = {};

        // Non-admin users can only see their own tasks
        if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
            where.assignedUserId = id;
        }

        // Apply filters with support for multiple values
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
            tasks,
            pagination: {
                page: pageNum,
                pageSize: pageSz,
                total,
                totalPages: Math.ceil(total / pageSz)
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const createTask = async (req: Request, res: Response) => {
    try {
        // 1. Destructure and extract the expected data from the request body
        console.log('CREATE TASK REQ BODY:', req.body);
        const {
            title,
            description,
            status,
            priority,
            assignedUserId,
            clientId,
            dueDate,
        } = req.body;

        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        // 2. Basic Validation: Ensure required fields are present
        if (!title || !assignedUserId || !clientId || !status || !priority) {
            return res.status(400).json({
                error: 'Missing required fields: title, assignedUserId, clientId, status, and priority are required.',
            });
        }

        // 3. Handle file upload if present
        let attachment = {};
        if (req.file) {
           attachment = {...req.file};
        }

        // 4. Use Prisma's `create` method to add a new task to the database
        const newTask = await prisma.task.create({
            data: {
                title,
                description: description || null, // Handle optional description
                status,
                priority,
                assignedUserId: parseInt(assignedUserId),
                clientId: parseInt(clientId),
                // The dueDate from the frontend is an ISO string, which Prisma handles perfectly for DateTime fields.
                // If dueDate is not provided, this will correctly be set to null (if your schema allows it).
                dueDate: dueDate ? new Date(dueDate) : null,
                // Add filename if file was uploaded
                attachments: attachment ? [attachment] : [],
            },
        });

        // 5. Respond with a 201 "Created" status and the newly created task object
        return res.status(201).json(newTask);

    } catch (error) {
        console.error('Error creating task:', error);

        // Advanced Error Handling for Prisma: Check for specific error codes
        if (error) {
            // Foreign key constraint failed (e.g., assignedUserId or clientId does not exist)
            return res.status(400).json({
                error: 'Invalid assigned user or client. Please ensure the user and client exist.',
            });
        }

        // For all other errors, return a generic 500 error
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const {
            id,
            title,
            description,
            status,
            priority,
            assignedUserId,
            clientId,
            comments,
            dueDate,
        } = req.body;

        if (!id || !title || !status || !priority || !assignedUserId || !clientId) {
            return res.status(400).json({ error: 'Bad Request' });
        }

        const user = await prisma.user.findUnique({
            where: { id: assignedUserId },
        })

        const client = await prisma.client.findUnique({
            where: { id: clientId },
        })
        if (client == null) {
            return res.status(400).json({ error: 'Client not found' });
        }
        if (user == null) {
            return res.status(400).json({ error: 'User not found' });
        }

        const updatedTask = await prisma.task.update({
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
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(400).json({ error: 'Internal Server Error' });
    }
}

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const deletedTask = await prisma.task.delete({
            where: { id: Number(id) },
        });
        res.status(201).json(deletedTask);
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getTaskCounts = async (req: Request, res: Response) => {
    try {
        const id = req.user?.userId;

        // Build where clause for filtering
        const where: any = {};

        // Non-admin users can only see their own tasks
        if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
            where.assignedUserId = id;
        }

        // Get counts for each status
        const [assignedCount, inProgressCount, completedCount, overdueCount] = await Promise.all([
            prisma.task.count({
                where: {
                    ...where,
                    status: 'ASSIGNED'
                }
            }),
            prisma.task.count({
                where: {
                    ...where,
                    status: 'IN_PROGRESS'
                }
            }),
            prisma.task.count({
                where: {
                    ...where,
                    status: 'COMPLETED'
                }
            }),
            prisma.task.count({
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
    } catch (error) {
        console.error('Error fetching task counts:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getOverdueTasks = async (req: Request, res: Response) => {
    try {
        const id = req.user?.userId;

        // Build where clause for filtering
        const where: any = {
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
        const tasks = await prisma.task.findMany({
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
                { status: 'asc' }   // Then by status (ASSIGNED, IN_PROGRESS)
            ]
        });

        return res.json(tasks);
    } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getActiveTasks = async (req: Request, res: Response) => {
    try {
        const id = req.user?.userId;

        // Build where clause for filtering
        const where: any = {
            status: { not: 'COMPLETED' }
        };

        // Non-admin users can only see their own tasks
        if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN") {
            where.assignedUserId = id;
        }

        // Get active tasks with sorting: overdue first, then by status
        const tasks = await prisma.task.findMany({
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
                { status: 'asc' }   // Then by status (ASSIGNED, IN_PROGRESS)
            ]
        });

        return res.json(tasks);
    } catch (error) {
        console.error('Error fetching active tasks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const { id, status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ error: 'Task ID and status are required' });
        }

        const validStatuses = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updatedTask = await prisma.task.update({
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
    } catch (error) {
        console.error('Error updating task status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}