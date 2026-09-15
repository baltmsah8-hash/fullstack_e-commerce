import type { Request, Response } from 'express';
import productModel from '../models/productModel';
import fs from 'fs';

const addProduct = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload an image" });
    }
    let image_filename: string = req.file.filename;

    const product = new productModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: image_filename,
    });
    try {
        await product.save();
        res.status(201).json({ success: true, message: "Product Added" });
    } catch (err) {
        console.error(err);
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
        console.log(req.body);
        fs.unlink(`uplods/${product}`, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
        await productModel.findByIdAndDelete(req.body.id);
        res.status(200).json({ success: true, message: 'Product Is Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


export { addProduct, listProducts, removeProduct };