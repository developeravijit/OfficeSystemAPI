const jwt = require("jsonwebtoken");
const httpCodes = require("../utils/httpCode");

const authCheck = (req, res, next) => {
  const token =
    req?.body.token || req?.query.token || req?.headers["authorization"];

  if (!token) {
    return res.status(httpCodes.bad_request).json({
      success: false,
      message: "Token is required to access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(httpCodes.server_error).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = authCheck;
