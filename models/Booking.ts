import mongoose, { Schema, Document, Types } from "mongoose";

export type BookingStatus = "active" | "completed" | "cancelled";

export interface IBooking extends Document {
  client: Types.ObjectId;
  room: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  totalPrice: number;
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    totalPrice: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
