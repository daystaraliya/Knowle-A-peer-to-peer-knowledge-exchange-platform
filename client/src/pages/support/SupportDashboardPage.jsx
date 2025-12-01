import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDisputes, assignDisputeToMe } from '../../api/adminApi';
import toast from 'react-hot-toast';
import Button from '../../components/Button';

const SupportDashboardPage = () => {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'open' });

    const fetchDisputes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllDisputes(filters);
            setDisputes(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not fetch disputes.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const handleAssign = async (disputeId) => {
        try {
            await assignDisputeToMe(disputeId);
            toast.success("Ticket assigned to you!");
            fetchDisputes(); // Refresh the list
        } catch (error) {
            toast.error("Failed to assign ticket.");
        }
    };

    const TABS = [ { key: 'open', label: 'Open' }, { key: 'under_review', label: 'Under Review' }, { key: 'resolved', label: 'Resolved' } ];
    const statusStyles = { open: 'bg-yellow-100 text-yellow-800', under_review: 'bg-blue-100 text-blue-800', resolved: 'bg-green-100 text-green-800' };

    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-6">Support Dashboard</h1>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {TABS.map((tab) => ( <button key={tab.key} onClick={() => setFilters({ status: tab.key })} className={`${filters.status === tab.key ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}> {tab.label} </button> ))}
                </nav>
            </div>
            {loading ? <p>Loading ticket queue...</p> : (
                <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Complainant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Respondent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Assignee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {disputes.map((d) => (
                                <tr key={d._id}>
                                    <td className="px-6 py-4">{d.complainant.fullName}</td>
                                    <td className="px-6 py-4">{d.respondent.fullName}</td>
                                    <td className="px-6 py-4">{d.reason}</td>
                                    <td className="px-6 py-4">{d.assignee?.fullName || <span className="text-gray-400 italic">Unassigned</span>}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <Button variant="outline" className="text-xs py-1 px-2" onClick={() => navigate(`/disputes/${d._id}`)}>View</Button>
                                        {!d.assignee && d.status === 'open' && <Button className="text-xs py-1 px-2" onClick={() => handleAssign(d._id)}>Assign to Me</Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SupportDashboardPage;
