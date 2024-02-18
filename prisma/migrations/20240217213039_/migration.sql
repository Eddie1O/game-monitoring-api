/*
  Warnings:

  - You are about to drop the `_RequestToTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teamId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_RequestToTeam_B_index";

-- DropIndex
DROP INDEX "_RequestToTeam_AB_unique";

-- DropIndex
DROP INDEX "_RequestToUser_B_index";

-- DropIndex
DROP INDEX "_RequestToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_RequestToTeam";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_RequestToUser";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Request_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("createdAt", "id", "status") SELECT "createdAt", "id", "status" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
