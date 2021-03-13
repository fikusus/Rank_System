
document.getElementById("regbutton").onclick = function (event) {
  event.preventDefault();
  console.log("Testr");
  let login = $("#login").val();
  let password = $("#password").val();
  let psw_repeat = $("#psw-repeat").val();
  if (login === "" || password === "" || psw_repeat === "") {
    document.getElementById("error_msg").innerHTML = "Заполните все поля";
    return;
  }
  if (password !== psw_repeat) {
    document.getElementById("error_msg").innerHTML = "Пароли не совпадают";
    return;
  }
  document.getElementById("error_msg").innerHTML = "";
  $.ajax({
    global: false,
    type: "POST",
    url: "/register",
    dataType: "json",
    data: {
      login: $("#login").val(),
      password: $("#password").val()
    },
    success: function (result) {
      if (result.error === undefined) {
        document.cookie = `session=${result.result}`;
        window.location.replace("/lobby");
      } else {
        document.getElementById("error_msg").innerHTML = result.error;
      }

      console.log(result.error);
    },
    error: function (request, status, error) {
      console.log(error);
    },
  });
};
