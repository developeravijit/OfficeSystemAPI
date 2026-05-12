const express = require("express");
const authRouter = require("./authRouter");
const taskRouter = require("./taskRouter");

const router = express.Router();

router.use("/api/user", authRouter);

router.use("/api/task", taskRouter);

module.exports = router;
