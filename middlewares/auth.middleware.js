const { verifyToken } = require("../utils/auth.utils");
const AppError = require("../utils/appError");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

module.exports.isAuth = async (req, res, next) => {
  console.log(req.signedCookies);
  const tokenFromClient = req.headers["x-access-token"];
  if (tokenFromClient) {
    try {
      const decoded = await verifyToken(tokenFromClient, accessTokenSecret);
      req.jwtDecoded = decoded;
      next();
    } catch (err) {
      next(new AppError("Unauthorized.", 401));
    }
  } else next(new AppError("No token provided.", 403));
};
