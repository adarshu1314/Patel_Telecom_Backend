import { Request, Response } from "express";
import prisma from '../utils/dbConnection';
import bcrypt from 'bcryptjs';


export const getUsers = async (req: Request, res: Response) => {
    try {
        const { page, pageSize: reqPageSize, search } = req.body;
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(reqPageSize) || 10;
        const id = req.user?.userId

        // Build where clause for search
        const whereClause: any = {};
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get total count for pagination
        const total = await prisma.user.count({ where: whereClause });
        const totalPages = Math.ceil(total / pageSize);

        // Fetch users with pagination and search
        const users = await prisma.user.findMany({
            skip: (pageNum - 1) * pageSize,
            take: pageSize,
            where: whereClause,
            include: {
                tasks: true,
                department: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform the user data to match frontend expectations
        const transformedUsers = users.map(user => ({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
        }));

        res.json({
            users: transformedUsers,
            pagination: {
                current: pageNum,
                pageSize,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, role, password, departmentId } = req.body;

        // Basic validation
        if (!name || !email || !role || !password) {
            return res.status(400).json({ error: 'Name, Email, Role and Password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // If departmentId is provided, check if department exists
        if (departmentId) {
            const department = await prisma.department.findUnique({
                where: { id: Number(departmentId) }
            });

            if (!department) {
                return res.status(400).json({ error: 'Department not found' });
            }
        }

        // Hash the password before storing
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user record in the database with hashed password and optional department
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role,
                password: hashedPassword, // Store the hashed password
                departmentId: departmentId ? Number(departmentId) : null,
            },
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { name, email, role, password, id, departmentId } = req.body;

        // Basic validation
        if (!name || !email || !role || !password || !id) {
            return res.status(400).json({ error: 'Bad Request' });
        }

        // If departmentId is provided, check if department exists
        if (departmentId) {
            const department = await prisma.department.findUnique({
                where: { id: Number(departmentId) }
            });

            if (!department) {
                return res.status(400).json({ error: 'Department not found' });
            }
        }

        // Hash the password if provided
        let hashedPassword = password;
        if (password) {
            const saltRounds = 12;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        const updateUser = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                role,
                password: hashedPassword,
                departmentId: departmentId ? Number(departmentId) : null,
            },
        });

        res.status(201).json(updateUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        // Basic validation
        if (!id) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const deletedUser = await prisma.user.delete({
            where: { id: Number(id) },
        });
        res.status(201).json(deletedUser);
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}       