const Router = require("express");
const { userRegister, userLogin, userChat } = require("../controller/user");

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/userChat", userChat);

module.exports = router;
