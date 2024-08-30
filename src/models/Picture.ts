import mongoose, { Document, Schema } from "mongoose";

interface IPicture extends Document {
  name: string;
  src: String;
  customerCode: string;
  measureDatetime: Date;
  measureType: "WATER" | "GAS";
}

const PictureSchema: Schema = new Schema({
  name: { type: String, required: true },
  src: { type: String, required: true },
  customerCode: { type: String, required: true },
  measureDatetime: { type: Date, required: true },
  measureType: { type: String, enum: ["WATER", "GAS"], required: true },
});

export default mongoose.model<IPicture>("Picture", PictureSchema);