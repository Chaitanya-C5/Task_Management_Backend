import { config as configDotenv } from "dotenv";
import mongoose from 'mongoose';

configDotenv();

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1); 
    }
};

export default db;