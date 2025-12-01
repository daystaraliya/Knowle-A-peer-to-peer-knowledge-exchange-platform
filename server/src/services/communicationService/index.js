import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import { sendPushNotification } from '../../utils/pushNotifier.js';
import { createClient } from 'redis'; // Import Redis

// --- CONFIGURATION ---
dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 8001;
const DB_NAME = "knowle";

// --- EXPRESS APP SETUP ---
const app = express();
const server = http.createServer(app);
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- DATABASE CONNECTION ---
mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    .then(() => console.log(`Communication Service DB Connected`))
    .catch((err) => {
        console.error("Communication Service DB connection FAILED: ", err);
        process.exit(1);
    });

// --- MONGOOSE MODELS (Simplified for this service) ---
const User = mongoose.model('User', new Schema({ fullName: String }));
const Exchange = mongoose.model('Exchange', new Schema({ initiator: { type: Schema.Types.ObjectId, ref: 'User' }, receiver: { type: Schema.Types.ObjectId, ref: 'User' }}));
const Message = mongoose.model('Message', new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    exchange: { type: Schema.Types.ObjectId, ref: 'Exchange', required: true }
}, { timestamps: true }));
const Notification = mongoose.model('Notification', new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, required: true }
}, { timestamps: true }));
const PushSubscription = mongoose.model('PushSubscription', new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    subscription: { endpoint: String, keys: { p256dh: String, auth: String } }
}));


// --- UTILS & MIDDLEWARE ---
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const authMiddleware = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { _id: new mongoose.Types.ObjectId(decoded._id) };
    next();
});

// --- API ROUTES & CONTROLLERS ---
const router = express.Router();
router.use(authMiddleware);

router.get('/messages/exchange/:exchangeId', asyncHandler(async (req, res) => {
    const { exchangeId } = req.params;
    const exchange = await Exchange.findById(exchangeId);
    if (!exchange.initiator.equals(req.user._id) && !exchange.receiver.equals(req.user._id)) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    const messages = await Message.find({ exchange: exchangeId }).populate('sender', 'fullName avatar _id').sort({ createdAt: 'asc' });
    res.status(200).json({ data: messages });
}));

router.get('/notifications', asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ data: notifications });
}));

router.patch('/notifications/read', asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: "Notifications marked as read" });
}));

app.use('/api/v1', router);
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- SOCKET.IO SETUP ---
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN, credentials: true } });

io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) return next(new Error('Authentication error'));
        const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=').map(decodeURIComponent)));
        const token = cookies.accessToken;
        if (!token) return next(new Error('Authentication error'));
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.user = { _id: new mongoose.Types.ObjectId(decoded._id) };
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

// --- REDIS PUB/SUB FOR INTER-SERVICE COMMUNICATION ---
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const subscriber = createClient({ url: redisUrl });

subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

(async () => {
    try {
        await subscriber.connect();
        console.log('Redis Subscriber connected.');

        await subscriber.subscribe('agreement:new', async (message) => {
            const { agreement, proposerName } = JSON.parse(message);
            const notification = await Notification.create({
                user: agreement.receiver,
                message: `${proposerName} sent you an agreement proposal.`,
                link: `/dashboard` // Link to dashboard where they can see it
            });
            io.to(`user-${agreement.receiver}`).emit('newNotification', notification);
        });

        await subscriber.subscribe('agreement:update', async (message) => {
            const { agreement, actorName } = JSON.parse(message);
            const otherParticipantId = agreement.proposer === actorName._id ? agreement.receiver : agreement.proposer;
            const notification = await Notification.create({
                user: otherParticipantId,
                message: `${actorName} has ${agreement.status} your agreement proposal.`,
                link: agreement.status === 'accepted' ? `/exchange/${agreement.relatedExchange}` : `/dashboard`
            });
            io.to(`user-${otherParticipantId}`).emit('newNotification', notification);
            io.to(`user-${agreement.proposer}`).to(`user-${agreement.receiver}`).emit('agreement_status_updated', agreement);
        });

    } catch (err) {
        console.error('Failed to connect Redis Subscriber:', err);
    }
})();


