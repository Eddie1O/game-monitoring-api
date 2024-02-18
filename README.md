#Game Monitoring API
API for managing users, teams, and requests for a game monitoring application

#API Documentation

> This is the API documentation for the Game Monitoring API. This API is used to manage users, teams, and requests for a game monitoring application. The API is protected by JWT authentication. The API server is running at http://localhost:3000. All responses are in JSON format same as your Requests have to be. Authtoken is required for all requests except for the health check and sign up endpoints. The authtoken can be obtained by signing in. The authtoken should be included in the request header as `Authorization: Bearer <authtoken>`.

##Health Check
**GET** `/api/v1/healthcheck`
Description: Checks if the API server is running.
Response: **200 OK** `{ message: "API server running" }`
##User
###Get User List
**GET** `/api/v1/user`
Description: List users. (Authenticated users only)
Response: **200 OK** `{ usersWithRank: [{ name: string, score: number, rank: number}]}`
###Sign Up
**POST** `/api/v1/user/signup`
Description: Creates a new user.
Request Body: `{ "username": string, "password": string }`
Response: **200 OK** `{ message: "User created successfully", token: string }`
###Sign In
**POST** `/api/v1/user/signin`
Description: Signs in a user.
Request Body: `{ "username": string, "password": string }`
Response: **200 OK** `{ user: { name: string, score: number }, token: string }`
##Team
###Get team list
**GET** `/api/v1/team`
Description: List teams.
Response: **200 OK** `{ teams: [{ name: string, memberNumber: number, owner: string, totalScore: number }] }`
###Create Team
**POST** `/api/v1/team`
Description: Creates a new team.
Request Body: `{ "name": string, "maximumMembers": number > 10 }`
Response: 200 Created with the created team's information.

###...TBD

#Tests
The API has been tested using Vitest. The tests are located in the `tests` directory. The tests can be run using the command `npm run test`. The tests are run against a prod database. The API server should be running before running the tests.

#TODO

- [x] Signup and signin with JWT
- [x] Assign a random score to user upon signup
- [x] Add middleware for protected routes
- [x] Authenticated users can fetch user list which includes:
  - [x] Rank
  - [x] Name
  - [x] Score
  - [x] Team
- [x] Users can create a team with the following details:
  - [x] Name
  - [x] Max member number (> 10)
- [x] Users can update and delete their team
- [x] Owner can accept and reject join requests
- [x] Users can fetch team list which includes:
  - [x] Team name
  - [x] Member number
  - [x] Owner name
  - [x] Total score of members in the team
- [x] Users can fetch a details of a team which includes:
  - [x] Team name
  - [x] Member list
    - [x] Rank
    - [x] Name
    - [x] Score
