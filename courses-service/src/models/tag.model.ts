import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITag extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const Tag: Model<ITag> = mongoose.model<ITag>('Tag', tagSchema);
