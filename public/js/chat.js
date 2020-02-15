const socket = io();

const $form = document.querySelector("#message-form");
const $messageField = $form.querySelector("#message");
const $sendButton = $form.querySelector("#send");
const $location = document.querySelector("#location");
const $messageTemplate = document.querySelector("#meessageTemplate").innerHTML;
const $locationTemplate = document.querySelector("#locationTemplate").innerHTML;
const $messageContainer = document.querySelector("#messages");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  const $message = $messageContainer.lastElementChild;
  const heightOfElement = parseInt(window.getComputedStyle($message).height);
  const marginOfElement = parseInt(
    window.getComputedStyle($message.lastElementChild).marginBottom
  );
  const totalHeight = heightOfElement + marginOfElement + 2; //2 is the block-start and end-margin of p elements
  if ($messageContainer.scrollHeight > $messageContainer.offsetHeight) {
    if (
      $messageContainer.scrollTop + $messageContainer.offsetHeight <
      $messageContainer.scrollHeight - totalHeight
    ) {
      return;
    }
    $messageContainer.scrollTop = $messageContainer.scrollHeight;
  }

  console.log("scroll " + $messageContainer.scrollHeight);
  console.log("offset " + $messageContainer.offsetHeight);
  console.log("scrollTop " + $messageContainer.scrollTop);
};

document.querySelector("#message-form").addEventListener("submit", e => {
  e.preventDefault();
  const text = e.target.elements.message.value;
  $sendButton.setAttribute("disabled", "disabled");

  socket.emit("newMessage", text, message => {
    $sendButton.removeAttribute("disabled");
    console.log(message);
  });
  $messageField.value = "";
  $messageField.focus();
});

$location.addEventListener("click", e => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert("Sorry your browser does not support location feature!");
  }
  $location.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(loc => {
    const locationObj = {
      lat: loc.coords.latitude,
      long: loc.coords.longitude
    };
    socket.emit("locationShared", locationObj, message => {
      console.log(message);
      $location.removeAttribute("disabled");
    });
  });
});

socket.on("publishLocation", data => {
  console.log(data);
  const html = Mustache.render($locationTemplate, {
    displayName: data.displayName,
    location: data.text,
    createdAt: moment(data.createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
});

socket.on("publish message", text => {
  console.log(text);
  const html = Mustache.render($messageTemplate, {
    displayName: text.displayName,
    message: text.text,
    createdAt: moment(text.createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
  autoscroll();

  //   document
  //     .querySelector("#messenger")
  //     .insertAdjacentHTML("beforeend", `<div>${text}</div>`);
});

socket.on("newUser", user => {
  console.log(user);
  const html = Mustache.render($messageTemplate, {
    displayName: user.displayName,
    message: user.text,
    createdAt: moment(user.createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
});
socket.on("userLeft", data => {
  console.log(data);
  const html = Mustache.render($messageTemplate, {
    displayName: data.displayName,
    message: data.text,
    createdAt: moment(data.createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
});

socket.on("message", data => {
  console.log(data);
  const html = Mustache.render($messageTemplate, {
    displayName: data.displayName,
    message: data.text,
    createdAt: moment(data.createdAt).format("h:mm a")
  });
  $messageContainer.insertAdjacentHTML("beforeend", html);
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("userList", ({ room, users }) => {
  const $sidebarTemplate = document.querySelector("#sidebar-template")
    .innerHTML;
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});

// socket.on("countUpdated", count => {
//   console.log("The count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("clicked");
//   socket.emit("increment");
// });
