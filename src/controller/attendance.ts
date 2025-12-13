import { Request, Response } from "express";
import { PrismaClient, AttendanceStatus } from "../../prisma-client";
import prisma from "../utils/dbConnection";

/**
 * Punch in - mark attendance with selfie and location
 */
export const punchIn = async (req: Request, res: Response) => {
  try {
    const { userId, latitude, longitude, location, remarks } = req.body;
    const selfiePhoto = req.file; // This will be a File object from multer

    const today = new Date();

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if attendance already marked for today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: Number(userId),
        date: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: new Date(today.setHours(23, 59, 59, 999))
        },
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ error: "Attendance already marked for today" });
    }

    // Convert Buffer to base64 if selfie photo exists
    let selfiePhotoBase64 = null;
    if (selfiePhoto) {
      selfiePhotoBase64 = `data:image/jpeg;base64,${selfiePhoto.buffer.toString('base64')}`;
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        userId: Number(userId),
        date: today,
        status: AttendanceStatus.SUBMITTED,
        selfiePhoto: selfiePhotoBase64,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        location: location || null,
        remarks: remarks || null,
      },
    });

    return res.status(201).json(newAttendance);
  } catch (error: any) {
    console.error("Error punching in:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Punch out - mark as absent
 */
export const punchOut = async (req: Request, res: Response) => {
  try {
    const { userId, remarks } = req.body;
    const today = new Date();

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if attendance already marked for today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: Number(userId),
        date: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: new Date(today.setHours(23, 59, 59, 999))
        },
      },
    });

    if (!existingAttendance) {
      return res.status(400).json({ error: "No attendance record found for today" });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        status: AttendanceStatus.SUBMITTED,
        remarks: remarks || existingAttendance.remarks,
      },
    });

    return res.status(200).json(updatedAttendance);
  } catch (error: any) {
    console.error("Error punching out:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get paginated attendance records
 */
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, userId, startDate, endDate, search } = req.body;
    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(pageSize) || 10;

    if (!pageNum || pageNum < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }

    // Check if user is admin or superadmin
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPERADMIN";

    // For non-admin users, only return their own attendance records
    let whereClause: any = {};

    // Date range filter
    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      // Set to end of day for endDate
      endDateTime.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startDateTime,
        lte: endDateTime,
      };
    } else if (startDate) {
      whereClause.date = { gte: new Date(startDate) };
    } else if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      whereClause.date = { lte: endDateTime };
    }

    // If userId is provided and user is admin, filter by that userId
    // If userId is not provided and user is not admin, filter by current user's userId
    if (userId && isAdmin) {
      whereClause.userId = Number(userId);
    } else if (!isAdmin) {
      whereClause.userId = req.user?.userId;
    }

    // Search filter - search by user name, email, or location
    if (search && isAdmin) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.attendance.count({ where: whereClause });

    const attendance = await prisma.attendance.findMany({
      skip: (pageNum - 1) * pageLimit,
      take: pageLimit,
      where: whereClause,
      include: { user: true },
      orderBy: { date: "desc" },
    });

    // Transform the response to include user name only for admin users
    const transformedAttendance = attendance.map(record => {
      const { user, ...rest } = record;
      if (isAdmin) {
        return {
          ...rest,
          userName: user.name,
          userEmail: user.email,
        };
      } else {
        return rest;
      }
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / pageLimit);

    return res.json({
      records: transformedAttendance,
      total,
      totalPages,
      currentPage: pageNum,
      pageSize: pageLimit,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Mark new attendance (simplified - present/absent with selfie and location)
 */
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { userId, date, status, latitude, longitude, location, remarks } = req.body;
    const selfiePhoto = req.file; // This will be a File object from multer

    if (!userId || !date || !status) {
      return res.status(400).json({
        error: "Missing required fields: userId, date, status",
      });
    }

    // Check if attendance already exists for this user and date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: Number(userId),
        date: new Date(date),
      },
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ error: "Attendance already marked for this user and date." });
    }

    // Convert Buffer to base64 if selfie photo exists
    let selfiePhotoBase64 = null;
    if (selfiePhoto) {
      selfiePhotoBase64 = `data:image/jpeg;base64,${selfiePhoto.buffer.toString('base64')}`;
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        userId: Number(userId),
        date: new Date(date),
        status,
        selfiePhoto: selfiePhotoBase64,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        location: location || null,
        remarks: remarks || null,
      },
    });

    return res.status(201).json(newAttendance);
  } catch (error: any) {
    console.error("Error creating attendance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update attendance remarks and status
 */
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id, status, remarks } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Attendance ID is required" });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: Number(id) },
      data: {
        status: status || undefined,
        remarks: remarks || undefined,
      },
    });

    return res.status(200).json(updatedAttendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { Id, date, userId } = req.body;

    if (!Id || !userId) {
      return res.status(400).json({ error: "Attendance ID is required" });
    }

    let whereClause: any = {};
    if (Id) {
      whereClause.id = Number(Id);
    }
    if (date) {
      whereClause.date = new Date(date);
    }
    if (userId) {
      whereClause.userId = Number(userId);
    }
    const deletedAttendance = await prisma.attendance.delete({
      where: whereClause,
    });

    return res.status(200).json(deletedAttendance);
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get monthly summary for a user
 */
export const getUserMonthlySummary = async (req: Request, res: Response) => {
  try {
    const { userId, date } = req.body; // month = "2025-09"

    if (!userId || !date) {
      return res
        .status(400)
        .json({ error: "userId and month (YYYY-MM) are required" });
    }

    const startDate = new Date(`${date}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const records = await prisma.attendance.findMany({
      where: {
        userId: Number(userId),
        date: { gte: startDate, lt: endDate },
      },
    });

    const summary = {
      submittedDays: records.filter((r) => r.status === AttendanceStatus.SUBMITTED).length,
      approvedDays: records.filter((r) => r.status === AttendanceStatus.APPROVED).length,
      rejectedDays: records.filter((r) => r.status === AttendanceStatus.REJECTED).length,
    };

    return res.json({ userId, date, summary });
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update attendance status (admin approval/rejection)
 */
export const updateAttendanceStatus = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;
    const { status, remarks } = req.body;

    if (!recordId) {
      return res.status(400).json({ error: "Attendance record ID is required" });
    }

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Valid status (APPROVED or REJECTED) is required" });
    }

    // Check if user is admin or superadmin
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPERADMIN";
    if (!isAdmin) {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    // Find the attendance record
    const attendanceRecord = await prisma.attendance.findUnique({
      where: { id: Number(recordId) },
      include: { user: true }
    });

    if (!attendanceRecord) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    // Update the attendance status
    const updatedAttendance = await prisma.attendance.update({
      where: { id: Number(recordId) },
      data: {
        status: status as AttendanceStatus,
        remarks: remarks || attendanceRecord.remarks,
      },
      include: { user: true }
    });

    // Return transformed response for frontend
    const { user, ...rest } = updatedAttendance;
    return res.json({
      ...rest,
      userName: user.name,
      userEmail: user.email,
    });

  } catch (error) {
    console.error("Error updating attendance status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
