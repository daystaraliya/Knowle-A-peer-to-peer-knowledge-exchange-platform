import React from 'react';
import Button from './Button';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4 text-textPrimary">{title}</h2>
                <p className="text-textSecondary mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;