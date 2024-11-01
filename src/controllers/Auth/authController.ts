import User from "../../Models/UserSchema";
import { StatusCodes } from "http-status-codes";
import { Application, Express, Request, Response } from "express";
;
import jwt, { JwtPayload } from "jsonwebtoken";
import { createJWT } from "../../utils/jwt";

import { config } from "dotenv";

import path from "path";
import ejs from "ejs";
import { sendMail } from "../../utils/sendEmail";
import { isTokenValid } from "../../utils/jwt.js";
import session from "express-session";
import crypto from "crypto";




import { CookieOptions } from "express";

import {
  ValidationError,
  UnAuthenticatedError,
  NotfoundError,
  BadRequestError,
  UnAuthorizedError,
} from "../../errors/index";
import sendVerificationMail from "../../utils/sendVerificationMail";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const localUrl = process.env.BASE_SERVER_URL;
const clientUrl = process.env.CLIENT_URL!
const clientID = process.env.CLIENT_ID!
const clientSecret = process.env.CLIENT_SECRET!


export const checkEmail= async (req:Request, res:Response) => {
  try {
    console.log("checking email")
    const { email} = req.body;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: "Error checking email" });
  }
}

export const signUp = async (req: Request, res: Response) => {
  const { email, password} = req.body;

 

  if (!password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Password is required" });
  }

function generateUsername(email: string): string {
  return email.split('@')[0];
}



  try {
    const user = await User.findOne({ email });
     const longerEXP = 1000 * 60 * 60 * 24 * 30;
     const maxAge = 90 * 24 * 60 * 60 * 1000;


    if (user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Email Already Exists" });
    }

    let username = generateUsername(email);
    const verificationToken = crypto.randomBytes(40).toString("hex");
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const data = { email, password, verificationToken, username};
    const newUser = new User(data);
    await newUser.save();


     const token = createJWT(
       {
         id: newUser._id,
         email: newUser.email,
       },
       maxAge
     );

     

    console.log("Cookie set:", res.getHeader("Set-Cookie"));

 

 
    const clientUrl =
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_LIVE_URL
        : process.env.CLIENT_URL;

  
    if (!clientUrl) {
      throw new Error("Client URL is not defined");
    }

 
    sendVerificationMail({
      verificationToken,
      clientUrl,
      email,
      username: newUser.username,
    });


     res.cookie("uToken", token, {
       httpOnly: true,
       expires: new Date(Date.now() + longerEXP),
       secure: process.env.NODE_ENV === "production",
     });
    
   
    res.status(StatusCodes.OK).json({
      message: "Please check your email to verify your account",
    
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};


// VERIFY EMAIL


export const verifyEmail = async (req: Request, res: Response) => {
  const { verificationToken , email}: { verificationToken: string | undefined , email:string | undefined} =
    req.body;

  try {
    if (verificationToken) {
      // Case 1: User clicks on the verification link in their email
      console.log("there is verification Token here")
      const user = await User.findOne({ verificationToken });

      if (!user) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Invalid token" });
      }


      //if the the token has expired?
      if (
        user.verificationTokenExpiresAt &&
        user.verificationTokenExpiresAt.getTime() < Date.now()
      ) {

        console.log(user.verificationTokenExpiresAt)
        //generate a new verification token
        const newVerificationToken = await crypto
          .randomBytes(40)
          .toString("hex");
        //generate a new expiry date starting from the current time
        const newVerificationTokenExpiresAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );

        //Replace the former verificationToken with the newly generated token
        user.verificationToken = newVerificationToken;

        //replace the former expiry date with the current expiry
        user.verificationTokenExpiresAt = newVerificationTokenExpiresAt;

        //Save the new changes
        await user.save();
         //send the verification mail with the new details
        sendVerificationMail({
          verificationToken: newVerificationToken,
          clientUrl, 
          email: user.email,
          username: user.username,
        });

        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "Verification token expired. A new verification email has been sent.",
        });
      }

      user.emailVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiresAt = null;
      await user.save();

      console.log("user verification", user);

      return res
        .status(StatusCodes.OK)
        .json({ message: "Email verified successfully" });
    }
  } catch (error) {
    console.error("Error during email verification:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};



export const login = async (req: Request, res: Response) => {
  console.log("hitting login");
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email});

    console.log("this user", user)

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new BadRequestError("Invalid Credentials");
    }

    const longerEXP = 1000 * 60 * 60 * 24 * 30;
    const maxAge = 90 * 24 * 60 * 60 * 1000;

    const token = createJWT(
      {
        id: user._id,
        email: user.email,
      },
      maxAge
    );

    return res.cookie("uToken", token, {
       httpOnly: true,
       expires: new Date(Date.now() + longerEXP),
       secure: process.env.NODE_ENV === "production",
     })
      .status(StatusCodes.OK)
      .json({
        message: "Account signed in successfully",
        user,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({ error: "Could not sign in" });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  const { email }: { email: string } = req.body;
  console.log("email", email);

  const user = await User.findOne({ email });



  if (!user) {
    console.log("User does not exit");
    res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    return;
  }

  const resetToken = user.createResetPasswordToken();


  // save the encrypted token in the data base
  await user.save();

  console.log(resetToken);
  const resetUrl = `${clientUrl}/verifying?resetToken=${resetToken}`;

  const templatePath = path.join(
    process.cwd(),
    "/src/views/forgotpassword.ejs"
  );

  const renderHtml = await ejs.renderFile(
    templatePath,
    {
      userFullname: user.username,
      userEmail: user.email,
      userRecoveryUrl: resetUrl,
    },
    { async: true }
  );

  try {
    await sendMail({
      email: user.email,
      subject: "Password Recovery",
      html: renderHtml,
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    //  in the event of an unfuufllied promise , we want to set the reset tokens to undefined
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    //then we save these new values to the database
    console.log(error, "error");
    user.save();
    res.status(StatusCodes.REQUEST_TIMEOUT).json({
      message: "There was an error sending password reset email. Try again ",
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  console.log("hitting the verify");
  const { token } = req.params;

  console.log("my token", token);

  try {
    // Encrypt the incoming token

    const encryptedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    console.log("encryptedtokne", encryptedToken);

    // Find the user whose passwordResetToken matches the encrypted token
    const user = await User.findOne({
      passwordResetToken: encryptedToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.redirect(`${clientUrl}/auth/recover`);
      return;
    }

 
    res.redirect(`${clientUrl}/auth/updatepassword?token=${token}`);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Error verifying password reset token" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { newPassword, token }: { newPassword: string; token: string } =
    req.body;

  try {
    if (!newPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "New password is required" });
    }

    // Encrypt the incoming token
    const encryptedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the user whose passwordResetToken matches the encrypted token
    const user = await User.findOne({
      passwordResetToken: encryptedToken,
    });

    if (!user) {
      return res
        .status(StatusCodes.NON_AUTHORITATIVE_INFORMATION)
        .json({ message: "Token is invalid or expired" });
    }

    // Update user's password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;

    // save the updated information to db
    await user.save();

    return res
      .status(StatusCodes.OK)
      .json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Error resetting password" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
      res.clearCookie("uToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
    res.status(StatusCodes.OK).json({ message: "User signed out succesffuy" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ mesage: "Oops, there was an error signing out" });
  }
};

export const closeAccount = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {

    const decodedToken = req.user as JwtPayload
    const decodedEmail = decodedToken.email

    if (decodedEmail !== email) {
        return res.status(StatusCodes.FORBIDDEN).json({ error: "Unauthorized" });
  }


    // Find the user by email
      const user = await User.findOne({ email });
      console.log("me", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.deleteOne({ email });

      res.clearCookie("uToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

    
    return res.status(200).json({ message: "Account closed successfully" });
  } catch (error) {
    console.error("Error closing account:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const googleSignUp = async (app: Application) => {
  if (!clientID || !clientSecret) {
    throw new Error(
      "Google OAuth client ID and secret are not defined in environment variables."
    );
  }

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        console.log("Profile:", profile); // Log the profile object
        try {
          // Check if user already exists in the db based on the email
          let user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            // If user does not exist, create a new user
            user = await User.create({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              image: profile.photos[0].value,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  const passportAuthScope = passport.authenticate("google", {
    failureRedirect: "http://localhost:3000", // Redirect to a failure route
  });

  const passportAuthFailed = passport.authenticate("google", {
    failureRedirect: "http://localhost:3000", // Redirect to a failure route
  });

  const callback = (req: Request, res: Response) => {
    if (req.user) {
      res.redirect(`http://localhost:3000/addBusiness`);
    } else {
      res.redirect(`http://localhost:3000/signup`);
    }
  };

  return { passportAuthScope, passportAuthFailed, callback };
};
