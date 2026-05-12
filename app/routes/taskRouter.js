const express = require("express");
const authCheck = require("../middleware/authMiddleware");
const permission = require("../middleware/permission");
const taskController = require("../controller/taskController");
const uploadFile = require("../middleware/cloudinaryMiddleware");

const taskRouter = express.Router();

taskRouter.post(
  "/create",
  authCheck,
  permission("admin", "manager"),
  uploadFile.array("attachments", 5),
  taskController.createTask,
);

taskRouter.patch(
  "/reassign/employee/:id",
  authCheck,
  permission("admin", "manager"),
  taskController.reassignTask,
);
taskRouter.get(
  "/pending",
  authCheck,
  permission("admin", "manager"),
  taskController.checkPendingTask,
);

taskRouter.get(
  "/my-task",
  authCheck,
  permission("employee"),
  taskController.assignedTask,
);

taskRouter.get(
  "/single/:id",
  authCheck,
  permission("employee"),
  taskController.singleTask,
);

taskRouter.patch(
  "/status/update/:id",
  authCheck,
  permission("employee"),
  taskController.updateTaskStatus,
);

taskRouter.delete(
  "/delete/:id",
  authCheck,
  permission("admin", "manager"),
  taskController.deleteTask,
);
module.exports = taskRouter;
