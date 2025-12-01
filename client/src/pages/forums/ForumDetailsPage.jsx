import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getForumDetails, getPostsForForum, createPost } from '../../api/forumApi';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const ForumDetailsPage = () => {
    const { id } = useParams();
    const [forum, setForum] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for new post form
    const [showPostForm, setShowPostForm] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [postLoading, setPostLoading] = useState(false);

    const fetchForumAndPosts = async () => {
        setLoading(true);
        try {
            const [forumRes, postsRes] = await Promise.all([
                getForumDetails(id),
                getPostsForForum(id)
            ]);
            setForum(forumRes.data.data);
            setPosts(postsRes.data.data);
        } catch (error) {
            console.error("Failed to fetch forum details", error);
            toast.error("Could not load forum details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForumAndPosts();
    }, [id]);
    
    const handleCreatePost = async (e) => {
        e.preventDefault();
        setPostLoading(true);
        try {
            const response = await createPost(id, { title: postTitle, content: postContent });
            setPosts([response.data.data, ...posts]);
            toast.success("Post created!");
            setPostTitle('');
            setPostContent('');
            setShowPostForm(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create post.");
        } finally {
            setPostLoading(false);
        }
    };

    if (loading) return <p>Loading forum...</p>;
    if (!forum) return <p>Forum not found.</p>;

    return (
        <div>
            <div className="bg-surface p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-4xl font-bold text-textPrimary">{forum.name}</h1>
                <p className="text-textSecondary mt-2">{forum.description}</p>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Posts</h2>
                <Button onClick={() => setShowPostForm(!showPostForm)}>
                    {showPostForm ? 'Cancel' : 'New Post'}
                </Button>
            </div>

            {showPostForm && (
                <div className="bg-surface p-6 rounded-lg shadow-md mb-8">
                    <form onSubmit={handleCreatePost}>
                        <div className="mb-4">
                            <label htmlFor="postTitle" className="block text-sm font-medium text-textSecondary">Title</label>
                            <input id="postTitle" type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="postContent" className="block text-sm font-medium text-textSecondary">Content</label>
                            <textarea id="postContent" value={postContent} onChange={(e) => setPostContent(e.target.value)} required rows="5" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                        <Button type="submit" disabled={postLoading}>{postLoading ? 'Posting...' : 'Create Post'}</Button>
                    </form>
                </div>
            )}
            
            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <Link to={`/posts/${post._id}`} key={post._id} className="block bg-surface p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-primary">{post.title}</h3>
                                <div className="text-sm text-textSecondary flex items-center space-x-4">
                                    <span>💬 {post.replyCount}</span>
                                    <span>👍 {post.upvotes.length}</span>
                                </div>
                            </div>
                            <div className="flex items-center mt-3 text-sm text-textSecondary">
                                <img src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.fullName}`} alt={post.author.fullName} className="w-6 h-6 rounded-full mr-2" />
                                <span>{post.author.fullName}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-textSecondary text-center py-8">No posts in this forum yet. Start the conversation!</p>
                )}
            </div>
        </div>
    );
};

export default ForumDetailsPage;
