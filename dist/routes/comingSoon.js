"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comingSoon_1 = require("../controller/comingSoon");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get coming soon information
router.get('/info', auth_1.validateToken, (req, res, next) => {
    console.log('COMING SOON ROUTE: INFO request received');
    next();
}, comingSoon_1.getComingSoon);
// Get coming soon development status
router.get('/status', auth_1.validateToken, (req, res, next) => {
    console.log('COMING SOON ROUTE: STATUS request received');
    next();
}, comingSoon_1.getComingSoonStatus);
exports.default = router;
//# sourceMappingURL=comingSoon.js.map