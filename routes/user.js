const express = require("express");
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserDashboardDetails,
  passwordUpdate,
} = require("../controllers/user");
const { isLoggedin } = require("../middlewares/user");
let router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router
  .route("/getUserDashboardDetails")
  .get(isLoggedin, getUserDashboardDetails);
router.route("/passwordUpdate").put(isLoggedin, passwordUpdate);

module.exports = router;
