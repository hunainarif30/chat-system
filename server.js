const path = require("path");
const express = require("express");
const userRoutes = require("./routes/user");
const app = express();
var mongoose = require("mongoose");
const bodyParser = require("body-parser");

const currDir = path.join(__dirname + "/static/");

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://Localhost:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedtopology: true,
  })
  .then(console.log("successfull"));

var db = mongoose.connection;
db.on("error", () => console.log("Error connecting to db"));
db.once("open", () => console.log("Connection successful"));

app.get("/register", (req, res) => {
  res.sendFile(currDir + "signup.html");
});

app.get("/", (req, res) => {
  res.sendFile(currDir + "login.html");
});
app.get("/welcome", (req, res) => {
  res.sendFile(currDir + "welcome.html");
});

app.use("/api", userRoutes);
app.use("/api", userRoutes);
app.listen(3000);
