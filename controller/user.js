const bcrypt = require("bcrypt");
const { compareSync } = require("bcrypt");
const { compare, hash } = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const generateEncryptedJwt = require("./jwt");
const express = require("express");
const app = express();
const path = require("path");

//Register User
const userRegister = async (req, res) => {
  try {
    const hashPass = await bcrypt.hash(req.body.password, 10);

    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashPass,
    });
    console.log(req.body);
    return res.status(200).redirect("/");
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
      return res.status(404).redirect("/");
    } else {
      console.log(req.body);
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
      jwt.verify(encryptedJwt, secret, function (err, decode) {
        if (err) {
          // console.log("token expires");
        }
      });
      return res.status(200).redirect("/welcome");
    }
  }
};
module.exports = { userRegister, userLogin };
