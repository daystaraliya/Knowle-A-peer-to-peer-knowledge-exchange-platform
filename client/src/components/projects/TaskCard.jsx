import React, { useState } from 'react';
import ConfirmDeleteModal from '../ConfirmDeleteModal';

const TaskCard = ({ task, onUpdateTask, onDeleteTask }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const statuses = ['To Do', 'In Progress', 'Done'];

    const handleStatusChange = (newStatus) => {
        onUpdateTask(task._id, { status: newStatus });
        setIsMenuOpen(false);
    }

    const handleDeleteConfirm = () => {
        onDeleteTask(task._id);
        setIsDeleteModalOpen(false);
    }

    return (
        <>
            <div className="bg-surface rounded-md shadow p-4 relative">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-textPrimary">{task.title}</p>
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-textSecondary hover:text-textPrimary">
                            &#x22EE; {/* Three vertical dots */}
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg z-10">
                                <div className="py-1">
                                    <p className="px-4 pt-2 pb-1 text-xs text-textSecondary">Change Status</p>
                                    {statuses.map(status => (
                                        <button key={status} onClick={() => handleStatusChange(status)} className="w-full text-left block px-4 py-2 text-sm text-textPrimary hover:bg-gray-100">
                                            {status}
                                        </button>
                                    ))}
                                    <div className="border-t my-1"></div>
                                    <button onClick={() => { setIsMenuOpen(false); setIsDeleteModalOpen(true); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        Delete Task
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {task.assignee ? (
                    <div className="flex items-center mt-3">
                        <img src={task.assignee.avatar || `https://ui-avatars.com/api/?name=${task.assignee.fullName}`} alt={task.assignee.fullName} className="w-6 h-6 rounded-full mr-2" />
                        <span className="text-xs text-textSecondary">{task.assignee.fullName}</span>
                    </div>
                ) : (
                    <div className="mt-3">
                        <span className="text-xs text-textSecondary italic">Unassigned</span>
                    </div>
                )}
            </div>
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Task?"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />
        </>
    );
};

export default TaskCard;