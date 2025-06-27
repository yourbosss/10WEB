import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ControllerWrapper } from '../utils/controllerWrapper';
import { Lesson } from '../models/lesson.model';

export class LessonController extends ControllerWrapper {
  public getLessonsByCourse = this.wrap(async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }

    const lessons = await Lesson.find({ courseId: new mongoose.Types.ObjectId(courseId) }).sort({ order: 1 }).exec();
    res.json(lessons);
  });

  public createLesson = this.wrap(async (req: Request, res: Response, next: NextFunction) => {
    const { title, content, courseId, order } = req.body;

    if (!title || !content || !courseId) {
      res.status(400).json({ message: 'Title, content and course ID are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }

    const lesson = new Lesson({
      title,
      content,
      courseId: new mongoose.Types.ObjectId(courseId),
      order: order || 0,
    });

    await lesson.save();
    res.status(201).json(lesson);
  });

  public updateLesson = this.wrap(async (req: Request, res: Response, next: NextFunction) => {
    const lessonId = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }

    const lesson = await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true }).exec();

    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    res.json(lesson);
  });

  public deleteLesson = this.wrap(async (req: Request, res: Response, next: NextFunction) => {
    const lessonId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      res.status(400).json({ message: 'Invalid lesson ID' });
      return;
    }

    const lesson = await Lesson.findByIdAndDelete(lessonId).exec();

    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    res.json({ message: 'Lesson deleted' });
  });
}