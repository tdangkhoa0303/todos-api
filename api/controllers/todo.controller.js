const Todo = require("../../models/todo.model");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

module.exports.index = catchAsync(async (req, res, next) => {
  const todos = await Todo.find();
  res.status(201).json({
    status: "success",
    data: { todos },
  });
});

module.exports.addTodo = catchAsync(async (req, res, next) => {
  const { text, id, completed } = req.body;
  const todo = await Todo.create({ id, text, completed });
  res.status(201).json({
    status: "success",
    data: { todo },
  });
});

module.exports.deleteTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const todo = await Todo.findOneAndDelete({ id });

  if (!todo) return next(new AppError("No tour found", 404));

  res.status(201).json({
    status: "success",
    data: { todo },
  });
});

module.exports.toggleTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { completed } = req.body;
  const todo = await Todo.updateOne({ id }, { completed });

  if (!todo) return next(new AppError("No tour found", 404));

  res.status(201).json({
    status: "success",
    data: { todo },
  });
});

module.exports.completeAllTodo = catchAsync(async (req, res, next) => {
  const updated = await Todo.updateMany({}, { completed: true });
  res.status(201).json({
    status: "success",
    data: { updated },
  });
});
