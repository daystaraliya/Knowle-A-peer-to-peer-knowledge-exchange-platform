import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';

// --- SSR Imports (Disabled for local development) ---
// import React from 'react';
// import ReactDOMServer from 'react-dom/server';
// import { StaticRouter } from 'react-router-dom/server';
// import App from '../../client/src/pages/App.jsx';
// Note: AuthProvider and SocketProvider are not used in this basic SSR setup
// as they rely on browser-specific features. The initial render is for SEO.
// The client-side hydration will bring in the full context functionality.

const app = express();

// Middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// A special raw body parser for the Stripe webhook
// Must be defined before the general json parser
import { stripeWebhook } from './controllers/payment.controllers.js';
app.post('/api/v1/payments/webhook', express.raw({type: 'application/json'}), stripeWebhook);


app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public')); // Server's public folder
app.use(cookieParser());

// Routes import
import userRouter from './routes/user.routes.js';
import exchangeRouter from './routes/exchange.routes.js';
import topicRouter from './routes/topic.routes.js';
import projectRouter from './routes/project.routes.js';
import skillTreeRouter from './routes/skillTree.routes.js';
// import messageRouter from './routes/message.routes.js'; // Decoupled to microservice
// import notificationRouter from './routes/notification.routes.js'; // Decoupled to microservice
import achievementRouter from './routes/achievement.routes.js';
import leaderboardRouter from './routes/leaderboard.routes.js';
import forumRouter from './routes/forum.routes.js';
import postRouter from './routes/post.routes.js';
import mentorRouter from './routes/mentor.routes.js';
import paymentRouter from './routes/payment.routes.js';
import recordingRouter from './routes/recording.routes.js';
import assessmentRouter from './routes/assessment.routes.js';
import resourceRouter from './routes/resource.routes.js';
import eventRouter from './routes/event.routes.js';
import featureRequestRouter from './routes/featureRequest.routes.js';
import onboardingRouter from './routes/onboarding.routes.js';
// import sitemapRouter from './routes/sitemap.routes.js'; // New Import for sitemap (missing file)
import agreementRouter from './routes/agreement.routes.js'; // New Import for agreements
import disputeRouter from './routes/dispute.routes.js'; // New Import for disputes

// Routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/exchanges', exchangeRouter);
app.use('/api/v1/topics', topicRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/skill-trees', skillTreeRouter);
// app.use('/api/v1/messages', messageRouter); // Decoupled to microservice
// app.use('/api/v1/notifications', notificationRouter); // Decoupled to microservice
app.use('/api/v1/achievements', achievementRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);
app.use('/api/v1/forums', forumRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/mentors', mentorRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/recordings', recordingRouter);
app.use('/api/v1/assessment', assessmentRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/feature-requests', featureRequestRouter);
app.use('/api/v1/onboarding', onboardingRouter);
// app.use('/', sitemapRouter); // New Route for sitemap (missing file)
app.use('/api/v1/agreements', agreementRouter); // New Route for agreements
app.use('/api/v1/disputes', disputeRouter); // New Route for disputes


// --- SEO & SSR Configuration (Disabled for local development) ---
// const __dirname = path.resolve();
// const clientBuildPath = path.resolve(__dirname, '..', 'client', 'dist');

// Serve static assets from the Vite build directory
// app.use(express.static(clientBuildPath, { index: false }));

// Basic API health check route for development
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Knowle API Server is running',
        timestamp: new Date().toISOString()
    });
});

// Handle 404 for non-API routes
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api/')) {
        return next();
    }
    res.status(404).json({ message: 'Route not found. This is the API server - use the client server for frontend.' });
});

export { app };