const express = require("express");
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserDashboardDetails,
  passwordUpdate,
  updateUserDetails,
  getAdminDetails,
  getAllUsers,
  getUserByAdmin,
  updateUserbyAdmin,
  removeUserByAdmin,
} = require("../controllers/user");
const { isLoggedin, isCustomRole } = require("../middlewares/user");
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
router.route("/userDashboard/update").put(isLoggedin, updateUserDetails);
router
  .route("/getAdminDetails")
  .get(isLoggedin, isCustomRole("admin"), getAdminDetails);
router.route("/admin/user").get(isLoggedin, isCustomRole("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isLoggedin, isCustomRole("admin"), getUserByAdmin)
  .post(isLoggedin, isCustomRole("admin"), updateUserbyAdmin)
  .delete(isLoggedin, isCustomRole("admin"), removeUserByAdmin);

module.exports = router;
