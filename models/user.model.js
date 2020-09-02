const mongoose = require("mongoose");

const userModel = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  avatarUrl: {
    type: String,
    default:
      "https://cdn.glitch.com/aca73c48-f323-427a-a4d2-8951b055938d%2F57633af1-a357-4d7a-a693-a11426eee969.image.png?v=1589613113114",
    trim: true,
  },
});

const User = mongoose.model("User", userModel, "users");

module.exports = User;
