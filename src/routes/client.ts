import express from 'express';
import { getClients,createClient,updateClient,deleteClient} from '../controller/client';
const router = express.Router();

// Get Task(s) based on ID (Your existing code)
router.post('/getClients', getClients);

// =================================================================
// START: New Endpoint to Create a Task
// =================================================================

router.post('/createClient', createClient);

// =================================================================
// END: New Endpoint to Create a Task
// =================================================================

router.post('/updateClient', updateClient);
router.post('/deleteClient', deleteClient);
export default router;