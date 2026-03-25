import { randomUUID } from "crypto";
import { mkdirSync, unlink } from "fs";
import path from "path";
import type { Request } from "express";

const ASSETS_ROOT = path.resolve(process.cwd(), "src/assets");
const STORAGE_ROOT = path.resolve(process.cwd(), "storages");
const PROJECT_IMAGES_DIRECTORY = path.join(STORAGE_ROOT, "projects");
const PROJECT_IMAGES_PUBLIC_PATH = "/storages/projects";
const DEFAULT_PROJECT_IMAGE_PUBLIC_PATH = "/assets/images/default-project.png";
const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function ensureProjectImagesDirectoryExists(): void {
  mkdirSync(PROJECT_IMAGES_DIRECTORY, { recursive: true });
}

function getProjectImageExtension(mimeType: string): string | null {
  return MIME_TYPE_TO_EXTENSION[mimeType] || null;
}

function buildProjectImageFilename(mimeType: string): string {
  const extension = getProjectImageExtension(mimeType);

  if (!extension) {
    throw new Error("Unsupported image type");
  }

  return `${Date.now()}-${randomUUID()}.${extension}`;
}

function buildProjectImageUrl(req: Request, filename: string): string {
  const relativeUrl = `${PROJECT_IMAGES_PUBLIC_PATH}/${filename}`;
  return buildPublicAssetUrl(req, relativeUrl);
}

function buildPublicAssetUrl(req: Request, relativeUrl: string): string {
  const host = req.get("host");

  if (!host) {
    return relativeUrl;
  }

  return `${req.protocol}://${host}${relativeUrl}`;
}

function buildDefaultProjectImageUrl(req: Request): string {
  return buildPublicAssetUrl(req, DEFAULT_PROJECT_IMAGE_PUBLIC_PATH);
}

function getStoredProjectImagePathFromUrl(imageUrl: string): string | null {
  try {
    const url = imageUrl.startsWith("http")
      ? new URL(imageUrl)
      : new URL(imageUrl, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);

    if (!pathname.startsWith(`${PROJECT_IMAGES_PUBLIC_PATH}/`)) {
      return null;
    }

    const relativePath = pathname.replace(/^\/+/, "");
    const resolvedPath = path.resolve(process.cwd(), relativePath);

    if (!resolvedPath.startsWith(PROJECT_IMAGES_DIRECTORY)) {
      return null;
    }

    return resolvedPath;
  } catch {
    return null;
  }
}

function deleteStoredProjectImage(imageUrl: string): Promise<void> {
  const imagePath = getStoredProjectImagePathFromUrl(imageUrl);

  if (!imagePath) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    unlink(imagePath, (error) => {
      if (!error || error.code === "ENOENT") {
        resolve();
        return;
      }

      reject(error);
    });
  });
}

export {
  ASSETS_ROOT,
  DEFAULT_PROJECT_IMAGE_PUBLIC_PATH,
  PROJECT_IMAGES_DIRECTORY,
  STORAGE_ROOT,
  ensureProjectImagesDirectoryExists,
  getProjectImageExtension,
  buildProjectImageFilename,
  buildProjectImageUrl,
  buildDefaultProjectImageUrl,
  deleteStoredProjectImage,
};
