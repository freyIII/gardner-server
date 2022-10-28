const _ = require("lodash");
const mongoose = require("mongoose");
const Schedule = require("../models/schedule.model");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const QueryFeatures = require("../utils/query/queryFeatures");

exports.createSchedule = catchAsync(async (req, res, next) => {
  const pickFields = [
    "name",
    "_room",
    "_strand",
    "yearLevel",
    "semester",
    "scheds",
  ];

  const filteredBody = _.pick(req.body, pickFields);

  filteredBody._tenantId = req.user._tenantId;
  filteredBody._createdBy = req.user._id;

  const schedule = await Schedule.create(filteredBody);

  res.status(201).json({
    status: "success",
    env: {
      schedule,
    },
  });
});

exports.getAllSchedules = catchAsync(async (req, res, next) => {
  const initialQuery = {
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const queryFeature = new QueryFeatures(
    Schedule.find(initialQuery)
      .populate("_room")
      .populate("_strand")
      .populate("scheds._professor")
      .populate("scheds._subject"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const nQueryFeature = new QueryFeatures(
    Schedule.find(initialQuery),
    req.query
  )
    .filter()
    .count();

  const schedules = await queryFeature.query;
  const nSchedules = await nQueryFeature.query;

  res.status(200).json({
    status: "success",
    total_docs: nSchedules,
    env: {
      schedules,
    },
  });
});

exports.updateSchedule = catchAsync(async (req, res, next) => {
  const pickFields = [
    "name",
    "_room",
    "_strand",
    "yearLevel",
    "semester",
    "scheds",
  ];
  const filteredBody = _.pick(req.body, pickFields);

  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const schedule = await Schedule.findOne(initialQuery);
  if (!schedule) return next(new AppError("Schedule not found", 400));

  const updatedSchedule = await Schedule.findOneAndUpdate(
    initialQuery,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    env: {
      schedule: updatedSchedule,
    },
  });
});

exports.deleteSchedule = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const schedule = await Schedule.findOne(initialQuery);

  if (!schedule) return next(new AppError("Schedule not Found", 404));

  schedule.status = "Deleted";

  await schedule.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    env: {
      schedule,
    },
  });
});
