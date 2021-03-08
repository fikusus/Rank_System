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

let arrayOfGamesId = [];

sql.getGameIdsList(function (error, result) {
  if (!error && result) {
    for (let i = 0; i < result.length; i++) {
      arrayOfGamesId.push(result[i].id);
    }
    console.log(arrayOfGamesId);
  }
});

app.post("/auth", async (req, res) => {
  if (req.body.login && req.body.password) {
    sql.auth(req.body.login, req.body.password,"users", function (error, results) {
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
    sql.register(
      req.body.login,
      req.body.password,
      "users",
      function (error, result) {
        if (error) {
          res.send(`{"error":"${error}"}`);
        } else {
          res.send(`{"session":"${CryptoJS.HmacSHA256(req.body.login, key)}"}`);
        }
      }
    );
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
        sql.inesertGame(results.login, req.body.name, function (error, result) {
          if (error) {
            res.send(`{"error":"${error}"}`);
          } else {
            res.send(`{"result":"${result}"}`);
          }
        });
      }
    });
  } else {
    res.send('{"error":"error"}');
  }
});

app.post("/getgameslist", async (req, res) => {
  if (req.body.key) {
    sql.getUserByKey(req.body.key, function (error, results) {
      if (error) {
        res.send(`{"error":"${error}"}`);
      } else {
        sql.getGameList(results.login, function (error, result) {
          if (error) {
            res.send(`{"error":"${error}"}`);
          } else {
            res.send(result);
          }
        });
      }
    });
  } else {
    res.send('{"error":"error"}');
  }
});

app.post("/testConnection", async (req, res) => {
  console.log(req.body.gameKey);
  if (req.body.gameKey) {
    if (arrayOfGamesId.includes(req.body.gameKey)) {
      res.send("OK");
    } else {
      sql.getGameByKey(req.body.gameKey, function (error, result) {
        if (error) {
          res.send('{"error":"Невнрный GameKey"}');
        } else {
          arrayOfGamesId.push(req.body.gameKey);
          res.send(`{"result":"OK"}`);
        }
      });
    }
  } else {
    res.send('{"error":"GameKey Error"}');
  }
});

app.post("/registerClient", async (req, res) => {
  console.log(req.body.gameKey);
  if (req.body.gameKey) {
    if (arrayOfGamesId.includes(req.body.gameKey)) {
      if (
        req.body.login &&
        req.body.login !== "" &&
        req.body.password !== null &&
        req.body.password
      ) {
        sql.register(req.body.login, req.body.password, req.body.gameKey,function(error, result){
          if (error) {
            res.send(error);
          } else {
            res.send(`{"result":"${CryptoJS.HmacSHA256(req.body.login, key)}"}`);
          }
        })
      }else{
        res.send('{"error":"Невнрные данные"}');
      }

    } else {
      res.send('{"error":"Невнрный GameKey"}');
    }
  } else {
    res.send('{"error":"GameKey Error"}');
  }
});

app.post("/authClient", async (req, res) => {
  console.log(req.body.gameKey);
  if (req.body.gameKey) {
    if (arrayOfGamesId.includes(req.body.gameKey)) {
      if (req.body.login && req.body.password) {
        sql.auth(req.body.login, req.body.password,req.body.gameKey, function (error, results) {
          if (error) {
            res.send('{"error":"Логин/пароль неверние"}');
          } else {
            if (results.length === 0) {
              res.send('{"error":"Логин/пароль неверние"}');
            } else {
              res.send(`{"result":"${CryptoJS.HmacSHA256(req.body.login, key)}"}`);
            }
          }
        });
      }
    } else {
      res.send('{"error":"Невнрный GameKey"}');
    }
  } else {
    res.send('{"error":"GameKey Error"}');
  }

});