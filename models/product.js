const { Schema } = require("mongoose");

let productSchema = Schema({
  name: {
    type: String,
    required: [true, "Product name is mandatory"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please enter the price"],
    maxLength: [6, "price should be less then 7 digit"],
  },
  descrption: {
    type: String,
    required: [true, "Please enter the description for an product"],
  },
});
