const router = require("express").Router();
const Project = require("../models/Project");
const auth = require("../middleware/authMiddleware");


// ================= CREATE PROJECT =================
// ONLY ADMIN CAN CREATE
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create project" });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name required" });
    }

    const project = await Project.create({
      name,
      createdBy: req.user.id,
      members: [req.user.id], // ✅ admin auto member
    });

    const populatedProject = await Project.findById(project._id)
      .populate("members", "name");

    res.json(populatedProject); // ✅ IMPORTANT
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating project" });
  }
});


// ================= GET PROJECTS =================
// Admin → all projects
// Member → only their projects
router.get("/", auth, async (req, res) => {
  try {
    let projects;

    if (req.user.role === "admin") {
      projects = await Project.find()
        .populate("members", "name");
    } else {
      projects = await Project.find({
        members: req.user.id, // ✅ correct filter
      }).populate("members", "name");
    }

    res.json(projects || []); // ✅ always array
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching projects" });
  }
});


// ================= ADD MEMBER =================
// ONLY ADMIN CAN ADD
router.put("/:id/add", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "name");

    res.json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding member" });
  }
});


// ================= DELETE PROJECT =================
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete project" });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting project" });
  }
});

module.exports = router;