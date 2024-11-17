
import passport from "passport";
import bcrypt from "bcryptjs";
import User from "../Models/UserSchema";
import express from "express";

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("hit register")
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    console.log(user)
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error logging in after registration" });
      }
      return res.json({
        user: { id: user.id, email: user.email, name: user.name },
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", (req, res, next) => {

  console.log("hit login")
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    });
  })(req, res, next);
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
    successRedirect: "http://localhost:3000",
  })
);

router.post("/logout", (req, res) => {
  console.log("hit logout")
  req.logout(() => {
    res.status(200).json({
      message: "Logged out successfully",
      authenticated:req.isAuthenticated()
    });
  });
});

export const authRoutes = router;


