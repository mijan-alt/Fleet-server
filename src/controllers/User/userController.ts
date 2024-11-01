import User from "../../Models/UserSchema";
import express from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { isTokenValid } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { UnAuthenticatedError } from "../../errors";
import { UserInterface } from "../../interfaces";

export const getActiveUser = async (req: Request, res: Response) => {
  try {
    let userid
  
    if (req.user) {
        const decodedToken = req.user as JwtPayload;
        userid = decodedToken.id;
    }
   

    const user = await User.findById(userid)

    if (!user) {
      // Send 404 Not Found if user is not found
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    // Send the populated user object
    res.status(StatusCodes.OK).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Oops there was an error" });
  }
};
