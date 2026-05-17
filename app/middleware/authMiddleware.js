const jwt = require("jsonwebtoken");
const httpCodes = require("../utils/httpCode");

const authCheck = (req, res, next) => {
  let token;

  // Token from body
  if (req.body.token) {
    token = req.body.token;
  }

  // Token from header
  else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    return res.status(httpCodes.bad_request).json({
      success: false,
      message: "Access Token Required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(httpCodes.unauthorized).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = authCheck;
