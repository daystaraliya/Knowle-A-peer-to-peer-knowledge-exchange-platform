import { Router } from 'express';
import {
    createDispute,
    getUserDisputes,
    getDisputeDetails,
    postDisputeMessage
} from '../controllers/dispute.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All dispute routes are protected
router.use(authMiddleware);

router.route('/')
    .post(createDispute)
    .get(getUserDisputes);

router.route('/:disputeId')
    .get(getDisputeDetails);

router.route('/:disputeId/messages')
    .post(postDisputeMessage);

export default router;