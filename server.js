const express = require("express");
const userRoutes = require("./routes/user");
const app = express();
var mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view-engine", "ejs");

mongoose
  .connect("mongodb://Localhost:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedtopology: true,
  })
  .then(console.log("successfull"));

var db = mongoose.connection;
db.on("error", () => console.log("Error connecting to db"));
db.once("open", () => console.log("Connection successful"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.use("/api", userRoutes);
app.use("/api", userRoutes);
app.listen(3000);
