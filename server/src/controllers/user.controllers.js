import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Exchange } from "../models/exchange.models.js";
import { SkillProficiency } from "../models/skillProficiency.models.js";
import { VerifiedSkill } from "../models/verifiedSkill.models.js";
import { PushSubscription } from "../models/pushSubscription.models.js"; // New import
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { mailSender } from "../utils/mailSender.js";
import {
    isValidEmail,
    isValidPassword,
    sanitizeHTML,
} from "../utils/validation.js";
import crypto from "crypto";
import { triggerReviewAnalysis } from "../services/reviewAnalysis.service.js";
import { getCache, setCache, delCache } from "../utils/cache.js"; // Import cache utilities

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    console.log(
        ` fullname: ${fullName}, email: ${email}, username: ${username}, password: ${password}`
    );

    if (
        [fullName, email, username, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!isValidEmail(email)) {
        throw new ApiError(400, "Please provide a valid email address.");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new ApiError(
            400,
            "Username can only contain letters, numbers, and underscores."
        );
    }

    if (!isValidPassword(password)) {
        throw new ApiError(
            400,
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        );
    }

    const lowercasedUsername = username.toLowerCase();
    const lowercasedEmail = email.toLowerCase();

    const existedUser = await User.findOne({
        $or: [{ email: lowercasedEmail }, { username: lowercasedUsername }],
    });

    if (existedUser) {
        throw new ApiError(
            409,
            "User with this email or username already exists."
        );
    }

    const user = await User.create({
        fullName: sanitizeHTML(fullName),
        email: lowercasedEmail,
        password,
        username: sanitizeHTML(lowercasedUsername),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log(`email: ${email}, password: ${password}`);

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "Invalid user credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id)
        .populate("topicsToTeach", "_id name")
        .populate("topicsToLearn", "_id name")
        .populate("achievements")
        .select("-password -refreshToken")
        .lean();

    const [proficiencies, verifiedSkills] = await Promise.all([
        SkillProficiency.find({ user: user._id }).populate("topic", "_id name"),
        VerifiedSkill.find({ user: user._id }).select("topic"),
    ]);

    loggedInUser.proficiencies = proficiencies;
    loggedInUser.verifiedSkills = verifiedSkills;

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                },
                "User logged In successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    // Invalidate user cache on logout
    await delCache(`user:${user._id}`);
    await delCache(`user-slug:${user.slug}`);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const cacheKey = `user:${req.user._id}`;

    // 1. Check cache first
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedUser,
                    "User profile fetched from cache successfully"
                )
            );
    }

    // 2. If not in cache, fetch from DB
    const user = await User.findById(req.user._id)
        .populate("topicsToTeach", "_id name")
        .populate("topicsToLearn", "_id name")
        .populate("achievements")
        .select("-password -refreshToken")
        .lean();

    const [proficiencies, verifiedSkills] = await Promise.all([
        SkillProficiency.find({ user: req.user._id }).populate(
            "topic",
            "_id name"
        ),
        VerifiedSkill.find({ user: req.user._id }).select("topic"),
    ]);

    user.proficiencies = proficiencies;
    user.verifiedSkills = verifiedSkills;

    // 3. Store result in cache for future requests
    await setCache(cacheKey, user, 1800); // Cache for 30 minutes

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, bio, preferredLanguage, languagesSpoken } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = sanitizeHTML(fullName);
    if (bio) updateData.bio = sanitizeHTML(bio);
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (languagesSpoken && Array.isArray(languagesSpoken)) {
        updateData.languagesSpoken = languagesSpoken
            .map((lang) =>
                typeof lang === "string" ? sanitizeHTML(lang.trim()) : ""
            )
            .filter((lang) => lang);
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided for update.");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateData },
        { new: true }
    ).select("-password");

    // Invalidate cache after update
    await delCache(`user:${user._id}`);
    await delCache(`user-slug:${user.slug}`);

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    // Invalidate cache after update
    await delCache(`user:${user._id}`);
    await delCache(`user-slug:${user.slug}`);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserTopics = asyncHandler(async (req, res) => {
    const { topicsToTeach, topicsToLearn } = req.body;

    if (!Array.isArray(topicsToTeach) || !Array.isArray(topicsToLearn)) {
        throw new ApiError(400, "Topics must be provided as arrays.");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                topicsToTeach: topicsToTeach,
                topicsToLearn: topicsToLearn,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    // Invalidate cache after update
    await delCache(`user:${user._id}`);
    await delCache(`user-slug:${user.slug}`);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User topics updated successfully."));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        // To prevent user enumeration, send a generic success message even if the user doesn't exist.
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "If an account with that email exists, a password reset link has been sent."
                )
            );
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password:</p>
        <a href="${resetURL}" target="_blank">${resetURL}</a>
        <p>This link will expire in 1 hour.</p>
    `;

    try {
        await mailSender(
            user.email,
            "Knowle - Password Reset Request",
            message
        );
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "If an account with that email exists, a password reset link has been sent."
                )
            );
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "Email could not be sent.");
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const resetToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const { password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(
            400,
            "Password reset token is invalid or has expired."
        );
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate user cache
    await delCache(`user:${user._id}`);
    await delCache(`user-slug:${user.slug}`);

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Password has been reset successfully.")
        );
});

const getPublicProfile = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const cacheKey = `user-slug:${slug}`;
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedUser,
                    "Public profile fetched from cache successfully"
                )
            );
    }

    const user = await User.findOne({ slug: slug })
        .select(
            "-password -refreshToken -email -resetPasswordToken -resetPasswordExpires"
        )
        .lean();

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const visibility = user.profileVisibility;
    if (!visibility.bio) user.bio = undefined;
    if (!visibility.skills) {
        user.topicsToLearn = undefined;
        user.topicsToTeach = undefined;
    }
    if (!visibility.achievements) user.achievements = undefined;

    // Fetch details even if hidden, but only populate if visible
    const populatePromises = [];
    if (visibility.skills) {
        populatePromises.push(
            User.populate(user, { path: "topicsToTeach", select: "name" })
        );
        populatePromises.push(
            User.populate(user, { path: "topicsToLearn", select: "name" })
        );
    }
    if (visibility.achievements) {
        populatePromises.push(User.populate(user, { path: "achievements" }));
    }

    await Promise.all(populatePromises);

    // Fetch proficiencies and verified skills separately to apply visibility
    const userWithDetails = { ...user };
    if (visibility.skills) {
        const [proficiencies, verifiedSkills] = await Promise.all([
            SkillProficiency.find({ user: user._id })
                .populate("topic", "_id name")
                .lean(),
            VerifiedSkill.find({ user: user._id }).select("topic").lean(),
        ]);
        userWithDetails.proficiencies = proficiencies;
        userWithDetails.verifiedSkills = verifiedSkills;
    }

    await setCache(cacheKey, userWithDetails, 300); // Cache for 5 mins

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userWithDetails,
                "Public profile fetched successfully"
            )
        );
});

const updateProfileVisibility = asyncHandler(async (req, res) => {
    const { bio, skills, achievements } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                "profileVisibility.bio": !!bio,
                "profileVisibility.skills": !!skills,
                "profileVisibility.achievements": !!achievements,
            },
        },
        { new: true }
    );

    // Invalidate caches as visibility rules have changed
    await delCache(`user:${user._id}`);
    await delCache(`user-slug:${user.slug}`);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user.profileVisibility,
                "Profile visibility updated."
            )
        );
});

const getTeacherAnalytics = asyncHandler(async (req, res) => {
    const teacherId = req.user._id;

    // 1. Get total sessions taught and average rating from user model
    const teacher = await User.findById(teacherId).select(
        "exchangesAsTeacherCount averageRating"
    );

    if (!teacher) {
        throw new ApiError(404, "Teacher not found.");
    }

    // 2. Aggregate exchanges to find unique students and popular topics
    const exchangeAnalytics = await Exchange.aggregate([
        // Match completed exchanges where the user was a teacher
        {
            $match: {
                status: "completed",
                $or: [
                    { initiator: teacherId }, // User taught their `topicToTeach`
                    { receiver: teacherId }, // User taught their `topicToLearn` (as part of the exchange)
                ],
            },
        },
        // Group to find unique students and topics taught
        {
            $group: {
                _id: null,
                // Get the student (the other person in the exchange)
                students: {
                    $addToSet: {
                        $cond: {
                            if: { $eq: ["$initiator", teacherId] },
                            then: "$receiver",
                            else: "$initiator",
                        },
                    },
                },
                // Get the topic taught by the teacher in each exchange
                topics: {
                    $push: {
                        $cond: {
                            if: { $eq: ["$initiator", teacherId] },
                            then: "$topicToTeach",
                            else: "$topicToLearn",
                        },
                    },
                },
            },
        },
    ]);

    let uniqueStudents = 0;
    let popularTopics = [];

    if (exchangeAnalytics.length > 0) {
        const analyticsData = exchangeAnalytics[0];
        uniqueStudents = analyticsData.students.length;

        // Count topic occurrences
        const topicCounts = analyticsData.topics.reduce((acc, topicId) => {
            const idStr = topicId.toString();
            acc[idStr] = (acc[idStr] || 0) + 1;
            return acc;
        }, {});

        const topicIds = Object.keys(topicCounts).map(
            (id) => new mongoose.Types.ObjectId(id)
        );
        const topics = await Topic.find({ _id: { $in: topicIds } }).select(
            "name"
        );

        popularTopics = topics
            .map((topic) => ({
                topic: topic.name,
                count: topicCounts[topic._id.toString()],
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5
    }

    const response = {
        totalSessionsTaught: teacher.exchangesAsTeacherCount,
        averageRating: teacher.averageRating,
        uniqueStudents,
        popularTopics,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                "Teacher analytics retrieved successfully."
            )
        );
});

const regenerateReviewSummary = asyncHandler(async (req, res) => {
    const io = req.app.get("io");

    // The service is fire-and-forget. The controller's job is just to start it.
    // The service itself will handle caching and notifications.
    triggerReviewAnalysis(req.user._id, io).catch((err) => {
        // Log the error but don't fail the request, as it's a background process.
        console.error("Error triggering background review analysis:", err);
    });

    return res
        .status(202)
        .json(
            new ApiResponse(
                202,
                null,
                "AI review analysis has been initiated. You will be notified upon completion."
            )
        );
});

const getRelatedUsers = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
        "topicsToTeach topicsToLearn"
    );
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const sharedInterestTopics = [...user.topicsToTeach, ...user.topicsToLearn];

    const relatedUsers = await User.find({
        _id: { $ne: userId },
        $or: [
            { topicsToTeach: { $in: sharedInterestTopics } },
            { topicsToLearn: { $in: sharedInterestTopics } },
        ],
    })
        .limit(5)
        .select("fullName slug avatar");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                relatedUsers,
                "Related users fetched successfully."
            )
        );
});

// New controller for saving push subscriptions
const savePushSubscription = asyncHandler(async (req, res) => {
    const { subscription } = req.body;
    const userId = req.user._id;

    if (!subscription || !subscription.endpoint) {
        throw new ApiError(400, "Push subscription object is required.");
    }

    await PushSubscription.findOneAndUpdate(
        { user: userId },
        { subscription: subscription, user: userId },
        { upsert: true, new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Push subscription saved successfully.")
        );
});

export {
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
    getRelatedUsers,
    savePushSubscription,
};
