const bcrypt = require("bcrypt");
const User = require("../../models/user.model");
const Token = require("../../models/token.model");

const catchAsync = require("../../utils/catchAsync");
const { generateToken, verifyToken } = require("../../helpers/jwt.helper");

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

module.exports.signUp = catchAsync(async (req, res, next) => {
  let { email, name, password } = req.body;
  const saltRounds = 10;

  password = await bcrypt.hash(password, saltRounds);
  const user = await User.create({ email, name, password });

  user.password = undefined;
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

module.exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(403).json({
      status: "fail",
      message:
        "The email address or password is incorrect. Please retry again.",
    });
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword)
    return res.status(403).json({
      status: "fail",
      message:
        "The email address or password is incorrect. Please retry again.",
    });
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

  res.cookie("refreshToken", refreshToken, {
    signed: true,
    expries: new Date(Date.now() + process.env.REFRESH_TOKEN_LIFE),
    // httpOnly: true,
    // secure: true,
  });
  res.status(200).json({
    status: "success",
    token: accessToken,
  });
});

module.exports.refreshToken = catchAsync(async (req, res, next) => {
  let { refreshToken } = await Token.findOne({
    refreshToken: req.signedCookies.refreshToken,
  });

  if (refreshToken) {
    const { data } = await verifyToken(refreshToken, refreshTokenSecret);

    await Token.findOneAndRemove({ refreshToken });

    const accessToken = await generateToken(
      data,
      accessTokenSecret,
      accessTokenLife
    );
    refreshToken = await generateToken(
      data,
      refreshTokenSecret,
      refreshTokenLife
    );

    await Token.create({ accessToken, refreshToken });

    res.cookie("refreshToken", refreshToken, {
      signed: true,
      expries: new Date(Date.now() + process.env.REFRESH_TOKEN_LIFE),
      // httpOnly: true,
      // secure: true,
    });
    res.status(200).json({
      status: "success",
      token: accessToken,
    });
  } else res.status(403).json({ status: "fail", message: "No token provided" });
});
