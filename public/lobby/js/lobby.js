let cookie = document.cookie;
let key = getCookie("session");
if (key) {
  $.ajax({
    global: false,
    type: "POST",
    url: "/chekUserSession",
    dataType: "json",
    data: {
      key: key,
    },
    success: function (result) {
      document.getElementById(
        "user-info"
      ).innerHTML = `Hello ${result.login}!<br>`;
      console.log(result);
    },
    error: function (request, status, error) {
      console.log(error);
    },
  });
} else {
  window.location.replace("/");
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

$("#create_game").click(function () {
  let gameName = document.getElementById("game_name_input").value;
  if (gameName !== "") {
    $.ajax({
      global: false,
      type: "POST",
      url: "/insertGame",
      dataType: "json",
      data: {
        key: key,
        name:gameName
      },
      success: function (result) {
        document.getElementById(
          "user-info"
        ).innerHTML = `Hello ${result.login}!<br>`;
        console.log(result);
      },
      error: function (request, status, error) {
        console.log(error);
      },
    });
  }
});
console.log(key);
