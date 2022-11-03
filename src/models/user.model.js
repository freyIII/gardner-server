const mongoose = require("mongoose");
const { bcryptHashEncode, bcryptHashCompare } = require("../utils/encryption");
const { createSessionToken } = require("../utils/tokens");
const { sendMail } = require("../utils/comms/index");
const crypto = require("crypto");
const UserSchema = new mongoose.Schema(
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
    password: {
      type: String,
      select: false,
      minlength: [
        8,
        "Password length must be greater or equal to 8 characters",
      ],
      required: [true, "Please provide password"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
    },

    type: {
      type: String,
      enum: ["Admin", "Assistant Admin", "Superadmin"],
      required: [true, "Please provide user type"],
    },
    _role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Please provide a role"],
    },
    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },

    isNewUser: {
      type: Boolean,
      default: true,
    },
    _tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide tenant id"],
    },
    _createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  const mailOptions = {
    to: this.email,
    subject: "New Gardner College Scheduling System Account Created",
    html: `<h1>Good day, this is your new Gardner College Scheduling System account:</h1> <p>email: ${this.email}</p> <p>password:${this.password}</p>`,
  };

  await sendMail(mailOptions);
  next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcryptHashEncode(this.password);
  this.passwordConfirm = undefined;

  next();
});

UserSchema.methods.isPasswordCorrect = async (inputPassword, userPassword) =>
  await bcryptHashCompare(inputPassword, userPassword);

UserSchema.methods.verifySession = function (sessionToken, token) {
  return sessionToken === createSessionToken(this, token);
};

UserSchema.methods.createPasswordResetToken = function () {
  let resetToken = crypto.randomBytes(16).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
