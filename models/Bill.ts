import mongoose, { Schema, Document, Types } from "mongoose";

export type BillStatus = "open" | "paid";

export interface IBillItem {
  product: Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
}

export interface IBill extends Document {
  tableNumber: number;
  items: IBillItem[];
  total: number;
  status: BillStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const BillItemSchema = new Schema<IBillItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const BillSchema = new Schema<IBill>(
  {
    tableNumber: { type: Number, required: true, min: 1 },
    items: { type: [BillItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["open", "paid"], default: "open" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);
