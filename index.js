require("dotenv").config();

const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");

const app = express();

// Set security HTTP header
app.use(helmet());

// Limit requests from same IP
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

//Middlewares
const globalErrorHandler = require("./middlewares/errorHandler.middleware");
const { isAuth } = require("./middlewares/auth.middleware");

// API ROUTE
const todoAPI = require("./api/routes/todo.route");
const authAPI = require("./api/routes/auth.route");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  dbName: "todoAPI",
});

app.use(cors());

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SIGNED_SECRET));
app.use(express.static("./public"));

app.use("/api/todos", isAuth, todoAPI);
app.use("/api/auth", authAPI);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is listening on port ", PORT);
});
