import { Request, Response } from 'express';
import { ControllerWrapper } from '../utils/controllerWrapper';
import { Comment } from '../models/comment.model';
import mongoose from 'mongoose';

export class CommentController extends ControllerWrapper {
    public getComments = this.wrap(async (req: Request, res: Response) => {
        const { courseId, lessonId } = req.query;

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId as string)) {
            res.status(400).json({ message: 'Неверный ID курса' });
            return;
        }

        const filter: any = { courseId: new mongoose.Types.ObjectId(courseId as string) };
        if (lessonId && mongoose.Types.ObjectId.isValid(lessonId as string)) {
            filter.lessonId = new mongoose.Types.ObjectId(lessonId as string);
        }

        const comments = await Comment.find(filter).sort({ createdAt: -1 }).exec();

        res.json(comments);
    });

    public createComment = this.wrap(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const { courseId, lessonId, content } = req.body;

        if (!userId) {
            res.status(401).json({ message: 'Неавторизованный' });
            return;
        }

        if (!courseId || !content) {
            res.status(400).json({ message: 'Курс и содержание обязательны' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: 'Неверный ID курса' });
            return;
        }

        if (lessonId && !mongoose.Types.ObjectId.isValid(lessonId)) {
            res.status(400).json({ message: 'Неверный ID урока' });
            return;
        }

        const comment = new Comment({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: new mongoose.Types.ObjectId(courseId),
            lessonId: lessonId ? new mongoose.Types.ObjectId(lessonId) : undefined,
            content,
        });

        await comment.save();

        res.status(201).json(comment);
    });

    public deleteComment = this.wrap(async (req: Request, res: Response) => {
        const commentId = req.params.id;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            res.status(400).json({ message: 'Неверный ID комментария' });
            return;
        }

        const comment = await Comment.findById(commentId).exec();
        if (!comment) {
            res.status(404).json({ message: 'Комментарий не найден' });
            return;
        }

        if (comment.userId.toString() !== userId && userRole !== 'admin') {
            res.status(403).json({ message: 'Нет прав на удаление комментария' });
            return;
        }

        await comment.deleteOne();

        res.json({ message: 'Комментарий удалён' });
    });
}
