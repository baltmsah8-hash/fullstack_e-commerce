import express from "express";
import multer from 'multer';
import { addProduct, listProducts, removeProduct } from '../controllers/productControllers';

const productRouter = express.Router();
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()} ${file.originalname}`);
    },
});
const upload = multer({storage: storage});

productRouter.post('/add-product', upload.single("image"), addProduct);
productRouter.get('/products-list', listProducts);
productRouter.post('/remove-product', removeProduct);

export default productRouter;