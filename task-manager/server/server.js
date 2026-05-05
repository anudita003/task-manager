const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== HEALTH CHECK ================== */
app.get("/", (req, res) => {
  res.status(200).json({
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
  console.error("❌ SERVER ERROR:", err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
  });
});

/* ================== DB + SERVER START ================== */
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1); // stop app if DB fails
  }
};

startServer();