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
  auth: (login, password, tablename, callback) => {
    var sql = `SELECT sessionkey FROM ${tablename} WHERE login = '${login}' AND password = '${CryptoJS.HmacSHA256(
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

  register: (login, password, tablename, callback) => {
    let sql_find_user = `SELECT COUNT(*) as solution FROM ${tablename} where login = '${login}';`;
    let sql_insert_user = `INSERT INTO ${tablename} (login, password, sessionkey) values ('${login}', '${CryptoJS.HmacSHA256(
      password,
      key
    )}', '${CryptoJS.HmacSHA256(login, key)}')`;

    let sql_create_user_table = `CREATE TABLE ${tablename} (
        sessionkey VARCHAR(128) UNIQUE,
        login VARCHAR(30) PRIMARY KEY,
        password VARCHAR(128) NOT NULL,
        const_params JSON,
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

  getGameByKey: (id, callback) => {
    var sql = `SELECT *  FROM games WHERE id = '${id}';`;

    connection.query(sql, function (error, results) {
      if (error || !results[0]) {
        return callback(SQLErrorMgs, null);
      } else {
        return callback(null, "OK");
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

  getGameIdsList: (callback) => {
    var sql = `SELECT  id  FROM games;`;

    connection.query(sql, function (error, results) {
      if (error) {
        return callback(SQLErrorMgs, null);
      } else {
        return callback(null, results);
      }
    });
  },

  insertPlayerData: (gameKey, sessionKey, data, callback) => {
    var sql = `UPDATE ${gameKey} SET params = '${JSON.stringify(
      data
    )}' WHERE sessionkey = '${sessionKey}'`;

    connection.query(sql, function (error, results) {
      if (error) {
        return callback(SQLErrorMgs, null);
      } else {
        if (results) {
          if (results.affectedRows === 1) {
            return callback(null, "OK");
          } else {
            return callback("Пользователь не найден", null);
          }
        } else {
          return callback(SQLErrorMgs, null);
        }
      }
    });
  },

  getPlayerData: (gameKey, sessionKey, base, callback) => {
    var sql = `SELECT ${base} FROM ${gameKey} WHERE sessionkey = '${sessionKey}'`;

    connection.query(sql, function (error, results) {
      if (error && !results) {
        return callback(SQLErrorMgs, null);
      } else {
        if (results[0][base]) {
            return callback(null, results[0][base]);
        } else {
          return callback(SQLErrorMgs, null);
        }
      }
    });
  },

};

module.exports = sql;
