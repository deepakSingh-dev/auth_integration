// src/routes/auth.js
import express from "express";
import {
  forgotPassword,
  getProfile,
  login,
  refreshToken,
  register,
  resetPassword,
  updateUserRole,
} from "#src/controllers/authController.js";
import { getUserByToken, updateUser } from "#src/controllers/userController.js";
import authMiddleware, {authorize} from "#src/middlewares/authMiddleware.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "#src/models/User.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth route" });
});
router.get("/getUser", authMiddleware, getProfile); 
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
// password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// user update 
router.put("/update", authMiddleware, updateUser);
router.get("/user/", authMiddleware, getUserByToken);

// Admin routes
router.put('/:id/role', authMiddleware, authorize('Admin'), updateUserRole);

// Google Authentication Route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`http://localhost:3000/auth/login?token=${token}`);
  }
);

// GitHub Authentication Route
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.redirect(`http://localhost:3000/auth/login?token=${token}`);
  }
);

router.post("/oauth-login", async (req, res) => {
  try {
    const { email, name, provider } = req.body;

    if (!email || !provider) {
      return res.status(400).json({ message: "Missing OAuth credentials" });
    }

    let user = await User.findOne({ email });

    // If user doesn't exist, create a new user (only for OAuth users)
    if (!user) {
      user = new User({
        name,
        email,
        password: "", // No password for OAuth users
        provider,
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/getUser", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from token by authMiddleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
