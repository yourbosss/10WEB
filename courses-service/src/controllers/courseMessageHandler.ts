import { ConsumeMessage } from 'amqplib';
import { Course } from '../models/course.model'; // Твоя модель курса
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
    // другие поля курса
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
          console.log(`Курс с id ${data.course._id} уже существует`);
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
        console.log(`Курс создан: ${course._id}`);
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
          console.log(`Курс обновлён: ${updated._id}`);
        } else {
          console.warn(`Курс для обновления не найден: ${data.course._id}`);
        }
        break;
      }
      case 'delete': {
        const deleted = await Course.findByIdAndDelete(data.course._id).exec();
        if (deleted) {
          console.log(`Курс удалён: ${deleted._id}`);
        } else {
          console.warn(`Курс для удаления не найден: ${data.course._id}`);
        }
        break;
      }
      default:
        console.warn(`Неизвестное действие: ${data.action}`);
    }
  } catch (error) {
    console.error('Ошибка обработки сообщения курса:', error);
    throw error; // чтобы RabbitMQ повторил попытку
  }
};
