import mongoose, { Schema, Document } from "mongoose";

export type ProductCategory = "food" | "drink" | "dessert";

export interface IProduct extends Document {
  name: string;
  category: ProductCategory;
  price: number;
  available: boolean;
  description: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["food", "drink", "dessert"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
