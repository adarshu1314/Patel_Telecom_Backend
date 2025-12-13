import express from 'express';
import { getClients,createClient,updateClient,deleteClient} from '../controller/upload';
const router = express.Router();

// Get Task(s) based on ID (Your existing code)
router.post('/UploadFile', getClients);


export default router;