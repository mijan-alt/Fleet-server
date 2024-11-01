import { isTokenValid } from "../utils/jwt";
import { Express, Request, Response, NextFunction } from "express";
import UnAuthenticatedError from "../errors/UnAuthenticatedError";
import User from "../Models/UserSchema";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // check header

  const authHeader = req.headers.authorization;

  console.log(authHeader)

  if (!authHeader || authHeader.startsWith("Bearer ")) {
    throw new UnAuthenticatedError("Authentication Token is missing");
  }
  console.log("my auth header", authHeader);

  token = authHeader?.split(" ")[1];
  console.log("my token", token);

  if (!token) {
    throw new UnAuthenticatedError("Authentication is invalid");
  }

  try {
    const payload = isTokenValid(token) as { _id: string }; //get the decoded token

    const user = await User.findById(payload._id);

    if (!user) {
      throw new UnAuthenticatedError("User not found");
    }

    next();
  } catch (error) {
    throw new UnAuthenticatedError("Authentication is invalid");
  }
};
