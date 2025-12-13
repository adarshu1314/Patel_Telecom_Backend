import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, getDepartments } from '../controller/user';
const router = express.Router();

// Get Task(s) based on ID (Your existing code)
router.post('/getUsers', getUsers);

// =================================================================
// START: New Endpoint to Create a Task
// =================================================================

router.post('/createUser', createUser);

// =================================================================
// END: New Endpoint to Create a Task
// =================================================================

router.post('/updateUser', updateUser);
router.post('/deleteUser', deleteUser);
router.get('/getDepartments', getDepartments);
export default router;