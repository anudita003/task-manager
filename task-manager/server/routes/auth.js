const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔴 VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔴 EMAIL FORMAT CHECK (NEW)
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 🔴 PASSWORD LENGTH CHECK (NEW)
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 🔴 CHECK EXISTING USER
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 🔒 ROLE SECURITY (VERY IMPORTANT)
    // Only allow admin if explicitly set (you can control this later)
    const userRole = role === "admin" ? "admin" : "member";

    // 👤 CREATE USER
    const user = await User.create({
      name,
      email,
      password: hash,
      role: userRole,
    });

    // 🔑 GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ RESPONSE (NO PASSWORD)
    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup error" });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔴 VALIDATION
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔴 CHECK USER
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔑 TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ RESPONSE
    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login error" });
  }
});


// ================= GET USERS =================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = router;
// ================= MAKE ADMIN (TEMP ROUTE) =================
router.get("/make-admin/:email", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { role: "admin" },
      { new: true }
    );

    if (!user) return res.status(404).json("User not found");

    res.json({ message: "User is now admin", user });
  } catch (err) {
    res.status(500).json("Error updating role");
  }
});