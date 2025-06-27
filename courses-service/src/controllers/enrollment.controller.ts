import { Request, Response } from 'express';
import { ControllerWrapper } from '../utils/controllerWrapper';
import { Enrollment } from '../models/enrollment.model';
import mongoose from 'mongoose';

export class EnrollmentController extends ControllerWrapper {
    public enrollCourse = this.wrap(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const { courseId } = req.body;

        if (!userId) {
            res.status(401).json({ message: 'Неавторизованный' });
            return;
        }

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: 'Неверный ID курса' });
            return;
        }

        const existing = await Enrollment.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: new mongoose.Types.ObjectId(courseId),
        }).exec();

        if (existing) {
            res.status(400).json({ message: 'Вы уже записаны на этот курс' });
            return;
        }

        const enrollment = new Enrollment({
            userId: new mongoose.Types.ObjectId(userId),
            courseId: new mongoose.Types.ObjectId(courseId),
        });

        await enrollment.save();

        res.status(201).json(enrollment);
    });

    public getUserEnrollments = this.wrap(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Неавторизованный' });
            return;
        }

        const enrollments = await Enrollment.find({ userId: new mongoose.Types.ObjectId(userId) })
            .populate('courseId')
            .exec();

        res.json(enrollments);
    });
}
