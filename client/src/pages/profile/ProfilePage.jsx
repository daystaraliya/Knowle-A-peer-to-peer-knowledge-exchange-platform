import React, { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';
import AchievementBadge from '../../components/achievements/AchievementBadge';
import VerifiedBadge from '../../components/VerifiedBadge';
import ReviewSummary from '../../components/profile/ReviewSummary';
import { regenerateReviewSummary } from '../../api/userApi';
import toast from 'react-hot-toast';

const StarRating = ({ rating, numberOfRatings }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
            {/* Simple display, not showing half stars for now for simplicity */}
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


const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    toast.promise(
        regenerateReviewSummary(),
        {
            loading: 'Asking the AI to analyze your reviews...',
            success: 'Regeneration started! You will be notified when it is complete.',
            error: 'Could not start regeneration.',
        }
    ).finally(() => setIsRegenerating(false));
  };

  const proficiencyMap = new Map(user.proficiencies?.map(p => [p.topic._id, p.proficiency]));
  const verifiedSkillsSet = new Set(user.verifiedSkills?.map(vs => vs.topic));


  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-textPrimary">My Profile</h1>
          <Link to={`/users/${user.slug}`} className="text-sm text-primary hover:underline mt-1 inline-block">View Public Profile</Link>
        </div>
        <Link to="/profile/edit">
            <Button>Edit Profile</Button>
        </Link>
      </div>
      <div className="bg-surface p-8 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-primary"
          />
          <div>
            <h2 className="text-2xl font-bold text-center sm:text-left">{user.fullName}</h2>
            <p className="text-textSecondary text-center sm:text-left">@{user.username}</p>
            <p className="text-textSecondary text-center sm:text-left mb-2">{user.email}</p>
            <div className="flex justify-center sm:justify-start mb-2">
                <StarRating rating={user.averageRating} numberOfRatings={user.numberOfRatings} />
            </div>
            <div className="flex justify-center sm:justify-start">
                <span className="font-bold text-primary">{user.points || 0} Points</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">About Me</h3>
          <p className="text-textSecondary">
            {user.bio || "You haven't added a bio yet. Tell others what you're passionate about!"}
          </p>
        </div>
        
        <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Achievements</h3>
            {user.achievements?.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                {user.achievements.map(ach => (
                    <AchievementBadge key={ach._id} achievement={ach} />
                ))}
                </div>
            ) : (
                <p className="text-textSecondary">Complete exchanges and master skills to earn achievements!</p>
            )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Skills I Know</h3>
                {user.topicsToTeach?.length > 0 ? (
                    <ul className="space-y-3">
                        {user.topicsToTeach.map(topic => (
                           <li key={topic._id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">{topic.name}</span>
                                    {verifiedSkillsSet.has(topic._id) && <VerifiedBadge />}
                                    {proficiencyMap.has(topic._id) && <ProficiencyBadge level={proficiencyMap.get(topic._id)} />}
                                </div>
                                <Link to={`/assessment/${topic._id}`}>
                                    <Button className="text-xs py-1 px-2" variant="outline">
                                        {proficiencyMap.has(topic._id) ? 'Re-assess' : 'Start Assessment'}
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-textSecondary">Add skills you can teach to your profile.</p>
                )}
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4 text-secondary">Skills I Want to Learn</h3>
                {user.topicsToLearn?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {user.topicsToLearn.map(topic => (
                            <span key={topic._id} className="bg-secondary text-white px-3 py-1 rounded-full text-sm">{topic.name}</span>
                        ))}
                    </div>
                ) : (
                    <p className="text-textSecondary">Add skills you want to learn to find matches.</p>
                )}
            </div>
        </div>

        <ReviewSummary summary={user.reviewSummary} />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleRegenerate} disabled={isRegenerating} variant="outline">
              {isRegenerating ? 'Processing...' : 'Regenerate with AI'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;