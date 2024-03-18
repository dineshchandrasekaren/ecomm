const express = require("express");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");

const user = require("./routes/user");
const home = require("./routes/view");
const mailHelper = require("./utils/mailHelper");

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use;
app.set("view engine", "ejs");

cloudinary.v2.config({
  cloud_name: "dnvhxz0x2",
  api_key: "938181617266279",
  api_secret: "yxBv1zyY5cW8jNXQHJFdAoACqn0",
});

app.use("/v1", user);
app.use("/v1", home);

module.exports = app;
