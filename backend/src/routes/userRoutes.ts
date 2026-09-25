import express from "express";
import { Request, Response } from "express";
import { login, logout, register } from "../controllers/userController";
import authMiddleware from "./auth";

const router = express.Router();

router.post("/login", login);
router.post("/loginout", logout);
router.post("/register", register);
// router.post("/profile", authMiddleware, async (req: Request, res:Response) => {});

export default router;
