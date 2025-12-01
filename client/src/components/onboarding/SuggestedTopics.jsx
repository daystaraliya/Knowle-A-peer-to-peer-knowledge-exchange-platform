import React, { useState } from 'react';
import Button from '../Button';

const TopicPill = ({ topic, isSelected, onToggle }) => (
    <button
        onClick={() => onToggle(topic._id)}
        className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm ${
            isSelected ? 'bg-primary text-white' : 'bg-gray-200 text-textPrimary hover:bg-gray-300'
        }`}
    >
        {topic.name}
    </button>
);

const SuggestedTopics = ({ suggestions, onFinish }) => {
    const [selectedTeach, setSelectedTeach] = useState(suggestions.teach.map(t => t._id));
    const [selectedLearn, setSelectedLearn] = useState(suggestions.learn.map(t => t._id));
    const [loading, setLoading] = useState(false);

    const toggleTopic = (topicId, type) => {
        const [selected, setSelected] = type === 'teach' ? [selectedTeach, setSelectedTeach] : [selectedLearn, setSelectedLearn];
        const newSelection = selected.includes(topicId)
            ? selected.filter(id => id !== topicId)
            : [...selected, topicId];
        setSelected(newSelection);
    };
    
    const handleFinishClick = () => {
        setLoading(true);
        onFinish({
            topicsToTeach: selectedTeach,
            topicsToLearn: selectedLearn
        });
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-4">Here are your AI-powered skill suggestions!</h2>
            <p className="text-textSecondary text-center mb-8">Feel free to adjust these before finishing your setup. You can always change them later in your profile.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-primary mb-4">Skills We Suggest You Teach</h3>
                    {suggestions.teach.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {suggestions.teach.map(topic => (
                                <TopicPill
                                    key={topic._id}
                                    topic={topic}
                                    isSelected={selectedTeach.includes(topic._id)}
                                    onToggle={(id) => toggleTopic(id, 'teach')}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-textSecondary">Based on your answers, we couldn't suggest any teaching skills yet.</p>
                    )}
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-secondary mb-4">Skills We Suggest You Learn</h3>
                    {suggestions.learn.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {suggestions.learn.map(topic => (
                                <TopicPill
                                    key={topic._id}
                                    topic={topic}
                                    isSelected={selectedLearn.includes(topic._id)}
                                    onToggle={(id) => toggleTopic(id, 'learn')}
                                />
                            ))}
                        </div>
                    ) : (
                         <p className="text-textSecondary">Based on your answers, we couldn't suggest any learning skills yet.</p>
                    )}
                </div>
            </div>

            <div className="text-center mt-8">
                <Button onClick={handleFinishClick} disabled={loading} className="w-full md:w-auto">
                    {loading ? 'Saving...' : 'Finish Setup & Enter Knowle'}
                </Button>
            </div>
        </div>
    );
};

export default SuggestedTopics;
