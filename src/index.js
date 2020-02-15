const http = require("http");
const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const public = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;
const Filter = require("bad-words");
const filter = new Filter();
const { textGen } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInroom
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(public));

io.on("connection", socket => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.broadcast
      .to(user.room)
      .emit(
        "newUser",
        textGen("Admin", `${user.username} has joined the session!`)
      );
    socket.emit("message", textGen("Admin", "Welcome on board"));
    io.to(user.room).emit("userList", {
      room: user.room,
      users: getUsersInroom(user.room)
    });
    callback();
  });

  socket.on("newMessage", (text, callback) => {
    const user = getUser(socket.id);

    if (filter.isProfane(text)) {
      return callback("profane text is no no");
    }
    io.to(user.room).emit("publish message", textGen(user.username, text));
    callback("Message was published");
    // console.log(user);
  });

  socket.on("locationShared", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "publishLocation",
      textGen(
        user.username,
        `https://www.google.com/maps/?q=${location.lat},${location.long}`
      )
    );
    callback("Location shared successfully!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    io.to(user.room).emit(
      "userLeft",
      textGen("Admin", `${user.username} has left the chat`)
    );
    io.to(user.room).emit("userList", {
      room: user.room,
      users: getUsersInroom(user.room)
    });
  });
});

// io.on("connection", socket => {
//   socket.emit("countUpdated", count);
//   socket.on("increment", () => {
//     count++;
//     io.emit("countUpdated", count);
//   });
// });

// app.set("view engine", "html");

// app.get("", (req, res) => {
//   res.render("maan");
// });

server.listen(port, () => {});
