const router = require("express").Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.use(authController.authenticate);
router.get("/me", authController.me);
router.get("/logout", authController.logout);
router.put("/update-password", authController.updatePassword);

module.exports = router;
