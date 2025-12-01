import { Dispute, DisputeMessage } from "../models/dispute.model.js";
import { User } from "../models/user.model.js";

class ApiError extends Error {
    constructor(statusCode, message) { super(message); this.statusCode = statusCode; }
}
class ApiResponse {
    constructor(statusCode, data, message = "Success") { this.statusCode = statusCode; this.data = data; this.message = message; this.success = statusCode < 400; }
}
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


// --- Support Controllers ---

export const getAllDisputes = asyncHandler(async (req, res) => {
    const { status, assigned } = req.query;
    const query = {};

    if (status && ['open', 'under_review', 'resolved'].includes(status)) {
        query.status = status;
    }
    if (assigned === 'me') {
        query.assignee = req.user._id;
    }
    if (assigned === 'unassigned') {
        query.assignee = null;
    }

    const disputes = await Dispute.find(query)
        .populate('complainant', 'fullName username')
        .populate('respondent', 'fullName username')
        .populate('assignee', 'fullName')
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched successfully."));
});

export const assignDispute = asyncHandler(async (req, res) => {
    const { disputeId } = req.params;
    const agentId = req.user._id;

    const dispute = await Dispute.findByIdAndUpdate(
        disputeId,
        { assignee: agentId, assignedAt: new Date(), status: 'under_review' },
        { new: true }
    ).populate('assignee', 'fullName');

    if (!dispute) throw new ApiError(404, "Dispute not found.");

    res.status(200).json(new ApiResponse(200, dispute, "Dispute assigned successfully."));
});

export const resolveDispute = asyncHandler(async (req, res) => {
    const { disputeId } = req.params;
    const { resolutionMessage } = req.body;

    if (!resolutionMessage) throw new ApiError(400, "A resolution message is required.");

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) throw new ApiError(404, "Dispute not found.");

    dispute.status = 'resolved';
    dispute.resolution = resolutionMessage;
    await dispute.save();

    await DisputeMessage.create({
        dispute: disputeId,
        author: req.user._id,
        content: `Case Resolved: ${resolutionMessage}`,
        isSupportMessage: true,
    });

    res.status(200).json(new ApiResponse(200, dispute, "Dispute resolved successfully."));
});

// --- Admin Controllers ---

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('fullName username email role accountStatus createdAt').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, users, "Users fetched successfully."));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    const validStatuses = ['active', 'warned', 'suspended', 'banned'];

    if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid account status.");

    const user = await User.findByIdAndUpdate(userId, { accountStatus: status }, { new: true }).select('fullName accountStatus');
    if (!user) throw new ApiError(404, "User not found.");

    res.status(200).json(new ApiResponse(200, user, "User status updated successfully."));
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const validRoles = ['user', 'mentor', 'support', 'admin'];
    
    if (!validRoles.includes(role)) throw new ApiError(400, "Invalid role.");
    
    if (req.user._id.equals(userId) && req.user.role === 'admin' && role !== 'admin') {
        throw new ApiError(400, "Admins cannot change their own role.");
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('fullName role');
    if (!user) throw new ApiError(404, "User not found.");

    res.status(200).json(new ApiResponse(200, user, "User role updated successfully."));
});
