let cookie = document.cookie;
let key = getCookie("session");
if (key) {
  sendRequest(
    "chekUserSession",
    {
      key: key,
    },
    function (result) {
      if (result.error && !result.login) {
        document.cookie = "session=;path=/";
        window.location.replace("/");
      } else {
        document.getElementById(
          "user-info"
        ).innerHTML = `Hello ${result.login}!<br>`;

        updateGamesTable();
      }

      console.log(result);
    }
  );
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
    sendRequest(
      "insertGame",
      {
        key: key,
        name: gameName,
      },
      function (result) {
        updateGamesTable();
        console.log(result);
      }
    );
  }
});


$("#Log_Out").click(function () {
  document.cookie = "session=;path=/";
  window.location.replace("/");
});

console.log(key);

function sendRequest(adrees, data, callback) {
  $.ajax({
    global: false,
    type: "POST",
    url: `/${adrees}`,
    dataType: "json",
    data: data,
    success: function (result) {
      return callback(result);
    },
    error: function (request, status, error) {
      console.log(error);
    },
  });
}

function updateGamesTable() {
  sendRequest(
    "getgameslist",
    {
      key: key,
    },
    function (result) {
      if (result.length === 0) {
        document.getElementById("gamelist").innerHTML = "<p>Тут ничего нет</p>";
      } else {
        let out = `<table id="customers">
        <tr>
          <th>Name</th>
          <th>ID</th>
          <th>Action</th>
        </tr>`;
        for (let i = 0; i < result.length; i++) {
          out += `<tr>`;
          out += `    <td>${result[i].name}</td>
          <td>${result[i].id}</td>
          <td></td>`;
          out += `</tr>`;
        }
        out += `</table>`;
        document.getElementById("gamelist").innerHTML = out;
      }

      console.log(result);
    }
  );
}
