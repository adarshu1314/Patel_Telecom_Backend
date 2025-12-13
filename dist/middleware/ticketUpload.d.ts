import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const ticketUpload: multer.Multer;
export declare const handleTicketFileUpload: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=ticketUpload.d.ts.map