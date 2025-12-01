import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecordingDetails } from '../../api/exchangeApi';

const RecordingDetailsPage = () => {
    const { id } = useParams();
    const [recording, setRecording] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRecording = async () => {
            try {
                const response = await getRecordingDetails(id);
                setRecording(response.data);
            } catch (err) {
                setError("Failed to fetch recording details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecording();
    }, [id]);

    const highlightText = (text) => {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.split(regex).map((part, index) =>
            regex.test(part) ? <mark key={index} className="bg-yellow-300">{part}</mark> : part
        );
    };

    if (loading) return <p className="text-center">Loading recording...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!recording) return <p className="text-center">Recording not found.</p>;

    return (
        <div>
            <div className="mb-4">
                <Link to={`/exchange/${recording.exchange}`} className="text-primary hover:underline">&larr; Back to Exchange</Link>
            </div>
            <div className="bg-surface p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-textPrimary">Recording from {new Date(recording.createdAt).toLocaleString()}</h1>
                <p className="text-textSecondary mt-1">Duration: {Math.round(recording.duration)} seconds</p>

                <audio controls src={recording.url} className="w-full mt-6">
                    Your browser does not support the audio element.
                </audio>

                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Transcript</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search transcript..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {recording.status === 'processing' && (
                        <div className="text-center text-textSecondary p-8 bg-gray-50 rounded-md">
                            <p>This recording is still being transcribed. Please check back in a few moments.</p>
                        </div>
                    )}
                     {recording.status === 'completed' && (
                        <div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                            {highlightText(recording.transcript)}
                        </div>
                    )}
                    {recording.status === 'failed' && (
                         <div className="text-center text-red-600 p-8 bg-red-50 rounded-md">
                            <p>Sorry, the transcription for this recording failed.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecordingDetailsPage;