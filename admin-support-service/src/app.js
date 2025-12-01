import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'Admin & Support Service' });
});

// Routes import
import adminRouter from './routes/admin.routes.js';

// Routes declaration
app.use('/api/v1', adminRouter);


// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
    });
});

export { app };
