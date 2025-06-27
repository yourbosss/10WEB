import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface ProcessImageOptions {
  width?: number;
  height?: number;
  rotate?: number;
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
}

export class ProcessImage {
  public async processImage(
    inputPath: string,
    outputPath: string,
    options: ProcessImageOptions = {}
  ): Promise<void> {
    try {
      let image = sharp(inputPath);

      if (options.rotate) {
        image = image.rotate(options.rotate);
      }

      if (options.width || options.height) {
        image = image.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      switch (options.format) {
        case 'jpeg':
          image = image.jpeg({ quality: options.quality ?? 80 });
          break;
        case 'png':
          image = image.png();
          break;
        case 'webp':
          image = image.webp({ quality: options.quality ?? 80 });
          break;
        default:
          break;
      }

      await image.toFile(outputPath);
    } catch (error) {
      throw new Error(`Image processing error: ${error}`);
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}