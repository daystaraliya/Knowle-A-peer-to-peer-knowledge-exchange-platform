import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createResource } from '../../api/resourceApi';
import { getTopics } from '../../api/topicApi';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const CreateResourcePage = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('article'); // 'article' or 'link'
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [url, setUrl] = useState('');
    const [allTopics, setAllTopics] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await getTopics();
                setAllTopics(response.data);
                if (response.data.length > 0) {
                    setTopic(response.data[0]._id); // Default to first topic
                }
            } catch (error) {
                toast.error("Could not load topics.");
            }
        };
        fetchTopics();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const resourceData = {
            title,
            topic,
            type,
            content: type === 'article' ? content : undefined,
            url: type === 'link' ? url : undefined,
        };

        try {
            const response = await createResource(resourceData);
            toast.success("Resource created successfully!");
            navigate(`/resources/${response.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create resource.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-textPrimary mb-6">Contribute to the Knowledge Base</h1>
            <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Resource Type</label>
                    <div className="flex space-x-4">
                        <Button type="button" onClick={() => setType('article')} variant={type === 'article' ? 'primary' : 'outline'}>Article</Button>
                        <Button type="button" onClick={() => setType('link')} variant={type === 'link' ? 'primary' : 'outline'}>Link</Button>
                    </div>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-textSecondary">Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                </div>
                
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-textSecondary">Topic</label>
                    <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm">
                        {allTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                </div>

                {type === 'article' ? (
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-textSecondary">Content</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows="10" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                ) : (
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-textSecondary">URL</label>
                        <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                )}
                
                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/resources')}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Resource'}</Button>
                </div>
            </form>
        </div>
    );
};

export default CreateResourcePage;