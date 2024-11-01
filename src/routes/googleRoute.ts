import { Request, Response, Router } from "express";
import passport from "passport";
import { UserInterface } from "../interfaces";
import { createJWT } from "../utils/jwt";


const googleRouter = Router();

// Google signup routes
googleRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

googleRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000", 
  }),
  (req: Request, res: Response) => {
    const user = req.user as UserInterface;
    const userId = user._id;
    console.log("my request", req.user);

    const longerEXP = 1000 * 60 * 60 * 24 * 30;

    const maxAge = 90 * 24 * 60 * 60 * 1000;

    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = createJWT(payload, maxAge);

    res.cookie("uToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + longerEXP),
      secure: true,
      sameSite: "none",
    });

    res.redirect('http://localhost:3000')
    
  }
);

export default googleRouter;
