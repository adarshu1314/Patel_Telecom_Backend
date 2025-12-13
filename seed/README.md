# Database Seed Files

This directory contains seed data for the TMS (Task Management System) database.

## Files

- `index.ts` - Main seed file that seeds all data (departments, users, clients, tasks, attendance)
- `data.ts` - Contains the actual seed data
- `tasks.ts` - Task-specific seed file for seeding only tasks
- `README.md` - This file

## Usage

### Prerequisites

1. Make sure your database is running and accessible
2. Ensure you have the DATABASE_URL environment variable set
3. Run `npx prisma generate` to generate Prisma client

### Seeding Commands

#### Seed all data (recommended for initial setup)
```bash
npm run seed
```

This will:
- Clear all existing data
- Seed 5 departments
- Seed 6 users (1 Superadmin, 1 Admin, 4 Users)
- Seed 5 clients
- Seed 8 tasks with various statuses and priorities
- Seed 12 attendance records for the past 2 days

#### Seed only tasks
```bash
npm run seed:tasks
```

This will only seed tasks, assuming other data already exists.

## Seed Data Overview

### Departments
- Engineering
- Marketing
- Sales
- Human Resources
- Finance

### Users
- John Doe (Superadmin) - Engineering
- Jane Smith (Admin) - Marketing
- Mike Johnson (User) - Sales
- Sarah Wilson (User) - Human Resources
- David Brown (User) - Finance
- Emily Davis (User) - Engineering

### Clients
- Acme Corporation
- Tech Solutions Inc
- Global Industries
- StartUp Ventures
- Enterprise Systems

### Tasks
8 tasks with various:
- Status: ASSIGNED, IN_PROGRESS, COMPLETED
- Priority: High, Medium, Low
- Due dates (ranging from past to future)
- Assignments to different users
- Client associations

### Attendance
12 attendance records for the past 2 days with various:
- Status: PRESENT, ABSENT, LEAVE, LATE
- Locations (Office, Home Office, Client sites)
- Remarks

## Notes

- All passwords are set to "password" (hashed)
- Email addresses follow the pattern: name@company.com
- Task due dates are calculated relative to the current date
- Attendance records are for the past 2 days
- The seed data is designed to provide a realistic test environment

## Development

When developing, you can run the seed commands multiple times. The main seed file will clear all existing data before seeding new data.

For production use, you may want to modify the seed data to match your specific requirements.