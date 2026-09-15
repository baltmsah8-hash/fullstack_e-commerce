"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const productControllers_1 = require("../controllers/productControllers");
const productRouter = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()} ${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
productRouter.post('/add-product', upload.single("image"), productControllers_1.addProduct);
productRouter.post('/products-list', productControllers_1.listProducts);
productRouter.post('/remove-product', productControllers_1.removeProduct);
exports.default = productRouter;
