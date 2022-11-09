const jwt = require("jsonwebtoken");
require("dotenv").config();
//const config = process.env;
const { decryptJwt } = require("../controller/jwt");

const verifyToken = async (req, res, next) => {
  let token =
    req.headers.cookie["token"] || req.headers.cookie || req.headers["token"];

  token = token.split("=").pop();

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const secret = Buffer.from(process.env.SECRET_KEY, "hex");
    //console.log("call se phele", secret);
    // console.log(secret.toString());

    const dec = await decryptJwt(token, secret);

    // if (decryptedJwt == token) {
    //   console.log(decryptedJwt);
    // }else{

    // }
    //console.log("verification result", result);
    //const decoded = jwt.verify(token, config.TOKEN_KEY);
    //res.user = decoded;
  } catch (err) {
    if (err.code === "ERR_JWT_EXPIRED") {
      return res.status(401).redirect("/?error=" + err.code);
    }
    return res.status(401).redirect("/");
  }
  return next();
};

module.exports = verifyToken;
