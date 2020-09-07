const AppError = require("../utils/appError");

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const sendErrorProd = ({ statusCode, status, message, isOperational }, res) => {
  if (isOperational) {
    res.status(statusCode).json({
      status: status,
      message: message,
    });
  } else
    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  if (error.name === "CastError") error = handleCastErrorDB(error);
  sendErrorProd(error, res);
};
