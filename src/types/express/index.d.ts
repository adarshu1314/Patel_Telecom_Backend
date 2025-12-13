import { UserModal } from "../../types";

declare global {
    namespace Express {
        interface Request {
            user?: UserModal; // or whatever shape your user object has
        }
    }
}