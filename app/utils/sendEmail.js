const transporter = require("../config/emailConfig");
const EmailVerify = require("../model/otpModel");

const sendEmail = async (req, user) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9999);

    const otpData = await EmailVerify({ userId: user._id, otp: otp }).save();

    await transporter.sendMail({
      from: process.env.EMAIL_FORM,
      to: user.email,
      subject: "OTP- verify your account",
      text: "",
      html: `<p>Dear ${user.name},</p> <p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP)</p>
    <h2 style="text-align: center; background-color: #a61616ff; padding: 10px;">OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`,
    });

    return otp;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = sendEmail;
