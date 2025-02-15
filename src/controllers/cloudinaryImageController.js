import ImageModel from "../models/image.js";
import {
  uploadToCloudinaryHelper,
  deleteFromCloudinaryHelper,
} from "../helpers/cloudinaryHelper.js";
import fs from "fs";

export async function uploadImageController(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file specified, please upload a valid file",
      });
    }
    const uploadedBy = req.userInfo.userId; // get the user who wants to upload the image from the middleware
    const { url, publicId } = await uploadToCloudinaryHelper(file.path);
    const savedImage = await ImageModel.create({
      url,
      publicId,
      uploadedBy,
    });

    if (!savedImage) {
      return res.status(400).json({
        success: false,
        message: "An error occured, please try again later",
      });
    }
    res.status(201).json({
      success: true,
      message: "Successfully uploaded the image",
      data: savedImage,
    });
    fs.unlinkSync(req.file.path); // delete the image file from local storage
  } catch (err) {
    console.error("Error occured while trying to uplod the image: ", err);
    res.status(500).json({
      success: false,
      message: "An error occured in the server",
      error: err,
    });
  }
}

export async function getImagesController(req, res) {
  /* supported paramaters to filter result:
            page ,
            limit (amount of data per page),
            sortBy (field to sort the data by, e.g, when it was created, last updated, name, etc)
            sortOrder (ascending or descending order)
    */
  try {
    const totalImages = await ImageModel.countDocuments();
    if (totalImages === 0) {
      return res.status(404).json({
        message: "No images found",
      });
    }

    const defaultPage = 1; // default to page 1
    const defaultLimit = 5;

    let currentPage = parseInt(req.query.page) || defaultPage; // get the client current page if it exists or default to page 1 if it doesnt exist
    let limit = parseInt(req.query.limit) || defaultLimit; // get the client requested limit if it exists or default to the default limit if it doesnt exist

    const skip = (currentPage - 1) * limit; // set the amount of data to not return when page changes
    const sortBy = req.params.sortBy || "createdAt"; // field to sort the data by
    const sortOrder = req.params.sortOrder === "asc" ? 1 : -1; // ascending order = 1, descending order = -1
    const sortMethodObject = {};
    sortMethodObject[sortBy] = sortOrder;

    // validate the current page to ensure it is within the supported amount
    if (currentPage < defaultPage) {
      currentPage = defaultPage;
    }
    // validate the client limit to ensure it is within the supported amount
    if (limit < 1 || limit > totalImages) {
      limit = defaultLimit;
    }

    const totalPages = Math.ceil(totalImages / limit);

    const allImages = await ImageModel.find() //get all images with the following clause: 👇
      .sort(sortMethodObject)// sort imags by their filter field (e.g CreatedAt) in Order specified(ascending or decending order)
      .limit(limit); //only return the specified number (limit) of data per page
    if (!allImages) {
      return res.status(404).json({
        message:
          "No images found with that query, check your parameters and try again",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully found all images",
      currentPage,
      totalPages,
      totalImages,
      data: allImages,
    });
  } catch (err) {
    console.error("Error occured while trying to get the images: ", err);
    res.status(500).json({
      success: false,
      message: "An error occured in the server",
      error: err,
    });
  }
}

export async function deleteImageController(req, res) {
  try {
    const userId = req.userInfo.userId;
    const imageToDeleteId = req.params.imageId; // imageId is gotten from  the requeset parameters

    // check if the image exist
    const imageObject = await ImageModel.findById(imageToDeleteId);
    if (!imageObject) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    //check if the current user trying to delete it is the user who uploaded it
    if (imageObject.uploadedBy.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message:
          "You are not authorised to delete the image,You did not upload it",
      });
    }

    // delete the image from cloudinary
    let deleteError = false;
    const deleteImageCloudinaryResponse = await deleteFromCloudinaryHelper(
      imageObject.publicId
    );
    if (deleteImageCloudinaryResponse.success) {
      const deleteImageDBResponse = await ImageModel.findByIdAndDelete(
        imageToDeleteId
      );
      if (!deleteImageDBResponse) {
        deleteError = true;
      }
    } else {
      deleteError = true;
    }
    deleteError
      ? res.status(400).json({
          success: false,
          message: "Unable to delete the image",
        })
      : res.status(200).json({
          success: true,
          message: "Deleted the image successfully",
        });
  } catch (err) {
    console.error("Error occured while trying to delete the images: ", err);
    res.status(500).json({
      success: false,
      message: "An error occured in the server",
      error: err,
    });
  }
}