io.on('connection', (socket) => {
    console.log('✅ User connected to Comm Service:', socket.user._id.toString());
    socket.join(`user-${socket.user._id}`);

    socket.on('joinExchange', (exchangeId) => socket.join(`exchange-${exchangeId}`));
    socket.on('leaveExchange', (exchangeId) => socket.leave(`exchange-${exchangeId}`));

    socket.on('sendMessage', async ({ exchangeId, content }) => {
        try {
            const exchange = await Exchange.findById(exchangeId);
            if (!exchange || (!exchange.initiator.equals(socket.user._id) && !exchange.receiver.equals(socket.user._id))) return;
            
            const receiverId = exchange.initiator.equals(socket.user._id) ? exchange.receiver : exchange.initiator;
            const message = await Message.create({ sender: socket.user._id, receiver: receiverId, exchange: exchangeId, content });
            const populatedMessage = await Message.findById(message._id).populate('sender', 'fullName avatar');
            io.to(`exchange-${exchangeId}`).emit('newMessage', populatedMessage);
            
            const senderUser = populatedMessage.sender;
            const payload = { title: `New message from ${senderUser.fullName}`, body: content, data: { url: `/exchange/${exchangeId}` } };
            await sendPushNotification(receiverId, payload);

        } catch (error) {
            console.error('sendMessage error:', error);
        }
    });

    socket.on('webrtc:call', async ({ exchangeId, offer }) => {
        try {
            const exchange = await Exchange.findById(exchangeId);
            if (!exchange || (!exchange.initiator.equals(socket.user._id) && !exchange.receiver.equals(socket.user._id))) return;
            const otherUserId = exchange.initiator.equals(socket.user._id) ? exchange.receiver : exchange.initiator;
            socket.to(`user-${otherUserId}`).emit('webrtc:offer-received', { offer, callerId: socket.user._id });
        } catch (error) { console.error('webrtc:call error:', error); }
    });

    socket.on('webrtc:answer', async ({ exchangeId, answer }) => {
        try {
            const exchange = await Exchange.findById(exchangeId);
            if (!exchange || (!exchange.initiator.equals(socket.user._id) && !exchange.receiver.equals(socket.user._id))) return;
            const otherUserId = exchange.initiator.equals(socket.user._id) ? exchange.receiver : exchange.initiator;
            socket.to(`user-${otherUserId}`).emit('webrtc:answer-received', { answer });
        } catch (error) { console.error('webrtc:answer error:', error); }
    });

    socket.on('webrtc:ice-candidate', async ({ exchangeId, candidate }) => {
        try {
            const exchange = await Exchange.findById(exchangeId);
            if (!exchange || (!exchange.initiator.equals(socket.user._id) && !exchange.receiver.equals(socket.user._id))) return;
            const otherUserId = exchange.initiator.equals(socket.user._id) ? exchange.receiver : exchange.initiator;
            socket.to(`user-${otherUserId}`).emit('webrtc:ice-candidate-received', { candidate });
        } catch (error) { console.error('webrtc:ice-candidate error:', error); }
    });
    
    socket.on('webrtc:hangup', async ({ exchangeId }) => {
        try {
            const exchange = await Exchange.findById(exchangeId);
            if (!exchange || (!exchange.initiator.equals(socket.user._id) && !exchange.receiver.equals(socket.user._id))) return;
            const otherUserId = exchange.initiator.equals(socket.user._id) ? exchange.receiver : exchange.initiator;
            socket.to(`user-${otherUserId}`).emit('webrtc:hangup-received');
        } catch (error) { console.error('webrtc:hangup error:', error); }
    });

    socket.on('disconnect', () => console.log('❌ User disconnected from Comm Service:', socket.user._id.toString()));
});

server.listen(PORT, () => console.log(`🚀 Communication Service running at http://localhost:${PORT}`));