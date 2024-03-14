const userModal = require("../models/user");
const cloudinary = require("cloudinary");
const { BigPromise } = require("../utils/BigPromise");
const { setCookieToken } = require("../utils/cookieToken");

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

  let user = await userModal.findOne({ email });
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
