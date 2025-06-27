import { Request, Response } from 'express';
import { Course, ICourse } from '../models/course.model';
import mongoose from 'mongoose';
import { ControllerWrapper } from '../utils/controllerWrapper';

export class CourseController extends ControllerWrapper {
    public getCourses = this.wrap(async (req: Request, res: Response) => {
        const { page = '1', limit = '10', tags } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const filter: any = {};
        if (tags) {
            const tagsArray = (tags as string).split(',').map(tag => tag.trim());
            filter.tags = { $in: tagsArray };
        }

        const courses = await Course.find(filter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .exec();

        const total = await Course.countDocuments(filter);

        res.json({
            data: courses,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
            },
        });
    });

    public getCourseById = this.wrap(async (req: Request, res: Response) => {
        const courseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: 'Invalid course ID' });
            return;
        }

        const course = await Course.findById(courseId).exec();
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        res.json(course);
    });

    public createCourse = this.wrap(async (req: Request, res: Response) => {
        const { title, description, tags, thumbnailUrl } = req.body;
        const instructorId = (req as any).user?.id;

        if (!instructorId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!title || !description) {
            res.status(400).json({ message: 'Title and description are required' });
            return;
        }

        const course = new Course({
            title,
            description,
            instructorId: new mongoose.Types.ObjectId(instructorId),
            tags: tags || [],
            thumbnailUrl: thumbnailUrl || '',
        });

        await course.save();

        res.status(201).json(course);
    });

    public updateCourse = this.wrap(async (req: Request, res: Response) => {
        const courseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: 'Invalid course ID' });
            return;
        }

        const updateData: Partial<ICourse> = req.body;

        const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true }).exec();
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        res.json(course);
    });

    public deleteCourse = this.wrap(async (req: Request, res: Response) => {
        const courseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: 'Invalid course ID' });
            return;
        }

        const course = await Course.findByIdAndDelete(courseId).exec();
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        res.json({ message: 'Course deleted' });
    });
}