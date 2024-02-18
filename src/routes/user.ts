import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

interface UserWithoutRank {
  name: string | null;
  score: number;
}

interface UserWithRank extends UserWithoutRank {
  rank: number;
}

router.get("/", async (req, res) => {
  const users: UserWithoutRank[] = await prisma.user.findMany({
    select: {
      name: true,
      score: true,
    },
  });
  //sort the users by score, add a ranking to each user
  const sortedUsers = users.toSorted((a, b) => b.score - a.score);
  const usersWithRank: UserWithRank[] = [];
  sortedUsers.forEach((user, index) => {
    usersWithRank.push({ ...user, rank: index + 1 });
  });
  res.status(200).json({ usersWithRank });
});

export default router;
