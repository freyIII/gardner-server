const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.encodeBase64 = (data) => Buffer.from(data).toString("base64");

exports.decodeBase64 = (base64) => Buffer.from(base64, "base64").toString();

exports.encodeHmacSha256 = (data, secret) =>
  crypto.createHmac("sha256", secret).update(data).digest("hex");

exports.bcryptHashEncode = async (text, cpucore = 12) =>
  await bcrypt.hash(text, cpucore);

exports.bcryptHashCompare = async (inputPassword, hashPassword) =>
  await bcrypt.compare(inputPassword, hashPassword);

exports.createRandomBytes = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

exports.updateToHashSha256 = (data) =>
  crypto.createHash("sha256").update(data).digest("hex");
