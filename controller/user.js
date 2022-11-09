const bcrypt = require("bcrypt");
const { compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { generateEncryptedJwt, decrypJwt } = require("./jwt");
const url = require("url");
require("dotenv").config();

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

const welcome = (req, res) => {};

const userChat = (req, res) => {
  // if room exists return response
  const user = { name: req.body.username, room: req.body.room };

  res.redirect(
    url.format({
      pathname: "/chat",
      query: {
        data: encodeURIComponent(
          JSON.stringify({
            username: user.name,
            room: user.room,
          })
        ),
      },
    })
  );
};

// Login Use

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
      const secret = Buffer.from(process.env.SECRET_KEY, "hex");
      const payload = {
        name: user.name,
        email: user.email,
      };
      var encryptedJwt = await generateEncryptedJwt("testsub", payload, secret);

      return res.status(200).cookie("token", encryptedJwt).redirect("/welcome");
    }
  }
};
module.exports = { userRegister, userLogin, userChat, welcome };
