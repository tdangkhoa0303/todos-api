const jwt = require("jsonwebtoken");
const { verifyToken } = require("../helpers/jwt.helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

module.exports.isAuth = catchAsync(async (req, res, next) => {
  const tokenFromClient = req.headers["x-access-token"];
  console.log(tokenFromClient);
  if (tokenFromClient) {
    const decoded = await verifyToken(tokenFromClient, accessTokenSecret);
    req.jwtDecoded = decoded;
    next();
  } else next(new AppError("No token provided.", 403));
});
