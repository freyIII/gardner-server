const _ = require("lodash");
const mongoose = require("mongoose");
const Professor = require("../models/professor.model");
const Subject = require("../models/subject.model");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const QueryFeatures = require("../utils/query/queryFeatures");

exports.createProfessor = catchAsync(async (req, res, next) => {
  const pickFields = [
    "firstName",
    "middleName",
    "lastName",
    "suffix",
    "mobileNumber",
    "email",
    "_subjects",
  ];

  const filteredBody = _.pick(req.body, pickFields);

  filteredBody._tenantId = req.user._tenantId;
  filteredBody._createdBy = req.user._id;

  const professor = await Professor.create(filteredBody);

  res.status(201).json({
    status: "success",
    env: {
      professor,
    },
  });
});

exports.getAllProfessors = catchAsync(async (req, res, next) => {
  const initialQuery = {
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const queryFeature = new QueryFeatures(
    Professor.find(initialQuery).populate("_subjects"),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const nQueryFeature = new QueryFeatures(
    Professor.find(initialQuery),
    req.query
  )
    .filter()
    .count();

  const nSubjectQueryFeature = new QueryFeatures(
    Subject.find(initialQuery),
    req.query
  )
    .filter()
    .count();

  const professors = await queryFeature.query;
  const nProfessors = await nQueryFeature.query;
  const nSubjects = await nSubjectQueryFeature.query;

  res.status(200).json({
    status: "success",
    total_docs: nProfessors,
    total_subjects: nSubjects,
    env: {
      professors,
    },
  });
});

exports.updateProfessor = catchAsync(async (req, res, next) => {
  const pickFields = [
    "firstName",
    "middleName",
    "lastName",
    "suffix",
    "mobileNumber",
    "email",
    "_subjects",
  ];

  const filteredBody = _.pick(req.body, pickFields);

  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const professor = await Professor.findOne(initialQuery);
  if (!professor) return next(new AppError("Professor not found", 400));

  const updatedProfessor = await Professor.findOneAndUpdate(
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
      professor: updatedProfessor,
    },
  });
});

exports.deleteProfessor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const professor = await Professor.findOne(initialQuery);

  if (!professor) return next(new AppError("Professor not Found", 404));

  professor.status = "Deleted";

  await professor.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    env: {
      professor,
    },
  });
});
