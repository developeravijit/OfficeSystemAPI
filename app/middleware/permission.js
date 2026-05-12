const httpCodes = require("../utils/httpCode");

const permission = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(httpCodes.bad_request).json({
        success: false,
        message: "Access Denied",
      });
    }
    next();
  };
};

module.exports = permission;
