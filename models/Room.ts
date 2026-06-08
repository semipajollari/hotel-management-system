import mongoose, { Schema, Document } from "mongoose";

export type RoomType = "single" | "double" | "suite" | "deluxe";
export type RoomStatus = "available" | "occupied" | "maintenance";

export interface IRoom extends Document {
  number: string;
  type: RoomType;
  price: number;
  capacity: number;
  status: RoomStatus;
  floor: number;
  description: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    number: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["single", "double", "suite", "deluxe"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1, max: 10 },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
    floor: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
