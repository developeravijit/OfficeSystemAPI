const Task = require("../model/taskModel");
const Employee = require("../model/user");
const filesCleaner = require("../utils/filesCleaner");
const httpCodes = require("../utils/httpCode");

class taskController {
  async createTask(req, res) {
    try {
      const { title, description, assignedTo, priority, dueDate } = req.body;

      if (!title || !description || !assignedTo || !priority || !dueDate) {
        await filesCleaner(req.files);
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "All fields required",
        });
      }
      const attachmentData = [];

      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          attachmentData.push({
            url: file.path,
            public_id: file.filename,
          });
        });
      }

      const loginUser = req.user;

      const assignUser = await Employee.findById(assignedTo);

      if (!assignUser) {
        await filesCleaner(req.files);
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "Assigned user not found",
        });
      }
      if (assignUser.status === "inactive" || assignUser.isDeleted) {
        await filesCleaner(req.files);
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Can not assign tasks to inactive employees",
        });
      }

      if (loginUser.role === "manager" && assignUser.role !== "employee") {
        await filesCleaner(req.files);

        return res.status(httpCodes.forbidden).json({
          success: false,
          message: "Managers can assign tasks only to employees",
        });
      }

      const currentDate = new Date();

      currentDate.setHours(0, 0, 0, 0);

      const taskDueDate = new Date(dueDate);

      taskDueDate.setHours(0, 0, 0, 0);

      if (taskDueDate < currentDate) {
        await filesCleaner(req.files);

        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Due date cannot be in the past",
        });
      }

      const taskData = new Task({
        title,
        description,
        assignedBy: req.user.id,
        assignedTo,
        priority,
        dueDate,
        attachments: attachmentData,
      });

      await taskData.save();

      const result = await Task.findById(taskData._id)
        .populate("assignedBy", "name email role")
        .populate("assignedTo", "name email role");

      return res.status(httpCodes.created).json({
        success: true,
        message: "Task created successfully",
        data: result,
      });
    } catch (error) {
      await filesCleaner(req.files);
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async reassignTask(req, res) {
    try {
      const taskID = req.params.id;
      const { assignedTo } = req.body;

      if (!assignedTo) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Assigned employee id is required",
        });
      }

      const taskData = await Task.findById(taskID);

      if (!taskData) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "Task not found",
        });
      }

      const employee = await Employee.findById(assignedTo);
      if (!employee) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "Employee not found",
        });
      }

      if (employee.status === "inactive" || employee.isDeleted) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Cannot assign task to inactive employee",
        });
      }
      const loginUser = req.user;
      if (loginUser.role === "manager" && employee.role !== "employee") {
        return res.status(httpCodes.forbidden).json({
          success: false,
          message: "Managers can assign tasks only to employees",
        });
      }
      if (taskData.status === "Completed") {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Completed task cannot be reassigned",
        });
      }
      taskData.assignedTo = assignedTo;
      await taskData.save();
      const updatedTask = await Task.findById(taskID)
        .populate("assignedBy", "name email role")
        .populate("assignedTo", "name email role");

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Task reassigned successfully",
        data: updatedTask,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async checkPendingTask(req, res) {
    try {
      const data = await Task.find({ status: "Pending" });

      if (!data || data.length === 0) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "No pending task found",
        });
      }

      return res.status(httpCodes.ok).json({
        success: true,
        message: "All Pending Task List",
        TotalpendingTask: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async assignedTask(req, res) {
    try {
      const loginUserId = req.user.id;

      if (!loginUserId) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Invalid login credential",
        });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const skip = (page - 1) * limit;

      const task = await Task.find({
        assignedTo: loginUserId,
        isDeleted: false,
      })
        .populate("assignedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Assigned task list",
        currentPage: page,
        totalTask: task.length,
        data: task,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async singleTask(req, res) {
    try {
      const taskId = req.params.id;

      const task = await Task.findOne({
        _id: taskId,
        assignedTo: req.user.id,
        isDeleted: false,
      }).populate("assignedBy", "name email role");

      if (!task) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(httpCodes.ok).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateTaskStatus(req, res) {
    try {
      const taskId = req.params.id;
      const { status } = req.body;

      const validStatus = ["Pending", "In Progress", "Completed"];

      if (!validStatus.includes(status)) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Invalid status",
        });
      }

      const task = await Task.findOne({
        _id: taskId,
        assignedTo: req.user.id,
        isDeleted: false,
      });

      if (!task) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "Task not found",
        });
      }

      task.status = status;
      await task.save();

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Task status updated successfully",
        data: task,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteTask(req, res) {
    try {
      const taskId = req.params.id;
      const data = await Task.findById(taskId);

      if (!data) {
        return res.status({
          success: false,
          message: "No task found",
        });
      }

      const deleteTaskData = await Task.findByIdAndUpdate(
        taskId,
        {
          isDeleted: true,
        },
        { new: true },
      );

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Task Deleted Successfully",
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new taskController();
