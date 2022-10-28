const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide role name"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please provide role description"],
    },
    accesses: [
      {
        label: String,
        metadata: Object,
        hasAccess: Boolean,
        route: String,
        action: String,
        subaccess: [{ type: Object }],
        subNodes: [{ type: Object }],
      },
    ],
    nUsers: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },
    _lguId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    _tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide tenant id"],
    },
    _createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user id"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Role", RoleSchema);
