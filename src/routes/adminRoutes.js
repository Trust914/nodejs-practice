import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdminMiddleware } from "../middlewares/adminMiddelware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdminMiddleware, (req, res) => {
  const { userId, username, email, role } = req.userInfo;

  res.status(200).json({
    fetchedHomePage: true,
    message: "Welcome to the admin page",
    userData: {
      _id: userId,
      username,
      email,
      role,
    },
  });
});

export default router;
