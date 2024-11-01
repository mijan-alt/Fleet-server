import { getActiveUser } from "../controllers/User/userController";
import { Router } from "express";
import { newAuthChecker } from "../middlewares";

const userRouter = Router();

userRouter.route("/active-user").get(newAuthChecker, getActiveUser);

export default userRouter;
