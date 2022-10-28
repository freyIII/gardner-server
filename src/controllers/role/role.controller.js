const _ = require("lodash");
const Role = require("../../models/role.model");
const User = require("../../models/user.model");

const catchAsync = require("../../utils/errors/catchAsync");
const AppError = require("../../utils/errors/AppError");
const QueryFeatures = require("../../utils/query/queryFeatures");
const {
  removeUnnecessaryFields,
  subAccessFields,
  checkExistingRole,
} = require("./role.helper");

exports.getAllRoles = catchAsync(async (req, res, next) => {
  const filteredQuery = _.omit(req.query, ["_tenantId", "status"]);

  const initialQuery = {
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const rolesQuery = new QueryFeatures(Role.find(initialQuery), filteredQuery)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const countRoleQuery = new QueryFeatures(
    Role.find(initialQuery),
    filteredQuery
  )
    .filter()
    .count();

  const roles = await rolesQuery.query;
  const totalRoles = await countRoleQuery.query;

  res.status(200).json({
    status: "Success",
    total_docs: totalRoles,
    env: {
      roles,
    },
  });
});

exports.createRole = catchAsync(async (req, res, next) => {
  const pickFields = ["name", "description", "accesses"];
  const filteredBody = _.pick(req.body, pickFields);
  filteredBody._createdBy = req.user._id;
  filteredBody._tenantId = req.user._tenantId;

  if (filteredBody.accesses)
    filteredBody.accesses = removeUnnecessaryFields(
      filteredBody.accesses,
      "subaccess",
      subAccessFields
    );

  const dupError = await checkExistingRole(filteredBody, req);
  if (dupError) return next(dupError);

  const role = await Role.create(filteredBody);

  res.status(201).json({
    status: "success",
    env: {
      role,
    },
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  const pickFields = ["name", "description", "accesses"];
  const filteredBody = _.pick(req.body, pickFields);
  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  if (filteredBody.accesses)
    filteredBody.accesses = removeUnnecessaryFields(
      filteredBody.accesses,
      "subaccess",
      subAccessFields
    );

  // const dupError = await checkExistingRole(filteredBody, req);
  // if (dupError) return next(dupError);

  const role = await Role.findOneAndUpdate(initialQuery, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!role) return next(new AppError("Role not found!", 404));

  res.status(200).json({
    status: "success",
    env: {
      role,
    },
  });
});

exports.deleteRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let initialQuery = {
    _id: id,
    status: "Active",
    _tenantId: req.user._tenantId,
  };

  const user = await User.findOne({
    status: "Active",
    _role: id,
    _tenantId: req.user._tenantId,
  });
  if (user) return next(new AppError("Active users found!", 401));

  const role = await Role.findOneAndUpdate(initialQuery, { status: "Deleted" });

  if (!role) return next(new AppError("Role not found!", 404));

  res.status(204).json({
    status: "success",
  });
});
