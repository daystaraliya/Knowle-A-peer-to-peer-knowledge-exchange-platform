import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';
import { getMessageHistory } from '../../api/chatApi';
import Button from '../Button';
import toast from 'react-hot-toast';

const ChatWindow = ({ exchangeId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socket = useSocket();
    const { user } = useContext(AuthContext);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getMessageHistory(exchangeId);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to fetch message history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [exchangeId]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('joinExchange', exchangeId);

        const handleNewMessage = (message) => {
            setMessages(prev => [...prev, message]);
             // Notify user if they are not the sender
            if (message.sender._id !== user._id) {
                toast(`${message.sender.fullName.split(' ')[0]} sent a message.`, { icon: '💬' });
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.emit('leaveExchange', exchangeId);
        };
    }, [socket, exchangeId, user._id]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket) return;

        const messageData = {
            exchangeId,
            content: newMessage,
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
    };

    if (loading) return <p>Loading chat...</p>;

    return (
        <div className="bg-surface rounded-lg shadow-md flex flex-col h-[70vh]">
            <h2 className="text-lg font-bold p-4 border-b">Exchange Chat</h2>
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start mb-4 ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender._id !== user._id && (
                            <img src={msg.sender.avatar || `https://ui-avatars.com/api/?name=${msg.sender.fullName}`} alt={msg.sender.fullName} className="w-8 h-8 rounded-full mr-3" />
                        )}
                        <div className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-md ${msg.sender._id === user._id ? 'bg-primary text-white' : 'bg-gray-200 text-textPrimary'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.sender._id === user._id ? 'text-indigo-200' : 'text-textSecondary'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</p>
                        </div>
                         {msg.sender._id === user._id && (
                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}`} alt={user.fullName} className="w-8 h-8 rounded-full ml-3" />
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <Button type="submit" className="rounded-l-none">Send</Button>
            </form>
        </div>
    );
};

export default ChatWindow;