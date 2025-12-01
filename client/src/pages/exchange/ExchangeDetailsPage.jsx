import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { getExchangeDetails, updateExchangeStatus, submitReview, getRecordingsForExchange, confirmCompletion } from '../../api/exchangeApi';
import { createProject } from '../../api/projectApi';
import { AuthContext } from '../../context/AuthContext';
import ChatWindow from '../../components/exchange/ChatWindow';
import VideoSession from '../../components/exchange/VideoSession';
import RecordingList from '../../components/exchange/RecordingList';
import toast from 'react-hot-toast';

const ReviewForm = ({ exchangeId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await submitReview(exchangeId, { rating, review });
            onReviewSubmitted();
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 border-t pt-6">
            <h3 className="text-xl font-bold text-textPrimary mb-4">Leave a Review</h3>
            <div className="mb-4">
                <label className="block text-sm font-medium text-textSecondary mb-2">Your Rating</label>
                <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none">
                            <svg className={`w-8 h-8 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-4">
                <label htmlFor="review" className="block text-sm font-medium text-textSecondary">Your Review (optional)</label>
                <textarea id="review" value={review} onChange={(e) => setReview(e.target.value)} rows="3" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
            </div>
            <Button type="submit" disabled={loading || rating === 0}>{loading ? 'Submitting...' : 'Submit Review'}</Button>
        </form>
    )
}

const ExchangeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exchange, setExchange] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectLoading, setProjectLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('session');

  const fetchDetails = useCallback(async () => {
    try {
        // No need to set loading true on refetch, just on initial load
        const [exchangeRes, recordingsRes] = await Promise.all([
            getExchangeDetails(id),
            getRecordingsForExchange(id)
        ]);
        setExchange(exchangeRes.data);
        setRecordings(recordingsRes.data);
      } catch (err) {
        setError("Failed to fetch exchange details or you don't have permission to view this.");
        console.error(err);
      } finally {
        setLoading(false);
      }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchDetails();
  }, [fetchDetails]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await updateExchangeStatus(id, newStatus);
      setExchange(response.data); // Update local state with new exchange data
      if (newStatus === 'accepted' || newStatus === 'rejected') {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(`Failed to ${newStatus} exchange.`);
      console.error(err);
    }
  };
  
  const handleConfirmCompletion = async () => {
      try {
          const response = await confirmCompletion(id);
          setExchange(response.data);
          toast.success("You have confirmed the completion of the exchange.");
      } catch (err) {
          toast.error(err.response?.data?.message || "Could not confirm completion.");
      }
  };

  const handleCreateProject = async () => {
    setProjectLoading(true);
    try {
        const response = await createProject(exchange._id);
        toast.success("Project started successfully!");
        navigate(`/projects/${response.data._id}`);
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to start project.';
        setError(errorMessage);
        toast.error(errorMessage);
    } finally {
        setProjectLoading(false);
    }
  }
  
  if (loading) return <p className="text-center">Loading exchange...</p>;
  if (error && !exchange) return <p className="text-center text-red-500">{error}</p>;
  if (!exchange) return <p className="text-center">Exchange not found.</p>;
  
  const isReceiver = user?._id === exchange.receiver._id;
  const isInitiator = user?._id === exchange.initiator._id;
  const otherParticipant = isInitiator ? exchange.receiver : exchange.initiator;
  
  const hasUserReviewed = (isInitiator && exchange.initiatorRating) || (isReceiver && exchange.receiverRating);

  const statusColor = {
    pending: 'text-yellow-500',
    accepted: 'text-green-500',
    rejected: 'text-red-500',
    completed: 'text-blue-500',
    cancelled: 'text-gray-500',
  };

  const canStartProject = (exchange.status === 'accepted' || exchange.status === 'completed') && !exchange.project;
  const canReportIssue = exchange.status === 'accepted' || exchange.status === 'completed';

  const hasUserConfirmedCompletion = (isInitiator && exchange.initiatorCompleted) || (isReceiver && exchange.receiverCompleted);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-4xl font-bold text-textPrimary mb-2">Exchange Details</h1>
        <p className="text-textSecondary mb-6">Exchange between {exchange.initiator.fullName} and {exchange.receiver.fullName}</p>
        <div className="bg-surface p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span className={`capitalize font-bold ${statusColor[exchange.status]}`}>{exchange.status}</span>
            </div>
            {canStartProject && (
                <Button onClick={handleCreateProject} disabled={projectLoading}>
                    {projectLoading ? 'Starting...' : '🚀 Start a Project'}
                </Button>
            )}
            {exchange.project && (
              <Link to={`/projects/${exchange.project}`}>
                <Button variant="secondary">View Project</Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b py-6">
            <div className="text-center">
              <Link to={`/users/${exchange.initiator.slug}`} className="group">
                <img src={exchange.initiator.avatar || `https://ui-avatars.com/api/?name=${exchange.initiator.fullName}`} alt={exchange.initiator.fullName} className="w-20 h-20 rounded-full mx-auto mb-2 group-hover:opacity-80 transition-opacity" />
                <p className="font-bold group-hover:underline">{exchange.initiator.fullName}</p>
              </Link>
              <p className="text-sm text-textSecondary">will teach</p>
              <p className="text-lg font-semibold text-primary">{exchange.topicToTeach.name}</p>
            </div>
            <div className="text-center">
              <Link to={`/users/${exchange.receiver.slug}`} className="group">
                <img src={exchange.receiver.avatar || `https://ui-avatars.com/api/?name=${exchange.receiver.fullName}`} alt={exchange.receiver.fullName} className="w-20 h-20 rounded-full mx-auto mb-2 group-hover:opacity-80 transition-opacity" />
                <p className="font-bold group-hover:underline">{exchange.receiver.fullName}</p>
              </Link>
              <p className="text-sm text-textSecondary">will teach</p>
              <p className="text-lg font-semibold text-secondary">{exchange.topicToLearn.name}</p>
            </div>
          </div>
          
          <p className="text-textSecondary my-6 text-center">
            {exchange.initiator.fullName} initiated this request to learn "{exchange.topicToLearn.name}" in exchange for teaching "{exchange.topicToTeach.name}".
          </p>

          <div className="flex justify-end space-x-4">
              {isReceiver && exchange.status === 'pending' && (
                  <>
                  <Button variant="outline" onClick={() => handleStatusUpdate('rejected')}>Decline</Button>
                  <Button onClick={() => handleStatusUpdate('accepted')}>Accept</Button>
                  </>
              )}
              {exchange.status === 'accepted' && (
                <>
                  {hasUserConfirmedCompletion ? (
                    <Button variant="secondary" disabled>Waiting for {otherParticipant.fullName}...</Button>
                  ) : (
                    <Button variant="secondary" onClick={handleConfirmCompletion}>Confirm Completion</Button>
                  )}
                </>
              )}
          </div>

          {exchange.status === 'completed' && !hasUserReviewed && (
              <ReviewForm exchangeId={exchange._id} onReviewSubmitted={fetchDetails} />
          )}

          {exchange.status === 'completed' && hasUserReviewed && (
              <div className="mt-6 border-t pt-6 text-center text-green-600 font-semibold">
                  Thank you for your review!
              </div>
          )}

          {canReportIssue && (
            <div className="mt-6 border-t pt-6 flex justify-end">
                <Link to={`/dispute/new/${exchange._id}`}>
                    <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                        Report an Issue
                    </Button>
                </Link>
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-1">
        {exchange.status === 'accepted' ? (
          <div className="bg-surface rounded-lg shadow-md h-[70vh] flex flex-col">
            <div className="border-b">
              <nav className="flex space-x-4 p-2" aria-label="Tabs">
                <button onClick={() => setActiveTab('session')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'session' ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}>Session</button>
                <button onClick={() => setActiveTab('chat')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'chat' ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}>Chat</button>
                <button onClick={() => setActiveTab('recordings')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'recordings' ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}>Recordings</button>
              </nav>
            </div>
            <div className="flex-grow overflow-hidden">
                {activeTab === 'session' && <VideoSession exchangeId={exchange._id} otherParticipant={otherParticipant} />}
                {activeTab === 'chat' && <ChatWindow exchangeId={exchange._id} />}
                {activeTab === 'recordings' && <RecordingList recordings={recordings} />}
            </div>
          </div>
        ) : (
             <div className="bg-surface rounded-lg shadow-md p-6 text-center">
                <h3 className="text-lg font-semibold">Session Tools</h3>
                <p className="text-textSecondary mt-2">Accept the exchange to access the chat and session recording tools.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeDetailsPage;