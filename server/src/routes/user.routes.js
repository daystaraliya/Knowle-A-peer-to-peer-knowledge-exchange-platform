import { Router } from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserTopics,
    forgotPassword,
    resetPassword,
    getPublicProfile,
    updateProfileVisibility,
    getTeacherAnalytics,
    regenerateReviewSummary,
    savePushSubscription
} from '../controllers/user.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);
router.route('/public/:username').get(getPublicProfile);

// Secured Routes
router.route('/logout').post(authMiddleware, logoutUser);
router.route('/profile').get(authMiddleware, getCurrentUser);
router.route('/profile').patch(authMiddleware, updateAccountDetails);
router.route('/avatar').patch(authMiddleware, upload.single('avatar'), updateUserAvatar);
router.route('/topics').patch(authMiddleware, updateUserTopics);
router.route('/profile/visibility').patch(authMiddleware, updateProfileVisibility);
router.route('/analytics/teacher').get(authMiddleware, getTeacherAnalytics);
router.route('/reviews/regenerate').post(authMiddleware, regenerateReviewSummary);
router.route('/push/subscribe').post(authMiddleware, savePushSubscription);


export default router;