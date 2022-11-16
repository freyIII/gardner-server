const _ = require("lodash");
const validator = require("validator");
const User = require("../models/user.model");
const crypto = require("crypto");
const {
  signToken,
  verifyToken,
  createSessionToken,
} = require("../utils/tokens");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const { sendMail } = require("../utils/comms/index");

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
  const user = await User.findById(req.user._id).populate("_role");

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
  console.log("here");
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Please provide email", 400));

  const user = await User.findOne({ email, status: { $ne: "Deleted" } });

  if (!user) return next(new AppError("User not found", 404));

  if (user.isSuspended === true)
    return next(new AppError("This account is suspended", 400));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  await mailResetToken(user, resetToken);

  res.status(200).json({
    status: "success",
    message: "Reset password token has been sent to email",
  });
});

const mailResetToken = async (user, resetToken) => {
  if (process.env.NODE_ENV === "test") return;

  try {
    const resetLink = `https://gardner-scheduling.herokuapp.com/reset-password/${resetToken}`;
    // const resetLink = `https://localhost:4200/reset-password/${resetToken}`;
    const validityDate = new Date(Date.now() + 10 * 60 * 1000).toLocaleString();

    const mailOptions = {
      to: user.email,
      subject: `Gardner College Scheduling System Password Reset Token. Valid until ${validityDate}`,
      html: ` <p style=" font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; text-align: justify; " > Hi ${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()},</p><br>
      <p style=" font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">Someone (hopefully you) has requested a password reset for your PoApps account. Follow the link below to set a new password: <span ><a href="${resetLink}" style="font-weight: bold" >${resetLink}</a ></span > </p><div style="width: 100%; height: 24px"></div>
      <p style=" font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">If you don't wish to reset your password, disregard this email and no action will be taken.</p>
      `,
    };

    await sendMail(mailOptions);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending email. Please try again later!",
        500
      )
    );
  }
};

exports.verifyResetPasswordToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
    status: { $ne: "Deleted" },
  });

  if (!user) return next(new AppError("Invalid password reset token", 400));

  if (user === "Suspended")
    return next(new AppError("Your Account is Suspended", 403));

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  res.status(200).json({
    status: "success",
    env: {
      user,
    },
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!password) return next(new AppError("Please provide new password", 400));

  if (!passwordConfirm)
    return next(new AppError("Please confirm new password", 400));

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
    status: { $ne: "Deleted" },
  });

  if (!user)
    return next(
      new AppError("Password reset token is invalid or has expired", 400)
    );

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    env: {
      user,
    },
  });
});
