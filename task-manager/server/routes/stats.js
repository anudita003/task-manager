const router = require("express").Router();
const Task = require("../models/Task");

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo");

    const total = tasks.length;
    const todo = tasks.filter(t => t.status === "todo").length;
    const done = tasks.filter(t => t.status === "done").length;

    const overdue = tasks.filter(
      t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    ).length;

    const perUser = {};
    tasks.forEach(t => {
      if (t.assignedTo) {
        const name = t.assignedTo.name;
        perUser[name] = (perUser[name] || 0) + 1;
      }
    });

    res.json({ total, todo, done, overdue, perUser });

  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Stats error" });
  }
});

module.exports = router;