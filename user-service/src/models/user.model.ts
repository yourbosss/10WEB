import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  role: string;
  favoriteCourseIds: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    favoriteCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false, // отключаем виртуалы, чтобы не использовать this._id
      versionKey: false,
      transform: (_, ret) => {
        // Преобразуем _id в строку id и удаляем _id
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
