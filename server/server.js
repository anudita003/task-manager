require("dotenv").config(); // 🔥 always first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== BASIC TEST ROUTES ================== */

// 🔥 ultra test (use this to check Railway)
app.get("/health", (req, res) => {
  res.send("OK");
});

// ping test
app.get("/ping", (req, res) => {
  res.send("pong");
});

/* ================== HEALTH CHECK ================== */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "🚀 API Running",
  });
});

/* ================== DEBUG ROUTE ================== */
app.get("/test", (req, res) => {
  res.send("WORKING ✅");
});

/* ================== ROUTES ================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/task"));
app.use("/api/projects", require("./routes/project"));
app.use("/api/stats", require("./routes/stats"));

/* ================== ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
  });
});

/* ================== START SERVER ================== */

// 🔥 IMPORTANT FIX
const PORT = Number(process.env.PORT) || 8080;

// debug (optional)
console.log("ENV CHECK:", process.env.MONGO_URI ? "MONGO OK" : "MONGO MISSING");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected");

    // 🔥 VERY IMPORTANT FOR RAILWAY
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB ERROR:", err);
    process.exit(1);
  });