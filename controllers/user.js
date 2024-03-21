const userModal = require("../models/user");
const cloudinary = require("cloudinary");
const { BigPromise } = require("../utils/BigPromise");
const { setCookieToken } = require("../utils/cookieToken");
const mailHelper = require("../utils/mailHelper");
const crypto = require("crypto");
const CustomError = require("../utils/customError");
const user = require("../models/user");

exports.signup = BigPromise(async (req, res) => {
  let { name, password, email } = req.body;
  console.log({ name, password, email }, req.body);
  if (!name || !password || !email) {
    res.status(400).json({ error: "name , password , email is mandatory" });
    return;
  }
  if (await userModal.findOne({ email })) {
    res.status(500).json({ error: "user already exist" });
    return;
  }
  let result;
  if (req.files.photo) {
    let file = req.files.photo;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
    });
  }
  console.log(result);
  let user = await userModal.create({
    name,
    password,
    email,
    photo: {
      id: result.public_id,
      url: result.secure_url,
    },
  });
  setCookieToken(res, user);
});

exports.login = BigPromise(async (req, res) => {
  let { password, email } = req.body;
  if (!password || !email) {
    res.status(400).json({ error: "password , email is mandatory" });
    return;
  }

  let user = await userModal.findOne({ email }).select("+password");
  if (!user) {
    return res.status(500).json({ error: "user not found signup" });
  }
  const isPasswordVerified = await user.verifyPassword(password);
  if (!isPasswordVerified) {
    return res.status(500).json({ error: "invalid password" });
  }

  setCookieToken(res, user);
});

exports.logout = BigPromise(async (req, res) => {
  if (req.cookies.token) {
    req.user = undefined;
    return res
      .cookie("token", "", {
        expire: Date.now(),
        httpOnly: true,
      })
      .json({
        success: true,
        message: "logout successfully",
      });
  }
  res.status(500).json({ message: "already logout" });
});

exports.forgotPassword = BigPromise(async (req, res) => {
  let { email } = req.body;
  if (!email) {
    return res.json({ error: "Email cannot be empty" });
  }
  let user = await userModal.findOne({ email });
  if (!user.email) {
    return res.json({ error: "email not exist" });
  }
  let token = await user.generateForgotPasswordToken();
  await user.save({ validateBeforeSave: false });
  await mailHelper({
    from: "dineshchandrasekaren@gmail.com",
    to: "vickey@one.com",
    subject: "Reset Password",
    text: `${req.protocol}://${req.get("host")}/resetPassword/${token}`,
  });
  res.json({ success: true, user });
});

exports.resetPassword = BigPromise(async (req, res) => {
  let { token } = req.params;

  let forgotPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  let user = await userModal.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(500).json({ error: "user not found" });
  }
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(500).json({ error: "password doesn't match" });
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "password updated" });
});

exports.getUserDashboardDetails = BigPromise(async (req, res, next) => {
  let user = await userModal.findById(req.user.id);

  if (!user) {
    return next(new CustomError("user not exist", 401));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.passwordUpdate = BigPromise(async (req, res, next) => {
  let user = await userModal.findById(req.user.id).select("+password");

  if (!user) {
    return next(new CustomError("user not exist", 401));
  }

  const { oldPassword, password } = req.body;

  let verifyPassword = await user.verifyPassword(oldPassword);

  if (!verifyPassword) {
    return next(new CustomError("old password is wrong"));
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: "password successfully updated",
    user,
  });
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const { id } = req.user;

  let newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = await userModal.findById(id);
    if (!user) {
      return next(new CustomError("user not found", 404));
    }
    const imageId = user.photo.id;

    let file = req.files.photo;

    await cloudinary.v2.uploader.destroy(imageId);

    let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
    });

    newData.photo = {
      id: result.public_id,
      url: result.secure_url,
    };
  }

  const user = await userModal.findByIdAndUpdate(id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "profile updated successfully",
    user,
  });
});

exports.getAdminDetails = BigPromise(async (req, res, next) => {
  const { id } = req.user;
  const user = await userModal.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.getAllUsers = BigPromise(async (req, res, next) => {
  const users = await userModal.find({ role: "user" });
  res.status(200).json({
    success: true,
    message: "All users are fetched",
    users,
  });
});
exports.getUserByAdmin = BigPromise(async (req, res, next) => {
  const { id } = req.params;
  let user = await userModal.findOne({ _id: id, role: "user" });
  if (!user) {
    return next(new CustomError("user not exist", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateUserbyAdmin = BigPromise(async (req, res, next) => {
  const { id } = req.params;
  let newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  if (req.files) {
    const user = await userModal.findById(id);
    if (!user) {
      return next(new CustomError("user not found", 404));
    }
    await cloudinary.v2.uploader.destroy(user.photo.id);
    let result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "user",
      }
    );
    newData.photo = {
      id: result.public_id,
      url: result.secure_url,
    };
  }

  let user = await userModal.findByIdAndUpdate(id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "user successfully updated",
    user,
  });
});

exports.removeUserByAdmin = BigPromise(async (req, res, next) => {
  const { id } = req.params;

  const user = await userModal.findOneAndDelete({ _id: id, role: "user" });

  if (!user) {
    return next(new CustomError("user not exist", 404));
  }

  res.status(200).json({
    success: true,
    message: "user successfully deleted",
    user,
  });
});
