import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllForums, createForum } from '../../api/forumApi';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

// Modal component for creating a new forum
const CreateForumModal = ({ isOpen, onClose, onForumCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createForum({ name, description });
            toast.success("Forum created successfully!");
            onForumCreated();
            onClose();
            setName('');
            setDescription('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create forum.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Start a New Forum</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-textSecondary">Forum Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-textSecondary">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="3" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Forum'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ForumsListPage = () => {
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchForums = async () => {
        setLoading(true);
        try {
            const response = await getAllForums();
            setForums(response.data.data);
        } catch (error) {
            console.error("Failed to fetch forums", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForums();
    }, []);

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-textPrimary">Community Forums</h1>
                    <p className="text-textSecondary mt-1">Discuss topics, ask questions, and form study groups.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>+ New Forum</Button>
            </div>

            {loading ? (
                <p>Loading forums...</p>
            ) : forums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {forums.map(forum => (
                        <Link to={`/forums/${forum._id}`} key={forum._id} className="bg-surface p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 block">
                            <h2 className="text-xl font-bold text-primary">{forum.name}</h2>
                            <p className="text-textSecondary mt-2 mb-4">{forum.description}</p>
                            <div className="flex justify-between text-sm text-textSecondary border-t pt-3">
                                <span>{forum.postCount} posts</span>
                                <span>Created by {forum.creator.fullName}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p>No forums have been created yet. Be the first!</p>
            )}
            
            <CreateForumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onForumCreated={fetchForums} />
        </div>
    );
};

export default ForumsListPage;
