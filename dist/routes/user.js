"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controller/user");
const router = express_1.default.Router();
// Get Task(s) based on ID (Your existing code)
router.post('/getUsers', user_1.getUsers);
// =================================================================
// START: New Endpoint to Create a Task
// =================================================================
router.post('/createUser', user_1.createUser);
// =================================================================
// END: New Endpoint to Create a Task
// =================================================================
router.post('/updateUser', user_1.updateUser);
router.post('/deleteUser', user_1.deleteUser);
router.get('/getDepartments', user_1.getDepartments);
exports.default = router;
//# sourceMappingURL=user.js.map