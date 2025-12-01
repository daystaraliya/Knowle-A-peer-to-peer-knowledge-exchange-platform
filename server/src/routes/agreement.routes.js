import { Router } from 'express';
import {
    createAgreement,
    getUserAgreements,
    getAgreementDetails,
    updateAgreementStatus,
} from '../controllers/agreement.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All agreement routes are protected
router.use(authMiddleware);

router.route('/')
    .post(createAgreement)
    .get(getUserAgreements);

router.route('/:agreementId')
    .get(getAgreementDetails);
    
router.route('/:agreementId/status')
    .patch(updateAgreementStatus);

export default router;