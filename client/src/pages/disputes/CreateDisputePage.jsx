import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getExchangeDetails } from '../../api/exchangeApi';
import { createDispute } from '../../api/disputeApi';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const CreateDisputePage = () => {
    const { exchangeId } = useParams();
    const navigate = useNavigate();
    const [exchange, setExchange] = useState(null);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const fetchExchange = async () => {
            try {
                const response = await getExchangeDetails(exchangeId);
                setExchange(response.data);
            } catch (error) {
                toast.error("Could not load exchange details.");
                navigate('/dashboard');
            } finally {
                setPageLoading(false);
            }
        };
        fetchExchange();
    }, [exchangeId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason || !description) {
            toast.error("Please select a reason and provide a description.");
            return;
        }
        setLoading(true);
        try {
            const response = await createDispute({ exchangeId, reason, description });
            toast.success(response.message);
            navigate(`/disputes/${response.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to file dispute.");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <p className="text-center">Loading exchange information...</p>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-textPrimary mb-2">Report an Issue</h1>
            <p className="text-textSecondary mb-6">Filing a dispute for your exchange with <span className="font-semibold">{exchange?.initiator.fullName} & {exchange?.receiver.fullName}</span>.</p>

            <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-textSecondary">Reason for Dispute</label>
                    <select
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="" disabled>Select a reason...</option>
                        <option value="User didn't show up">User didn't show up</option>
                        <option value="Harassment or inappropriate behavior">Harassment or inappropriate behavior</option>
                        <option value="Content was not as described">Content was not as described</option>
                        <option value="Technical issues prevented the exchange">Technical issues prevented the exchange</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-textSecondary">
                        Please provide a detailed description of the issue
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="6"
                        placeholder="Explain what happened in as much detail as possible. This will help our support team resolve the issue quickly."
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    ></textarea>
                </div>
                <div className="flex justify-end space-x-4">
                    <Link to={`/exchange/${exchangeId}`}>
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Dispute'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateDisputePage;