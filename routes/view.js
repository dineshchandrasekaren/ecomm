const express = require("express");
const { home } = require("../controllers/view");
const router = express.Router();

router.route("/signupview").get(home);
module.exports = router;
