import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getPremiumContent } from '../../api/mentorApi';

const PremiumContentPage = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.premium?.subscriptionStatus === 'active') {
            const fetchContent = async () => {
                try {
                    const response = await getPremiumContent();
                    setContent(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch premium content", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchContent();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <p className="text-center">Loading premium content...</p>;
    }

    if (user?.premium?.subscriptionStatus !== 'active') {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">Premium Content</h1>
            <p className="text-textSecondary mb-8">Exclusive articles and resources from our top mentors.</p>

            {content.length > 0 ? (
                <div className="space-y-6">
                    {content.map(item => (
                        <div key={item._id} className="bg-surface p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-primary mb-2">{item.title}</h2>
                            <p className="text-sm text-textSecondary mb-4">
                                By <Link to={`/users/${item.mentor.username}`} className="font-semibold hover:underline">{item.mentor.fullName}</Link>
                            </p>
                            <div className="prose max-w-none text-textPrimary">
                                {item.content}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-textSecondary mt-12">No premium content has been published yet.</p>
            )}
        </div>
    );
};

export default PremiumContentPage;