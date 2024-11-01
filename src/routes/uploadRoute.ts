import express from "express";
import { uploadVirtualTour } from "../controllers/Virtual-tour";

const uploadRouter = express.Router();

uploadRouter.post("/upload-virtual-tour", uploadVirtualTour);

export default uploadRouter;
