import { Request, Response } from 'express';
export declare const downloadUserTemplate: (req: Request, res: Response) => Promise<void>;
export declare const downloadClientTemplate: (req: Request, res: Response) => Promise<void>;
export declare const bulkUploadUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const bulkUploadClients: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const temporaryFileUpload: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const processTemporaryFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTemporaryFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=bulk.d.ts.map