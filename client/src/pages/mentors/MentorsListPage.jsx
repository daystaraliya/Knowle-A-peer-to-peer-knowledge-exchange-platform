import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllMentors } from '../../api/mentorApi';

const MentorsListPage = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await getAllMentors();
                setMentors(response.data.data);
            } catch (error) {
                console.error("Failed to fetch mentors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMentors();
    }, []);

    if (loading) return <p className="text-center">Loading mentors...</p>;

    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">Browse Mentors</h1>
            <p className="text-textSecondary mb-8">Connect with experienced mentors for personalized guidance.</p>
            
            {mentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map(mentor => (
                        <Link to={`/users/${mentor.username}`} key={mentor._id} className="block bg-surface p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <img src={mentor.avatar || `https://ui-avatars.com/api/?name=${mentor.fullName}`} alt={mentor.fullName} className="w-16 h-16 rounded-full mr-4" />
                                <div>
                                    <h2 className="text-xl font-bold text-primary">{mentor.fullName}</h2>
                                    <p className="text-sm text-textSecondary">@{mentor.username}</p>
                                </div>
                            </div>
                            <p className="text-textSecondary text-sm mb-4 line-clamp-3">{mentor.bio || "This mentor hasn't added a bio yet."}</p>
                            <div className="border-t pt-3">
                                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Mentor</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-textSecondary mt-12">No mentors are available on the platform yet.</p>
            )}
        </div>
    );
};

export default MentorsListPage;