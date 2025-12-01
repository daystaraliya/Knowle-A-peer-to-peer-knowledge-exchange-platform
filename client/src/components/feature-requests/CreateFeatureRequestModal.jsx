import React, { useState } from 'react';
import Button from '../Button';
import { useTranslation } from 'react-i18next';

const CreateFeatureRequestModal = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ title, description });
        } catch (error) {
            // Error is handled in parent, but we stop loading here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{t('roadmap.modal.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-textSecondary">{t('roadmap.modal.ideaTitle')}</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder={t('roadmap.modal.titlePlaceholder')}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-textSecondary">{t('roadmap.modal.description')}</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="5"
                            placeholder={t('roadmap.modal.descriptionPlaceholder')}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={onClose}>{t('roadmap.modal.cancel')}</Button>
                        <Button type="submit" disabled={loading}>{loading ? t('roadmap.modal.submitting') : t('roadmap.modal.submit')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFeatureRequestModal;