import mongoose from 'mongoose';
const DB_NAME = "knowle";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Admin Service connected to MongoDB !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("ADMIN SERVICE MONGODB connection FAILED: ", error);
        process.exit(1);
    }
};

export default connectDB;
