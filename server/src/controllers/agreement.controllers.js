import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Agreement } from "../models/agreement.models.js";
import { Exchange } from "../models/exchange.models.js";
import { redisClient } from "../utils/cache.js";
import mongoose from "mongoose";

const createAgreement = asyncHandler(async (req, res) => {
    const { receiverId, learningObjectives, proposedDuration, topicToLearnId, topicToTeachId } = req.body;
    const proposerId = req.user._id;

    if (!receiverId || !learningObjectives || !proposedDuration || !topicToLearnId || !topicToTeachId) {
        throw new ApiError(400, "All fields for the agreement are required.");
    }
    
    if (proposerId.toString() === receiverId) {
        throw new ApiError(400, "You cannot create an agreement with yourself.");
    }

    const existingAgreement = await Agreement.findOne({
        $or: [
            { proposer: proposerId, receiver: receiverId },
            { proposer: receiverId, receiver: proposerId }
        ],
        status: 'pending'
    });

    if (existingAgreement) {
        throw new ApiError(409, "A pending agreement with this user already exists.");
    }

    const agreement = await Agreement.create({
        proposer: proposerId,
        receiver: receiverId,
        learningObjectives,
        proposedDuration,
        topicToLearn: topicToLearnId,
        topicToTeach: topicToTeachId,
    });
    
    // Publish an event for the real-time service to pick up
    if (redisClient?.isReady) {
        const payload = JSON.stringify({ agreement, proposerName: req.user.fullName });
        await redisClient.publish('agreement:new', payload);
    }

    return res.status(201).json(new ApiResponse(201, agreement, "Agreement proposal sent successfully."));
});

const getUserAgreements = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const agreements = await Agreement.find({ $or: [{ proposer: userId }, { receiver: userId }] })
        .populate('proposer', 'fullName username avatar')
        .populate('receiver', 'fullName username avatar')
        .sort({ createdAt: -1 });
        
    return res.status(200).json(new ApiResponse(200, agreements, "User agreements retrieved successfully."));
});

const getAgreementDetails = asyncHandler(async (req, res) => {
    const { agreementId } = req.params;
    const userId = req.user._id;

    const agreement = await Agreement.findById(agreementId)
        .populate('proposer', 'fullName')
        .populate('receiver', 'fullName');

    if (!agreement) {
        throw new ApiError(404, "Agreement not found.");
    }

    if (!agreement.proposer._id.equals(userId) && !agreement.receiver._id.equals(userId)) {
        throw new ApiError(403, "You are not authorized to view this agreement.");
    }

    return res.status(200).json(new ApiResponse(200, agreement, "Agreement details retrieved successfully."));
});

const updateAgreementStatus = asyncHandler(async (req, res) => {
    const { agreementId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!['accepted', 'declined', 'cancelled'].includes(status)) {
        throw new ApiError(400, "Invalid status provided.");
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
        throw new ApiError(404, "Agreement not found.");
    }

    if (agreement.status !== 'pending') {
        throw new ApiError(400, `This agreement is already ${agreement.status} and cannot be updated.`);
    }

    // Authorization checks
    if ((status === 'accepted' || status === 'declined') && !agreement.receiver.equals(userId)) {
        throw new ApiError(403, "Only the receiver can accept or decline an agreement.");
    }
    if (status === 'cancelled' && !agreement.proposer.equals(userId)) {
        throw new ApiError(403, "Only the proposer can cancel an agreement.");
    }
    
    agreement.status = status;

    if (status === 'accepted') {
        // Create the corresponding exchange
        const exchange = await Exchange.create({
            initiator: agreement.proposer,
            receiver: agreement.receiver,
            topicToLearn: agreement.topicToLearn,
            topicToTeach: agreement.topicToTeach,
            status: 'accepted' // Start in 'accepted' state directly
        });
        agreement.relatedExchange = exchange._id;
    }

    await agreement.save();

    // Publish an event for the real-time service
    if (redisClient?.isReady) {
        const payload = JSON.stringify({ agreement, actorName: req.user.fullName });
        await redisClient.publish('agreement:update', payload);
    }
    
    return res.status(200).json(new ApiResponse(200, agreement, `Agreement ${status} successfully.`));
});


export {
    createAgreement,
    getUserAgreements,
    getAgreementDetails,
    updateAgreementStatus,
};