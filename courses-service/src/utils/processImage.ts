import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface ProcessImageOptions {
  width?: number;        // Максимальная ширина
  height?: number;       // Максимальная высота
  rotate?: number;       // Поворот в градусах (90, 180, 270)
  format?: 'jpeg' | 'png' | 'webp'; // Формат выходного файла
  quality?: number;      // Качество сжатия (для jpeg/webp), 1-100
}

export class ProcessImage {
  // Обрабатывает изображение по пути inputPath и сохраняет в outputPath
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
          fit: 'inside', // сохраняет пропорции, не превышая размеры
          withoutEnlargement: true, // не увеличивает если меньше
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
          // Если формат не указан, сохраняем в исходном формате
          break;
      }

      await image.toFile(outputPath);
    } catch (error) {
      throw new Error(`Ошибка обработки изображения: ${error}`);
    }
  }

  // Удаляет файл по пути, если нужно
  public async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Игнорируем ошибку, если файла нет
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
