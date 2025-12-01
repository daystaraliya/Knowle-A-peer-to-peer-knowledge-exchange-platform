import React from 'react';
import { Link } from 'react-router-dom';

const RecordingList = ({ recordings }) => {

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
                return <span title="Processing..." className="text-yellow-500">⏳</span>;
            case 'completed':
                return <span title="Completed" className="text-green-500">✅</span>;
            case 'failed':
                return <span title="Failed" className="text-red-500">❌</span>;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Session Recordings</h3>
            <div className="flex-grow overflow-y-auto">
                {recordings.length > 0 ? (
                    <ul className="space-y-3">
                        {recordings.map(rec => (
                            <li key={rec._id}>
                                <Link
                                    to={`/recordings/${rec._id}`}
                                    className="block p-3 bg-gray-50 rounded-md hover:bg-indigo-50 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-sm text-textPrimary">
                                                Recording - {new Date(rec.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-textSecondary">
                                                {new Date(rec.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {getStatusIcon(rec.status)}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-textSecondary pt-10">
                        <p>No recordings found for this exchange yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordingList;
