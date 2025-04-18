import express from "express";

import authRoutes from "./routes/auth/authRoutes.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import sessionMiddleware from "./middleware/sessionMiddleWare.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware to prevent caching for sensitive routes like login
app.use("/login", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Middleware
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);

// View engine setup
app.set("view engine", "ejs");
app.set("views", "views");

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle process termination
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("erorr Closing MongoDb Connection:", err);
    process.exit(0);
  }
});
