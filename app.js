const express = require("express");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");

const user = require("./routes/user");
const home = require("./routes/view");

const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");

let app = express();

const file = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.set("view engine", "ejs");

cloudinary.v2.config({
  cloud_name: "dnvhxz0x2",
  api_key: "938181617266279",
  api_secret: "yxBv1zyY5cW8jNXQHJFdAoACqn0",
});

app.use("/v1", user);
app.use("/v1", home);

module.exports = app;
