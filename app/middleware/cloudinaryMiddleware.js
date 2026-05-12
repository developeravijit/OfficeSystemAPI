require("dotenv").config();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const FILE_TYPE = ["jpg", "jpeg", "png", "webp"];

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUD_FOLDER_NAME,
    allowed_formats: FILE_TYPE,

    public_id: (req, file) => {
      const name = file.originalname.split(".")[0]; 
      const uniqueName = name.replace(/\s+/g, "-") + "-" + Date.now(); 
      return uniqueName;
    },
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const uploadFile = multer({
  storage: cloudStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = uploadFile;
