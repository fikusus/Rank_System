module.exports = async function (app, sql, CryptoJS) {
  const cryptData = require("./cryptData");
  const config = require("config");
  const key = config.get("key");

  let arrayOfGames = [];
  let arrayOfGamesId = [];
  let gameIdsList = await sql.getGameIdsList(function (error, result) {});

  if (!gameIdsList.error && gameIdsList) {
    for (let i = 0; i < gameIdsList.length; i++) {
      arrayOfGamesId.push(gameIdsList[i].id);
      arrayOfGames.push(gameIdsList[i]);
    }
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

  async function checkUserData(data, res) {
    let gameKey = data[0].gameKey;
    if (gameKey) {
      var result = arrayOfGames.filter((obj) => {
        return obj.id === gameKey;
      });

      if (arrayOfGamesId.includes(gameKey)) {
        for (const property in data[1]) {
          data[1][property] = cryptData.decrypt(
            data[1][property],
            result[0].security,
            result[0].iv
          );
          if (!data[1][property]) {
            res.send('{"error":"ER_SECURITY_CHECK"}');
            return null;
          }
        }

        return data[1];
      } else {
        let chekedGameKey = await sql.getGameByKey(gameKey);
        if (!JSON.parse(chekedGameKey).error) {
          arrayOfGamesId.push(gameKey);
          arrayOfGames.push(JSON.parse(chekedGameKey).result);
        }
        if (!JSON.parse(chekedGameKey).error) {
          res.send('{"error":"ER_INVALID_GAMEKEY"}');
          return null;
        } else {
          for (const property in data[1]) {
            data[1][property] = cryptData.decrypt(
              data[1][property],
              result[0].security,
              result[0].iv
            );
            if (!data[1][property]) {
              res.send('{"error":"ER_SECURITY_CHECK"}');
              return null;
            }
          }

          return data[1];
        }
      }
    } else {
      res.send('{"error":"ER_INVALID_GAMEKEY"}');
      return null;
    }
  }

  app.post("/registerClient", async (req, res) => {
    let decryptedUserData = await checkUserData(req.body, res);
    if (decryptedUserData) {
      let gameKey = req.body[0].gameKey;
      regData = decryptedUserData.regInfo;
      let login = regData.login;
      let password = regData.password;
      if (login && password) {
        let ud = null;
        if (userData) {
          ud = `'${JSON.stringify(userData)}'`;
        }
        let result = await sql.register(login, password, gameKey, ud);
        res.send(result);
      } else {
        res.send(`{"error":"ER_INVALID_FIELDS"}`);
      }
    }
  });

  app.post("/authClient", async (req, res) => {
    let decryptedUserData = await checkUserData(req.body, res);
    if (decryptedUserData) {
      let gameKey = req.body[0].gameKey;
      let login = decryptedUserData.authInfo.login;
      let password = decryptedUserData.authInfo.password;
      if (login && password) {
        let result = await sql.auth(login, password, gameKey);
        if (!JSON.parse(result).error) {
          let sessionKey = JSON.parse(result).result;
          let userInfo = await sql.getPlayerData(gameKey, sessionKey);
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
    }
  });

  app.post("/sendData", async (req, res) => {
    let decryptedUserData = await checkUserData(req.body, res);
    if (decryptedUserData) {
      let gameKey = req.body[0].gameKey;
      let sessionKey = decryptedUserData.userData.sessionKey;
      let userData = decryptedUserData.userData.userData;
      if (sessionKey && userData) {
        let result = await sql.insertPlayerData(
          gameKey,
          sessionKey,
          decryptedUserData.userData.type,
          userData
        );
        res.send(result);
      }else{
        res.send(`{"error":"ER_INVALID_FIELDS"}`);
      }
    }
  });

  app.post("/getData", async (req, res) => {

    let decryptedUserData = await checkUserData(req.body, res);
    if (decryptedUserData) {
      let gameKey = req.body[0].gameKey;
      let sessionKey = decryptedUserData.sessionKey.sessionKey;
        let result = await sql.getPlayerData(gameKey, sessionKey);
        res.send(result);
      } 
  });

  app.post("/getRating", async (req, res) => {
    let decryptedUserData = await checkUserData(req.body, res);
    if (decryptedUserData) {
      let gameKey = req.body[0].gameKey;
      let sessionKey = decryptedUserData.userData.sessionKey;
      let count =  decryptedUserData.userData.count;
      let result = await sql.getRating(gameKey, sessionKey, count);
      res.send(result);
    }
  });
};
