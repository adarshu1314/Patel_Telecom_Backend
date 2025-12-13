
export const departments = [
    {
        name: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Marketing',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Sales',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Human Resources',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Finance',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const users = [
    {
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'SUPERADMIN',
        department: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'ADMIN',
        department: 'Marketing',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'USER',
        department: 'Sales',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'USER',
        department: 'Human Resources',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'David Brown',
        email: 'david.brown@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'USER',
        department: 'Finance',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'USER',
        department: 'Engineering',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const clients = [
    {
        name: 'Acme Corporation',
        phone: '+1-555-0123',
        email: 'contact@acme.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Tech Solutions Inc',
        phone: '+1-555-0456',
        email: 'info@techsolutions.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Global Industries',
        phone: '+1-555-0789',
        email: 'hello@globalindustries.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'StartUp Ventures',
        phone: '+1-555-0321',
        email: 'founders@startupventures.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Enterprise Systems',
        phone: '+1-555-0654',
        email: 'support@enterprisesystems.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const tasks = [
    {
        title: 'Setup Development Environment',
        description: 'Configure development environment for new team members',
        status: 'ASSIGNED',
        assignedUser: 'john.doe@company.com',
        client: 'Acme Corporation',
        priority: 'High',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        title: 'Create Marketing Campaign',
        description: 'Design and implement Q4 marketing campaign',
        status: 'IN_PROGRESS',
        assignedUser: 'jane.smith@company.com',
        client: 'Tech Solutions Inc',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
    },
    {
        title: 'Client Onboarding Process',
        description: 'Streamline client onboarding workflow',
        status: 'COMPLETED',
        assignedUser: 'mike.johnson@company.com',
        client: 'Global Industries',
        priority: 'Low',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(),
    },
    {
        title: 'HR Policy Update',
        description: 'Update employee handbook and policies',
        status: 'ASSIGNED',
        assignedUser: 'sarah.wilson@company.com',
        client: null,
        priority: 'Medium',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        title: 'Financial Report Q3',
        description: 'Prepare quarterly financial analysis report',
        status: 'IN_PROGRESS',
        assignedUser: 'david.brown@company.com',
        client: 'Enterprise Systems',
        priority: 'High',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(),
    },
    {
        title: 'API Integration',
        description: 'Integrate third-party payment API',
        status: 'ASSIGNED',
        assignedUser: 'emily.davis@company.com',
        client: 'StartUp Ventures',
        priority: 'High',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        title: 'Website Redesign',
        description: 'Complete company website redesign project',
        status: 'IN_PROGRESS',
        assignedUser: 'john.doe@company.com',
        client: 'Acme Corporation',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(),
    },
    {
        title: 'Sales Training Program',
        description: 'Develop and conduct sales team training',
        status: 'ASSIGNED',
        assignedUser: 'mike.johnson@company.com',
        client: null,
        priority: 'Low',
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const attendance = [
    {
        user: 'john.doe@company.com',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'APPROVED',
        location: 'Office Building A',
        remarks: 'Regular work day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'jane.smith@company.com',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'SUBMITTED',
        location: 'Office Building B',
        remarks: 'Client meeting in the morning',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'mike.johnson@company.com',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'SUBMITTED',
        location: 'Office Building A',
        remarks: 'Traffic delay',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'sarah.wilson@company.com',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'REJECTED',
        location: 'Home Office',
        remarks: 'Remote work day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'david.brown@company.com',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'APPROVED',
        location: null,
        remarks: 'Personal day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'emily.davis@company.com',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'SUBMITTED',
        location: 'Office Building A',
        remarks: 'Regular work day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'john.doe@company.com',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'APPROVED',
        location: 'Office Building A',
        remarks: 'Regular work day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'jane.smith@company.com',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'REJECTED',
        location: null,
        remarks: 'Sick day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'mike.johnson@company.com',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'APPROVED',
        location: 'Client Site - Tech Solutions',
        remarks: 'On-site client meeting',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'sarah.wilson@company.com',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'SUBMITTED',
        location: 'Office Building B',
        remarks: 'Regular work day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'david.brown@company.com',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'APPROVED',
        location: 'Office Building A',
        remarks: 'Regular work day',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        user: 'emily.davis@company.com',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'SUBMITTED',
        location: 'Office Building A',
        remarks: 'Late due to doctor appointment',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];