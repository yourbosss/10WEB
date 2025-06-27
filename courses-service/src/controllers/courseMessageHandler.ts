import { ConsumeMessage } from 'amqplib';
import { Course } from '../models/course.model'; 
import mongoose from 'mongoose';

interface CourseMessage {
  action: 'create' | 'update' | 'delete';
  course: {
    _id: string;
    title: string;
    description: string;
    instructorId: string;
    tags?: string[];
    thumbnailUrl?: string;
  };
}

export const courseMessageHandler = async (msg: ConsumeMessage): Promise<void> => {
  try {
    const content = msg.content.toString();
    const data: CourseMessage = JSON.parse(content);

    switch (data.action) {
      case 'create': {
        const courseExists = await Course.findById(data.course._id).exec();
        if (courseExists) {
          console.log(`Course with id ${data.course._id} already exists`);
          break;
        }
        const course = new Course({
          _id: new mongoose.Types.ObjectId(data.course._id),
          title: data.course.title,
          description: data.course.description,
          instructorId: new mongoose.Types.ObjectId(data.course.instructorId),
          tags: data.course.tags || [],
          thumbnailUrl: data.course.thumbnailUrl || '',
        });
        await course.save();
        console.log(`Course created: ${course._id}`);
        break;
      }
      case 'update': {
        const updated = await Course.findByIdAndUpdate(
          data.course._id,
          {
            title: data.course.title,
            description: data.course.description,
            instructorId: new mongoose.Types.ObjectId(data.course.instructorId),
            tags: data.course.tags || [],
            thumbnailUrl: data.course.thumbnailUrl || '',
          },
          { new: true }
        ).exec();

        if (updated) {
          console.log(`Course updated: ${updated._id}`);
        } else {
          console.warn(`Course not found for update: ${data.course._id}`);
        }
        break;
      }
      case 'delete': {
        const deleted = await Course.findByIdAndDelete(data.course._id).exec();
        if (deleted) {
          console.log(`Course deleted: ${deleted._id}`);
        } else {
          console.warn(`Course not found for deletion: ${data.course._id}`);
        }
        break;
      }
      default:
        console.warn(`Unknown action: ${data.action}`);
    }
  } catch (error) {
    console.error('Error processing course message:', error);
    throw error; 
  }
};