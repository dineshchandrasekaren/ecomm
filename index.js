require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/database");

// configure port
app.listen(process.env.PORT, () => {
  console.log(`server is running at port ${process.env.PORT}`);
});

// connect to database
connectDB();
