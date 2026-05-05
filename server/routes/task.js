const router = require("express").Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/authMiddleware");

// ================= CREATE TASK =================
router.post("/", auth, async (req, res) => {
  try {
    // 🔒 Only admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create tasks" });
    }

    let { title, assignedTo, projectId, dueDate, priority } = req.body;

    // 🔥 Validation
    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    // 🔥 FIX: priority lowercase
    if (priority) {
      priority = priority.toLowerCase();
    }

    let project = null;

    // 🔥 Project validation
    if (projectId) {
      project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // 🔥 FIX: safe ObjectId compare
      if (assignedTo) {
        const isMember = project.members
          .map((m) => m.toString())
          .includes(assignedTo.toString());

        // 🔥 auto-add member to project
        if (!isMember) {
          project.members.push(assignedTo);
          await project.save();
        }
      }
    }

    const task = await Task.create({
      title,
      assignedTo: assignedTo || null,
      project: projectId || null,
      dueDate,
      priority: priority || "low",
      status: "todo",
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name")
      .populate("project", "name");

    res.json(populatedTask);

  } catch (err) {
    console.log("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Error creating task" });
  }
});


// ================= GET TASKS =================
router.get("/", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name")
        .populate("project", "name");
    } else {
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedTo", "name")
        .populate("project", "name");
    }

    res.json(tasks || []);

  } catch (err) {
    console.log("GET TASK ERROR:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});


// ================= UPDATE STATUS =================
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔐 Member restriction
    if (
      req.user.role !== "admin" &&
      task.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.status = req.body.status;
    await task.save();

    const updated = await Task.findById(task._id)
      .populate("assignedTo", "name")
      .populate("project", "name");

    res.json(updated);

  } catch (err) {
    console.log("UPDATE TASK ERROR:", err);
    res.status(500).json({ message: "Update error" });
  }
});


// ================= DELETE TASK =================
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete task" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted" });

  } catch (err) {
    console.log("DELETE TASK ERROR:", err);
    res.status(500).json({ message: "Delete error" });
  }
});


// ================= STATS =================
router.get("/stats", auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find().populate("assignedTo", "name");
    } else {
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedTo", "name");
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

      // overdue
      if (
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== "done"
      ) {
        stats.overdue++;
      }

      const userName = t.assignedTo?.name || "Unassigned";

      stats.perUser[userName] =
        (stats.perUser[userName] || 0) + 1;
    });

    res.json(stats);

  } catch (err) {
    console.log("STATS ERROR:", err);
    res.status(500).json({ message: "Stats error" });
  }
});

module.exports = router;