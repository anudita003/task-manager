const router = require("express").Router();
const Project = require("../models/Project");
const auth = require("../middleware/authMiddleware");

// ================= CREATE PROJECT =================
// ONLY ADMIN CAN CREATE
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only admin can create project");
    }

    const project = await Project.create({
      name: req.body.name,
      createdBy: req.user.id,
      members: [req.user.id], // admin is automatically member
    });

    res.json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error creating project");
  }
});


// ================= GET PROJECTS =================
// Admin → all projects
// Member → only their projects
router.get("/", auth, async (req, res) => {
  try {
    let projects;

    if (req.user.role === "admin") {
      projects = await Project.find().populate("members", "name");
    } else {
      projects = await Project.find({
        members: req.user.id,
      }).populate("members", "name");
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json("Error fetching projects");
  }
});


// ================= ADD MEMBER =================
// ONLY ADMIN CAN ADD
router.put("/:id/add", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only admin can add members");
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.body.userId } },
      { new: true }
    ).populate("members", "name");

    res.json(project);
  } catch (err) {
    res.status(500).json("Error adding member");
  }
});


// ================= DELETE PROJECT (OPTIONAL BONUS) =================
// ONLY ADMIN
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only admin can delete project");
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json("Error deleting project");
  }
});

module.exports = router;