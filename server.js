const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const format = require("./utils/format");
const {
  userJoin,
  getCurUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "Admin";

//set static folder
app.use(express.static(path.join(__dirname, "public")));
// run when the client connects
// sockets k sarey functions ka pehla argument event ka naam hota hai or dusra paramenter any method or message
io.on("connection", (socket) => {
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
    const user = getCurUser(socket.id);
    io.to(user.room).emit("message", format(user.username, msg));
  });

  // broadcast when the user leaves the chat
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        format(botName, `${user.username} has left the chat`),
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`server is up on port ${PORT}`);
});
