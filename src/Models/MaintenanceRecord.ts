import mongoose from "mongoose";
import { Schema } from "mongoose";

export interface IMaintenanceRecord extends Document {
  truckId: mongoose.Types.ObjectId;
  serviceDate: Date;
  serviceType: string;
  cost: number;
  description: string;
  nextServiceDue: Date;
  odometerReading: number;
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    truckId: { type: Schema.Types.ObjectId, ref: "Truck", required: true },
    serviceDate: { type: Date, required: true },
    serviceType: { type: String, required: true },
    cost: { type: Number, required: true },
    description: { type: String, required: true },
    nextServiceDue: { type: Date, required: true },
    odometerReading: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const MaintenanceRecord = mongoose.model<IMaintenanceRecord>(
  "MaintenanceRecord",
  MaintenanceRecordSchema
);
