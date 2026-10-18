import type { Request, Response } from 'express';
import productModel from '../models/productModel';
import fs from 'fs';
import path from 'path';

async function deleteUploadedImage(filename: string): Promise<void> {
    try {
        const uploadDirectory = path.resolve("uploads");
        const imagePath = path.resolve(uploadDirectory, path.basename(filename));

        if (path.dirname(imagePath) !== uploadDirectory) {
            console.error("Security Alert: Attempted Path Traversal cleanup ignored.");
            return;
        }

        await fs.promises.unlink(imagePath);
    } catch (cleanupError) {
        if ((cleanupError as NodeJS.ErrnoException).code !== "ENOENT") {
            console.error("Failed to clean up uploaded product image:", cleanupError);
        }
    }
}

const addProduct = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload an image" });
    }
    
    let image_filename: string = req.file.filename;

    const name = req.body.name?.trim();
    const description = req.body.description?.trim();
    const category = req.body.category?.trim();
    const rawPrice = req.body.price;

    if (!name || name.length < 3) {
        await deleteUploadedImage(image_filename);
        return res.status(400).json({ success: false, message: "Please provide a valid product name (minimum 3 characters)" });
    }

    if (!description || description.length < 10) {
        await deleteUploadedImage(image_filename);
        return res.status(400).json({ success: false, message: "Please provide a valid description (minimum 10 characters)" });
    }

    if (!category) {
        await deleteUploadedImage(image_filename);
        return res.status(400).json({ success: false, message: "Please specify a product category" });
    }

    const price = Number(rawPrice);

    if (isNaN(price)) {
        await deleteUploadedImage(image_filename);
        return res.status(400).json({ success: false, message: "Price must be a valid number" });
    }

    if (price <= 0) {
        await deleteUploadedImage(image_filename);
        return res.status(400).json({ success: false, message: "Please write a real price greater than 0" });
    }

    const product = new productModel({
        name,
        description,
        price, 
        category,
        image: image_filename,
    });

    try {
        await product.save();
        return res.status(201).json({ success: true, message: "Product Added" });
    } catch (err) {
        console.error(err);
        await deleteUploadedImage(image_filename);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const listProducts = async (req: Request, res: Response) => {
    try {
        const products = await productModel.find({});
        return res.status(200).json({ success: true, data: products });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeProduct = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await productModel.findById(req.body.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await deleteUploadedImage(product.image);

        await productModel.findByIdAndDelete(product._id);
        return res.status(200).json({ success: true, message: 'Product Is Deleted' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { addProduct, listProducts, removeProduct };
