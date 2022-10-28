const mongoose = require("mongoose");
const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    type: {
      type: String,
      required: [true, "Please provide a code"],
      enum: ["Laboratory", "Lecture"],
    },
    _tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide tenant id"],
    },
    _createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user _id"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Deleted"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
