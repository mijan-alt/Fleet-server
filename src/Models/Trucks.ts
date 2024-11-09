
import mongoose, { Schema, Document } from 'mongoose';

export interface ITruck {
  userId: mongoose.Types.ObjectId;
  plateNumber: string;
  model: string;
  year: number;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  lastServiceDate: Date;
  purchaseDate: Date;
  fuelEfficiency: number;
}

const TruckSchema = new Schema<ITruck>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plateNumber: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"],
      default: "ACTIVE",
    },
    lastServiceDate: { type: Date, required: true },
    purchaseDate: { type: Date, required: true },
    fuelEfficiency: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const Truck = mongoose.model<ITruck>('Truck', TruckSchema);