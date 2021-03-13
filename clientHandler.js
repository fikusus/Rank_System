module.exports = async function (app, sql, CryptoJS) {
  const config = require("config");
  const key = config.get("key");

  let arrayOfGamesId = [];

  let gameIdsList = await sql.getGameIdsList(function (error, result) {});

  if (!gameIdsList.error && gameIdsList) {
    for (let i = 0; i < gameIdsList.length; i++) {
      arrayOfGamesId.push(gameIdsList[i].id);
    }
    console.log(arrayOfGamesId);
  }

  app.post("/testConnection", async (req, res) => {
    if (req.body.gameKey) {
      let result = await checkGameKey(req.body.gameKey);
      res.send(result);
    } else {
      res.send(`{"error":"ER_INVALID_FIELDS"}`);
    }
  });

  async function checkGameKey(gameKey) {
    if (arrayOfGamesId.includes(gameKey)) {
      return `{"result":"OK"}`;
    } else {
      let chekedGameKey = await sql.getGameByKey(gameKey);
      if (!JSON.parse(chekedGameKey).error) {
        arrayOfGamesId.push(gameKey);
      }
      return chekedGameKey;
    }
  }

  app.post("/registerClient", async (req, res) => {
    regData = req.body[0];
    userData = req.body[1];
    console.log(regData);
    if (regData.gameKey) {
      let checkedUser = await checkGameKey(regData.gameKey);
      console.log(checkedUser);
      if (!JSON.parse(checkedUser).error) {
        let login = regData.login;
        let password = regData.password;
        if (login && password) {
          let ud = null;
          if (userData) {
            ud = `'${JSON.stringify(userData)}'`;
          }
          let result = await sql.register(login, password, regData.gameKey, ud);

          res.send(result);
        } else {
          res.send(`{"error":"ER_INVALID_FIELDS"}`);
        }
      } else {
        res.send('{"error":"ER_INVALID_GAMEKEY"}');
      }
    } else {
      res.send('{"error":"ER_INVALID_GAMEKEY"}');
    }
  });

  app.post("/authClient", async (req, res) => {
    if (req.body.gameKey) {
      let checkedUser = await checkGameKey(req.body.gameKey);
      if (!JSON.parse(checkedUser).error) {
        let login = req.body.login;
        let password = req.body.password;
        if (login && password) {
          let result = await sql.auth(login, password, req.body.gameKey);
          if (!JSON.parse(result).error) {
            let sessionKey = JSON.parse(result).result;
            let userInfo = await sql.getPlayerData(
              req.body.gameKey,
              sessionKey
            );
            console.log(userInfo);
            if (!JSON.parse(userInfo).error) {
              res.send(`{"result":"${sessionKey}","useparams":${userInfo}}`);
            } else {
              res.send(result);
            }
          } else {
            res.send(result);
          }
        } else {
          res.send(`{"error":"ER_INVALID_FIELDS"}`);
        }
      } else {
        res.send('{"error":"ER_INVALID_GAMEKEY"}');
      }
    } else {
      res.send('{"error":"ER_INVALID_GAMEKEY"}');
    }
  });

  app.post("/sendData", async (req, res) => {
    verifyData = req.body[0];
    userData = req.body[1].userData;
    let gameKey = verifyData.gameKey;
    let sessionKey = verifyData.sessionKey;
    console.log(userData);
    if (gameKey && sessionKey) {
      let checkedUser = await checkGameKey(gameKey);
      if (!JSON.parse(checkedUser).error) {
        let result = await sql.insertPlayerData(
          gameKey,
          sessionKey,
          verifyData.type,
          userData
        );
        res.send(result);
      } else {
        res.send('{"error":"ER_INVALID_GAMEKEY"}');
      }
    } else {
      res.send('{"error":"ER_INVALID_GAMEKEY"}');
    }
  });

  app.post("/getData", async (req, res) => {
    let gameKey = req.body.gameKey;
    let sessionKey = req.body.sessionKey;
    console.log(req.body);

    if (gameKey && sessionKey) {
      let checkedUser = await checkGameKey(gameKey);
      if (!JSON.parse(checkedUser).error) {
        let result = await sql.getPlayerData(gameKey, sessionKey);
        res.send(result);
      } else {
        res.send('{"error":"ER_INVALID_GAMEKEY"}');
      }
    } else {
      res.send('{"error":"ER_INVALID_GAMEKEY"}');
    }
  });

  app.post("/getRating", async (req, res) => {
    let gameKey = req.body.gameKey;
    let sessionKey = req.body.sessionKey;
    let count = req.body.count;
    console.log(req.body);

    if (gameKey && sessionKey && count != null) {
      let checkedUser = await checkGameKey(gameKey);
      if (!JSON.parse(checkedUser).error) {
        let result = await sql.getRating(gameKey, sessionKey,count);
        res.send(result);
      } else {
        res.send('{"error":"ER_INVALID_GAMEKEY"}');
      }
    } else {
      res.send('{"error":"ER_INVALID_GAMEKEY"}');
    }
  });
};
