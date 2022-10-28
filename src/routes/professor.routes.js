const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const professorController = require("../controllers/professor.controller");

router.use(authController.authenticate);

router
  .route("/")
  .post(professorController.createProfessor)
  .get(professorController.getAllProfessors);

router
  .route("/:id")
  .put(professorController.updateProfessor)
  .delete(professorController.deleteProfessor);

module.exports = router;
