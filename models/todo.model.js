const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    required: true,
    trim: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema, "todos");
module.exports = Todo;
