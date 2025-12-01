import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        /**
         * For production scalability, a MongoDB Replica Set is essential for high availability and redundancy.
         * The connection string (`MONGODB_URI`) should be formatted to include all members of the replica set.
         *
         * Example for a 3-member replica set:
         * MONGODB_URI=mongodb://mongo1.example.com:27017,mongo2.example.com:27017,mongo3.example.com:27017/knowle?replicaSet=rs0
         *
         * - `mongo1`, `mongo2`, `mongo3` are the hosts of the replica set members.
         * - `rs0` is the name of the replica set.
         *
         * The Mongoose driver will automatically handle failover if the primary node becomes unavailable.
         */
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection FAILED: ", error);
        process.exit(1);
    }
};

export default connectDB;
