import express, { Request, Response } from 'express';
import { encryptText} from '../controller/encrypt';

const router = express.Router();


// Login route
router.post('/encryptText', encryptText);

export default router;