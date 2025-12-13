"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClients = void 0;
const dbConnection_1 = __importDefault(require("../utils/dbConnection"));
const getClients = async (req, res) => {
    try {
        const { page, pageSize: reqPageSize, search } = req.body;
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(reqPageSize) || 10;
        const id = req.user?.userId;
        // Build where clause for search
        const whereClause = {};
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Get total count for pagination
        const total = await dbConnection_1.default.client.count({ where: whereClause });
        const totalPages = Math.ceil(total / pageSize);
        // Fetch clients with pagination and search
        const clients = await dbConnection_1.default.client.findMany({
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
    }
    catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getClients = getClients;
const createClient = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        // Basic validation
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }
        // Create a new client record in the database
        const newClient = await dbConnection_1.default.client.create({
            data: {
                name,
                email,
                phone: phone || null, // Handle optional fields
            },
        });
        res.status(201).json(newClient);
    }
    catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createClient = createClient;
const updateClient = async (req, res) => {
    try {
        const { name, email, phone, id } = req.body;
        // Basic validation
        if (!name || !email || !phone || !id) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const updateClient = await dbConnection_1.default.client.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                phone: phone || null, // Handle optional fields
            },
        });
        res.status(201).json(updateClient);
    }
    catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    try {
        const { id } = req.body;
        // Basic validation
        if (!id) {
            return res.status(400).json({ error: 'Bad Request' });
        }
        const deletClient = await dbConnection_1.default.client.delete({
            where: { id: Number(id) },
        });
        res.status(201).json(deletClient);
    }
    catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteClient = deleteClient;
//# sourceMappingURL=client.js.map