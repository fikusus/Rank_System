const express = require("express");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
var CryptoJS = require("crypto-js");
const router = require("./router");

const sql = require("./sql");

const key = "dimatohadanil";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);
app.use(bodyParser.json());
app.use("/public", express.static("public"));

app.post("/auth", async (req, res) => {
  if (req.body.login && req.body.password) {
    sql.auth(req.body.login, req.body.password, function (error, results) {
      if (error) {
        res.send('{"error":"Логин/пароль неверние"}');
      } else {
        if (results.length === 0) {
          res.send('{"error":"Логин/пароль неверние"}');
        } else {
          res.send(`{"session":"${CryptoJS.HmacSHA256(req.body.login, key)}"}`);
        }
      }
    });
  }
});

app.post("/register", async (req, res) => {
  if (
    req.body.login &&
    req.body.login !== "" &&
    req.body.password !== null &&
    req.body.password &&
    req.body.psw_repeat !== null &&
    req.body.psw_repeat &&
    req.body.password === req.body.psw_repeat
  ) {
    sql.register(req.body.login, req.body.password, function (error, result) {
      if (error) {
        res.send(`{"error":"${error}"}`);
      } else {
        res.send(`{"session":"${CryptoJS.HmacSHA256(req.body.login, key)}"}`);
      }
    });
  } else {
    res.send('{"error":"error"}');
  }
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.post("/chekUserSession", async (req, res) => {
  if (req.body.key) {
    sql.getUserByKey(req.body.key, function (error, results) {
      if (error) {
        res.send(`{"error":"${error}"}`);
      } else {
        console.log(results);
          res.send(results);
      }
    });
  }
});

app.post("/insertGame", async (req, res) => {
  if (
    req.body.name &&
    req.body.name !== "" &&
    req.body.key &&
    req.body.key !== ""
  ) {

    sql.getUserByKey(req.body.key, function (error, results) {
      if (error) {
        res.send(`{"error":"${error}"}`);
      } else {
          sql.inesertGame(results.login, req.body.name, function(error, result){
            if (error) {
              res.send(`{"error":"${error}"}`);
            } else {
              res.send(`{"result":"${result}"}`);
            }
          })

      }
    });
  } else {
    res.send('{"error":"error"}');
  }
});


app.post("/getgameslist", async (req, res) => {
  if (
    req.body.key
  ) {

    sql.getUserByKey(req.body.key, function (error, results) {
      if (error) {
        res.send(`{"error":"${error}"}`);
      } else {
          sql.getGameList(results.login, function(error, result){
            if (error) {
              res.send(`{"error":"${error}"}`);
            } else {
              
              res.send(result);
            }
          })

      }
    });
  } else {
    res.send('{"error":"error"}');
  }
});


