import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { changePasswordController } from "../controllers/authController.js";

const router = express.Router();

// get user home page/dashboard
router.get("/user", authMiddleware, (req, res) => {
  const { userId, username, email, role } = req.userInfo;
  res.status(200).json({
    fetchedHomePage: true,
    message: "Welcome to the user page",
    userData: {
      _id: userId,
      username,
      email,
      role,
    },
  });
});

// update password
router.put("/update-password", authMiddleware, changePasswordController);
export default router;
