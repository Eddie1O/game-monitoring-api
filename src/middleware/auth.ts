import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import invariant from "tiny-invariant";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  invariant(process.env.JWT_SECRET, "JWT_SECRET is not defined");
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ message: "A token is required for authentication" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
