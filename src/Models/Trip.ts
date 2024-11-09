
import mongoose, { Schema, Document } from "mongoose";

export interface ITrip extends Document {
  truckId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  startLocation: string;
  endLocation: string;
  distance: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  fuelCost: number;
  notes?: string;
  revenue?: number;
}

const TripSchema = new Schema<ITrip>(
  {
    truckId: { type: Schema.Types.ObjectId, ref: "Truck", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    distance: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PLANNED", "IN_PROGRESS", "COMPLETED"],
      default: "PLANNED",
    },
    fuelCost: { type: Number, required: true, min: 0 },
    notes: { type: String },
    revenue: { type: Number, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying by date ranges
TripSchema.index({ startDate: 1, endDate: 1 });

export const Trip = mongoose.model<ITrip>("Trip", TripSchema);
