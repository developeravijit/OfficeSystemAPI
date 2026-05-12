const cloudinary = require("../config/cloudinary");
const httpCodes = require("./httpCode");

const imageCleaner = async (file) => {
  if (file?.filename) {
    try {
      await cloudinary.uploader.destroy(file.filename);
    } catch (error) {
      return res.status(httpCodes.bad_gateway).json({
        success: false,
        message: error.message,
      });
    }
  }
};

module.exports = imageCleaner;
