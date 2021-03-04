document.getElementById("regbutton").onclick = function(event){
    event.preventDefault();
    console.log("Testr");
    $.ajax({
        global: false,
        type: 'POST',
        url: "/register",
        dataType: 'json',
        data: {
            login:$("#login").val(),
            password: $("#password").val(),
            psw_repeat: $("#psw-repeat").val()
        },
        success: function (result) {
            console.log(result);
        },
        error: function (request, status, error) {
            console.log(error);
        }
    });
}