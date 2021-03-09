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
  if (req.body.gameKey) {
    checkGameKey(req.body.gameKey,function(result){
      if(result){
        res.send(`{"result":"OK"}`);
      }else{
        res.send('{"error":"Невнрный GameKey"}');
      }
    })
  } else {
    res.send('{"error":"GameKey Error"}');
  }
});


function checkGameKey(gameKey, callback){
  if (arrayOfGamesId.includes(gameKey)) {
    return callback(true);
  } else {
    sql.getGameByKey(gameKey, function (error, result) {
      console.log(error + " " + result)
      if (error) {
        return callback(false);
      } else {       
        arrayOfGamesId.push(gameKey);
        return callback(true);
      }
    });
  }
}

app.post("/registerClient", async (req, res) => {
  if (req.body.gameKey) {
    checkGameKey(req.body.gameKey,function(result){
      if(result){
        if (
          req.body.login &&
          req.body.login !== "" &&
          req.body.password !== null &&
          req.body.password
        ) {
          sql.register(req.body.login, req.body.password, req.body.gameKey,function(error, result){
            if (error) {
              res.send(`{"error":"${error}"}`);
            } else {
              res.send(`{"result":"${CryptoJS.HmacSHA256(req.body.login, key)}"}`);
            }
          })
        }else{
          res.send('{"error":"Невнрные данные"}');
        }
  
      }else{
        res.send('{"error":"Невнрный GameKey"}');
      }
    })

  } else {
    res.send('{"error":"GameKey Error"}');
  }
});

app.post("/authClient", async (req, res) => {
  if (req.body.gameKey) {
    checkGameKey(req.body.gameKey,function(result){
      if(result){
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
      }else{
        res.send('{"error":"Невнрный GameKey"}');
      }
    })
  } else {
    res.send('{"error":"GameKey Error"}');
  }

});

app.post("/sendData", async (req, res) => {
  let gameKey = req.body.gameKey;
  let sessionKey = req.body.sessionKey;
  if (gameKey && sessionKey) {
    checkGameKey(req.body.gameKey,function(result){
      if(result){

          let data = req.body;

          delete data["gameKey"];
          delete data["sessionKey"];
          sql.insertPlayerData(gameKey,sessionKey,data, function(error, result){
            if (error) {
              res.send(`{"error":"${error}"}`);
            } else {
              res.send(`{"result":"OK"}`);
            }
          })
          console.log(data);

      }else{
        res.send('{"error":"Невнрный GameKey"}');
      }
    })
  } else {
    res.send('{"error":"GameKey Error"}');
  }

});


app.post("/getData", async (req, res) => {
  let gameKey = req.body.gameKey;
  let sessionKey = req.body.sessionKey;
  let base = req.body.base;
  console.log(req.body);

  if (gameKey && sessionKey && base ) {
    checkGameKey(req.body.gameKey,function(result){
      if(result){
          sql.getPlayerData(gameKey,sessionKey,base, function(error, result){
            if (error) {
              res.send(`{"error":"${error}"}`);
            } else {
              console.log(result);
              res.send(result);
            }
          })


      }else{
        res.send('{"error":"Невнрный GameKey"}');
      }
    })
  } else {
    res.send('{"error":"GameKey Error"}');
  }

});