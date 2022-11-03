const _ = require("lodash");
const { generateRandomPassword } = require("../utils/tokens");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Role = require("../models/role.model");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const QueryFeatures = require("../utils/query/queryFeatures");

exports.createUser = catchAsync(async (req, res, next) => {
  const pickFields = [
    "firstName",
    "lastName",
    "middleName",
    "suffix",
    "email",
    "mobileNumber",
    "type",
    "password",
    "_role",
    "passwordConfirm",
  ];

  const filteredBody = _.pick(req.body, pickFields);
  const existEmail = await User.findOne({ email: filteredBody.email });

  if (existEmail) return next(new AppError("Email already exist", 400));
  filteredBody._tenantId = req.user._tenantId;
  filteredBody._createdBy = req.user._id;
  const user = await User.create(filteredBody);

  res.status(201).json({
    status: "success",
    env: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const initialQuery = {
    type: { $ne: "Superadmin" },
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const queryFeature = new QueryFeatures(
    User.find(initialQuery).populate("_role"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const nQueryFeature = new QueryFeatures(User.find(initialQuery), req.query)
    .filter()
    .count();

  const nRoleQueryFeature = new QueryFeatures(
    Role.find({ status: { $ne: "Deleted" }, _tenantId: req.user._tenantId }),
    req.query
  )
    .filter()
    .count();

  const users = await queryFeature.query;
  const nUsers = await nQueryFeature.query;
  const nRoles = await nRoleQueryFeature.query;

  res.status(200).json({
    status: "success",
    total_docs: nUsers,
    total_roles: nRoles,
    env: {
      users,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const pickFields = [
    "firstName",
    "lastName",
    "middleName",
    "suffix",
    "email",
    "mobileNumber",
    "type",
    "_role",
  ];

  const filteredBody = _.pick(req.body, pickFields);

  const existEmail = await User.findOne({
    email: filteredBody.email,
    _id: { $ne: req.params.id },
  });

  if (existEmail) return next(new AppError("Email already exist", 400));

  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const user = await User.findOne(initialQuery);

  if (!user) return next(new AppError("User not found", 400));

  const updatedUser = await User.findOneAndUpdate(initialQuery, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    env: {
      user: updatedUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const user = await User.findOne(initialQuery);

  if (!user) return next(new AppError("User not Found", 404));

  user.status = "Deleted";

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    env: {
      user,
    },
  });
});
