import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import { AuthContext } from '../../context/AuthContext';
import { getUserExchanges, updateExchangeStatus } from '../../api/exchangeApi'; // updateExchangeStatus is needed
import { getRegisteredEvents, getHostedEvents } from '../../api/eventApi';
import { getUserAgreements, updateAgreementStatus } from '../../api/agreementApi'; // New import
import Button from '../../components/Button';
import toast from 'react-hot-toast';

// Reusable component for displaying agreement proposals
const AgreementProposalList = ({ title, agreements, onStatusUpdate }) => (
    <div>
        <h2 className="text-2xl font-bold text-textPrimary mb-4">{title}</h2>
        {agreements.length > 0 ? (
            <ul className="space-y-4">
                {agreements.map(agreement => (
                    <li key={agreement._id} className="bg-surface p-4 rounded-lg shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <p className="font-semibold">
                                    Proposal from {agreement.proposer.fullName}
                                </p>
                                <div className="text-sm text-textSecondary mt-2">
                                    <p className="font-medium">Objectives:</p>
                                    <ul className="list-disc list-inside ml-4">
                                        {agreement.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                                    </ul>
                                    <p className="mt-1">Duration: {agreement.proposedDuration} minutes</p>
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-4 sm:mt-0">
                                <Button variant="outline" onClick={() => onStatusUpdate(agreement._id, 'declined')}>Decline</Button>
                                <Button onClick={() => onStatusUpdate(agreement._id, 'accepted')}>Accept</Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-textSecondary">No new agreement proposals.</p>
        )}
    </div>
);


// A reusable component to render a list of exchanges
const ExchangeList = ({ title, exchanges, emptyMessage }) => (
    <div>
        <h2 className="text-2xl font-bold text-textPrimary mb-4">{title}</h2>
        {exchanges.length > 0 ? (
            <ul className="space-y-4">
                {exchanges.map(exchange => (
                    <li key={exchange._id} className="bg-surface p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold">
                                {exchange.initiator.fullName} &harr; {exchange.receiver.fullName}
                            </p>
                            <p className="text-sm text-textSecondary">
                                Learning "{exchange.topicToLearn.name}" &amp; Teaching "{exchange.topicToTeach.name}"
                            </p>
                        </div>
                        <Link to={`/exchange/${exchange._id}`}>
                            <Button variant="outline">View</Button>
                        </Link>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-textSecondary">{emptyMessage}</p>
        )}
    </div>
);


const DashboardPage = () => {
  const [agreements, setAgreements] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0 });
  const { user } = useContext(AuthContext);

  const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [exchangesResponse, agreementsResponse, registeredEventsRes, hostedEventsRes] = await Promise.all([
            getUserExchanges(),
            getUserAgreements(),
            getRegisteredEvents(),
            user.role === 'mentor' ? getHostedEvents() : Promise.resolve({ data: [] })
        ]);

        const exchangeData = exchangesResponse.data;
        setExchanges(exchangeData);
        setAgreements(agreementsResponse.data);

        const newStats = {
          active: exchangeData.filter(e => e.status === 'accepted').length,
          pending: agreementsResponse.data.filter(a => a.status === 'pending' && a.receiver._id === user._id).length,
          completed: exchangeData.filter(e => e.status === 'completed').length
        };
        setStats(newStats);

        const combinedEvents = [
            ...registeredEventsRes.data.map(e => ({ ...e, type: 'attending' })),
            ...hostedEventsRes.data.map(e => ({ ...e, type: 'hosting' }))
        ];
        combinedEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        setUpcomingEvents(combinedEvents);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
  useEffect(() => {
    fetchDashboardData();
  }, [user]);
  
  const handleAgreementStatusUpdate = async (agreementId, status) => {
    try {
        await updateAgreementStatus(agreementId, status);
        toast.success(`Proposal has been ${status}.`);
        fetchDashboardData(); // Refetch all data to update dashboard
    } catch (error) {
        toast.error(`Failed to ${status} proposal.`);
    }
  };
  
  const incomingAgreements = agreements.filter(a => a.status === 'pending' && a.receiver._id === user?._id);
  const activeExchanges = exchanges.filter(e => e.status === 'accepted');
  const completedExchanges = exchanges.filter(e => e.status === 'completed');

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-textPrimary mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Active Exchanges" value={stats.active} />
        <DashboardCard title="Incoming Proposals" value={stats.pending} />
        <DashboardCard title="Completed Exchanges" value={stats.completed} />
      </div>

       <div className="mt-10">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">My Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
             <ul className="space-y-4">
              {upcomingEvents.map(event => (
                <li key={event._id} className="bg-surface p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{event.title}
                        <span className={`text-xs font-semibold ml-2 px-2 py-0.5 rounded-full ${event.type === 'hosting' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                           {event.type === 'hosting' ? 'Hosting' : 'Attending'}
                        </span>
                    </p>
                    <p className="text-sm text-textSecondary">{new Date(event.eventDate).toLocaleString()}</p>
                  </div>
                  <Link to={`/events/${event._id}`}>
                    <Button>View Event</Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-textSecondary">You have no upcoming events. <Link to="/events" className="text-primary hover:underline">Browse events</Link> to join one!</p>
          )}
        </div>

      <div className="mt-10 grid grid-cols-1 gap-8">
        <AgreementProposalList
            title="Incoming Agreement Proposals"
            agreements={incomingAgreements}
            onStatusUpdate={handleAgreementStatusUpdate}
        />
        <ExchangeList 
            title="Active Exchanges"
            exchanges={activeExchanges}
            emptyMessage="You have no active exchanges. Find a match to get started!"
        />
        <ExchangeList 
            title="Completed Exchanges"
            exchanges={completedExchanges}
            emptyMessage="You haven't completed any exchanges yet."
        />
      </div>
    </div>
  );
};

export default DashboardPage;