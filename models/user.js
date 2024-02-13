const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_150"); // this refers to particular image
});

imageSchema.virtual("disp").get(function () {
  return this.url.replace("/upload", "/upload/w_300,h_300"); // this refers to particular image
});

const UserSchema = new Schema({
  //   username: String,          not needed due to passport plugin below
  //   password: String,          not needed due to passport plugin below
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  diplay_image: String,
  images: [imageSchema],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
