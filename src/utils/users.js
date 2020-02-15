const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room || username == "" || room == "") {
    return {
      error: "Name and room are required"
    };
  }

  const userExists = users.find(user => {
    return user.username === username && user.room === room;
  });

  if (userExists) {
    return {
      error: "This user has already been used!"
    };
  }
  const user = {
    id,
    username,
    room
  };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const userIndex = users.findIndex(user => {
    return user.id === id;
  });
  if (userIndex == -1) {
    return "no user found";
  }
  const deletedUser = users.splice(userIndex, 1)[0];
  return deletedUser;
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInroom = room => {
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInroom
};
