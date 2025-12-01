import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import {
    getAllDisputes,
    assignDispute,
    resolveDispute,
    getAllUsers,
    updateUserStatus,
    updateUserRole
} from '../controllers/admin.controllers.js';

const router = Router();

// --- Support Routes (accessible by 'support' and 'admin') ---
const supportAccess = requireRole(['support', 'admin']);
router.get('/support/disputes', authMiddleware, supportAccess, getAllDisputes);
router.post('/support/disputes/:disputeId/assign', authMiddleware, supportAccess, assignDispute);
router.post('/support/disputes/:disputeId/resolve', authMiddleware, supportAccess, resolveDispute);

// --- Admin Routes (accessible by 'admin' only) ---
const adminAccess = requireRole(['admin']);
router.get('/admin/users', authMiddleware, adminAccess, getAllUsers);
router.patch('/admin/users/:userId/status', authMiddleware, adminAccess, updateUserStatus);
router.patch('/admin/users/:userId/role', authMiddleware, adminAccess, updateUserRole);

export default router;
