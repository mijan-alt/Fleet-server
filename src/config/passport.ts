import { Request, Response, Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserInterface } from "../interfaces";
import User from "../Models/UserSchema";

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error(
    "Google OAuth client ID and secret are not defined in environment variables."
  );
}

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

         if (user) {
           // If user exists, update Google ID if not already set
           if (!user.googleId) {
             user.googleId = profile.id;
             await user.save();
           }
         } else {
             user = await User.create({
               username: profile.displayName,
               email: profile.emails[0].value,
               googleId: profile.id,
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


export default passport
