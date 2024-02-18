import { Router } from "express";
import invariant from "tiny-invariant";
import { prisma } from "../prisma";
import { userIdFromJWT } from "../utils";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  //get all teams
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      maximumMembers: true,
      owner: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
      members: {
        select: {
          name: true,
          score: true,
        },
      },
    },
  });
  const teamsWithFreeSlots = teams.map((team) => {
    const freeSlots = team.maximumMembers - team._count.members;
    return { ...team, freeSlots };
  });

  if (!teams) {
    return res.status(400).json({ error: "Teams not found" });
  }

  const teamScores = await prisma.user.groupBy({
    by: ["teamId"],
    where: {
      teamId: {
        in: teams.map((team) => team.id),
      },
    },
    _sum: {
      score: true,
    },
  });

  if (!teamScores) {
    return res.status(400).json({ error: "Team scores not found" });
  }
  //combine the teams with their scores
  const result = teamsWithFreeSlots.map((team) => {
    const score = teamScores.find((t) => t.teamId === team.id);
    return { ...team, score: score?._sum.score ?? 0 };
  });

  res.status(200).json({ result });
});

router.get("/:teamId", async (req, res) => {
  const { teamId } = req.params;
  if (typeof teamId !== "string" || teamId.length === 0) {
    return res.status(400).json({ message: "Invalid teamId" });
  }
  const users = await prisma.user.findMany({
    select: {
      name: true,
      score: true,
    },
    orderBy: {
      score: "desc",
    },
  });
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    select: {
      id: true,
      name: true,
      maximumMembers: true,
      owner: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
      members: {
        select: {
          name: true,
          score: true,
        },
      },
    },
  });
  if (!team) {
    return res.status(400).json({ error: "Team not found" });
  }

  const membersWithRank = team.members.map((member) => {
    const rank = users.findIndex((user) => user.name === member.name) + 1;
    return { ...member, rank };
  });

  //calculate team rank based on the sum of the scores of its members

  return res.status(200).json({ ...team, members: membersWithRank });
});

router.post("/create", async (req, res) => {
  //create a team, user is already authenticated
  const token = req.headers.authorization?.split(" ")[1];
  const { name, maximumMembers } = req.body;

  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }

  if (typeof name !== "string" || name.length === 0) {
    return res.status(400).json({ message: "Invalid name" });
  }
  if (typeof maximumMembers !== "number" || maximumMembers <= 10) {
    return res
      .status(400)
      .json({ message: "maximumMembers should be a number greather than 10" });
  }

  try {
    const createdTeam = await prisma.team.create({
      data: {
        name,
        maximumMembers,
        ownerId: userId,
      },
    });
    if (!createdTeam) {
      return res.status(400).json({ error: "Team creation failed" });
    }

    res
      .status(200)
      .json({ message: "Team created successfully", teamId: createdTeam.id });
  } catch (error) {
    res.status(400).json({ error: "Team creation failed" });
  }
});

router.post("/update", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id, name, maximumMembers } = req.body;

  if (typeof name !== "string" || name.length === 0) {
    return res.status(400).json({ message: "Invalid name" });
  }
  if (typeof id !== "string" || id.length === 0) {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (typeof maximumMembers !== "number" || maximumMembers <= 10) {
    return res
      .status(400)
      .json({ message: "maximumMembers should be a number greather than 10" });
  }
  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }

  try {
    const updatedTeam = await prisma.team.update({
      where: {
        id,
        ownerId: userId,
      },
      data: {
        name,
        maximumMembers,
      },
    });
    if (!updatedTeam) {
      return res.status(400).json({ error: "Team update failed" });
    }
    res.status(200).json({ message: "Team updated successfully" });
  } catch (error) {
    res.status(400).json({ error: "Team update failed" });
  }
});

router.post("/delete", async (req, res) => {
  invariant(process.env.JWT_SECRET, "JWT_SECRET is not defined");
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.body;
  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }

  try {
    const deletedTeam = await prisma.team.delete({
      where: {
        id: id,
        ownerId: userId,
      },
    });
    if (!deletedTeam) {
      return res.status(400).json({ error: "Team deletion failed!" });
    }
    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Team deletion failed" });
  }
});

router.post("/join", async (req, res) => {
  invariant(process.env.JWT_SECRET, "JWT_SECRET is not defined");
  //create a join request
  const token = req.headers.authorization?.split(" ")[1];
  const { teamId } = req.body;
  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  if (typeof teamId !== "string" || teamId.length === 0) {
    return res.status(400).json({ message: "Invalid teamId" });
  }

  try {
    const createdRequest = await prisma.request.create({
      data: {
        status: "pending",
        teamId,
        userId,
      },
    });
    if (!createdRequest) {
      return res.status(400).json({ error: "Join request failed" });
    }
    res.status(200).json({
      message: "Join request created successfully",
      requestId: createdRequest.id,
    });
  } catch (error) {
    res.status(400).json({ error: "Join request failed" });
  }
});

export default router;
