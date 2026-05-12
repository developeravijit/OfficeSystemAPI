const Employee = require("../model/user");
const bcrypt = require("bcrypt");
const superAdmin = async () => {
  try {
    const adminExist = await Employee.findOne({ role: "admin" });
    console.log(`Super Admin: ${adminExist}`);

    if (!adminExist) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin@1234", salt);
      const superAdminData = await Employee.create({
        name: "Super Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        phone: "9999999999",
        role: "admin",
        status: "active",
      });
      console.log(`Default admin created ${superAdminData}`);
    }
  } catch (error) {
    console.log(`Admin create error ${error.message}`);
  }
};

module.exports = superAdmin;
