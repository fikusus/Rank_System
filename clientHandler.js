const { json } = require('body-parser');

module.exports = function (app, sql, CryptoJS) {
    const config = require('config');
    const key =  config.get("key");

    let arrayOfGamesId = [];

    sql.getGameIdsList(function (error, result) {
      if (!error && result) {
        for (let i = 0; i < result.length; i++) {
          arrayOfGamesId.push(result[i].id);
        }
        console.log(arrayOfGamesId);
      }
    });



  app.post("/testConnection", async (req, res) => {
    if (req.body.gameKey) {
      checkGameKey(req.body.gameKey, function (result) {
        if (result) {
          res.send(`{"result":"OK"}`);
        } else {
          res.send('{"error":"Невнрный GameKey"}');
        }
      });
    } else {
      res.send('{"error":"GameKey Error"}');
    }
  });

  function checkGameKey(gameKey, callback) {
    if (arrayOfGamesId.includes(gameKey)) {
      return callback(true);
    } else {
      sql.getGameByKey(gameKey, function (error, result) {
        console.log(error + " " + result);
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
    regData = req.body[0];
    userData = req.body[1];
    console.log(req.body);
    if (regData.gameKey) {
      checkGameKey(regData.gameKey, function (result) {
        if (result) {
          if (
            regData.login &&
            regData.login !== "" &&
            regData.password !== null &&
            regData.password
          ) {
            let ud = null;
            if (userData) {
              ud = `'${JSON.stringify(userData)}'`;
            }
            sql.register(
              regData.login,
              regData.password,
              regData.gameKey,
              ud,
              function (error, result) {
                if (error) {
                  res.send(`{"error":"${error}"}`);
                } else {
                    if(userData){
                        res.send(
                            `{"result":"${CryptoJS.HmacSHA256(regData.login, key)}","useparams":${JSON.stringify(userData)}}`
                          );
                    }else{
                        res.send(
                            `{"result":"${CryptoJS.HmacSHA256(regData.login, key)}","useparams":null}`
                          );
                    }

                }
              }
            );
          } else {
            res.send('{"error":"Невнрные данные"}');
          }
        } else {
          res.send('{"error":"Невнрный GameKey"}');
        }
      });
    } else {
      res.send('{"error":"GameKey Error"}');
    }
  });

  app.post("/authClient", async (req, res) => {
    if (req.body.gameKey) {
      checkGameKey(req.body.gameKey, function (result) {
        if (result) {
          if (req.body.login && req.body.password) {
            sql.auth(
              req.body.login,
              req.body.password,
              req.body.gameKey,
              function (error, results) {
                if (error) {
                  res.send('{"error":"Логин/пароль неверние"}');
                } else {
                  if (results.length === 0) {
                    res.send('{"error":"Логин/пароль неверние"}');
                  } else {
                      let sessionKey = CryptoJS.HmacSHA256(req.body.login, key);
                      sql.getPlayerData(req.body.gameKey, sessionKey, function(error, result){

                        if (error) {
                            res.send(`{"error":"${error}"}`);
                          } else {

                            res.send(
                                `{"result":"${sessionKey}","useparams":${JSON.stringify(result)}}`
                              );
                          }
                      })

                  }
                }
              }
            );
          }
        } else {
          res.send('{"error":"Невнрный GameKey"}');
        }
      });
    } else {
      res.send('{"error":"GameKey Error"}');
    }
  });

  app.post("/sendData", async (req, res) => {
    let gameKey = req.body.gameKey;
    let sessionKey = req.body.sessionKey;
    if (gameKey && sessionKey) {
      checkGameKey(req.body.gameKey, function (result) {
        if (result) {
          let data = req.body;

          delete data["gameKey"];
          delete data["sessionKey"];
          sql.insertPlayerData(
            gameKey,
            sessionKey,
            data,
            function (error, result) {
              if (error) {
                res.send(`{"error":"${error}"}`);
              } else {
                res.send(`{"result":"OK"}`);
              }
            }
          );
          console.log(data);
        } else {
          res.send('{"error":"Невнрный GameKey"}');
        }
      });
    } else {
      res.send('{"error":"GameKey Error"}');
    }
  });

  app.post("/getData", async (req, res) => {
    let gameKey = req.body.gameKey;
    let sessionKey = req.body.sessionKey;
    let base = req.body.base;
    console.log(req.body);

    if (gameKey && sessionKey && base) {
      checkGameKey(req.body.gameKey, function (result) {
        if (result) {
          sql.getPlayerData(
            gameKey,
            sessionKey,
            function (error, result) {
              if (error) {
                res.send(`{"error":"${error}"}`);
              } else {
                console.log(result);
                res.send(result);
              }
            }
          );
        } else {
          res.send('{"error":"Невнрный GameKey"}');
        }
      });
    } else {
      res.send('{"error":"GameKey Error"}');
    }
  });



  app.post("/getRating", async (req, res) => {
    let gameKey = req.body.gameKey;
    let sessionKey = req.body.sessionKey;
    let count = req.body.count;
    console.log(req.body);

    if (gameKey && sessionKey && count) {
      checkGameKey(req.body.gameKey, function (result) {
        if (result) {
          sql.getRating(
            gameKey,
            sessionKey,
            count,
            function (error, result) {
              if (error) {
                res.send(`{"error":"${error}"}`);
              } else {
                console.log(result);
                res.send(result);
              }
            }
          );
        } else {
          res.send('{"error":"Невнрный GameKey"}');
        }
      });
    } else {
      res.send('{"error":"GameKey Error"}');
    }
  });

  app.post("/setRating", async (req, res) => {
    let gameKey = req.body.gameKey;
    let sessionKey = req.body.sessionKey;
    let rank = req.body.rank;
    console.log(req.body);

    if (gameKey && sessionKey && rank) {
      checkGameKey(req.body.gameKey, function (result) {
        if (result) {
          sql.getRating(
            gameKey,
            sessionKey,
            rank,
            function (error, result) {
              if (error) {
                res.send(`{"error":"${error}"}`);
              } else {
                res.send(`{"result":"OK"}`);
              }
            }
          );
        } else {
          res.send('{"error":"Невнрный GameKey"}');
        }
      });
    } else {
      res.send('{"error":"GameKey Error"}');
    }
  });
};
