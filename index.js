const express = require("express");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
var CryptoJS = require("crypto-js");

const { v4: uuidv4 } = require("uuid");
const key = "dimatohadanil";

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
});

connection.connect();

app.use("/public", express.static("public"));

app.get("/", async (req, res) => {
  res.sendFile(`${__dirname}/public/main/main.html`);
});

app.get("/lobby", async (req, res) => {
  res.sendFile(`${__dirname}/public/lobby/lobby.html`);
});

app.get("/register", async (req, res) => {
  res.sendFile(`${__dirname}/public/register/register.html`);
});

app.get("/auth", async (req, res) => {
  res.sendFile(`${__dirname}/public/auth/auth.html`);
});

app.post("/auth", async (req, res) => {
  if (req.body.login && req.body.password) {
    connection.query(
      `SELECT sessionkey FROM users WHERE login = '${
        req.body.login
      }' AND password = '${CryptoJS.HmacSHA256(req.body.password, key)}' ;`,
      function (error, results, fields) {
        if (error) {
          throw error;
        } else {
          if (results.length === 0) {
            res.send('{"error":"Логин/пароль неверние"}');
          } else {
            res.send(
              `{"session":"${CryptoJS.HmacSHA256(req.body.login, key)}"}`
            );
          }
        }
      }
    );
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
    connection.query(
      `SELECT EXISTS (
            SELECT 1 
            FROM   information_schema.tables 
            WHERE  table_schema = 'test'
            AND    table_name = 'users'
            ) as solution;`,
      function (error, results, fields) {
        if (error) throw error;
        if (results[0].solution === 1) {
          insertUser(req.body.login, req.body.password, res);
        } else {
          connection.query(
            `CREATE TABLE users (
                    sessionkey VARCHAR(128) UNIQUE,
                    login VARCHAR(30) PRIMARY KEY,
                    password VARCHAR(128) NOT NULL,
                    params JSON
                )`,
            function (error, results, fields) {
              if (error) {
                throw error;
              } else {
                insertUser(req.body.login, req.body.password, res);
              }
            }
          );
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
    connection.query(
      `SELECT login, params  FROM users WHERE sessionkey = '${req.body.key}';`,
      function (error, results, fields) {
        if (error) {
          throw error;
        } else {
          res.send(results[0]);
        }
      }
    );
  }
});

app.post("/insertGame", async (req, res) => {
  if (
    req.body.name &&
    req.body.name !== "" &&
    req.body.key &&
    req.body.key !== ""
  ) {
    connection.query(
      `SELECT EXISTS (
            SELECT 1 
            FROM   information_schema.tables 
            WHERE  table_schema = 'test'
            AND    table_name = 'games'
            ) as solution;`,
      async function (error, results, fields) {
        if (error) {
          throw error;
        } else {
          console.log(await getLoginByKey(req.body.key));
          connection.query(
            `SELECT login, params  FROM users WHERE sessionkey = '${req.body.key}';`,
            function (error2, results2, fields2) {
              if (error2) {
                throw error2;
              } else {
                if (results[0].solution === 1) {
                  insertGame(results2[0].login, req.body.name, res);
                } else {
                  connection.query(
                    `CREATE TABLE games (
                          login VARCHAR(30),
                          name VARCHAR(30),
                          id VARCHAR(30) PRIMARY KEY,
                          CONSTRAINT UC_Person UNIQUE (login,name)
                      )`,
                    function (error, results, fields) {
                      if (error) {
                        throw error;
                      } else {
                        insertGame(results2[0].login, req.body.name, res);
                      }
                    }
                  );
                }
                //res.send(results[0]);
              }
              //console.log(results2);
            }
          );
        }
      }
    );
  } else {
    res.send('{"error":"error"}');
  }
});

async function insertUser(username, password, res) {
  connection.query(
    `SELECT COUNT(*) as solution FROM users where login = '${username}';`,
    function (error, results, fields) {
      if (error) throw error;
      if (results[0].solution === 1) {
        res.send('{"error":"Имя пользователя занято"}');
      } else {
        connection.query(
          `INSERT INTO users (login, password, sessionkey) values ('${username}', '${CryptoJS.HmacSHA256(
            password,
            key
          )}', '${CryptoJS.HmacSHA256(username, key)}')`,
          function (error, results, fields) {
            if (error) throw error;
            res.send(`{"session":"${CryptoJS.HmacSHA256(username, key)}"}`);
          }
        );
      }
    }
  );
}

async function insertGame(login, name, res) {
  connection.query(
    `SELECT COUNT(*) as solution FROM games where login = '${login}' AND name = '${name}';`,
    function (error, results, fields) {
      if (error) {
        throw error;
      } else {
        if (results[0].solution === 1) {
          res.send('{"error":"Имя занято"}');
        } else {
          connection.query(
            `INSERT INTO games  values ('${login}','${name}' ,'${CryptoJS.HmacSHA256(
              login + name,
              key
            )}')`,
            function (error, results, fields) {
              if (error) throw error;
              res.send(`{"result":"Успешно добавлено "}`);
            }
          );
        }
      }
    }
  );
}

async function getLoginByKey(sessionkey, callback) {
  var sql = `SELECT login, params  FROM users WHERE sessionkey = '${sessionkey}';`;

  connection.query(sql, function (err, results) {
    if (err) {
      throw err;
    }
    console.log(results[0].login); // good
    stuff_i_want = results[0].login; // Scope is larger than function

    return callback(results[0].login);
  });
}
