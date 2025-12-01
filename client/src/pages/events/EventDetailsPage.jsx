import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventDetails, registerForEvent, cancelRegistration } from '../../api/eventApi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEvent = async () => {
        try {
            const response = await getEventDetails(id);
            setEvent(response.data);
        } catch (err) {
            setError("Could not load event details.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchEvent();
    }, [id]);

    const handleRegister = async () => {
        setActionLoading(true);
        try {
            await registerForEvent(id);
            toast.success("Successfully registered for the event!");
            fetchEvent(); // Refetch to update attendee list
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed.");
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleCancel = async () => {
        setActionLoading(true);
        try {
            await cancelRegistration(id);
            toast.success("You have cancelled your registration.");
            fetchEvent(); // Refetch
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel registration.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <p className="text-center">Loading event...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!event) return <p className="text-center">Event not found.</p>;

    const isUserRegistered = event.attendees.some(attendee => attendee._id === user?._id);
    const isHost = user?._id === event.host._id;
    const isEventFull = event.attendees.length >= event.maxAttendees;

    const getRegistrationButton = () => {
        if (isHost) {
            return <Button variant="outline" disabled>You are the host</Button>;
        }
        if (isUserRegistered) {
            return <Button variant="secondary" onClick={handleCancel} disabled={actionLoading}>{actionLoading ? 'Cancelling...' : t('events.cancelRegistration')}</Button>;
        }
        if (isEventFull) {
            return <Button disabled>{t('events.full')}</Button>;
        }
        return <Button onClick={handleRegister} disabled={actionLoading}>{actionLoading ? 'Registering...' : t('events.register')}</Button>;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
                <Link to="/events" className="text-primary hover:underline">&larr; Back to all events</Link>
            </div>
            
            <div className="bg-surface p-8 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-start">
                    <div>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">{event.topic.name}</span>
                        <h1 className="text-4xl font-bold text-textPrimary mt-4">{event.title}</h1>
                        <p className="text-lg text-textSecondary mt-2">{new Date(event.eventDate).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        {getRegistrationButton()}
                    </div>
                </div>

                <div className="border-t my-6"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">About this Event</h2>
                        <p className="text-textPrimary whitespace-pre-wrap">{event.description}</p>
                    </div>
                    <div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-4">{t('events.hostedBy')}</h3>
                            <Link to={`/users/${event.host.username}`} className="flex items-center space-x-3 group">
                                <img src={event.host.avatar || `https://ui-avatars.com/api/?name=${event.host.fullName}`} alt={event.host.fullName} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-semibold group-hover:underline">{event.host.fullName}</p>
                                    <p className="text-sm text-textSecondary">@{event.host.username}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t my-6"></div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">{t('events.attendees')} ({event.attendees.length}/{event.maxAttendees})</h2>
                     <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${(event.attendees.length / event.maxAttendees) * 100}%` }}></div>
                    </div>
                    {event.attendees.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                            {event.attendees.map(attendee => (
                                <Link to={`/users/${attendee.username}`} key={attendee._id} title={attendee.fullName}>
                                    <img src={attendee.avatar || `https://ui-avatars.com/api/?name=${attendee.fullName}`} alt={attendee.fullName} className="w-12 h-12 rounded-full hover:ring-2 ring-primary" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-textSecondary">{t('events.noAttendees')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;