import { createClient } from 'redis';
import { ApiError } from './ApiError.js';

let redisClient;

/**
 * Initializes the Redis client and connects to the server.
 * This should be called once when the application starts.
 */
const initRedis = async () => {
    redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis connected successfully.'));

    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        throw new ApiError(500, "Could not connect to the caching service.");
    }
};

/**
 * Retrieves a value from the cache for a given key.
 * @param {string} key The key to retrieve.
 * @returns {Promise<object|null>} The parsed JSON object or null if not found.
 */
const getCache = async (key) => {
    if (!redisClient?.isOpen) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error(`Redis GET error for key ${key}:`, err);
        return null;
    }
};

/**
 * Stores a value in the cache with an expiration time.
 * @param {string} key The key to store the value under.
 * @param {object} value The JSON object to store.
 * @param {number} expirationInSeconds The time-to-live for the cache entry in seconds. Default is 1 hour.
 */
const setCache = async (key, value, expirationInSeconds = 3600) => {
    if (!redisClient?.isOpen) return;
    try {
        await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    } catch (err) {
        console.error(`Redis SET error for key ${key}:`, err);
    }
};

/**
 * Deletes a key from the cache. Used for cache invalidation.
 * @param {string} key The key to delete.
 */
const delCache = async (key) => {
    if (!redisClient?.isOpen) return;
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error(`Redis DEL error for key ${key}:`, err);
    }
};

export {
    initRedis,
    getCache,
    setCache,
    delCache,
    redisClient
};
