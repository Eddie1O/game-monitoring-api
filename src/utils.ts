import jwt from "jsonwebtoken";
import invariant from "tiny-invariant";

export function userIdFromJWT(token: string | undefined): string | undefined {
  invariant(process.env.JWT_SECRET, "JWT_SECRET is not defined");
  if (typeof token !== "string" || token.length === 0) {
    return undefined;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      typeof decoded !== "object" ||
      !decoded.userId ||
      typeof decoded.userId !== "string"
    ) {
      return undefined;
    }
    return decoded.userId;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
