const Employee = require("../model/user");
const imageCleaner = require("../utils/imageCleaner");
const httpCodes = require("../utils/httpCode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

class authController {
  async createUser(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password || !phone) {
        await imageCleaner(req.file);
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "All fields are required",
        });
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(password)) {
        await imageCleaner(req.file);
        return res.status(httpCodes.bad_request).json({
          success: false,
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
        });
      }

      const existingUser = await Employee.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        await imageCleaner(req.file);
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "User already exist",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const data = new Employee({
        name,
        email: email.toLowerCase(),
        password: hashPassword,
        phone,
      });

      if (req.file) {
        data.avatar = req.file.path;
        data.public_id = req.file.filename;
      }

      const result = await data.save();
      return res.status(httpCodes.created).json({
        success: true,
        message: "User Created Successfully",
        data: result,
      });
    } catch (error) {
      await imageCleaner(req.file);
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async userLogin(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "All fields are required",
        });
      }

      const data = await Employee.findOne({ email: email.toLowerCase() });
      if (!data) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Invalid email id",
        });
      }
      if (data.status === "inactive" || data.isDeleted) {
        return res.status(httpCodes.forbidden).json({
          success: false,
          message: "Account is inactive",
        });
      }
      const isMatch = await bcrypt.compare(password, data.password);
      if (!isMatch) {
        return res.status(httpCodes.forbidden).json({
          success: false,
          message: "Invalid Password",
        });
      }

      const token = jwt.sign(
        {
          id: data._id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          status: data.status,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Login Successfully",
        data: {
          id: data._id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          status: data.status,
          token: token,
        },
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async showUser(req, res) {
    try {
      const data = await Employee.find();

      if (!data || data.length === 0) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "No user find",
        });
      }
      return res.status(httpCodes.ok).json({
        success: true,
        message: "All Employee List",
        totalEmployee: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async roleDefine(req, res) {
    try {
      const id = req.params.id;
      const { role } = req.body;

      if (!role) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Role is required",
        });
      }

      const validRoles = ["employee", "manager", "admin"];

      if (!role || !validRoles.includes(role)) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Invalid role",
        });
      }

      const updateRole = await Employee.findByIdAndUpdate(
        id,
        { role },
        { new: true },
      );
      if (!updateRole) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(httpCodes.ok).json({
        success: true,
        message: "Role Update successfully",
        data: updateRole,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateUser(req, res) {
    try {
      const id = req.params.id;
      const databyID = await Employee.findById(id);

      if (!databyID) {
        await imageCleaner(req.file);
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "User not found",
        });
      }
      const data = { ...req.body };

      delete data.role;
      delete data.status;

      if (req.file) {
        if (databyID.avatar) {
          await cloudinary.uploader.destroy(databyID.public_id);
        }
        data.avatar = req.file.path;
        data.public_id = req.file.filename;
      }

      const updateUser = await Employee.findByIdAndUpdate(id, data, {
        new: true,
      });

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Employee updated successfully",
        data: updateUser,
      });
    } catch (error) {
      await imageCleaner(req.file);
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async userStatus(req, res) {
    try {
      const id = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Role is required",
        });
      }

      const userStatus = ["active", "inactive"];

      if (!status || !userStatus.includes(status)) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "Invalid status",
        });
      }

      const updateStatus = await Employee.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );
      if (!updateStatus) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(httpCodes.ok).json({
        success: true,
        message: "Role Update successfully",
        data: updateStatus,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async inactiveUser(req, res) {
    try {
      const data = await Employee.find({ status: "inactive" });

      if (!data || data.length === 0) {
        return res.status(httpCodes.not_found).json({
          success: false,
          message: "No inactive employee found",
        });
      }

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Inactive Employee List",
        totalInactiveEmployee: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const id = req.params.id;

      const data = await Employee.findById(id);

      if (!data) {
        return res.status(httpCodes.bad_request).json({
          success: false,
          message: "User not found",
        });
      }

      const deleteUser = await Employee.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );

      return res.status(httpCodes.ok).json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error) {
      return res.status(httpCodes.server_error).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new authController();
