import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = Router();

router.post("/signup", async (req, res) => {
  const { name, password } = req.body;
  if (typeof name !== "string" || name.length === 0) {
    return res.status(400).json({ message: "Invalid name" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Invalid password" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const score = Math.floor(Math.random() * 100); // Random score between 0 and 99

  try {
    const createdUser = await prisma.user.create({
      data: {
        name,
        passwordHash: hashedPassword,
        score,
      },
    });

    if (!createdUser) {
      return res.status(400).json({ error: "User registration failed here" });
    }
    const token = jwt.sign(
      { userId: createdUser.id, name: createdUser.name },
      process.env.JWT_SECRET!,
      {
        expiresIn: "12h",
      }
    );

    res.status(200).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(400).json({ error: "User registration failed" });
  }
});

router.post("/signin", async (req, res) => {
  const { name, password } = req.body;
  if (typeof name !== "string" || name.length === 0) {
    return res.status(400).json({ message: "Invalid name" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Invalid password" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        name,
      },
      select: {
        passwordHash: true,
        id: true,
        name: true,
        score: true,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    if (
      typeof user.name !== "string" ||
      typeof user.passwordHash !== "string"
    ) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    //compare passwords
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name },
      process.env.JWT_SECRET!,
      {
        expiresIn: "12h",
      }
    );

    res.status(200).json({
      message: "User signed in successfully",
      user: { name: user.name, score: user.score },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//delete account using username and password
router.post("/delete", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded !== "object" || !decoded.userId) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const user = await prisma.user.delete({
      where: {
        id: decoded.userId,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "User account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
