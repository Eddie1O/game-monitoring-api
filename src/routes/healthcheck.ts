import { Router } from "express";

const router = Router();
router.get("/", async (req, res) => {
  res.status(200).json({ message: "API server running" });
});

export default router;
