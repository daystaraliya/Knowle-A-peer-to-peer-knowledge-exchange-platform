import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
import http from 'http';

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8002;

const server = http.createServer(app);

connectDB()
.then(() => {
    server.on("error", (error) => {
        console.error("HTTP Server Error: ", error);
        throw error;
    });

    server.listen(PORT, () => {
        console.log(`🚀 Admin & Support Service is running at http://localhost:${PORT}`);
    });
})
.catch((err) => {
    console.error("MONGO DB connection failed for Admin Service !!! ", err);
    process.exit(1);
});
