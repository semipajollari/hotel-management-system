import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  nationality: string;
  createdAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    idNumber: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
