const mongoose = require("mongoose");
const dns = require("dns");

// Fix for Windows / ISP DNS servers that fail on MongoDB Atlas SRV lookups (querySrv ECONNREFUSED)
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
    // Ignore if not supported
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB is connected");
    } catch (error) {
        console.log("MongoDB connection failed: ", error.message);
    }
};

module.exports = connectDB;