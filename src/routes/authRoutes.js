import express from "express";
import {
  createNewUserController,
  loginUserController,
} from "../controllers/authController.js";

const router = express.Router();

// all routes are related to authentication and authorization

// register (create) new user
router.post("/register", createNewUserController);

// login registered user
router.post("/login", loginUserController);

export default router;
