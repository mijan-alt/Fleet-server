import { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoute";
import { connectDb } from "./db/connectDb";
import bodyParser from "body-parser";
import express from "express";
import userRouter from "./routes/userRoute";
import { googleSignUp } from "./controllers/Auth/authController";
import session from "express-session";
import { config } from "dotenv";
import User from "./Models/UserSchema";
import { UserInterface } from "./interfaces";
import googleRouter from "./routes/googleRoute";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import propertyRouter from "./routes/propertyRoute";
import uploadRouter from "./routes/uploadRoute";


config(); // Load environment variables from .env file

const app: Express = express();

const origin = [
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: origin,
    credentials: true,
    methods: ["GET",  "PUT", "PATCH", "POST", "DELETE"], // corrected array format
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

// Use cookie-parser before express-session

// Use express-session middleware
app.use(
  session({
    name: "session_id",
    secret: "keyboard cat",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: true,
  })
);


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
     
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

app.use(passport.initialize());


app.use("/", googleRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);
app.use('/api/v1', propertyRouter)
app.use('/api/v1', uploadRouter)



//Business route for emailing


connectDb(app);
