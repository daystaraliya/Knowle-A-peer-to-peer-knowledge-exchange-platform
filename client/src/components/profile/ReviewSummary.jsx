import React from 'react';

const ReviewSummary = ({ summary }) => {
    if (!summary || (!summary.positive?.length && !summary.negative?.length)) {
        return (
            <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold mb-2">AI Review Summary</h3>
                <p className="text-textSecondary">
                    Not enough reviews yet to generate a summary. Complete at least 3 exchanges to see AI-powered insights here!
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">AI Review Summary</h3>
                {summary.lastUpdated && (
                    <p className="text-xs text-textSecondary">
                        Last updated: {new Date(summary.lastUpdated).toLocaleDateString()}
                    </p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {summary.positive?.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-bold text-green-800 flex items-center mb-2">
                            <span className="text-xl mr-2">👍</span> Key Strengths
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-green-700 text-sm">
                            {summary.positive.map((point, index) => (
                                <li key={`pos-${index}`}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}
                 {summary.negative?.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-bold text-yellow-800 flex items-center mb-2">
                           <span className="text-xl mr-2">💡</span> Areas for Growth
                        </h4>
                         <ul className="list-disc list-inside space-y-2 text-yellow-700 text-sm">
                            {summary.negative.map((point, index) => (
                                <li key={`neg-${index}`}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSummary;