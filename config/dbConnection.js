import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()

const connection = process.env.MONGO_URI;

const dbConnection = async () => {
    try {
        await mongoose.connect(connection, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error("Error connecting to the db...", err.message);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB Disconnected...");
});

export default dbConnection;
