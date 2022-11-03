const _ = require("lodash");
const mongoose = require("mongoose");
const Room = require("../models/room.model");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppError");
const QueryFeatures = require("../utils/query/queryFeatures");

exports.createRoom = catchAsync(async (req, res, next) => {
  const pickFields = ["name", "type"];

  const filteredBody = _.pick(req.body, pickFields);
  filteredBody._tenantId = req.user._tenantId;
  filteredBody._createdBy = req.user._id;
  const room = await Room.create(filteredBody);

  res.status(201).json({
    status: "success",
    env: {
      room,
    },
  });
});

exports.getAllRooms = catchAsync(async (req, res, next) => {
  const initialQuery = {
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const queryFeature = new QueryFeatures(Room.find(initialQuery), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const nQueryFeature = new QueryFeatures(Room.find(initialQuery), req.query)
    .filter()
    .count();

  const rooms = await queryFeature.query;
  const nRooms = await nQueryFeature.query;

  res.status(200).json({
    status: "success",
    total_docs: nRooms,
    env: {
      rooms,
    },
  });
});

exports.updateRoom = catchAsync(async (req, res, next) => {
  const pickFields = ["name", "type"];

  const filteredBody = _.pick(req.body, pickFields);

  const { id } = req.params;
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  const room = await Room.findOne(initialQuery);

  if (!room) return next(new AppError("Room not found", 400));

  const updatedRoom = await Room.findOneAndUpdate(initialQuery, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    env: {
      user: updatedRoom,
    },
  });
});

exports.updateRoomStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatus = ["Active", "Inactive", "Deleted"];
  const initialQuery = {
    _id: id,
    status: { $ne: "Deleted" },
    _tenantId: req.user._tenantId,
  };

  if (!allowedStatus.includes(status))
    return next(new AppError("Invalid value for status", 400));

  const room = await Room.findOne(initialQuery);

  if (!room) return next(new AppError("Room not Found", 404));

  room.status = status;

  await room.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    env: {
      room,
    },
  });
});
