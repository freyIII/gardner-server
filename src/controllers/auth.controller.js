const _ = require("lodash");
const validator = require("validator");
const User = require("../models/user.model");

const {
  signToken,
  verifyToken,
  createSessionToken,
} = require("../utils/tokens");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");

const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken({ id: user._id });
  const session_token = createSessionToken(user, token);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    session_token,
    token,
    env: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  // const { type } = req.params;
  const { email, password } = req.body;

  if (!email) return next(new AppError("Please provide email", 400));
  if (!password) return next(new AppError("Please provide password", 400));

  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.isPasswordCorrect(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  sendAuthResponse(user, 200, res);
});

exports.me = catchAsync(async (req, res, next) => {
  const user = await req.user;

  res.status(200).json({
    status: "success",
    env: {
      user,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    token: "",
    session_token: "",
  });
});

exports.authenticate = catchAsync(async (req, res, next) => {
  const { authorization, s_auth } = req.headers;
  let sessionToken;
  let token;

  if (authorization && authorization.startsWith("Bearer"))
    token = authorization.split(" ")[1];
  if (s_auth) sessionToken = s_auth;

  if (!token || !sessionToken)
    return next(new AppError("Please login to continue", 401));

  const verifiedToken = verifyToken(token);

  const user = await User.findById(verifiedToken.id);

  if (!user || user.status === "Deleted")
    return next(
      new AppError("User no longer exist. Please login to continue", 404)
    );

  if (user.status === "Suspended")
    return next(new AppError("Unauthorized. Account is Suspended", 403));

  if (!user.verifySession(sessionToken, token))
    return next(new AppError("Invalid session", 401));

  req.user = user;

  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword)
    return next(new AppError("Please provide current password", 400));

  if (!newPassword)
    return next(new AppError("Please provide new password", 400));

  if (!confirmNewPassword)
    return next(new AppError("Please confirm new password", 400));

  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.isPasswordCorrect(currentPassword, user.password)))
    return next(new AppError("Incorrect current password", 401));

  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;
  user.isNewUser = false;

  await user.save();

  sendAuthResponse(user, 200, res);
});
