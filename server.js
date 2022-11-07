const path = require("path");
const express = require("express");
const userRoutes = require("./routes/user");
const app = express();
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketio = require("socket.io");
const format = require("./utils/format");
const amqp = require("amqplib/callback_api");
const {
  userJoin,
  getCurUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const currDir = path.join(__dirname + "/static/");

app.use(bodyParser.json());
// app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);

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
  res.sendFile(currDir + "index.html");
});

app.get("/chat", (req, res) => {
  console.log("hello");
  res.sendFile(currDir + "chat.html");
});

app.use("/api", userRoutes);

const io = socketio(server);
const botName = "Admin";

var AMQPCONN;

//set static folder
//app.use(express.static(path.join(__dirname, "public")));

amqp.connect("amqp://localhost", function (error, connection) {
  if (error) {
    throw error;
  }
  AMQPCONN = connection;
  console.log("RabbitMQ connection successful");
});

// run when the client connects
// sockets k sarey functions ka pehla argument event ka naam hota hai or dusra paramenter any method or message
io.on("connection", (socket) => {
  console.log("gere");
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // to emit a message to a single client
    // welcome current user
    socket.emit("message", format(botName, "Welcome to the chat"));

    // to broadcast a message to all the client except the sender
    // broadacast when the user connects
    socket.broadcast
      .to(user.room)
      .emit("message", format(botName, `${user.username} has joined the chat`));

    // send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //to broadcast to all including the user
  // io.emit()
  // aik naya event lia client se or usko pass krdia wapis se client ko

  socket.on("chatMessage", (msg) => {
    console.log(msg);
    const user = getCurUser(socket.id);
    const message = JSON.parse(msg);

    //TODO : Creating a channel
    if (AMQPCONN) {
      AMQPCONN.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        //TODO : initializing  a queue
        var queue = "Message Queue";
        channel.assertQueue(queue, {
          durable: false,
        });
        //TODO : sending to queue
        channel.sendToQueue(queue, Buffer.from(msg));
        io.to(user.room).emit("message", format(user.username, message.msg));
        console.log(" [x] Sent %s", msg);
      });
    } else {
      console.log("connection to RabbitMQ lost");
    }
    console.log(message);
  });

  // broadcast when the user leaves the chat
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        format(botName, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
    setTimeout(function () {
      AMQPCONN.close();
      process.exit(0);
    }, 500);
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`server is up on port ${PORT}`);
});
