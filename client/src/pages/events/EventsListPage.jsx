import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../../api/eventApi';
import { getTopics } from '../../api/topicApi';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import EventCard from '../../components/events/EventCard';
import { useTranslation } from 'react-i18next';

const EventsListPage = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topicFilter, setTopicFilter] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [eventsRes, topicsRes] = await Promise.all([
                    getAllEvents(),
                    getTopics()
                ]);
                setEvents(eventsRes.data);
                setTopics(topicsRes.data);
            } catch (error) {
                console.error("Failed to fetch events or topics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchFilteredEvents = async () => {
            setLoading(true);
            try {
                const response = await getAllEvents(topicFilter);
                setEvents(response.data);
            } catch (error) {
                console.error("Failed to fetch filtered events", error);
            } finally {
                setLoading(false);
            }
        };
        
        // Only refetch if filter is not initial state
        if(topicFilter !== undefined){
            fetchFilteredEvents();
        }
    }, [topicFilter]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-textPrimary">{t('events.title')}</h1>
                    <p className="text-textSecondary mt-1">{t('events.subtitle')}</p>
                </div>
                {user?.role === 'mentor' && (
                    <Link to="/events/new">
                        <Button>{t('events.createEvent')}</Button>
                    </Link>
                )}
            </div>

            <div className="mb-6 max-w-sm">
                <label htmlFor="topic-filter" className="block text-sm font-medium text-textSecondary mb-1">{t('events.filterByTopic')}</label>
                <select
                    id="topic-filter"
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="bg-surface border border-gray-300 text-textPrimary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                >
                    <option value="">{t('events.allTopics')}</option>
                    {topics.map(topic => (
                        <option key={topic._id} value={topic._id}>{topic.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="text-center">Loading events...</p>
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-textSecondary mt-12">
                    <h2 className="text-2xl font-semibold mb-2">{t('events.noEvents')}</h2>
                    <p>{t('events.noEventsSubtitle')}</p>
                </div>
            )}
        </div>
    );
};

export default EventsListPage;