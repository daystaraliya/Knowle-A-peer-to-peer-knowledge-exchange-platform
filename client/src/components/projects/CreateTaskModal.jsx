import React, { useState } from 'react';
import Button from '../Button';

const CreateTaskModal = ({ isOpen, onClose, onSubmit, members, projectId }) => {
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ projectId, title, assignee: assigneeId || null });
            setTitle('');
            setAssigneeId('');
            onClose();
        } catch (error) {
            console.error("Failed to create task", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-textSecondary">Task Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="assignee" className="block text-sm font-medium text-textSecondary">Assign To (Optional)</label>
                        <select
                            id="assignee"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        >
                            <option value="">Unassigned</option>
                            {members.map(member => (
                                <option key={member._id} value={member._id}>{member.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;