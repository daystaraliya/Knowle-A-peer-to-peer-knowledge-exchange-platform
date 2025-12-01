import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getResourceDetails, toggleUpvote, deleteResource } from '../../api/resourceApi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const ResourceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [upvotes, setUpvotes] = useState(0);
    const [isUpvoted, setIsUpvoted] = useState(false);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const response = await getResourceDetails(id);
                setResource(response.data);
                setUpvotes(response.data.upvotes.length);
                setIsUpvoted(response.data.upvotes.includes(user?._id));
            } catch (err) {
                setError("Could not load resource.");
            } finally {
                setLoading(false);
            }
        };
        fetchResource();
    }, [id, user?._id]);

    const handleUpvote = async () => {
        try {
            const response = await toggleUpvote(id);
            setUpvotes(response.data.upvotesCount);
            setIsUpvoted(!isUpvoted);
        } catch (err) {
            toast.error("Could not process upvote.");
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
            try {
                await deleteResource(id);
                toast.success("Resource deleted.");
                navigate('/resources');
            } catch (err) {
                toast.error("Failed to delete resource.");
            }
        }
    };


    if (loading) return <p className="text-center">Loading resource...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!resource) return <p className="text-center">Resource not found.</p>;
    
    const isAuthor = user?._id === resource.author._id;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
                <Link to="/resources" className="text-primary hover:underline">&larr; Back to Knowledge Base</Link>
            </div>
            
            <div className="bg-surface p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">{resource.topic.name}</span>
                        <h1 className="text-4xl font-bold text-textPrimary mt-4">{resource.title}</h1>
                        <div className="flex items-center mt-3 text-textSecondary">
                            <img src={resource.author.avatar || `https://ui-avatars.com/api/?name=${resource.author.fullName}`} alt={resource.author.fullName} className="w-8 h-8 rounded-full mr-3" />
                            <span>By <Link to={`/users/${resource.author.username}`} className="font-semibold hover:underline">{resource.author.fullName}</Link></span>
                            <span className="mx-2">•</span>
                            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                     {isAuthor && (
                        <div className="flex space-x-2">
                            {/* <Button variant="outline" className="text-xs">Edit</Button> */}
                            <Button onClick={handleDelete} variant="outline" className="text-xs border-red-500 text-red-500 hover:bg-red-50">Delete</Button>
                        </div>
                    )}
                </div>

                <div className="border-t my-6"></div>

                {resource.type === 'article' ? (
                    <div className="prose max-w-none text-textPrimary whitespace-pre-wrap">
                        {resource.content}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold">External Link</h3>
                        <p className="text-textSecondary my-2">This resource is an external link. Click the button below to open it in a new tab.</p>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Button className="mt-2">{resource.url}</Button>
                        </a>
                    </div>
                )}
                
                <div className="border-t mt-8 pt-4 flex justify-end">
                     <button onClick={handleUpvote} className={`flex items-center space-x-2 text-lg font-semibold rounded-full px-4 py-2 transition-colors ${isUpvoted ? 'bg-primary text-white' : 'bg-gray-200 text-textSecondary hover:bg-gray-300'}`}>
                        <span>👍</span>
                        <span>{upvotes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailsPage;