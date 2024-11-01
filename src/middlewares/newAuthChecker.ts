import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnAuthenticatedError, ValidationError } from "../errors";
import { config } from "dotenv";

config();
const secretKey: string = process.env.JWT_SECRET || "";

const newAuthChecker = (req: Request, res: Response, next: NextFunction) => {
 
  const token = req.cookies.uToken;

  console.log("uToken", token);

  if (!token) {
    throw new UnAuthenticatedError("Unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
    console.log("decoded Token", decodedToken)

    if (!decodedToken) {
      throw new ValidationError("You are not logged in");
    }

    req.user = decodedToken

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export { newAuthChecker };
