import { User } from '../models/user.models.js';
import { Exchange } from '../models/exchange.models.js';
import { analyzeAllUserReviews } from '../utils/gemini.js';

const MIN_REVIEWS_FOR_ANALYSIS = 3;
const NEW_REVIEWS_THRESHOLD = 3; // Number of new reviews required to trigger a new analysis

/**
 * Triggers an AI-powered analysis of all reviews for a given user.
 * This is designed to be a fire-and-forget async function.
 * @param {mongoose.Types.ObjectId} userId - The ID of the user to analyze.
 * @param {object} io - The Socket.IO server instance for real-time notifications.
 */
export const triggerReviewAnalysis = async (userId, io) => {
    try {
        // 1. Find all completed exchanges for the user
        const exchanges = await Exchange.find({
            status: 'completed',
            $or: [{ initiator: userId }, { receiver: userId }],
            $or: [
                { initiatorReview: { $exists: true, $ne: null, $ne: "" } },
                { receiverReview: { $exists: true, $ne: null, $ne: "" } }
            ]
        }).select('initiator receiver initiatorReview receiverReview');

        // 2. Collect all relevant reviews
        const reviews = exchanges.reduce((acc, ex) => {
            // If the user was the receiver, the initiator's review is about them
            if (ex.receiver.equals(userId) && ex.initiatorReview) {
                acc.push(ex.initiatorReview);
            }
            // If the user was the initiator, the receiver's review is about them
            if (ex.initiator.equals(userId) && ex.receiverReview) {
                acc.push(ex.receiverReview);
            }
            return acc;
        }, []);
        
        // 3. Check if there are enough reviews
        if (reviews.length < MIN_REVIEWS_FOR_ANALYSIS) {
            console.log(`Skipping review analysis for user ${userId}, not enough reviews (${reviews.length}).`);
            return;
        }

        // 4. Cost-saving check: see if enough new reviews have been added since the last summary
        const user = await User.findById(userId).select('lastReviewSummaryReviewCount');
        if (user && reviews.length < (user.lastReviewSummaryReviewCount + NEW_REVIEWS_THRESHOLD)) {
            console.log(`Skipping review analysis for user ${userId}: not enough new reviews. Current: ${reviews.length}, Last summary at: ${user.lastReviewSummaryReviewCount}. Required new: ${NEW_REVIEWS_THRESHOLD}.`);
            return;
        }

        // 5. Call Gemini for analysis
        const summary = await analyzeAllUserReviews(reviews);

        // 6. Update the user document with the summary and the new review count
        await User.findByIdAndUpdate(userId, {
            $set: {
                reviewSummary: {
                    positive: summary.positive,
                    negative: summary.negative,
                    lastUpdated: new Date()
                },
                lastReviewSummaryReviewCount: reviews.length // Update the count
            }
        });
        
        console.log(`✅ AI review summary updated for user ${userId}`);

        // 7. Emit socket event to notify the user
        if (io) {
            io.to(`user-${userId}`).emit('reviewSummaryUpdated');
        }

    } catch (error) {
        console.error(`❌ Failed to process review analysis for user ${userId}:`, error);
    }
};