import apiClient from './apiClient';

const FORUMS_URL = `/api/v1/forums`;
const POSTS_URL = `/api/v1/posts`;

// Forum Endpoints
export const getAllForums = () => apiClient.get(FORUMS_URL);
export const createForum = (forumData) => apiClient.post(FORUMS_URL, forumData);
export const getForumDetails = (forumId) => apiClient.get(`${FORUMS_URL}/${forumId}`);

// Post Endpoints
export const getPostsForForum = (forumId) => apiClient.get(`${FORUMS_URL}/${forumId}/posts`);
export const createPost = (forumId, postData) => apiClient.post(`${FORUMS_URL}/${forumId}/posts`, postData);
export const getPostWithReplies = (postId) => apiClient.get(`${POSTS_URL}/${postId}`);
export const createReply = (postId, replyData) => apiClient.post(`${POSTS_URL}/${postId}/reply`, replyData);
export const toggleUpvote = (postId) => apiClient.post(`${POSTS_URL}/${postId}/upvote`);