
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/user";

const router = Router();

// Signup
router.post(
  "/signup",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !["brand", "creator"].includes(role)
      ) {
        res.status(400).json({ message: "Invalid signup details" });
        return;
      }

      if (!name.trim() || !email.trim() || password.length < 8) {
        res.status(400).json({
          message: "Name and email are required; password must be at least 8 characters"
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail
      });

      if (existingUser) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role as UserRole
      });

     const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is missing");
}

const token = jwt.sign(
  { userId: user._id.toString(), role: user.role },
  secret,
  { expiresIn: "1d" }
);

res.status(201).json({
  message: "Signup successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Unable to register user" });
    }
  }
);

// Login
router.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        res.status(400).json({
          message: "Email and password are required"
        });
        return;
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase()
      }).select("+password");

      if (!user) {
        res.status(401).json({
          message: "Invalid email or password"
        });
        return;
      }

      const passwordMatches = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatches) {
        res.status(401).json({
          message: "Invalid email or password"
        });
        return;
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error("JWT_SECRET is missing");
      }

      const token = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        secret,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Unable to log in" });
    }
  }
);

export default router;
