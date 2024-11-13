import mongoose from 'mongoose'
import { Schema } from 'mongoose'


export interface IDriver extends Document {
  name: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: "ACTIVE" | "OFF_DUTY" | "ON_LEAVE";
  hireDate: Date;
  contactInfo: string;
  performanceRating: number;
  userId: mongoose.Types.ObjectId;
}

const DriverSchema = new Schema<IDriver>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "OFF_DUTY", "ON_LEAVE"],
      default: "ACTIVE",
    },
    hireDate: { type: Date, required: true },
    contactInfo: { type: String, required: true },
    performanceRating: { type: Number, min: 0, max: 5, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Driver = mongoose.model<IDriver>("Driver", DriverSchema);
