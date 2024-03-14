const { connect } = require("mongoose");

module.exports.connectDB = () =>
  connect(process.env.DB_URL)
    .then(() => {
      console.log("db connected successfully");
    })
    .catch((e) => {
      console.log(e.message);
    });
