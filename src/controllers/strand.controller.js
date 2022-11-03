const _ = require("lodash");
const mongoose = require("mongoose");
const Strand = require("../models/strand.model");
const Subject = require("../models/subject.model");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const QueryFeatures = require("../utils/query/queryFeatures");

exports.createStrand = catchAsync(async (req, res, next) => {
  const pickFields = ["name", "code", "_subjects"];

  const filteredBody = _.pick(req.body, pickFields);
  const existCode = await Strand.findOne({ code: filteredBody.code });

  if (existCode) return next(new AppError("Code already exist", 400));

  filteredBody._tenantId = req.user._tenantId;
  filteredBody._createdBy = req.user._id;
  const strand = await Strand.create(filteredBody);

  res.status(201).json({
    status: "success",
    env: {
      strand,
    },
  });
});

exports.getAllStrands = catchAsync(async (req, res, next) => {
  const initialQuery = {
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const queryFeature = new QueryFeatures(
    Strand.find(initialQuery).populate("_subjects"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const nQueryFeature = new QueryFeatures(Strand.find(initialQuery), req.query)
    .filter()
    .count();

  const nSubjectQueryFeature = new QueryFeatures(
    Subject.find(initialQuery),
    req.query
  )
    .filter()
    .count();

  const strands = await queryFeature.query;
  const nStrands = await nQueryFeature.query;
  const nSubjects = await nSubjectQueryFeature.query;

  res.status(200).json({
    status: "success",
    total_docs: nStrands,
    total_subjects: nSubjects,
    env: {
      strands,
    },
  });
});

exports.updateStrand = catchAsync(async (req, res, next) => {
  const pickFields = ["name", "code", "_subjects"];

  const filteredBody = _.pick(req.body, pickFields);

  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const strand = await Strand.findOne(initialQuery);
  if (!strand) return next(new AppError("Strand not found", 400));

  const existCode = await Strand.findOne({ code: filteredBody.code });
  if (existCode) return next(new AppError("Code already exist", 400));

  const updatedStrand = await Strand.findOneAndUpdate(
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
      strand: updatedStrand,
    },
  });
});

exports.deleteStrand = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const strand = await Strand.findOne(initialQuery);

  if (!strand) return next(new AppError("Strand not Found", 404));

  strand.status = "Deleted";

  await strand.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    env: {
      strand,
    },
  });
});
