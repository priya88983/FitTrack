import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import UserRoutes from "./routes/User.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user/", UserRoutes);

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hii everyone",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("API ERROR:");
  console.error(err.stack || err);

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

const connectDB = () => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Connected to Mongo DB");
    })
    .catch((err) => {
      console.error("Failed to connect with MongoDB");
      console.error(err);
    });
};

const startServer = async () => {
  try {
    connectDB();

    app.listen(8080, () => {
      console.log("Server started on port 8080");
    });
  } catch (error) {
    console.error("Server startup error:");
    console.error(error);
  }
};

startServer();