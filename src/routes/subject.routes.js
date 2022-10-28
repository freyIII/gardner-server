const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const subjectController = require("../controllers/subject.controller");

router.use(authController.authenticate);

router
  .route("/")
  .post(subjectController.createSubject)
  .get(subjectController.getAllSubjects);

router
  .route("/:id")
  .put(subjectController.updateSubject)
  .delete(subjectController.deleteSubject);

module.exports = router;
