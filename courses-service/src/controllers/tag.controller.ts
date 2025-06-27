import { Request, Response, NextFunction } from 'express';
import { Tag, ITag } from '../models/tag.model';

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tags = await Tag.find().sort({ name: 1 }).exec();
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Tag name is required' });
      return;
    }

    const existing = await Tag.findOne({ name }).exec();
    if (existing) {
      res.status(400).json({ message: 'Tag already exists' });
      return;
    }

    const tag = new Tag({ name });
    await tag.save();

    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tagId = req.params.id;
    const tag = await Tag.findByIdAndDelete(tagId).exec();
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    next(error);
  }
};