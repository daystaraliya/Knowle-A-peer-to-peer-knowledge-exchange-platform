import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getResources } from '../../api/resourceApi';
import { getTopics } from '../../api/topicApi';
import Button from '../../components/Button';
import ResourceCard from '../../components/resources/ResourceCard';

const ResourceListPage = () => {
    const [resources, setResources] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topicFilter, setTopicFilter] = useState('');

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await getTopics();
                setTopics(response.data);
            } catch (error) {
                console.error("Failed to fetch topics", error);
            }
        };
        fetchTopics();
    }, []);

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const response = await getResources(topicFilter);
                setResources(response.data);
            } catch (error) {
                console.error("Failed to fetch resources", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [topicFilter]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-textPrimary">Knowledge Base</h1>
                    <p className="text-textSecondary mt-1">A community-curated library of articles and resources.</p>
                </div>
                <Link to="/resources/new">
                    <Button>+ Contribute</Button>
                </Link>
            </div>
            
            <div className="mb-6 max-w-sm">
                <label htmlFor="topic-filter" className="block text-sm font-medium text-textSecondary mb-1">Filter by Topic</label>
                <select
                    id="topic-filter"
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="bg-surface border border-gray-300 text-textPrimary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                >
                    <option value="">All Topics</option>
                    {topics.map(topic => (
                        <option key={topic._id} value={topic._id}>{topic.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="text-center">Loading resources...</p>
            ) : resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(resource => (
                        <ResourceCard key={resource._id} resource={resource} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-textSecondary mt-12">
                    <h2 className="text-2xl font-semibold mb-2">No Resources Found</h2>
                    <p>Be the first to contribute to this topic!</p>
                </div>
            )}
        </div>
    );
};

export default ResourceListPage;