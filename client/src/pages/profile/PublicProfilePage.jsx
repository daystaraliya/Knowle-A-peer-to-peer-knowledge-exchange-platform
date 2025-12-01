import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile, getRelatedUsers } from '../../api/userApi';
import { getMentorOfferings, getMentorPremiumContent } from '../../api/mentorApi';
import { createCheckoutSession } from '../../api/paymentApi';
import { AuthContext } from '../../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import AchievementBadge from '../../components/achievements/AchievementBadge';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import VerifiedBadge from '../../components/VerifiedBadge';
import ReviewSummary from '../../components/profile/ReviewSummary';
import { Helmet } from 'react-helmet-async';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StarRating = ({ rating, numberOfRatings }) => {
    const fullStars = Math.floor(rating);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            {[...Array(5 - fullStars)].map((_, i) => <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
             <span className="text-textSecondary ml-2 text-sm">({numberOfRatings} reviews)</span>
        </div>
    );
};

const ProficiencyBadge = ({ level }) => {
    const levelStyles = {
        'Novice': 'bg-gray-200 text-gray-800',
        'Intermediate': 'bg-blue-200 text-blue-800',
        'Advanced': 'bg-purple-200 text-purple-800',
        'Expert': 'bg-yellow-200 text-yellow-800'
    };
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelStyles[level] || 'bg-gray-200'}`}>
            {level}
        </span>
    );
};

const PublicProfilePage = () => {
    const { slug } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [offerings, setOfferings] = useState([]);
    const [premiumContent, setPremiumContent] = useState([]);
    const [relatedUsers, setRelatedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await getPublicProfile(slug);
                const profileData = response.data;
                setUser(profileData);

                const promises = [];
                if (profileData.role === 'mentor') {
                    promises.push(getMentorOfferings(profileData._id));
                    promises.push(getMentorPremiumContent(profileData._id));
                }
                promises.push(getRelatedUsers(profileData._id));

                const [offeringsRes, contentRes, relatedRes] = await Promise.all(promises);
                
                if (offeringsRes) setOfferings(offeringsRes.data.data);
                if (contentRes) setPremiumContent(contentRes.data.data);
                if (relatedRes) setRelatedUsers(relatedRes.data);

            } catch (err) {
                setError(err.response?.data?.message || 'Could not fetch user profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [slug]);

    const handlePurchase = async (priceId, type) => {
        setPaymentLoading(type === 'subscription' ? 'subscription' : priceId);
        try {
            const stripe = await stripePromise;
            const response = await createCheckoutSession({ priceId, type });
            const { sessionId } = response.data.data;
            const result = await stripe.redirectToCheckout({ sessionId });
            if (result.error) {
                toast.error(result.error.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed.');
        } finally {
            setPaymentLoading(null);
        }
    };


    if (loading) return <p className="text-center">Loading profile...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!user) return <p className="text-center">User not found.</p>;

    const proficiencyMap = new Map(user.proficiencies?.map(p => [p.topic._id, p.proficiency]));
    const verifiedSkillsSet = new Set(user.verifiedSkills?.map(vs => vs.topic));

    return (
        <>
            <Helmet>
                <title>{`${user.fullName} | Knowle Profile`}</title>
                <meta name="description" content={user.bio || `View the Knowle profile for ${user.fullName}. Explore their skills, achievements, and contributions to the community.`} />
            </Helmet>
            <div className="max-w-4xl mx-auto">
                <div className="bg-surface p-8 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-secondary" />
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-center sm:text-left">{user.fullName}</h1>
                                {user.role === 'mentor' && <span className="text-sm font-semibold bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full">Mentor</span>}
                            </div>
                            <p className="text-textSecondary text-center sm:text-left">@{user.username}</p>
                            <p className="text-textSecondary text-center sm:text-left text-sm mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                            <div className="flex justify-center sm:justify-start my-2"><StarRating rating={user.averageRating} numberOfRatings={user.numberOfRatings} /></div>
                            {user.points !== undefined && (<div className="flex justify-center sm:justify-start"><span className="font-bold text-primary">{user.points} Points</span></div>)}
                        </div>
                    </div>

                    {user.bio && (<div className="mt-8 border-t pt-6"><h3 className="text-xl font-semibold mb-4">About Me</h3><p className="text-textSecondary">{user.bio}</p></div>)}
                    
                    <ReviewSummary summary={user.reviewSummary} />

                    {user.role === 'mentor' && offerings.length > 0 && (
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-xl font-semibold mb-4">Mentorship Sessions</h3>
                            <div className="space-y-4">
                                {offerings.map(offer => (
                                    <div key={offer._id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold">{offer.title} - {offer.duration}</h4>
                                            <p className="text-sm text-textSecondary">{offer.description}</p>
                                        </div>
                                        <Button onClick={() => handlePurchase(offer._id, 'mentorship')} disabled={paymentLoading === offer._id}>
                                            {paymentLoading === offer._id ? 'Processing...' : `Book for $${(offer.price / 100).toFixed(2)}`}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {user.role === 'mentor' && premiumContent.length > 0 && (
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-xl font-semibold mb-4">Premium Content</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <ul className="list-disc list-inside space-y-2 text-textPrimary">
                                    {premiumContent.map(content => <li key={content._id}>{content.title}</li>)}
                                </ul>
                                {currentUser?.premium?.subscriptionStatus !== 'active' && (
                                    <div className="mt-4 text-center border-t pt-4">
                                        <p className="mb-3 font-semibold">Get access to all premium content from all mentors!</p>
                                        <Button onClick={() => handlePurchase(null, 'subscription')} disabled={paymentLoading === 'subscription'} variant="secondary">
                                            {paymentLoading === 'subscription' ? 'Processing...' : 'Subscribe Now'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {user.achievements && (
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-xl font-semibold mb-4">Achievements</h3>
                            {user.achievements.length > 0 ? (<div className="flex flex-wrap gap-4">{user.achievements.map(ach => (<AchievementBadge key={ach._id} achievement={ach} />))}</div>) : (<p className="text-textSecondary">No achievements earned yet.</p>)}
                        </div>
                    )}

                    {user.topicsToTeach && user.topicsToLearn && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-primary">Skills They Know</h3>
                                {user.topicsToTeach.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {user.topicsToTeach.map(topic => (
                                            <div key={topic._id} className="flex items-center gap-2 bg-primary text-white px-3 py-1 rounded-full text-sm">
                                                <span>{topic.name}</span>
                                                {verifiedSkillsSet.has(topic._id) && <VerifiedBadge />}
                                                {proficiencyMap.has(topic._id) && <ProficiencyBadge level={proficiencyMap.get(topic._id)} />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (<p className="text-textSecondary">No skills listed.</p>)}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-secondary">Skills They Want to Learn</h3>
                                {user.topicsToLearn.length > 0 ? (<div className="flex flex-wrap gap-2">{user.topicsToLearn.map(topic => (<span key={topic._id} className="bg-secondary text-white px-3 py-1 rounded-full text-sm">{topic.name}</span>))}</div>) : (<p className="text-textSecondary">Not looking to learn any new skills right now.</p>)}
                            </div>
                        </div>
                    )}

                    {relatedUsers.length > 0 && (
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-xl font-semibold mb-4">Related Profiles</h3>
                            <div className="flex flex-wrap gap-6">
                                {relatedUsers.map(related => (
                                    <Link to={`/users/${related.slug}`} key={related._id} className="text-center group">
                                        <img src={related.avatar || `https://ui-avatars.com/api/?name=${related.fullName}`} alt={related.fullName} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-transparent group-hover:border-primary transition-colors" />
                                        <p className="text-sm font-semibold text-textSecondary group-hover:text-primary transition-colors">{related.fullName}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PublicProfilePage;