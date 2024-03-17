const { Schema, model } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = Schema({
  name: {
    type: String,
    maxLength: [40, "Name should be under 40 character"],
    required: [true, "please enter your name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter the email"],
    validate: [validator.isEmail, "Please enter the valid email"],
  },
  password: {
    type: String,
    minLength: [6, "Password should be minimum 6 character"],
    required: [true, "Please enter the password"],
    select: false,
  },
  photo: {
    id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

userSchema.methods.verifyPassword = async function (password) {
  let isVerified = false;
  try {
    isVerified = await bcrypt.compare(password, this.password);
  } catch (e) {
    console.log(e.message);
  }
  return isVerified;
};

userSchema.methods.generateForgotPasswordToken = function () {
  const forgotToken = crypto.randomBytes(64).toString("hex");
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
  return forgotToken;
};

module.exports = model("user", userSchema);
