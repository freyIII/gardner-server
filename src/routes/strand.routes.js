const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const strandController = require("../controllers/strand.controller");

router.use(authController.authenticate);

router
  .route("/")
  .post(strandController.createStrand)
  .get(strandController.getAllStrands);

router
  .route("/:id")
  .put(strandController.updateStrand)
  .delete(strandController.deleteStrand);

module.exports = router;
