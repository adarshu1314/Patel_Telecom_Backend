export interface UserModal {
    userId: number;
    email: string;
    name: string;
    role: "USER" | "ADMIN" | "SUPERADMIN";
    department?: {
        id: number;
        name: string;
    };
}
export interface Client {
    id: number;
    name: string;
}
export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    assignedUserId: number;
    clientId: number;
    priority: 'low' | 'medium' | 'high';
    comments: any[];
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    assignedUser?: UserModal;
    client?: Client;
}
export interface Attendance {
    userId: number;
    date: string;
    status: "SUBMITTED" | "APPROVED" | "REJECTED";
    checkIn?: string;
    checkOut?: string;
    remarks?: string;
}
//# sourceMappingURL=types.d.ts.map