const userModel = require("../models/user");
const { BigPromise } = require("../utils/BigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedin = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return next(CustomError("Please login to access this page", 401));
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  let user = await userModel.findById(decoded.id);

  req.user = user;

  next();
});
