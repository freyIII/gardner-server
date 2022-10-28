const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const scheduleController = require("../controllers/schedule.controller");

router.use(authController.authenticate);

router
  .route("/")
  .post(scheduleController.createSchedule)
  .get(scheduleController.getAllSchedules);

router
  .route("/:id")
  .put(scheduleController.updateSchedule)
  .delete(scheduleController.deleteSchedule);

module.exports = router;
