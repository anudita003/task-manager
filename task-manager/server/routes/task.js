const router = require("express").Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/authMiddleware");

// ================= CREATE TASK =================
router.post("/", auth, async (req, res) => {
  try {
    const { title, assignedTo, projectId, dueDate, priority } = req.body;

    // 🔥 Check if project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json("Project not found");

    // 🔐 Member restriction: must be part of project
    if (
      req.user.role !== "admin" &&
      !project.members.includes(req.user.id)
    ) {
      return res.status(403).json("Not part of this project");
    }

    const task = await Task.create({
      title,
      assignedTo,
      project: projectId,
      dueDate,
      priority,
      status: "todo",
    });

    res.json(task);
  } catch (err) {
    res.status(500).json("Error creating task");
  }
});

// ================= GET TASKS =================
router.get("/", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      // Admin → all tasks
      tasks = await Task.find()
        .populate("assignedTo", "name")
        .populate("project", "name");
    } else {
      // Member → only assigned tasks
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedTo", "name")
        .populate("project", "name");
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json("Error fetching tasks");
  }
});

// ================= UPDATE STATUS =================
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json("Task not found");

    // 🔐 Member can update only own task
    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json("Not allowed");
    }

    task.status = req.body.status;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json("Update error");
  }
});

// ================= DELETE TASK =================
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json("Task not found");

    // 🔐 Only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json("Only admin can delete task");
    }

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json("Delete error");
  }
});

// ================= STATS =================
router.get("/stats", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find().populate("assignedTo", "name");
    } else {
      tasks = await Task.find({ assignedTo: req.user.id }).populate(
        "assignedTo",
        "name"
      );
    }

    const stats = {
      total: tasks.length,
      todo: 0,
      done: 0,
      overdue: 0,
      perUser: {},
    };

    tasks.forEach((t) => {
      if (t.status === "todo") stats.todo++;
      if (t.status === "done") stats.done++;

      // 🔥 Overdue logic
      if (
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== "done"
      ) {
        stats.overdue++;
      }

      const userName = t.assignedTo?.name || "Unassigned";

      if (!stats.perUser[userName]) {
        stats.perUser[userName] = 0;
      }

      stats.perUser[userName]++;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json("Stats error");
  }
});

module.exports = router;