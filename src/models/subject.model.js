const mongoose = require("mongoose");
const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    code: {
      type: String,
      trim: true,
      required: [true, "Please provide code"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please provide description"],
    },
    type: {
      type: String,
      enum: ["Core", "Contextualized", "Specialized"],
      required: [true, "Please provide type"],
    },
    yearLevel: {
      type: String,
      enum: ["1st", "2nd"],
      required: [true, "Please provide year level"],
    },
    semester: {
      type: String,
      enum: ["1st", "2nd"],
      required: [true, "Please provide semester"],
    },
    nProfessors: {
      type: Number,
      default: 0,
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
      enum: ["Active", "Deleted"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", SubjectSchema);

module.exports = Subject;
