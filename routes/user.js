const Router = require("express");
const { userRegister, userLogin, userChat, welcome } = require("../controller/user");

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/userChat", userChat);
router.post("/welcome", userChat);

module.exports = router;
