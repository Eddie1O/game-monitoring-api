# game-monitoring-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.25. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

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
