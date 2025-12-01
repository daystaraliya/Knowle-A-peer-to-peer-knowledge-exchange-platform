import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { getNotifications, markNotificationsAsRead } from '../api/notificationApi';
import { savePushSubscription } from '../api/pushApi'; // New import
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from './Button';

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const socket = useSocket();
    const [permissionStatus, setPermissionStatus] = useState('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermissionStatus(Notification.permission);
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await getNotifications();
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
            toast.success(notification.message, {
                icon: '🔔',
            });
        };

        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }, [socket]);

    const handleToggle = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            try {
                await markNotificationsAsRead();
                setNotifications(notifications.map(n => ({...n, isRead: true})));
            } catch (error) {
                console.error("Failed to mark notifications as read", error);
            }
        }
    };
    
    const handleRequestPermission = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast.error("Push notifications are not supported in this browser.");
            return;
        }

        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);

        if (permission === 'granted') {
            subscribeUserToPush();
        } else {
            toast.error("Push notification permission denied.");
        }
    };

    const subscribeUserToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();
            
            if (existingSubscription) {
                console.log('User is already subscribed.');
                await savePushSubscription(existingSubscription);
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
            });

            await savePushSubscription(subscription);
            toast.success("Push notifications enabled!");
        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
            toast.error("Failed to enable push notifications.");
        }
    };

    return (
        <div className="relative">
            <button onClick={handleToggle} className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-textSecondary hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface rounded-md shadow-lg z-20">
                    <div className="p-2 font-semibold border-b flex justify-between items-center">
                        <span>Notifications</span>
                        {permissionStatus !== 'granted' && (
                             <Button onClick={handleRequestPermission} className="text-xs py-1 px-2">Enable</Button>
                        )}
                    </div>
                    <div className="py-1 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <Link
                                    key={notif._id}
                                    to={notif.link}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-2 text-sm text-textPrimary hover:bg-gray-100 ${!notif.isRead ? 'bg-indigo-50' : ''}`}
                                >
                                    {notif.message}
                                    <p className="text-xs text-textSecondary mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                </Link>
                            ))
                        ) : (
                            <p className="px-4 py-3 text-sm text-textSecondary">No notifications yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;