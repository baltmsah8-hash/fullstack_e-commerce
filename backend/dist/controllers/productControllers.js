"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProduct = exports.listProducts = exports.addProduct = void 0;
const productModel_1 = __importDefault(require("../models/productModel"));
const fs_1 = __importDefault(require("fs"));
const addProduct = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload an image" });
    }
    let image_filename = req.file.filename;
    const product = new productModel_1.default({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: image_filename,
    });
    try {
        await product.save();
        res.status(201).json({ success: true, message: "Product Added" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.addProduct = addProduct;
const listProducts = async (req, res) => {
    try {
        const products = await productModel_1.default.find({});
        res.status(201).json({ success: true, data: products });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.listProducts = listProducts;
const removeProduct = async (req, res) => {
    try {
        const product = await productModel_1.default.findById(req.body.id);
        console.log(req.body);
        fs_1.default.unlink(`uplods/${product}`, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
        await productModel_1.default.findByIdAndDelete(req.body.id);
        res.status(200).json({ success: true, message: 'Product Is Deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.removeProduct = removeProduct;
