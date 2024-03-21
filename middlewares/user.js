const userModel = require("../models/user");
const { BigPromise } = require("../utils/BigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedin = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.header("Authorization") &&
      req.header("Authorization").replace("Bearer ", ""));

  if (!token) {
    return next(new CustomError("Please login to access this page", 401));
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  let user = await userModel.findById(decoded.id);

  req.user = user;

  next();
});

exports.isCustomRole =
  (...roles) =>
  (req, res, next) => {
    const { user } = req;
    if (!user) {
      return next(new CustomError("please login to access a page", 401));
    }
    if (!roles.includes(user.role)) {
      return next(new CustomError("access denied", 401));
    }

    next();
  };
