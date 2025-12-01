import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EventCard = ({ event }) => {
    const { t } = useTranslation();

    return (
        <Link to={`/events/${event._id}`} className="block bg-surface p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="flex-grow">
                <p className="text-sm font-semibold text-primary">{event.topic.name}</p>
                <h2 className="text-xl font-bold text-textPrimary mt-2 mb-2 line-clamp-2">{event.title}</h2>
                <p className="text-sm text-textSecondary">{new Date(event.eventDate).toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-textSecondary border-t pt-3 mt-4">
                <div className="flex items-center">
                    <img src={event.host.avatar || `https://ui-avatars.com/api/?name=${event.host.fullName}`} alt={event.host.fullName} className="w-6 h-6 rounded-full mr-2" />
                    <span>{event.host.fullName}</span>
                </div>
                <span className="font-semibold">{event.attendees.length} / {event.maxAttendees}</span>
            </div>
        </Link>
    );
};

export default EventCard;