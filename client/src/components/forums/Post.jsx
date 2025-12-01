import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toggleUpvote } from '../../api/forumApi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Post = ({ post, isReply = false }) => {
    const { user } = useContext(AuthContext);
    const [upvotes, setUpvotes] = useState(post.upvotes.length);
    const [isUpvoted, setIsUpvoted] = useState(post.upvotes.includes(user?._id));

    const handleUpvote = async () => {
        try {
            const response = await toggleUpvote(post._id);
            setUpvotes(response.data.data.upvotes);
            setIsUpvoted(!isUpvoted);
        } catch (error) {
            toast.error("Could not process upvote.");
        }
    };
    
    return (
        <div className={`bg-surface p-5 rounded-lg shadow-md ${isReply ? 'ml-4 md:ml-12 border-l-4 border-primary' : ''}`}>
            <div className="flex items-start space-x-4">
                <Link to={`/users/${post.author.slug}`}>
                    <img src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.fullName}`} alt={post.author.fullName} className="w-10 h-10 rounded-full" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link to={`/users/${post.author.slug}`} className="font-semibold hover:underline">{post.author.fullName}</Link>
                            <span className="text-sm text-textSecondary ml-2">• {new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    {post.title && <h2 className="text-2xl font-bold mt-2 mb-4">{post.title}</h2>}
                    <p className="text-textPrimary whitespace-pre-wrap mt-2">{post.content}</p>
                    <div className="flex items-center mt-4">
                        <button onClick={handleUpvote} className={`flex items-center space-x-1 text-sm font-semibold rounded-full px-3 py-1 transition-colors ${isUpvoted ? 'bg-primary text-white' : 'bg-gray-200 text-textSecondary hover:bg-gray-300'}`}>
                           <span>👍</span>
                           <span>{upvotes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;