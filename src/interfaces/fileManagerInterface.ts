import { Document } from "mongodb";
import { Types } from "mongoose";

interface IFileManager extends Document {
  originalname: string;
  format: string;
  width: number;
  height: number;
  secure_url: string;
}

export { IFileManager };

