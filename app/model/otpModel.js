const mongoose = require("mongoose");

const verifyEmailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expire: "15m",
  },
});

const EmailVerify = mongoose.model("EmailVerify", verifyEmailSchema);

module.exports = EmailVerify;
