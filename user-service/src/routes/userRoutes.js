import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* -------------------- GOOGLE OAuth -------------------- */

// Step 1: Redirect to Google
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
router.get("/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/users/auth/failed" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Get current logged in user
router.get("/auth/me", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json(decoded);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout
router.get("/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/failed", (req, res) => {
  res.status(401).json({ error: "Google authentication failed" });
});

/* -------------------- CREATE USER -------------------- */

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ message: error });
  }
});

/* -------------------- GET USER BY ID -------------------- */

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    console.error("User fetch error:", error);
    return res.status(500).json({ message: "Error fetching user" });
  }
});

/* -------------------- GET ALL USERS -------------------- */

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;