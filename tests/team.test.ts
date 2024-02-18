import { afterAll, beforeAll, expect, test } from "vitest";

const testUser = {
  name: "testuser2",
  password: "password",
  token: "",
  teamId: "",
};

const acceptedMember = {
  name: "testMember3",
  password: "password",
  token: "",
  teamId: "",
  requestId: "",
};

const rejectedMember = {
  name: "testMember4",
  password: "password",
  token: "",
  teamId: "",
  requestId: "",
};

beforeAll(async () => {
  //create user
  const response = await fetch("http://localhost:3000/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testUser),
  });
  const data = await response.json();
  testUser.token = data.token;

  //create accepted member
  const response2 = await fetch("http://localhost:3000/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(acceptedMember),
  });
  const data2 = await response2.json();
  acceptedMember.token = data2.token;

  //create rejected member
  const response3 = await fetch("http://localhost:3000/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rejectedMember),
  });
  const data3 = await response3.json();
  rejectedMember.token = data3.token;
});

test("API server healthcheck", async () => {
  const response = await fetch("http://localhost:3000/healthcheck");
  const data = await response.json();
  expect(data.message).toBe("API server running");
});

test("Create team", async () => {
  const response = await fetch("http://localhost:3000/api/v1/team/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUser.token}`,
    },
    body: JSON.stringify({
      name: "testteam1",
      maximumMembers: 11,
    }),
  });
  const data = await response.json();
  expect(data.message).toBe("Team created successfully");
  expect(data.teamId).toBeTypeOf("string");
  testUser.teamId = data.teamId;
  expect(data.error).toBeUndefined();
});

test("Get team list", async () => {
  const response = await fetch("http://localhost:3000/api/v1/team/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUser.token}`,
    },
  });
  const data = await response.json();
  expect(data.result.length).toBeGreaterThan(0);
  const result = data.result[0];
  expect(result.name).toBeTypeOf("string");
  expect(result.owner.name).toBeTypeOf("string");
  expect(result.score).toBeTypeOf("number");
  expect(result._count.members).toBeTypeOf("number");
  expect(result.freeSlots).toBeTypeOf("number");
});

test("Create team join request", async () => {
  const response = await fetch("http://localhost:3000/api/v1/team/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${acceptedMember.token}`,
    },
    body: JSON.stringify({
      teamId: testUser.teamId,
    }),
  });
  const data = await response.json();
  expect(data.message).toBe("Join request created successfully");
  expect(data.error).toBeUndefined();
  acceptedMember.requestId = data.requestId;
  //create request for rejected member
  const response2 = await fetch("http://localhost:3000/api/v1/team/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rejectedMember.token}`,
    },
    body: JSON.stringify({
      teamId: testUser.teamId,
    }),
  });
  const data2 = await response2.json();
  expect(data2.message).toBe("Join request created successfully");
  expect(data2.error).toBeUndefined();
  rejectedMember.requestId = data2.requestId;
});

test("Accept team join request", async () => {
  const response = await fetch("http://localhost:3000/api/v1/request/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUser.token}`,
    },
    body: JSON.stringify({
      requestId: acceptedMember.requestId,
    }),
  });
  const data = await response.json();
  expect(data.message).toBe("Request accepted successfully");
  expect(data.error).toBeUndefined();
});

test("Reject team join request", async () => {
  const response = await fetch("http://localhost:3000/api/v1/request/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUser.token}`,
    },
    body: JSON.stringify({
      requestId: rejectedMember.requestId,
    }),
  });
  const data = await response.json();
  expect(data.message).toBe("Request rejected successfully");
  expect(data.error).toBeUndefined();
});

test("Get team details", async () => {
  const response = await fetch(
    `http://localhost:3000/api/v1/team/${testUser.teamId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUser.token}`,
      },
    }
  );
  const data = await response.json();
  expect(data.name).toBeTypeOf("string");
  expect(data.owner.name).toBeTypeOf("string");
  expect(data.members.length).toBeGreaterThan(0);
  const member = data.members[0];
  expect(member.name).toBeTypeOf("string");
  expect(member.rank).toBeTypeOf("number");
  expect(member.score).toBeTypeOf("number");
});

test("Update team details", async () => {
  const response = await fetch("http://localhost:3000/api/v1/team/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUser.token}`,
    },
    body: JSON.stringify({
      id: testUser.teamId,
      name: "testteam3",
      maximumMembers: 99,
    }),
  });
  const data = await response.json();
  expect(data.message).toBe("Team updated successfully");
  expect(data.error).toBeUndefined();
});

test("Delete team", async () => {
  const response = await fetch("http://localhost:3000/api/v1/team/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUser.token}`,
    },
    body: JSON.stringify({
      id: testUser.teamId,
    }),
  });
  const data = await response.json();
  expect(data.message).toBe("Team deleted successfully");
  expect(data.error).toBeUndefined();
});

afterAll(async () => {
  //delete user
  await fetch("http://localhost:3000/api/v1/auth/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testUser.token}`,
    },
  });

  //delete accepted member
  await fetch("http://localhost:3000/api/v1/auth/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${acceptedMember.token}`,
    },
  });

  //delete rejected member
  await fetch("http://localhost:3000/api/v1/auth/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rejectedMember.token}`,
    },
  });
});
