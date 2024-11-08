import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User from "../Models/UserSchema";

export const configurePassport = () => {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email: any, password: any, done: any) => {
        try {
          const user = await User.findOne({ email });
          if (!user || !user.password) {
            return done(null, false, { message: "Invalid credentials" });
          }
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid credentials" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { googleId: profile.id },
              { email: profile.emails?.[0]?.value },
            ],
          });

          if (!user) {
            user = await User.create({
              email: profile.emails?.[0]?.value,
              name: profile.displayName,
              googleId: profile.id,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
