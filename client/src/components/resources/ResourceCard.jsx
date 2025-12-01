import React from 'react';
import { Link } from 'react-router-dom';

const ResourceCard = ({ resource }) => {
    return (
        <Link to={`/resources/${resource._id}`} className="block bg-surface p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-primary mb-2 line-clamp-2">{resource.title}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${resource.type === 'article' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                    {resource.type}
                </span>
            </div>
            <p className="text-sm text-textSecondary mb-4">
                Topic: <span className="font-semibold">{resource.topic.name}</span>
            </p>
            <div className="flex justify-between items-center text-sm text-textSecondary border-t pt-3 mt-4">
                <div className="flex items-center">
                    <img src={resource.author.avatar || `https://ui-avatars.com/api/?name=${resource.author.fullName}`} alt={resource.author.fullName} className="w-6 h-6 rounded-full mr-2" />
                    <span>{resource.author.fullName}</span>
                </div>
                <span>👍 {resource.upvotes.length}</span>
            </div>
        </Link>
    );
};

export default ResourceCard;