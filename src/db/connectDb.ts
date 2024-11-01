import mongoose from "mongoose";
import { config } from "dotenv";

config();

export const connectDb = async (app: any) => {
  console.log("hitting db function");
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    app.listen(process.env.port, (): void => {
      console.log(`Server is running on http://localhost:${process.env.port}`);
    });
  } catch (error) {
    console.log("error connecting to db", error);
  }
};
