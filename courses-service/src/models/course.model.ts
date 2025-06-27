import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructorId: mongoose.Types.ObjectId;
  tags: string[];
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    thumbnailUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);
