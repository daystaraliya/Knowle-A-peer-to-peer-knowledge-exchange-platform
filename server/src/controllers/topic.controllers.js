import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Topic } from "../models/topic.models.js";
import { createOrGetTopic } from "../utils/topic.utils.js";

const createTopic = asyncHandler(async (req, res) => {
    const { name, category } = req.body;

    if (!name) {
        throw new ApiError(400, "Topic name is required");
    }

    // This function now handles normalization and finds or creates the topic
    const topic = await createOrGetTopic(name, category);

    // Using 201 as the topic resource is now available as a result of the request
    return res.status(201).json(new ApiResponse(201, topic, "Topic processed successfully."));
});

const getAllTopics = asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const topics = await Topic.find(query).sort({ name: 1 });

    return res.status(200).json(new ApiResponse(200, topics, "Topics retrieved successfully"));
});

export { createTopic, getAllTopics };
