import cloudinary from "../config/cloudinary.js";

const logServerError = (action, error) => {
  console.error(
    `An error occured while trying  to ${action} the image:  ${error}`
  );
  throw new Error(
    "An error occured while trying  to upload the image: ",
    error
  );
};

export async function uploadToCloudinaryHelper(filePath) {
  try {
    const uploadedImage = await cloudinary.uploader.upload(filePath);
    return {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };
  } catch (error) {
    logServerError("upload", error);
  }
}

export async function deleteFromCloudinaryHelper(publicId) {
  try {
    const deletedImage = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      message: "Successfully deleted the image from cloudinary",
      data: deletedImage
    };
  } catch (error) {
    logServerError("delete", error);
  }
}
