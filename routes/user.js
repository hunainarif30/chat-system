const Router = require("express");
const { userRegister, userLogin } = require("../controller/user");

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);

module.exports = router;
