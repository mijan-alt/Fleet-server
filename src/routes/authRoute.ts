import { Request, Response, Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import multer from "multer";
// import { newAuthChecker } from "../middlewares";
import { checkEmail } from "../controllers/Auth/authController";

import {
  login,
  signUp,
  forgotPassword,
  verifyToken,
  updatePassword,
  verifyEmail,
  closeAccount,
  logout,
} from "../controllers/Auth/authController";

const authRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  filename: function (req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage });

// Auth routes
authRouter.post("/check-email", checkEmail)
authRouter.post("/sign-up", signUp);
authRouter.post("/login", login);
authRouter.get("/logout",  logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.get("/verify/:token", verifyToken);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/updatepassword", updatePassword);



// Email verification and account closure routes
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/close-account",  closeAccount);


export default authRouter;
