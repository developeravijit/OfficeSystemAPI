require("dotenv").config();
const express = require("express");
const DbConnect = require("./app/config/db");
const router = require("./app/routes");
const superAdmin = require("./app/utils/superAdmin");

const app = express();

// Database connection
DbConnect();

// Super Admin
superAdmin();

// Json Config
app.use(express.json());

// Router define
app.use(router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Port is running on ${PORT}`);
});
