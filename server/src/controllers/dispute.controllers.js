import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Dispute, DisputeMessage } from "../models/dispute.models.js";
import { Exchange } from "../models/exchange.models.js";
import { getInitialDisputeResponse } from "../utils/gemini.js";
import mongoose from "mongoose";

/**
 * @description Creates a new dispute ticket related to an exchange.
 * @route POST /api/v1/disputes
 * @access Private
 */
const createDispute = asyncHandler(async (req, res) => {
    const { exchangeId, reason, description } = req.body;
    const complainantId = req.user._id;

    if (!exchangeId || !reason || !description) {
        throw new ApiError(400, "Exchange ID, reason, and description are required.");
    }

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) throw new ApiError(404, "Related exchange not found.");

    const isParticipant = exchange.initiator.equals(complainantId) || exchange.receiver.equals(complainantId);
    if (!isParticipant) {
        throw new ApiError(403, "You must be a participant to file a dispute for this exchange.");
    }
    
    const existingDispute = await Dispute.findOne({ relatedExchange: exchangeId });
    if (existingDispute) {
        throw new ApiError(409, "A dispute has already been filed for this exchange.");
    }

    const respondentId = exchange.initiator.equals(complainantId) ? exchange.receiver : exchange.initiator;

    const dispute = await Dispute.create({
        relatedExchange: exchangeId,
        complainant: complainantId,
        respondent: respondentId,
        reason,
        description,
    });

    // AI Assisted Initial Response
    try {
        const aiResponseText = await getInitialDisputeResponse({ reason, description });
        
        await DisputeMessage.create({
            dispute: dispute._id,
            content: aiResponseText,
            isSupportMessage: true,
            // author is intentionally null for AI messages
        });
    } catch (aiError) {
        // Log the error but don't fail the entire dispute creation process.
        // The dispute is already created, which is the most critical part.
        console.error("AI dispute response generation failed:", aiError);
    }

    return res.status(201).json(new ApiResponse(201, dispute, "Dispute filed successfully. Our team will review it shortly."));
});

/**
 * @description Fetches all disputes a user is involved in (as complainant or respondent).
 * @route GET /api/v1/disputes
 * @access Private
 */
const getUserDisputes = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const disputes = await Dispute.find({ $or: [{ complainant: userId }, { respondent: userId }] })
        .populate('relatedExchange', 'topicToLearn topicToTeach')
        .populate('complainant', 'fullName')
        .populate('respondent', 'fullName')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, disputes, "User disputes retrieved successfully."));
});

/**
 * @description Fetches the details of a single dispute and all its associated messages.
 * @route GET /api/v1/disputes/:disputeId
 * @access Private (Participant only)
 */
const getDisputeDetails = asyncHandler(async (req, res) => {
    const { disputeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
        throw new ApiError(400, "Invalid dispute ID.");
    }

    const dispute = await Dispute.findById(disputeId)
        .populate('relatedExchange', '_id')
        .populate('complainant', 'fullName')
        .populate('respondent', 'fullName');

    if (!dispute) throw new ApiError(404, "Dispute not found.");

    if (!dispute.complainant._id.equals(userId) && !dispute.respondent._id.equals(userId)) {
        throw new ApiError(403, "You are not authorized to view this dispute.");
    }

    const messages = await DisputeMessage.find({ dispute: disputeId })
        .populate('author', 'fullName avatar')
        .sort({ createdAt: 'asc' });

    const responsePayload = {
        dispute: dispute.toObject(),
        messages: messages,
    };

    return res.status(200).json(new ApiResponse(200, responsePayload, "Dispute details and messages retrieved."));
});

/**
 * @description Adds a new message to a dispute conversation.
 * @route POST /api/v1/disputes/:disputeId/messages
 * @access Private (Participant only)
 */
const postDisputeMessage = asyncHandler(async (req, res) => {
    const { disputeId } = req.params;
    const { content } = req.body;
    const authorId = req.user._id;

    if (!content) throw new ApiError(400, "Message content cannot be empty.");

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) throw new ApiError(404, "Dispute not found.");

    const isParticipant = dispute.complainant.equals(authorId) || dispute.respondent.equals(authorId);
    if (!isParticipant) {
        throw new ApiError(403, "You cannot post messages in this dispute.");
    }
    
    if (dispute.status === 'resolved') {
        throw new ApiError(400, "This dispute is resolved and can no longer be commented on.");
    }

    const message = await DisputeMessage.create({
        dispute: disputeId,
        author: authorId,
        content,
    });

    const populatedMessage = await DisputeMessage.findById(message._id).populate('author', 'fullName avatar');

    // Here you would typically emit a socket event to notify other parties in real-time.

    return res.status(201).json(new ApiResponse(201, populatedMessage, "Message posted successfully."));
});


// Conceptual function for admins, not exposed via routes for now.
const resolveDispute = async (disputeId, resolution, actionTaken) => {
    // 1. Find the dispute
    // 2. Update its status and resolution text
    // 3. If action is taken (e.g., 'warn', 'suspend'), update the respondent's user.accountStatus
    // 4. Notify both parties
}


export {
    createDispute,
    getUserDisputes,
    getDisputeDetails,
    postDisputeMessage,
};