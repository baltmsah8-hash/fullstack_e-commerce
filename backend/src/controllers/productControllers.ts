import type { Request, Response } from 'express';
import productModel from '../models/productModel';
import fs from 'fs';
import path from 'path';

const addProduct = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload an image" });
    }
    let image_filename: string = req.file.filename;

    const product = new productModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename,
    });
    try {
        await product.save();
        res.status(201).json({ success: true, message: "Product Added" });
    } catch (err) {
        console.error(err);
        try {
            await fs.promises.unlink(path.resolve("uploads", path.basename(image_filename)));
        } catch (cleanupError) {
            if ((cleanupError as NodeJS.ErrnoException).code !== "ENOENT") {
                console.error("Failed to clean up uploaded product image:", cleanupError);
            }
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

const listProducts = async (req: Request, res: Response) => {
    try {
        const products = await productModel.find({});
        res.status(201).json({ success: true, data: products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const removeProduct = async (req: Request, res: Response) => {
    try {
        const product = await productModel.findById(req.body.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const uploadDirectory = path.resolve("uploads");
        const imagePath = path.resolve(uploadDirectory, path.basename(product.image));
        if (path.dirname(imagePath) !== uploadDirectory) {
            return res.status(400).json({ success: false, message: "Invalid product image path" });
        }

        try {
            await fs.promises.unlink(imagePath);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                throw error;
            }
        }

        await productModel.findByIdAndDelete(product._id);
        res.status(200).json({ success: true, message: 'Product Is Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


export { addProduct, listProducts, removeProduct };