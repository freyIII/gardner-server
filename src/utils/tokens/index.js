const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../../config");

exports.signToken = (payload, expires = "30d") =>
  jwt.sign(payload, config.jwt_secret, {
    expiresIn: expires,
  });

exports.verifyToken = (token) => jwt.verify(token, config.jwt_secret);

exports.createSessionToken = (user, token) => {
  const verifiedToken = this.verifyToken(token);

  const csrf_token = `<${user._id}+${verifiedToken.exp}+${verifiedToken.iat}>`;

  return crypto.createHash("sha256").update(csrf_token).digest("hex");
};

exports.generateRandomPassword = (length = 8) => {
  // if (config.devenv === "development") return config.dev_user_pass;
  if (length < 8) length = 8;

  let randomPassword = "";
  const charset = "abcdefghijklmnopqrstuvwxyz";
  const chartsetCaps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const chartsetDigits = "1234567890";
  const chartsetSpecChars = "!@#$%^&*()_+-=";
  const half = Math.ceil(length / 2);

  // generate random password
  for (let i = 0, n = charset.length; i < half; ++i)
    randomPassword += charset.charAt(Math.floor(Math.random() * n));

  for (let i = 0, n = chartsetCaps.length; i < half; ++i)
    randomPassword += chartsetCaps.charAt(Math.floor(Math.random() * n));

  for (let i = 0, n = chartsetDigits.length; i < 1; ++i)
    randomPassword += chartsetDigits.charAt(Math.floor(Math.random() * n));

  for (let i = 0, n = chartsetSpecChars.length; i < 1; ++i)
    randomPassword += chartsetSpecChars.charAt(Math.floor(Math.random() * n));

  return randomPassword;
};

exports.createOTP = () => {
  if (config.devenv === "development") return "1234";

  return totp.generate();
};
