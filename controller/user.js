const bcrypt = require("bcrypt");
const { compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const generateEncryptedJwt = require("./jwt");

//Register User
const userRegister = async (req, res) => {
  try {
    const hashPass = await bcrypt.hash(req.body.password, 10);

    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashPass,
    });
    return res.status(200).json({ Response: "Successfully signed up" });
  } catch (err) {
    return res.status(404).send({ Response: "Email already registered" });
  }
};

// Login User

const userLogin = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.status(404).send({ message: "Email not registered" });
  } else {
    const validPassword = compareSync(req.body.password, user.password);
    if (!validPassword) {
      return res.status(404).send({ message: "Wrong Password" });
    } else {
      const secret = Buffer.from(
        "62197fc8886bd3b739dd2cc8aa109d0be93acdea64c07b8908168b80daf1dc47",
        "hex"
      );
      const payload = {
        name: user.name,
        email: user.email,
      };
      const encryptedJwt = await generateEncryptedJwt(
        "testsub",
        payload,
        secret
      );
      //   const token = jwt.sign(
      //     {
      //       name: user.name,
      //       email: user.email,
      //     },
      //     "Stack",
      //     {
      //       expiresIn: "1m",
      //     },
      //     "secrettoken123"
      //   );

      return res
        .status(200)
        .json({ message: "Successfully Logged In", token: encryptedJwt });
    }
  }
};
module.exports = { userRegister, userLogin };
