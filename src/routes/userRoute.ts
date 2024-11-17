import express from "express";
import { UserInterface } from "../interfaces";


const router = express.Router();

// Protected route to check authentication
router.get("/check-auth",  (req, res) => {
  const user = req.user as UserInterface

  console.log('authenticated', req.isAuthenticated())
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: user
      ? { _id: user._id, name: user.name, email: user.email }
      : null,
  });
});

export const apiRoutes = router;
