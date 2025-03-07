// src/app.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import client from "prom-client";

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

dotenv.config();
connectDB();

const app = express();

// Trust proxy if behind a proxy (e.g., Heroku, Nginx)
app.set("trust proxy", 1);


app.use(cors());
// For all other routes, use JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    console.log("req.originalUrl --> ", req.originalUrl);
    const labels = {
      route: req.originalUrl, // Use originalUrl to capture the full path
      code: res.statusCode,
      method: req.method
    };
    end(labels);
  });
  next();
});



app.use("/api/auth", authRoutes);


export default app;
