const mongoose = require("mongoose");
const ScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide mobile number"],
    },
    _room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Please provide a room"],
    },
    _strand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Strand",
      required: [true, "Please provide a strand"],
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
    scheds: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          required: [true, "Please provide sched day"],
        },
        shift: {
          type: String,
          enum: ["Morning", "Afternoon"],
          required: [true, "Please provide sched shift"],
        },
        startTime: {
          type: String,
          required: [true, "Please provide sched startTime"],
        },
        endTime: {
          type: String,
          required: [true, "Please provide sched endTime"],
        },
        _professor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Professor",
          required: [true, "Please provide a professor"],
        },
        _subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: [true, "Please provide a subject"],
        },
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

const Schedule = mongoose.model("Schedule", ScheduleSchema);

module.exports = Schedule;
