import React, { useState } from 'react';
import Button from '../Button';
import { createAgreement } from '../../api/agreementApi';
import toast from 'react-hot-toast';

const AgreementProposalModal = ({ isOpen, onClose, matchUser, topicToLearnId, topicToTeachId, onProposalSent }) => {
    const [learningObjectives, setLearningObjectives] = useState(['']);
    const [proposedDuration, setProposedDuration] = useState(60);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...learningObjectives];
        newObjectives[index] = value;
        setLearningObjectives(newObjectives);
    };

    const addObjective = () => {
        if (learningObjectives.length < 5) {
            setLearningObjectives([...learningObjectives, '']);
        }
    };

    const removeObjective = (index) => {
        if (learningObjectives.length > 1) {
            const newObjectives = learningObjectives.filter((_, i) => i !== index);
            setLearningObjectives(newObjectives);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const nonEmptyObjectives = learningObjectives.filter(obj => obj.trim() !== '');
        if (nonEmptyObjectives.length === 0) {
            toast.error("Please provide at least one learning objective.");
            setLoading(false);
            return;
        }

        try {
            await createAgreement({
                receiverId: matchUser._id,
                learningObjectives: nonEmptyObjectives,
                proposedDuration: Number(proposedDuration),
                topicToLearnId,
                topicToTeachId,
            });
            toast.success(`Agreement proposal sent to ${matchUser.fullName}!`);
            onProposalSent(matchUser._id);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send proposal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-2">Propose Agreement</h2>
                <p className="text-textSecondary mb-6">Set the terms for your exchange with {matchUser.fullName}.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-2">Learning Objectives</label>
                        {learningObjectives.map((objective, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={objective}
                                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                    placeholder={`Objective ${index + 1}`}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                                {learningObjectives.length > 1 && (
                                    <button type="button" onClick={() => removeObjective(index)} className="ml-2 text-red-500 hover:text-red-700 font-bold p-2">&times;</button>
                                )}
                            </div>
                        ))}
                        {learningObjectives.length < 5 && (
                             <Button type="button" variant="outline" onClick={addObjective} className="text-xs py-1 px-2 mt-2">+ Add Objective</Button>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="duration" className="block text-sm font-medium text-textSecondary">Proposed Duration (minutes)</label>
                        <select
                            id="duration"
                            value={proposedDuration}
                            onChange={(e) => setProposedDuration(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="90">90 minutes</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Proposal'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgreementProposalModal;