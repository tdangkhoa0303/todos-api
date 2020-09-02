const express = require("express");

const router = express.Router();
const {
  index,
  addTodo,
  deleteTodo,
  toggleTodo,
  completeAllTodo,
} = require("../controllers/todo.controller");

router.route("/").get(index).post(addTodo);

router.route("/complete").get(completeAllTodo);

router.route("/:id").post(toggleTodo).delete(deleteTodo);

module.exports = router;
