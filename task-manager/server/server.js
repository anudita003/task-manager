const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== HEALTH CHECK (IMPORTANT FIRST) ================== */
app.get("/", (req, res) => {
  res.send("🚀 API Running");
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
    // ❌ process.exit removed (IMPORTANT)
  });

/* ================== ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

/* ================== SERVER START ================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});