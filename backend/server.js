const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const reviewRoutes = require("./routes/reviews");
const mlRoutes = require("./routes/ml");
const studentRoutes = require("./routes/student");
const guideRoutes = require("./routes/guide");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const connectDB = require("./config/db");
const { autoSeedIfEmpty } = require("./seeds/autoSeed");

// Initialize MongoDB Connection (reused across serverless/instance cold-starts)
connectDB()
  .then(() => {
    // Run seed check asynchronously in background without blocking incoming login requests
    setTimeout(() => {
      autoSeedIfEmpty().catch((err) => console.error("Background seed error:", err));
    }, 100);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Database connection readiness middleware for serverless/cold-starts
app.use(async (req, res, next) => {
  // Allow health checks to respond instantly without waiting for DB
  if (req.path === "/health" || req.path === "/api/health" || req.path === "/") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database error on request:", err);
    res.status(503).json({ error: "Database unavailable. Please retry in a moment." });
  }
});

// Routes (mounted on both /api/* and /* for full compatibility)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/users", userRoutes);

app.use("/api/projects", projectRoutes);
app.use("/projects", projectRoutes);

app.use("/api/reviews", reviewRoutes);
app.use("/reviews", reviewRoutes);

app.use("/api/ml", mlRoutes);
app.use("/ml", mlRoutes);

app.use("/api/student", studentRoutes);
app.use("/student", studentRoutes);

app.use("/api/guide", guideRoutes);
app.use("/guide", guideRoutes);

app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) =>
  res.json({
    status: "ok",
    message: "eduTrack Backend API is live and running",
    endpoints: {
      health: "/api/health",
      seed: "/api/seed",
      auth: "/api/auth",
      projects: "/api/projects",
      ml: "/api/ml",
    },
  }),
);
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));
app.get("/api/seed", async (req, res) => {
  const result = await autoSeedIfEmpty();
  res.json(result);
});
app.get("/seed", async (req, res) => {
  const result = await autoSeedIfEmpty();
  res.json(result);
});

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

