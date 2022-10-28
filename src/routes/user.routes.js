const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

router.use(authController.authenticate);

router
  .route("/")
  .post(userController.createUser)
  .get(userController.getAllUsers);

router
  .route("/:id")
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
