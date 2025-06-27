import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
