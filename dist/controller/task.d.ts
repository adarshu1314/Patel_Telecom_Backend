import { Request, Response } from "express";
export declare const getTasks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTaskCounts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOverdueTasks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getActiveTasks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTaskStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=task.d.ts.map