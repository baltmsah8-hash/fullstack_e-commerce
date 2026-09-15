import express from "express";
import adminLogin from "../controllers/adminController";

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);

export default adminRouter;
