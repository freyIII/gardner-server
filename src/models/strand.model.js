const mongoose = require("mongoose");
const StrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    code: {
      type: String,
      required: [true, "Please provide a code"],
    },
    _subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: [true, "Please provide a subject"],
      },
    ],
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

const Strand = mongoose.model("Strand", StrandSchema);

module.exports = Strand;
