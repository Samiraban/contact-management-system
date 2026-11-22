
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Admin from "../models/Admin.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please try again in 15 minutes."
  }
});

function createToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function publicAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email
  };
}

// CREATE ADMIN ACCOUNT
router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const signupCode = String(req.body.signupCode || "");

    const requiredCode = String(process.env.ADMIN_SIGNUP_CODE || "");

    if (!requiredCode) {
      return res.status(503).json({
        message: "Account creation is not configured. Set ADMIN_SIGNUP_CODE in server/.env."
      });
    }

    if (!name || !email || !password || !signupCode) {
      return res.status(400).json({
        message: "Please complete every field."
      });
    }

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({
        message: "Name must be between 2 and 60 characters."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters."
      });
    }

    if (signupCode !== requiredCode) {
      return res.status(403).json({
        message: "The workspace access code is incorrect."
      });
    }

    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      token: createToken(admin),
      admin: publicAdmin(admin)
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    next(error);
  }
});

// ADMIN LOGIN
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    res.json({
      token: createToken(admin),
      admin: publicAdmin(admin)
    });

  } catch (error) {
    next(error);
  }
});

// CURRENT ADMIN
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId).select("name email");

    if (!admin) {
      return res.status(401).json({
        message: "Administrator account not found."
      });
    }

    res.json({
      admin: publicAdmin(admin)
    });

  } catch (error) {
    next(error);
  }
});

export default router;
