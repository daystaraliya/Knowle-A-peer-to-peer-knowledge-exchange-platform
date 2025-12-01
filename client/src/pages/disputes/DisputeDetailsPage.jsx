import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getDisputeDetails, postDisputeMessage } from '../../api/disputeApi';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const DisputeDetailsPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [dispute, setDispute] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchDetails = async () => {
        try {
            const response = await getDisputeDetails(id);
            setDispute(response.data.dispute);
            setMessages(response.data.messages);
        } catch (error) {
            toast.error("Could not load dispute details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchDetails();
    }, [id]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const response = await postDisputeMessage(id, { content: newMessage });
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <p className="text-center">Loading Resolution Center...</p>;
    if (!dispute) return <p className="text-center">Dispute not found.</p>;
    
    const statusStyles = {
        open: 'bg-yellow-100 text-yellow-800',
        under_review: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-surface p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-textPrimary">Dispute Details</h1>
                        <p className="text-textSecondary">
                            Regarding exchange: <Link to={`/exchange/${dispute.relatedExchange._id}`} className="text-primary hover:underline">View Exchange</Link>
                        </p>
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusStyles[dispute.status]}`}>
                        {dispute.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="border-t my-4"></div>
                <div>
                    <p><span className="font-semibold">Complainant:</span> {dispute.complainant.fullName}</p>
                    <p><span className="font-semibold">Respondent:</span> {dispute.respondent.fullName}</p>
                    <p><span className="font-semibold">Reason:</span> {dispute.reason}</p>
                </div>
            </div>

            <div className="bg-surface rounded-lg shadow-md flex flex-col h-[60vh]">
                <h2 className="text-lg font-bold p-4 border-b">Resolution Chat</h2>
                <div className="flex-grow p-4 overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg._id} className={`flex items-start mb-4 ${msg.author?._id === user._id ? 'justify-end' : 'justify-start'}`}>
                            {msg.author && msg.author._id !== user._id && (
                                <img src={msg.author.avatar || `https://ui-avatars.com/api/?name=${msg.author.fullName}`} alt={msg.author.fullName} className="w-8 h-8 rounded-full mr-3" />
                            )}
                            {msg.isSupportMessage && (
                                <div className="w-8 h-8 rounded-full mr-3 bg-indigo-500 text-white flex items-center justify-center font-bold text-lg shrink-0">🤖</div>
                            )}

                            <div className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-md ${
                                msg.isSupportMessage ? 'bg-indigo-100 text-indigo-900' :
                                msg.author?._id === user._id ? 'bg-primary text-white' : 'bg-gray-200 text-textPrimary'
                            }`}>
                                <p className="font-bold text-sm">{msg.isSupportMessage ? "Gemini Support" : msg.author?.fullName}</p>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-xs mt-1 text-right ${msg.author?._id === user._id ? 'text-indigo-200' : 'text-textSecondary'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                            </div>

                             {msg.author?._id === user._id && (
                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}`} alt={user.fullName} className="w-8 h-8 rounded-full ml-3" />
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {dispute.status !== 'resolved' && (
                    <form onSubmit={handleSendMessage} className="p-4 border-t flex">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message to support..."
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        <Button type="submit" disabled={sending} className="rounded-l-none">
                            {sending ? 'Sending...' : 'Send'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DisputeDetailsPage;