const express = require("express");
const authController = require("../controller/authController");
const permission = require("../middleware/permission");
const authCheck = require("../middleware/authMiddleware");
const uploadFile = require("../middleware/cloudinaryMiddleware");

const authRouter = express.Router();

authRouter.post(
  "/create",
  uploadFile.single("avatar"),
  authController.createUser,
);

authRouter.post("/login", authController.userLogin);

authRouter.post("/verify", authController.verifyEmail);

authRouter.post("/refresh-token", authController.refreshToken);

authRouter.get(
  "/list",
  authCheck,
  permission("admin"),
  authController.showUser,
);

authRouter.patch(
  "/role/update/:id",
  authCheck,
  permission("admin"),
  authController.roleDefine,
);

authRouter.put(
  "/update/:id",
  authCheck,
  permission("admin", "manager"),
  authController.updateUser,
);

authRouter.patch(
  "/status/:id",
  authCheck,
  permission("admin"),
  authController.userStatus,
);

authRouter.get(
  "/inactive/list",
  authCheck,
  permission("admin", "manager"),
  authController.inactiveUser,
);

authRouter.delete(
  "/delete/:id",
  authCheck,
  permission("admin", "manager"),
  authController.deleteUser,
);

module.exports = authRouter;
