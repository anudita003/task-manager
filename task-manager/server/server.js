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
  res.json({
    status: "OK",
    message: "🚀 API Running",
  });
});

/* ================== DEBUG ROUTE (VERY IMPORTANT) ================== */
app.get("/test", (req, res) => {
  res.send("WORKING ✅");
});

/* ================== ROUTES ================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/task"));
app.use("/api/projects", require("./routes/project"));
app.use("/api/stats", require("./routes/stats"));

/* ================== DB CONNECT ================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
  });

/* ================== ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
  });
});

/* ================== SERVER START ================== */
const PORT = process.env.PORT || 8080; // 🔥 Railway default

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});