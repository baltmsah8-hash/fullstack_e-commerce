import express from "express";
import { login, logout, register, profile, allUsers, changeRole, removeUser,  } from "../controllers/userController";
import { adminMiddleware, authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.get("/profile", authMiddleware, profile);
router.get("/all-users", authMiddleware, adminMiddleware, allUsers);
router.put("/change-role", authMiddleware, adminMiddleware, changeRole);
router.delete("/remove-user", authMiddleware, adminMiddleware, removeUser);

export default router;
