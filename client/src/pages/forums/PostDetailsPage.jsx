import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostWithReplies, createReply } from '../../api/forumApi';
import Button from '../../components/Button';
import PostComponent from '../../components/forums/Post';
import toast from 'react-hot-toast';

const PostDetailsPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Reply form state
    const [replyContent, setReplyContent] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const response = await getPostWithReplies(id);
                const { replies, ...mainPost } = response.data.data;
                setPost(mainPost);
                setReplies(replies);
            } catch (error) {
                console.error("Failed to fetch post", error);
                toast.error("Could not load the post.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setReplyLoading(true);
        try {
            const response = await createReply(id, { content: replyContent });
            setReplies([...replies, response.data.data]);
            setReplyContent('');
            toast.success("Reply posted!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post reply.");
        } finally {
            setReplyLoading(false);
        }
    };

    if (loading) return <p>Loading post...</p>;
    if (!post) return <p>Post not found.</p>;

    return (
        <div>
            <div className="mb-4">
                <Link to={`/forums/${post.forum}`} className="text-primary hover:underline">&larr; Back to Forum</Link>
            </div>

            <PostComponent post={post} />

            <div className="my-8">
                <h3 className="text-xl font-bold mb-4">{replies.length} Replies</h3>
                <div className="bg-surface p-6 rounded-lg shadow-md">
                    <form onSubmit={handleReplySubmit}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        ></textarea>
                        <div className="text-right mt-3">
                            <Button type="submit" disabled={replyLoading}>
                                {replyLoading ? 'Posting...' : 'Post Reply'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="space-y-6">
                {replies.map(reply => (
                    <PostComponent key={reply._id} post={reply} isReply={true} />
                ))}
            </div>
        </div>
    );
};

export default PostDetailsPage;
