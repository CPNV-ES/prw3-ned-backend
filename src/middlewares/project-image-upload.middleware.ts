import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import {
  PROJECT_IMAGES_DIRECTORY,
  buildProjectImageFilename,
  ensureProjectImagesDirectoryExists,
  getProjectImageExtension,
} from "../utils/project-images";

const MAX_PROJECT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureProjectImagesDirectoryExists();
    cb(null, PROJECT_IMAGES_DIRECTORY);
  },
  filename: (_req, file, cb) => {
    try {
      cb(null, buildProjectImageFilename(file.mimetype));
    } catch (error) {
      cb(error as Error, "");
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_PROJECT_IMAGE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!getProjectImageExtension(file.mimetype)) {
      cb(new Error("Only jpg, png, and webp images are allowed"));
      return;
    }

    cb(null, true);
  },
}).single("image");

function uploadProjectImage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  upload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
          error: `Image exceeds max size of ${MAX_PROJECT_IMAGE_SIZE_BYTES} bytes`,
        });
        return;
      }

      res.status(400).json({ error: error.message });
      return;
    }

    res.status(400).json({ error: error.message });
  });
}

export { MAX_PROJECT_IMAGE_SIZE_BYTES, uploadProjectImage };
