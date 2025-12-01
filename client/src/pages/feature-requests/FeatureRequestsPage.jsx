import React, { useState, useEffect, useCallback } from 'react';
import { getFeatureRequests, createFeatureRequest, toggleUpvote } from '../../api/featureRequestApi';
import Button from '../../components/Button';
import FeatureRequestCard from '../../components/feature-requests/FeatureRequestCard';
import CreateFeatureRequestModal from '../../components/feature-requests/CreateFeatureRequestModal';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const FeatureRequestsPage = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popular'); // 'popular' or 'recent'
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getFeatureRequests(sortBy);
            setRequests(response.data);
        } catch (error) {
            toast.error("Failed to fetch feature requests.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [sortBy]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleCreateRequest = async (requestData) => {
        try {
            await createFeatureRequest(requestData);
            toast.success("Your idea has been submitted!");
            fetchRequests(); // Refetch to show the new request
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit idea.");
            throw error; // Propagate error to modal to keep it open if needed
        }
    };

    const handleToggleUpvote = async (requestId) => {
        try {
            // Optimistic UI update
            setRequests(prevRequests => prevRequests.map(req => {
                if (req._id === requestId) {
                    const hasUpvoted = req.hasUpvoted;
                    return {
                        ...req,
                        upvoteCount: hasUpvoted ? req.upvoteCount - 1 : req.upvoteCount + 1,
                        hasUpvoted: !hasUpvoted,
                    };
                }
                return req;
            }));
            await toggleUpvote(requestId);
        } catch (error) {
            toast.error("Failed to vote.");
            // Revert optimistic update on error
            fetchRequests();
        }
    };
    
    const TABS = [
        { key: 'popular', label: t('roadmap.popular') },
        { key: 'recent', label: t('roadmap.recent') },
    ];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-textPrimary">{t('roadmap.title')}</h1>
                    <p className="text-textSecondary mt-1">{t('roadmap.subtitle')}</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0">{t('roadmap.suggestFeature')}</Button>
            </div>
            
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSortBy(tab.key)}
                            className={`${sortBy === tab.key ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {loading ? (
                <p className="text-center">{t('roadmap.loading')}</p>
            ) : requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map(request => (
                        <FeatureRequestCard
                            key={request._id}
                            request={request}
                            onUpvoteToggle={handleToggleUpvote}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-textSecondary mt-12">
                    <h2 className="text-2xl font-semibold mb-2">{t('roadmap.noRequestsTitle')}</h2>
                    <p>{t('roadmap.noRequestsBody')}</p>
                </div>
            )}

            <CreateFeatureRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateRequest}
            />
        </div>
    );
};

export default FeatureRequestsPage;