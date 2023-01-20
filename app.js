const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const app = express();
const env = require("dotenv");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const config = require("./src/config/index");
const authRouter = require("./src/routes/auth.routes");
const userRouter = require("./src/routes/user.routes");
const roomRouter = require("./src/routes/room.routes");
const strandRouter = require("./src/routes/strand.routes");
const subjectRouter = require("./src/routes/subject.routes");
const professorRouter = require("./src/routes/professor.routes");
const scheduleRouter = require("./src/routes/schedule.routes");
const roleRouter = require("./src/routes/role.routes");
const errorController = require("./src/controllers/error/error.controller");

const allowedOrigins = ["http://localhost:4200"];

const origin = function (origin, callback) {
  if (!origin) return callback(null, true);

  // if (allowedOrigins.indexOf(origin) === -1) {
  //   console.log(origin);
  //   const message = `This site ${origin} doesn't have a permission to access this site.`;
  //   return callback(new AppError(message, 403), false);
  // }
  return callback(null, true);
};

env.config();
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("Connected to DB"));
sgMail.setApiKey(config.sendgrid);

app.use(helmet());
app.use(
  cors({
    origin,
    methods: ["POST", "PATCH", "PUT", "DELETE", "GET"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/v1/health", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Up and Running!",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/strand", strandRouter);
app.use("/api/v1/subject", subjectRouter);
app.use("/api/v1/professor", professorRouter);
app.use("/api/v1/schedule", scheduleRouter);
app.use("/api/v1/role", roleRouter);

app.listen(process.env.PORT, () => {
  // console.log(`server is running at port ${process.env.PORT}`);
});

app.use(errorController);

module.exports = app;
