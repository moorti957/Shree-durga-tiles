import sharp from 'sharp';
import { AppError } from '../middlewares/errorHandler';

const allowedFormats = new Set(['jpeg', 'png', 'webp', 'gif', 'avif', 'tiff']);

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'webp';
};

export const processUploadImage = async (input: Buffer): Promise<ProcessedImage> => {
  const image = sharp(input, { limitInputPixels: 40_000_000, animated: false });
  let metadata: sharp.Metadata;
  try {
    metadata = await image.metadata();
  } catch (error) {
    if (
      error instanceof Error &&
      /unsupported image format|corrupt header|input buffer .*invalid|input buffer is empty/i.test(error.message)
    ) {
      throw new AppError('Uploaded file is not a valid supported image.', 400, 'INVALID_IMAGE');
    }
    throw error;
  }
  if (!metadata.format || !allowedFormats.has(metadata.format)) {
    throw new AppError('Only supported raster image files can be uploaded.', 400, 'INVALID_IMAGE');
  }
  const result = await image
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    format: 'webp',
  };
};
