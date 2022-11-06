const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
//const format = require("./utils/format");
// getting user name and room from the query string

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// join chatroom
socket.emit("joinRoom", { username, room });

// get room users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  console.log(message);
  //handling the output that shows the msgs
  outputMessages(message);

  //scroll down
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  // preventing the html form to directly submit
  e.preventDefault();

  // getting the message
  const msg = e.target.elements.msg.value;
  const MessageObject = { msg, username, room };
  console.log(MessageObject);

  // emitting the message directly to the server.
  socket.emit("chatMessage", JSON.stringify(MessageObject));

  // clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// this function is responsible for making the div of each msg and then appending it to the chat msg class so that is show each time.
function outputMessages(message) {
  // creating a div each time a msg/event is triggered
  const div = document.createElement("div");
  div.classList.add("message");
  // setting the inner html of the div
  div.innerHTML = `<p class="meta">${message.user}<span>${
    " " + message.time
  }</span></p>
    <p class="text">
      ${message.message}
    </p>`;
  // appending the msgs to the class
  document.querySelector(".chat-messages").appendChild(div);
}

// display current user
function outputRoomName(room) {
  roomName.innerText = room;
}
// add users to the dom
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}
