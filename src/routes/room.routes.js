const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const roomController = require("../controllers/room.controller");

router.use(authController.authenticate);

router
  .route("/")
  .post(roomController.createRoom)
  .get(roomController.getAllRooms);

router
  .route("/:id")
  .put(roomController.updateRoom)
  .patch(roomController.updateRoomStatus);

module.exports = router;
