
document.getElementById("regbutton").onclick = function (event) {
    event.preventDefault();
    let login = $("#login").val();
    let password = $("#password").val();
    if (login === "" || password === "") {
      document.getElementById("error_msg").innerHTML = "Заполните все поля";
      return;
    }
    document.getElementById("error_msg").innerHTML = "";
    $.ajax({
      global: false,
      type: "POST",
      url: "/auth",
      dataType: "json",
      data: {
        login: $("#login").val(),
        password: $("#password").val(),
      },
      success: function (result) {
        if (result.error === undefined) {
          document.cookie = `session=${result.session}`;
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
  