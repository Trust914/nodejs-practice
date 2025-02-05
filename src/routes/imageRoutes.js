import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdminMiddleware } from "../middlewares/adminMiddelware.js";
import {
  deleteImageController,
  getImagesController,
  uploadImageController,
} from "../controllers/cloudinaryImageController.js";
import uploadeImageMiddleware from "../middlewares/uploadeMiddleware.js";

const router = express.Router();

// upload image route --- only admins can upload images
router.post(
  "/upload",
  authMiddleware,
  isAdminMiddleware,
  uploadeImageMiddleware.single("image"),
  uploadImageController
);

// Get all images - all users can view uploaded images
router.get("/get-all", authMiddleware, getImagesController);

// Delete an image by its id - only admins can delete images and an admin can ONLY delete an image they uploaded
router.delete("/delete/:imageId", authMiddleware, isAdminMiddleware,deleteImageController);

export default router;
