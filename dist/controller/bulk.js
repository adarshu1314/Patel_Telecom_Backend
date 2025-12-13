"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemporaryFile = exports.processTemporaryFile = exports.temporaryFileUpload = exports.bulkUploadClients = exports.bulkUploadUsers = exports.downloadClientTemplate = exports.downloadUserTemplate = void 0;
const XLSX = __importStar(require("xlsx"));
const dbConnection_1 = __importDefault(require("../utils/dbConnection"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Helper function to generate unique IDs
const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
const downloadUserTemplate = async (req, res) => {
    try {
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        // Sample data for the template
        const templateData = [
            {
                'Name': 'John Doe',
                'Email': 'john.doe@example.com',
                'Role': 'USER',
                'Password': 'password123',
                'Department': 'Engineering'
            },
            {
                'Name': 'Jane Smith',
                'Email': 'jane.smith@example.com',
                'Role': 'ADMIN',
                'Password': 'password123',
                'Department': 'Marketing'
            }
        ];
        // Create worksheet from template data
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Template');
        // Add departments reference sheet
        const departments = await dbConnection_1.default.department.findMany({
            orderBy: { name: 'asc' }
        });
        const deptTemplateData = departments.map(dept => ({
            'Department Name': dept.name,
            'Department ID': dept.id
        }));
        const deptWorksheet = XLSX.utils.json_to_sheet(deptTemplateData);
        XLSX.utils.book_append_sheet(workbook, deptWorksheet, 'Departments Reference');
        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=user-template.xlsx');
        // Send the Excel file
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('Error generating user template:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.downloadUserTemplate = downloadUserTemplate;
const downloadClientTemplate = async (req, res) => {
    try {
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        // Sample data for the template
        const templateData = [
            {
                'Name': 'Acme Corporation',
                'Email': 'contact@acme.com',
                'Phone': '+1234567890'
            },
            {
                'Name': 'Tech Solutions Inc',
                'Email': 'info@techsolutions.com',
                'Phone': '+0987654321'
            }
        ];
        // Create worksheet from template data
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients Template');
        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=client-template.xlsx');
        // Send the Excel file
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('Error generating client template:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.downloadClientTemplate = downloadClientTemplate;
const bulkUploadUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileBuffer = req.file.buffer;
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const results = {
            success: 0,
            errors: [],
            duplicates: 0,
            totalRows: data.length
        };
        // Get all departments for validation
        const departments = await dbConnection_1.default.department.findMany();
        const departmentMap = new Map(departments.map(dept => [dept.name, dept.id]));
        // First pass: Validate all rows without creating any records
        const validRows = [];
        const validationErrors = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowIndex = i + 2; // Excel rows are 1-indexed, plus header row
            try {
                // Validate required fields
                if (!row.Name || !row.Email || !row.Role || !row.Password) {
                    validationErrors.push(`Row ${rowIndex}: Missing required fields (Name, Email, Role, Password)`);
                    continue;
                }
                // Validate role
                const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
                if (!validRoles.includes(row.Role)) {
                    validationErrors.push(`Row ${rowIndex}: Invalid role '${row.Role}'. Must be one of: ${validRoles.join(', ')}`);
                    continue;
                }
                // Check for duplicate email
                const existingUser = await dbConnection_1.default.user.findFirst({
                    where: { email: row.Email }
                });
                if (existingUser) {
                    results.duplicates++;
                    validationErrors.push(`Row ${rowIndex}: Email '${row.Email}' already exists`);
                    continue;
                }
                // Validate department if provided
                if (row['Department ID']) {
                    const deptName = row['Department ID'].toString();
                    if (!departmentMap.has(deptName)) {
                        validationErrors.push(`Row ${rowIndex}: Department '${deptName}' not found`);
                        continue;
                    }
                }
                // If we get here, the row is valid
                validRows.push(row);
            }
            catch (error) {
                console.error(`Error validating row ${rowIndex}:`, error);
                validationErrors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // If there are any validation errors, return them without processing any records
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: `Found ${validationErrors.length} validation errors. Please fix all errors before retrying.`,
                errors: validationErrors,
                results: {
                    success: 0,
                    errors: validationErrors.length,
                    duplicates: results.duplicates,
                    totalRows: data.length,
                    processedRows: 0
                }
            });
        }
        // Second pass: Create all valid records in a transaction
        try {
            await dbConnection_1.default.$transaction(async (tx) => {
                for (const row of validRows) {
                    const rowIndex = data.indexOf(row) + 2; // Excel rows are 1-indexed, plus header row
                    try {
                        // Hash password
                        const saltRounds = 12;
                        const hashedPassword = await bcryptjs_1.default.hash(row.Password, saltRounds);
                        // Get department ID if provided
                        let departmentId = null;
                        if (row['Department ID']) {
                            const deptName = row['Department ID'].toString();
                            departmentId = departmentMap.get(deptName);
                        }
                        // Create user
                        await tx.user.create({
                            data: {
                                name: row.Name,
                                email: row.Email,
                                role: row.Role,
                                password: hashedPassword,
                                departmentId: departmentId
                            }
                        });
                        results.success++;
                    }
                    catch (error) {
                        console.error(`Error creating user from row ${rowIndex}:`, error);
                        throw error; // This will roll back the transaction
                    }
                }
            });
        }
        catch (error) {
            console.error('Error in transaction:', error);
            return res.status(500).json({
                error: 'Failed to create users',
                message: 'An error occurred while creating users. No records were created.',
                errors: [`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
                results: {
                    success: 0,
                    errors: 1,
                    duplicates: results.duplicates,
                    totalRows: data.length,
                    processedRows: 0
                }
            });
        }
        res.json({
            message: `Bulk upload completed successfully. All ${results.success} records were processed.`,
            results: {
                success: results.success,
                errors: 0,
                duplicates: results.duplicates,
                totalRows: data.length,
                processedRows: results.success
            }
        });
    }
    catch (error) {
        console.error('Error in bulk user upload:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.bulkUploadUsers = bulkUploadUsers;
const bulkUploadClients = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileBuffer = req.file.buffer;
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const results = {
            success: 0,
            errors: [],
            duplicates: 0,
            totalRows: data.length
        };
        // First pass: Validate all rows without creating any records
        const validRows = [];
        const validationErrors = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowIndex = i + 2; // Excel rows are 1-indexed, plus header row
            try {
                // Validate required fields
                if (!row.Name || !row.Email) {
                    validationErrors.push(`Row ${rowIndex}: Missing required fields (Name, Email)`);
                    continue;
                }
                // Check for duplicate email
                const existingClient = await dbConnection_1.default.client.findFirst({
                    where: { email: row.Email }
                });
                if (existingClient) {
                    results.duplicates++;
                    validationErrors.push(`Row ${rowIndex}: Email '${row.Email}' already exists`);
                    continue;
                }
                // If we get here, the row is valid
                validRows.push(row);
            }
            catch (error) {
                console.error(`Error validating row ${rowIndex}:`, error);
                validationErrors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // If there are any validation errors, return them without processing any records
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: `Found ${validationErrors.length} validation errors. Please fix all errors before retrying.`,
                errors: validationErrors,
                results: {
                    success: 0,
                    errors: validationErrors.length,
                    duplicates: results.duplicates,
                    totalRows: data.length,
                    processedRows: 0
                }
            });
        }
        // Second pass: Create all valid records in a transaction
        try {
            await dbConnection_1.default.$transaction(async (tx) => {
                for (const row of validRows) {
                    const rowIndex = data.indexOf(row) + 2; // Excel rows are 1-indexed, plus header row
                    try {
                        // Create client
                        await tx.client.create({
                            data: {
                                name: row.Name,
                                email: row.Email,
                                phone: row.Phone || null
                            }
                        });
                        results.success++;
                    }
                    catch (error) {
                        console.error(`Error creating client from row ${rowIndex}:`, error);
                        throw error; // This will roll back the transaction
                    }
                }
            });
        }
        catch (error) {
            console.error('Error in transaction:', error);
            return res.status(500).json({
                error: 'Failed to create clients',
                message: 'An error occurred while creating clients. No records were created.',
                errors: [`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
                results: {
                    success: 0,
                    errors: 1,
                    duplicates: results.duplicates,
                    totalRows: data.length,
                    processedRows: 0
                }
            });
        }
        res.json({
            message: `Bulk upload completed successfully. All ${results.success} records were processed.`,
            results: {
                success: results.success,
                errors: 0,
                duplicates: results.duplicates,
                totalRows: data.length,
                processedRows: results.success
            }
        });
    }
    catch (error) {
        console.error('Error in bulk client upload:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.bulkUploadClients = bulkUploadClients;
// Temporary file upload for 2-step process
const temporaryFileUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const file = req.file;
        const { type } = req.body; // Get type from request body
        const fileId = generateUniqueId();
        const tempDir = path_1.default.join(__dirname, '../../temp');
        // Create temp directory if it doesn't exist
        if (!fs_1.default.existsSync(tempDir)) {
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        }
        // Save file to temp location
        const fileName = `${fileId}-${file.originalname}`;
        const filePath = path_1.default.join(tempDir, fileName);
        fs_1.default.writeFileSync(filePath, file.buffer);
        // Read and validate file content
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        // Basic validation
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            rowCount: data.length,
            sampleData: data.slice(0, 3) // First 3 rows for preview
        };
        // Validate file structure based on type
        if (type === 'users') {
            // Check for required columns for users
            const requiredColumns = ['Name', 'Email', 'Role', 'Password'];
            const actualColumns = Object.keys(data[0] || {});
            requiredColumns.forEach(col => {
                if (!actualColumns.includes(col)) {
                    validation.errors.push(`Missing required column: ${col}`);
                    validation.isValid = false;
                }
            });
            // Validate role values
            const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
            data.forEach((row, index) => {
                if (row.Role && !validRoles.includes(row.Role)) {
                    validation.errors.push(`Row ${index + 2}: Invalid role '${row.Role}'. Must be one of: ${validRoles.join(', ')}`);
                    validation.isValid = false;
                }
            });
        }
        else if (type === 'clients') {
            // Check for required columns for clients
            const requiredColumns = ['Name', 'Email'];
            const actualColumns = Object.keys(data[0] || {});
            requiredColumns.forEach(col => {
                if (!actualColumns.includes(col)) {
                    validation.errors.push(`Missing required column: ${col}`);
                    validation.isValid = false;
                }
            });
        }
        // Check for empty rows
        const emptyRows = data.filter((row) => !Object.keys(row).some(key => row[key] && row[key].toString().trim()));
        if (emptyRows.length > 0) {
            validation.warnings.push(`Found ${emptyRows.length} empty rows`);
        }
        res.json({
            success: true,
            fileId,
            fileName,
            validation,
            message: validation.isValid
                ? 'File uploaded successfully and validation passed'
                : 'File uploaded but validation failed. Please fix the errors before processing.'
        });
    }
    catch (error) {
        console.error('Error in temporary file upload:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.temporaryFileUpload = temporaryFileUpload;
// Process temporary file
const processTemporaryFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { type } = req.body;
        const tempDir = path_1.default.join(__dirname, '../../temp');
        const tempFiles = fs_1.default.readdirSync(tempDir);
        const tempFile = tempFiles.find(file => file.startsWith(fileId));
        if (!tempFile) {
            return res.status(404).json({ error: 'Temporary file not found' });
        }
        const filePath = path_1.default.join(tempDir, tempFile);
        // Read the file
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        let results;
        if (type === 'users') {
            results = await processBulkUsers(data, null);
        }
        else if (type === 'clients') {
            results = await processBulkClients(data, null);
        }
        else {
            return res.status(400).json({ error: 'Invalid type specified' });
        }
        // Delete the temporary file after processing
        fs_1.default.unlinkSync(filePath);
        res.json({
            success: true,
            results,
            message: 'File processed successfully'
        });
    }
    catch (error) {
        console.error('Error processing temporary file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.processTemporaryFile = processTemporaryFile;
// Delete temporary file
const deleteTemporaryFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const tempDir = path_1.default.join(__dirname, '../../temp');
        const tempFiles = fs_1.default.readdirSync(tempDir);
        const tempFile = tempFiles.find(file => file.startsWith(fileId));
        if (!tempFile) {
            return res.status(404).json({ error: 'Temporary file not found' });
        }
        const filePath = path_1.default.join(tempDir, tempFile);
        // Delete file from disk
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        res.json({
            success: true,
            message: 'Temporary file deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting temporary file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.deleteTemporaryFile = deleteTemporaryFile;
// Helper function to process bulk users
const processBulkUsers = async (data, tempFile) => {
    const results = {
        success: 0,
        errors: [],
        duplicates: 0,
        totalRows: data.length
    };
    // Get all departments for validation
    const departments = await dbConnection_1.default.department.findMany();
    const departmentMap = new Map(departments.map(dept => [dept.name, dept.id]));
    // First pass: Validate all rows without creating any records
    const validRows = [];
    const validationErrors = [];
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowIndex = i + 2; // Excel rows are 1-indexed, plus header row
        try {
            // Validate required fields
            if (!row.Name || !row.Email || !row.Role || !row.Password) {
                validationErrors.push(`Row ${rowIndex}: Missing required fields (Name, Email, Role, Password)`);
                continue;
            }
            // Validate role
            const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
            if (!validRoles.includes(row.Role)) {
                validationErrors.push(`Row ${rowIndex}: Invalid role '${row.Role}'. Must be one of: ${validRoles.join(', ')}`);
                continue;
            }
            // Check for duplicate email
            const existingUser = await dbConnection_1.default.user.findFirst({
                where: { email: row.Email }
            });
            if (existingUser) {
                results.duplicates++;
                validationErrors.push(`Row ${rowIndex}: Email '${row.Email}' already exists`);
                continue;
            }
            // Validate department if provided
            if (row['Department ID']) {
                const deptName = row['Department ID'].toString();
                if (!departmentMap.has(deptName)) {
                    validationErrors.push(`Row ${rowIndex}: Department '${deptName}' not found`);
                    continue;
                }
            }
            // If we get here, the row is valid
            validRows.push(row);
        }
        catch (error) {
            console.error(`Error validating row ${rowIndex}:`, error);
            validationErrors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // If there are any validation errors, return them without processing any records
    if (validationErrors.length > 0) {
        return {
            ...results,
            errors: validationErrors,
            processedRows: 0,
            message: 'Validation failed'
        };
    }
    // Second pass: Create all valid records in a transaction
    try {
        await dbConnection_1.default.$transaction(async (tx) => {
            for (const row of validRows) {
                const rowIndex = data.indexOf(row) + 2; // Excel rows are 1-indexed, plus header row
                try {
                    // Hash password
                    const saltRounds = 12;
                    const hashedPassword = await bcryptjs_1.default.hash(row.Password, saltRounds);
                    // Get department ID if provided
                    let departmentId = null;
                    if (row['Department ID']) {
                        const deptName = row['Department ID'].toString();
                        departmentId = departmentMap.get(deptName);
                    }
                    // Create user
                    await tx.user.create({
                        data: {
                            name: row.Name,
                            email: row.Email,
                            role: row.Role,
                            password: hashedPassword,
                            departmentId: departmentId
                        }
                    });
                    results.success++;
                }
                catch (error) {
                    console.error(`Error creating user from row ${rowIndex}:`, error);
                    throw error; // This will roll back the transaction
                }
            }
        });
    }
    catch (error) {
        console.error('Error in transaction:', error);
        return {
            ...results,
            errors: [`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            processedRows: 0,
            message: 'Transaction failed'
        };
    }
    return {
        ...results,
        processedRows: results.success,
        message: `Bulk upload completed successfully. All ${results.success} records were processed.`
    };
};
// Helper function to process bulk clients
const processBulkClients = async (data, tempFile) => {
    const results = {
        success: 0,
        errors: [],
        duplicates: 0,
        totalRows: data.length
    };
    // First pass: Validate all rows without creating any records
    const validRows = [];
    const validationErrors = [];
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowIndex = i + 2; // Excel rows are 1-indexed, plus header row
        try {
            // Validate required fields
            if (!row.Name || !row.Email) {
                validationErrors.push(`Row ${rowIndex}: Missing required fields (Name, Email)`);
                continue;
            }
            // Check for duplicate email
            const existingClient = await dbConnection_1.default.client.findFirst({
                where: { email: row.Email }
            });
            if (existingClient) {
                results.duplicates++;
                validationErrors.push(`Row ${rowIndex}: Email '${row.Email}' already exists`);
                continue;
            }
            // If we get here, the row is valid
            validRows.push(row);
        }
        catch (error) {
            console.error(`Error validating row ${rowIndex}:`, error);
            validationErrors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // If there are any validation errors, return them without processing any records
    if (validationErrors.length > 0) {
        return {
            ...results,
            errors: validationErrors,
            processedRows: 0,
            message: 'Validation failed'
        };
    }
    // Second pass: Create all valid records in a transaction
    try {
        await dbConnection_1.default.$transaction(async (tx) => {
            for (const row of validRows) {
                const rowIndex = data.indexOf(row) + 2; // Excel rows are 1-indexed, plus header row
                try {
                    // Create client
                    await tx.client.create({
                        data: {
                            name: row.Name,
                            email: row.Email,
                            phone: row.Phone || null
                        }
                    });
                    results.success++;
                }
                catch (error) {
                    console.error(`Error creating client from row ${rowIndex}:`, error);
                    throw error; // This will roll back the transaction
                }
            }
        });
    }
    catch (error) {
        console.error('Error in transaction:', error);
        return {
            ...results,
            errors: [`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            processedRows: 0,
            message: 'Transaction failed'
        };
    }
    return {
        ...results,
        processedRows: results.success,
        message: `Bulk upload completed successfully. All ${results.success} records were processed.`
    };
};
//# sourceMappingURL=bulk.js.map