import React from 'react';

const OnboardingStep = ({ question, onAnswer, currentAnswer }) => {
    const { id, text, type, options } = question;

    const handleSelect = (option) => {
        if (type === 'multi-select') {
            const currentSelection = currentAnswer || [];
            const newSelection = currentSelection.includes(option)
                ? currentSelection.filter(item => item !== option)
                : [...currentSelection, option];
            onAnswer(id, newSelection);
        } else {
            onAnswer(id, option);
        }
    };

    const isSelected = (option) => {
        if (!currentAnswer) return false;
        return Array.isArray(currentAnswer) ? currentAnswer.includes(option) : currentAnswer === option;
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">{text}</h2>
            <div className={`grid ${type === 'multi-select' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(option)}
                        className={`block text-center p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                            isSelected(option)
                                ? 'bg-primary border-primary text-white font-semibold shadow-lg'
                                : 'bg-white border-gray-300 hover:border-primary'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OnboardingStep;
