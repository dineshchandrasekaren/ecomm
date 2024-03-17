const userModal = require("../models/user");
const cloudinary = require("cloudinary");
const { BigPromise } = require("../utils/BigPromise");
const { setCookieToken } = require("../utils/cookieToken");
const mailHelper = require("../utils/mailHelper");
const crypto = require("crypto");
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
  if (!user.verifyPassword(password)) {
    return res.status(500).json({ error: "invalid password" });
  }

  setCookieToken(res, user);
});

exports.logout = async (req, res) => {
  if (req.cookies.token) {
    return res.clearCookie("token").json({
      success: true,
      message: "logout successfully",
    });
  }
  res.status(500).json({ message: "already logout" });
};

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
