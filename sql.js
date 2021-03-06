var CryptoJS = require("crypto-js");
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
});

let SQLErrorMgs = "Ошибка, поробуйте позже";

const key = "dimatohadanil";

connection.connect();

let sql = {
  auth: (login, password, callback) => {
    var sql = `SELECT sessionkey FROM users WHERE login = '${login}' AND password = '${CryptoJS.HmacSHA256(
      password,
      key
    )}' ;`;

    connection.query(sql, function (err, results) {
      if (err) {
        if (err.code === "ER_NO_SUCH_TABLE") {
          return callback("Логин/пароль неверние", null);
        } else {
          return callback(SQLErrorMgs, null);
        }
      } else {
        return callback(null, results);
      }
    });
  },

  register: (login, password, callback) => {
    let sql_find_user = `SELECT COUNT(*) as solution FROM users where login = '${login}';`;
    let sql_insert_user = `INSERT INTO users (login, password, sessionkey) values ('${login}', '${CryptoJS.HmacSHA256(
      password,
      key
    )}', '${CryptoJS.HmacSHA256(login, key)}')`;

    let sql_create_user_table = `CREATE TABLE users (
        sessionkey VARCHAR(128) UNIQUE,
        login VARCHAR(30) PRIMARY KEY,
        password VARCHAR(128) NOT NULL,
        params JSON
    )`;
    connection.query(sql_find_user, function (error, results, fields) {
      if (error) {
        if (error.code === "ER_NO_SUCH_TABLE") {
          connection.query(
            sql_create_user_table,
            function (error, results, fields) {
              if (error) {
                return callback(SQLErrorMgs, null);
              } else {
                connection.query(
                  sql_insert_user,
                  function (error, results, fields) {
                    if (error) {
                      return callback(SQLErrorMgs, null);
                    } else {
                      callback(null, "OK");
                    }
                  }
                );
              }
            }
          );
        } else {
          return callback(SQLErrorMgs, null);
        }
      } else {
        console.log(results);
        if (results[0].solution === 1) {
          callback("Имя пользователя занято", null);
        } else {
          connection.query(sql_insert_user, function (error, results, fields) {
            if (error) {
              return callback(SQLErrorMgs, null);
            } else {
              return callback(null, "OK");
            }
          });
        }
      }
    });
  },

  getUserByKey: (sessionkey, callback) => {
    var sql = `SELECT login, params  FROM users WHERE sessionkey = '${sessionkey}';`;

    connection.query(sql, function (error, results) {
      if (error || !results[0]) {
        return callback(SQLErrorMgs, null);
      } else {
        return callback(null, results[0]);
      }
    });
  },

  inesertGame: (login, name, callback) => {
    let sql_find_game = `SELECT COUNT(*) as solution FROM games where login = '${login}' AND name = '${name}';`;
    let sql_insert_game = `INSERT INTO games  values ('${login}','${name}' ,'${CryptoJS.HmacSHA256(
      login + name,
      key
    )}')`;

    let sql_create_game_table = `CREATE TABLE games (
      login VARCHAR(30),
      name VARCHAR(30),
      id VARCHAR(30) PRIMARY KEY,
      CONSTRAINT UC_Person UNIQUE (login,name)
  )`;
    connection.query(sql_find_game, function (error, results, fields) {
      if (error) {
        if (error.code === "ER_NO_SUCH_TABLE") {
          connection.query(
            sql_create_game_table,
            function (error, results, fields) {
              if (error) {
                return callback(SQLErrorMgs, null);
              } else {
                connection.query(
                  sql_insert_game,
                  function (error, results, fields) {
                    if (error) {
                      return callback(SQLErrorMgs, null);
                    } else {
                      callback(null, "OK");
                    }
                  }
                );
              }
            }
          );
        } else {
          return callback(SQLErrorMgs, null);
        }
      } else {
        console.log(results);
        if (results[0].solution === 1) {
          callback("Имя  занято", null);
        } else {
          connection.query(sql_insert_game, function (error, results, fields) {
            if (error) {
              return callback(SQLErrorMgs, null);
            } else {
              return callback(null, "OK");
            }
          });
        }
      }
    });
  },

  getGameList: (login, callback) => {
    var sql = `SELECT name, id  FROM games WHERE login = '${login}';`;

    connection.query(sql, function (error, results) {
      if (error) {
        return callback(SQLErrorMgs, null);
      } else {
        return callback(null, results);
      }
    });
  },
};

module.exports = sql;
