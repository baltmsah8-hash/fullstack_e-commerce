import express from "express";
import multer from 'multer';
import fs from 'fs';
import { addProduct, listProducts, removeProduct } from '../controllers/productControllers';

const productRouter = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({storage: storage});

productRouter.post('/add-product', upload.single("image"), addProduct);
productRouter.get('/products-list', listProducts);
productRouter.post('/remove-product', removeProduct);

export default productRouter;