import { Router } from "express";
import { prisma } from "../prisma";
import { userIdFromJWT } from "../utils";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  const requests = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      requests: {
        select: {
          id: true,
          teams: {
            select: {
              id: true,
              name: true,
            },
          },
          status: true,
          createdAt: true,
        },
      },
    },
  });

  const teamRequests = await prisma.team.findUnique({
    where: {
      ownerId: userId,
    },
    select: {
      requests: {
        select: {
          id: true,
          users: {
            select: {
              id: true,
              name: true,
            },
          },
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!requests || !teamRequests) {
    return res.status(400).json({ error: "User not found" });
  }
  res.status(200).json({
    myRequests: requests.requests,
    myTeamRequest: teamRequests.requests,
  });
});

router.post("/accept", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  const { requestId } = req.body;
  if (typeof requestId !== "string" || requestId.length === 0) {
    return res.status(400).json({ message: "Invalid requestId" });
  }
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
      teams: {
        ownerId: userId,
      },
    },
    select: {
      status: true,
      users: {
        select: {
          id: true,
        },
      },
      teams: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!request) {
    return res.status(400).json({ error: "Request not found" });
  }
  if (request.status !== "pending") {
    return res.status(400).json({ error: "Request already processed" });
  }
  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status: "accepted",
    },
  });
  if (!updatedRequest) {
    return res.status(400).json({ error: "Request update failed" });
  }
  //add user to team

  const userAddedToTeam = await prisma.team.update({
    where: {
      id: request.teams.id,
    },
    data: {
      members: {
        connect: {
          id: request.users.id,
        },
      },
    },
  });
  if (!userAddedToTeam) {
    return res.status(400).json({ error: "User not added to team" });
  }
  res.status(200).json({ message: "Request accepted successfully" });
});

router.post("/reject", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = userIdFromJWT(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  const { requestId } = req.body;
  if (typeof requestId !== "string" || requestId.length === 0) {
    return res.status(400).json({ message: "Invalid requestId" });
  }
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
      teams: {
        ownerId: userId,
      },
    },
    select: {
      status: true,
    },
  });
  if (!request) {
    return res.status(400).json({ error: "Request not found" });
  }
  if (request.status !== "pending") {
    return res.status(400).json({ error: "Request already processed" });
  }
  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status: "rejected",
    },
  });
  if (!updatedRequest) {
    return res.status(400).json({ error: "Request update failed" });
  }
  res.status(200).json({ message: "Request rejected successfully" });
});

export default router;
