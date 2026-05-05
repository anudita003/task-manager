require("dotenv").config();  // 🔥 FIRST LINE

console.log("ENV CHECK:", process.env.MONGO_URI);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== BASIC TEST ROUTE ================== */
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
const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ DB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB ERROR:", err);
    process.exit(1);
  });