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
      } else {
        window.location.replace("/lobby");
      }

      console.log(result);
    }
  );
} 


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