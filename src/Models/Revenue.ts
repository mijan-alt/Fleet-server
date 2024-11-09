import mongoose, { Schema, Document } from "mongoose";

export interface IRevenue extends Document {
  tripId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  type: "FREIGHT" | "OTHER";
  description: string;
  paymentStatus: "PENDING" | "PAID" | "OVERDUE";
  invoiceNumber?: string;
}

const RevenueSchema = new Schema<IRevenue>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["FREIGHT", "OTHER"],
      required: true,
    },
    description: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "OVERDUE"],
      default: "PENDING",
    },
    invoiceNumber: { type: String },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying by date
RevenueSchema.index({ date: 1 });

export const Revenue = mongoose.model<IRevenue>("Revenue", RevenueSchema);
