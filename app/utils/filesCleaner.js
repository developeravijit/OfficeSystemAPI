const cloudinary = require("../config/cloudinary");

const filesCleaner = async (files) => {
  try {
    if (!files || files.length === 0) {
      return;
    }
    for (const file of files) {
      if (file.filename) {
        await cloudinary.uploader.destroy(file.filename);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = filesCleaner;
