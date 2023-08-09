const express = require("express");
const router = express.Router();

const userRoutes = require("./../domains/user");
const EmailVerificationRoutes = require("./../domains/email_verification");

router.use("/user", userRoutes);
router.use("/email_verification", EmailVerificationRoutes);

module.exports = router;
