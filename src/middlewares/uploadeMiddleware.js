import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const imageFileName = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, imageFileName);
  },
});

const checkFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported, please upload only images"));
  }
};

// multer middleware
export default multer({
  storage: storage,
  fileFilter: checkFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },//10MB file size limit
});
