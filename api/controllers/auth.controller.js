const bcrypt = require("bcrypt");
const User = require("../../models/user.model");
const Token = require("../../models/token.model");

const catchAsync = require("../../utils/catchAsync");
const { generateToken, verifyToken } = require("../../utils/auth.utils");
const AppError = require("../../utils/appError");

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

module.exports.signUp = catchAsync(async (req, res, next) => {
  let { email, name, password } = req.body;
  const saltRounds = 10;

  password = await bcrypt.hash(password, saltRounds);
  const user = await User.create({ email, name, password });

  res.status(201).json({
    status: "success",
    data: {
      user: basicDetails(user),
    },
  });
});

module.exports.logIn = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return next(
        new AppError(
          "The email address or password is incorrect. Please retry again.",
          403
        )
      );
    res.cookie("asd", "adsdsa");
    setToken(res, user);
  } catch (err) {
    console.log(err);
  }
});

module.exports.refreshToken = catchAsync(async (req, res, next) => {
  let { refreshToken } = await Token.findOne({
    refreshToken: req.signedCookies.refreshToken,
  });

  if (refreshToken) {
    const { data } = await verifyToken(refreshToken, refreshTokenSecret);

    await Token.findOneAndRemove({ refreshToken });

    setToken(res, data);
  } else next(new AppError("No token provided.", 403));
});

const setToken = async (res, user) => {
  const accessToken = await generateToken(
    user,
    accessTokenSecret,
    accessTokenLife
  );

  const refreshToken = await generateToken(
    user,
    refreshTokenSecret,
    refreshTokenLife
  );

  await Token.create({ refreshToken, accessToken });

  const cookieOptions = {
    httpOnly: true,
    // secure: true,
    signed: true,
    expries: new Date(Date.now() + process.env.REFRESH_TOKEN_LIFE),
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.status(200).json({
    status: "success",
    user: {
      ...basicDetails(user),
      token: accessToken,
    },
  });
};

const basicDetails = (user) => {
  const { _id, name, email, avatarUrl } = user;
  return { _id, name, email, avatarUrl };
};
