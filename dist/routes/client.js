"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../controller/client");
const router = express_1.default.Router();
// Get Task(s) based on ID (Your existing code)
router.post('/getClients', client_1.getClients);
// =================================================================
// START: New Endpoint to Create a Task
// =================================================================
router.post('/createClient', client_1.createClient);
// =================================================================
// END: New Endpoint to Create a Task
// =================================================================
router.post('/updateClient', client_1.updateClient);
router.post('/deleteClient', client_1.deleteClient);
exports.default = router;
//# sourceMappingURL=client.js.map