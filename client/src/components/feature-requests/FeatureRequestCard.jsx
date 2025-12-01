import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FeatureRequestCard = ({ request, onUpvoteToggle }) => {
    const { t } = useTranslation();
    const { _id, title, description, author, upvoteCount, createdAt, status, hasUpvoted } = request;

    const statusStyles = {
        'Under Consideration': 'bg-gray-200 text-gray-800',
        'Planned': 'bg-blue-200 text-blue-800',
        'In Progress': 'bg-yellow-200 text-yellow-800',
        'Completed': 'bg-green-200 text-green-800'
    };
    
    return (
        <div className="bg-surface p-5 rounded-lg shadow-md flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0">
                <button
                    onClick={() => onUpvoteToggle(_id)}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-colors ${hasUpvoted ? 'bg-primary border-primary text-white' : 'bg-gray-100 border-gray-300 hover:bg-indigo-50 hover:border-primary'}`}
                    aria-label={t('roadmap.upvote')}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                    <span className="font-bold text-lg">{upvoteCount}</span>
                </button>
            </div>
            <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                    <h2 className="text-xl font-bold text-textPrimary">{title}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status] || 'bg-gray-200'}`}>
                        {status}
                    </span>
                </div>
                <p className="text-textSecondary mb-3">{description}</p>
                <div className="text-xs text-textSecondary">
                    <span>{t('roadmap.submittedBy')} <Link to={`/users/${author.username}`} className="font-semibold text-primary hover:underline">{author.fullName}</Link></span>
                    <span className="mx-1">•</span>
                    <span>{new Date(createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default FeatureRequestCard;