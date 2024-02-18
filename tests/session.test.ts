import { expect, test } from "vitest";

const testUsers = [
  {
    name: "user1test",
    password: "password",
    token: "",
  },
];

async function getToken({
  name,
  password,
}: {
  name: string;
  password: string;
}) {
  const response = await fetch("http://localhost:3000/api/v1/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      password,
    }),
  });
  const data = await response.json();
  if (typeof data.token !== "string") throw new Error("Token not found");
  return data.token;
}

test("API server healthcheck", async () => {
  const response = await fetch("http://localhost:3000/healthcheck");
  const data = await response.json();
  expect(data.message).toBe("API server running");
});

test("User registration", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testUsers[0]),
  });
  const data = await response.json();
  expect(data.message).toBe("User registered successfully");
  expect(data.error).toBeUndefined();
  expect(data.token).toBeTypeOf("string");
  testUsers[0].token = data.token;
});

test("User singin", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: testUsers[0].name,
      password: testUsers[0].password,
    }),
  });
  const data = await response.json();
  expect(data.message).toBe("User signed in successfully");
  expect(data.token).toBeTypeOf("string");
  testUsers[0].token = data.token;
  expect(data.error).toBeUndefined();
});

test("User account deletion", async () => {
  const token = await getToken({
    name: testUsers[0].name,
    password: testUsers[0].password,
  });
  const response = await fetch("http://localhost:3000/api/v1/auth/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  expect(data.message).toBe("User account deleted successfully");
  expect(data.error).toBeUndefined();
});
