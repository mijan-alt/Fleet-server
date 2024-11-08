import express from "express";
import cors from "cors";
import passport from "passport";
import { configurePassport } from "./config/passport";
import { sessionConfig } from "./config/session";
import { authRoutes } from "./routes/auth";
import { apiRoutes } from "./routes/userRoute";
import { connectDb } from "./db/connectDb";
import session from "express-session";


const app = express();



// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session and passport setup
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Routes
app.use("/", authRoutes);
app.use("/", apiRoutes);


connectDb(app);