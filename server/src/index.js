import 'ignore-styles'; // Add this line to handle CSS imports on the server for SSR
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
import http from 'http';
import { seedAchievements } from './db/seed.js';
import { initRedis } from './utils/cache.js'; // Import Redis initializer

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

connectDB()
.then(() => {
    // Initialize Redis connection
    return initRedis();
})
.then(() => {
    // Seed the database with achievements on startup
    seedAchievements().catch(err => console.error("Achievement seeding failed:", err));

    server.on("error", (error) => {
        console.error("HTTP Server Error: ", error);
        throw error;
    });

    server.listen(PORT, () => {
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
})
.catch((err) => {
    console.error("MONGO DB or Redis connection failed !!! ", err);
    process.exit(1);
});
