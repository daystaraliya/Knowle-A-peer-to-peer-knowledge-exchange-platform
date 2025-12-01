import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../api/eventApi';
import { getTopics } from '../../api/topicApi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const CreateEventPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topic: '',
        eventDate: '',
        eventTime: '',
        durationMinutes: '60',
        maxAttendees: '10'
    });
    const [allTopics, setAllTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Redirect if user is not a mentor
    useEffect(() => {
        if (user && user.role !== 'mentor') {
            toast.error("You must be a mentor to create events.");
            navigate('/events');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await getTopics();
                setAllTopics(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, topic: response.data[0]._id }));
                }
            } catch (error) {
                toast.error("Could not load topics.");
            }
        };
        fetchTopics();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { title, description, topic, eventDate, eventTime, durationMinutes, maxAttendees } = formData;
        const combinedDateTime = new Date(`${eventDate}T${eventTime}`);

        try {
            const response = await createEvent({
                title,
                description,
                topic,
                eventDate: combinedDateTime.toISOString(),
                durationMinutes: parseInt(durationMinutes, 10),
                maxAttendees: parseInt(maxAttendees, 10),
            });
            toast.success("Event created successfully!");
            navigate(`/events/${response.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-textPrimary mb-6">Create a New Event</h1>
            <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-md space-y-6">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-textSecondary">Event Title</label>
                    <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-textSecondary">Topic</label>
                    <select id="topic" name="topic" value={formData.topic} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm">
                        {allTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-textSecondary">Date</label>
                        <input id="eventDate" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="eventTime" className="block text-sm font-medium text-textSecondary">Time</label>
                        <input id="eventTime" name="eventTime" type="time" value={formData.eventTime} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="durationMinutes" className="block text-sm font-medium text-textSecondary">Duration (minutes)</label>
                        <input id="durationMinutes" name="durationMinutes" type="number" min="15" step="15" value={formData.durationMinutes} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="maxAttendees" className="block text-sm font-medium text-textSecondary">Max Attendees</label>
                        <input id="maxAttendees" name="maxAttendees" type="number" min="2" value={formData.maxAttendees} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-textSecondary">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="6" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/events')}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</Button>
                </div>
            </form>
        </div>
    );
};

export default CreateEventPage;