import { Topic } from '../models/topic.models.js';
import { ApiError } from './ApiError.js';

/**
 * Normalizes a topic name to a consistent format.
 * - Trims whitespace.
 * - Capitalizes the first letter of each word.
 * - Handles special cases like ".js" to be lowercase.
 * e.g., " react.js " -> "React.js", "node js" -> "Node Js"
 * @param {string} name - The raw topic name.
 * @returns {string} The normalized topic name.
 */
const normalizeTopicName = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name
        .trim()
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 0) // Filter out empty strings from multiple spaces
        .map(word => {
            // Handle cases like "react.js" -> "React.js"
            if (word.includes('.')) {
                const parts = word.split('.');
                const mainPart = parts[0];
                const extension = parts.slice(1).join('.');
                return mainPart.charAt(0).toUpperCase() + mainPart.slice(1) + '.' + extension;
            }
            // Handle cases like "node" -> "Node"
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
};

/**
 * Finds an existing topic by its normalized name (case-insensitive) or creates a new one if it doesn't exist.
 * @param {string} name - The name of the topic.
 * @param {string} [category='User Submitted'] - The category for the new topic if created.
 * @returns {Promise<object>} The Mongoose document for the topic.
 */
export const createOrGetTopic = async (name, category = 'User Submitted') => {
    const normalizedName = normalizeTopicName(name);
    if (!normalizedName) {
        throw new ApiError(400, 'Topic name cannot be empty.');
    }

    // Case-insensitive search using a regex. `^` and `$` ensure it matches the whole string.
    const existingTopic = await Topic.findOne({
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
    });

    if (existingTopic) {
        // If an existing topic is found, return it to ensure data consistency.
        return existingTopic;
    }

    // If it doesn't exist, create it.
    const newTopic = await Topic.create({
        name: normalizedName, // Store with the normalized name
        category,
        description: `A topic for ${normalizedName}, added by the community.`
    });

    return newTopic;
};
