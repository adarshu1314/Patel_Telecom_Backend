export interface UserModal {
  userId: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
}


export interface Client {
  id: number;
  name: string;
  // ... other client properties
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'; // Updated to match new enum
  assignedUserId: number;
  clientId: number;
  priority: 'low' | 'medium' | 'high';
  comments: any[]; // Define a proper type for comments if needed
  createdAt: string;
  updatedAt: string;
  dueDate?: string; // Optional due date
  assignedUser?: UserModal; // Optional, populated by join
  client?: Client; // Optional, populated by join
}

export interface Attendance {
  userId: number;
  date: string; // ISO date string (YYYY-MM-DD)
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  checkIn?: string; // optional ISO datetime
  checkOut?: string; // optional ISO datetime
  remarks?: string;
}
