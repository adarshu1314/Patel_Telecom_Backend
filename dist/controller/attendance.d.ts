import { Request, Response } from "express";
/**
 * Punch in - mark attendance with selfie and location
 */
export declare const punchIn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Punch out - mark as absent
 */
export declare const punchOut: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get paginated attendance records
 */
export declare const getAttendance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Mark new attendance (simplified - present/absent with selfie and location)
 */
export declare const createAttendance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update attendance remarks and status
 */
export declare const updateAttendance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Delete attendance record
 */
export declare const deleteAttendance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get monthly summary for a user
 */
export declare const getUserMonthlySummary: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update attendance status (admin approval/rejection)
 */
export declare const updateAttendanceStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=attendance.d.ts.map