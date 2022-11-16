const router = require("express").Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router
  .route("/reset-password/:token")
  .get(authController.verifyResetPasswordToken)
  .put(authController.resetPassword);
router.post("/forgot-password", authController.forgotPassword);

router.use(authController.authenticate);

router.get("/me", authController.me);
router.get("/logout", authController.logout);
router.put("/update-password", authController.updatePassword);

module.exports = router;
