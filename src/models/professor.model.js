const mongoose = require("mongoose");
const ProfessorSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      trim: true,
      required: [true, "Please provide mobile number"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please provide email"],
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "Please provide first name"],
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Please provide first name"],
    },
    suffix: String,
    _subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: [true, "Please provide a subject"],
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Professor = mongoose.model("Professor", ProfessorSchema);

module.exports = Professor;
