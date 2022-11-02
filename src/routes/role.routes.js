const router = require("express").Router();

const authController = require("../controllers/auth.controller");
const roleController = require("../controllers/role/role.controller");

router.use(authController.authenticate);

router
  .route("/")
  .get(roleController.getAllRoles)
  .post(roleController.createRole);

router
  .route("/:id")
  .put(roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;
