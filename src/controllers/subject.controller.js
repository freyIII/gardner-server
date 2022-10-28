const _ = require("lodash");
const mongoose = require("mongoose");
const Subject = require("../models/subject.model");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const QueryFeatures = require("../utils/query/queryFeatures");

exports.createSubject = catchAsync(async (req, res, next) => {
  const pickFields = [
    "name",
    "code",
    "description",
    "type",
    "yearLevel",
    "semester",
  ];

  const filteredBody = _.pick(req.body, pickFields);

  const existCode = await Subject.findOne({ code: filteredBody.code });
  if (existCode) return next(new AppError("Code already exist", 400));

  filteredBody._tenantId = req.user._tenantId;
  filteredBody._createdBy = req.user._id;
  // console.log(filteredBody);
  const subject = await Subject.create(filteredBody);

  res.status(201).json({
    status: "success",
    env: {
      subject,
    },
  });
});

exports.getAllSubjects = catchAsync(async (req, res, next) => {
  const initialQuery = {
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const queryFeature = new QueryFeatures(Subject.find(initialQuery), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const nQueryFeature = new QueryFeatures(Subject.find(initialQuery), req.query)
    .filter()
    .count();

  const subjects = await queryFeature.query;
  const nSubjects = await nQueryFeature.query;

  res.status(200).json({
    status: "success",
    total_docs: nSubjects,
    env: {
      subjects,
    },
  });
});

exports.updateSubject = catchAsync(async (req, res, next) => {
  const pickFields = [
    "name",
    "code",
    "description",
    "type",
    "yearLevel",
    "semester",
  ];

  const filteredBody = _.pick(req.body, pickFields);

  const existCode = await Subject.findOne({ code: filteredBody.code });
  if (existCode) return next(new AppError("Code already exist", 400));

  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const subject = await Subject.findOne(initialQuery);

  if (!subject) return next(new AppError("Subject not found", 400));

  const updatedSubject = await Subject.findOneAndUpdate(
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
      subject: updatedSubject,
    },
  });
});

exports.deleteSubject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const subject = await Subject.findOne(initialQuery);

  if (!subject) return next(new AppError("Subject not Found", 404));

  subject.status = "Deleted";

  await subject.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    env: {
      subject,
    },
  });
});
