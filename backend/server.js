const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");
const jobRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// ─── CORS - allow localhost AND vercel ───────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  // Add any other vercel preview URLs you have
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "GlobalTNA API is running ✅" });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("✅ MongoDB connected");
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      process.exit(1);
    });
}