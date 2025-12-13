import { Request, Response } from 'express';
import prisma from '../utils/dbConnection';

export const getClients = async (req: Request, res: Response) => {
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
        const total = await prisma.client.count({ where: whereClause });
        const totalPages = Math.ceil(total / pageSize);

        // Fetch clients with pagination and search
        const clients = await prisma.client.findMany({
            skip: (pageNum - 1) * pageSize,
            take: pageSize,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            clients,
            pagination: {
                current: pageNum,
                pageSize,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const createClient = async (req: Request, res: Response) => {
    try {
        const { name, email, phone } = req.body;

        // Basic validation
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }
        // Create a new client record in the database
        const newClient = await prisma.client.create({
            data: {
                name,
                email,
                phone: phone || null, // Handle optional fields

            },
        });

        res.status(201).json(newClient);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const updateClient = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, id } = req.body;

        // Basic validation
        if (!name || !email || !phone || !id) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const updateClient = await prisma.client.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                phone: phone || null, // Handle optional fields
            },
        });
        res.status(201).json(updateClient);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        // Basic validation
        if (!id) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const deletClient = await prisma.client.delete({
            where: { id: Number(id) },
        });
        res.status(201).json(deletClient);
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
