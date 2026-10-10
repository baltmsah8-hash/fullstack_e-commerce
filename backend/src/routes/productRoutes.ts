import express, { type RequestHandler } from "express";
import multer from 'multer';
import fs from 'fs';
import path from "path";
import crypto from 'crypto';
import sharp from "sharp";
import { addProduct, listProducts, removeProduct } from '../controllers/productControllers';
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const productRouter = express.Router();
const maxImageSize = 5 * 1024 * 1024;
const supportedImageFormats = new Set(["jpeg", "png", "webp", "avif", "tiff"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxImageSize, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(null, true);
  },
}).single("image");

const uploadAndConvertImage: RequestHandler = (req, res, next) => {
  upload(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      const isOversized = error.code === "LIMIT_FILE_SIZE";
      return res.status(isOversized ? 413 : 400).json({
        success: false,
        message: isOversized
          ? "Image must be 5MB or smaller"
          : "Please upload a single image file",
      });
    }
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (!req.file) {
      return next();
    }

    let imageFormat: string | undefined;
    try {
      const metadata = await sharp(req.file.buffer, { limitInputPixels: 25_000_000 }).metadata();
      imageFormat = metadata.format;
    } catch {
      return res.status(400).json({ success: false, message: "Invalid or unsupported image" });
    }

    if (!imageFormat || !supportedImageFormats.has(imageFormat)) {
      return res.status(400).json({
        success: false,
        message: "Supported image formats are JPG, PNG, WEBP, AVIF, and TIFF",
      });
    }

    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(req.file.buffer, { limitInputPixels: 25_000_000 })
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      return res.status(400).json({ success: false, message: "Invalid or unsupported image" });
    }

    const filename = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}.webp`;
    const destination = path.resolve("uploads");
    const filePath = path.join(destination, filename);

    try {
      await fs.promises.mkdir(destination, { recursive: true });
      await fs.promises.writeFile(filePath, webpBuffer, { flag: "wx" });
    } catch (writeError) {
      return next(writeError);
    }

    req.file.filename = filename;
    next();
  });
};

productRouter.post('/add-product', authMiddleware, adminMiddleware, uploadAndConvertImage, addProduct);
productRouter.get('/products-list', listProducts);
productRouter.delete('/remove-product', authMiddleware, adminMiddleware, removeProduct);

export default productRouter;