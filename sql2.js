var md5 = require('md5');
var CryptoJS = require("crypto-js");
var mysql = require("mysql2/promise");
var connection = mysql.createPool({
  host: process.env.host ? process.env.host : "localhost",
  user: process.env.user ? process.env.user : "root",
  password: process.env.password ? process.env.password : "",
  database: process.env.database ? process.env.database : "marina",
});
var randomstring = require("randomstring");
let SQLErrorMgs = "ER_EXTERNAL_ERROR";

const config = require("config");
const key = config.get("key");

let sql = {
  auth: async (login, password, tablename, callback) => {
    var sql = `SELECT sessionkey FROM ${tablename} WHERE login = '${login}' AND password = '${CryptoJS.HmacSHA256(
      password,
      key
    )}' ;`;

    try {
      const rows = await connection.query(sql);
      if (rows[0].length) {
        return `{"result":"${rows[0][0].sessionkey}"}`;
      } else {
        return `{"error":"ER_INVALID_LOGIN"}`;
      }
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        return `{"error":"ER_INVALID_LOGIN"}`;
      } else {
        return `{"error":"${SQLErrorMgs}"}`;
      }
    }
  },

  register: async (login, password, tablename, userData) => {
    let sql_find_user = `SELECT COUNT(*) as solution FROM ${tablename} where login = '${login}';`;
    let sql_insert_user = `INSERT INTO ${tablename} (login, password, sessionkey, const_params) values ('${login}', '${CryptoJS.HmacSHA256(
      password,
      key
    )}', '${CryptoJS.HmacSHA256(login, key)}', ${userData})`;
    let sql_create_user_table = `CREATE TABLE ${tablename} (
        sessionkey VARCHAR(128) UNIQUE,
        login VARCHAR(128) PRIMARY KEY,
        password VARCHAR(128) NOT NULL,
        const_params JSON,
        params JSON,
        rating DOUBLE
    )`;
    try {
      const rows = await connection.query(sql_find_user);
      if (rows[0][0].solution) {
        return `{"error":"ER_NAME_IS_TAKEN"}`;
      } else {
        await connection.query(sql_insert_user);
        return `{"result":"${CryptoJS.HmacSHA256(login, key)}"}`;
      }
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        try {
          await connection.query(sql_create_user_table);
          await connection.query(sql_insert_user);
          return `{"result":"${CryptoJS.HmacSHA256(login, key)}"}`;
        } catch (err) {
          return `{"error":"${SQLErrorMgs}"}`;
        }
      } else {
        return `{"error":"${SQLErrorMgs}"}`;
      }
    }
  },

  getUserByKey: async (sessionkey, callback) => {
    var sql = `SELECT login, params  FROM users WHERE sessionkey = '${sessionkey}';`;
    try {
      const rows = await connection.query(sql);
      if (rows[0].length) {
        return JSON.stringify(rows[0][0]);
      } else {
        return `{"error":"ER_INVALID_SESSION"}`;
      }
    } catch (err) {
      return `{"error":"${SQLErrorMgs}"}`;
    }
  },

  inesertGame: async (login, name) => {
    let sql_find_game = `SELECT COUNT(*) as solution FROM games where login = '${login}' AND name = '${name}';`;
    let sql_insert_game = `INSERT INTO games  values ('${login}','${name}' ,'${'g' + md5(login + name)}','${randomstring.generate(32)}','${randomstring.generate(16)}')`;

    let sql_create_game_table = `CREATE TABLE games (
      login VARCHAR(128),
      name VARCHAR(128),
      id VARCHAR(128) PRIMARY KEY,
      security VARCHAR(32),
      iv VARCHAR(16)
      CONSTRAINT UC_Person UNIQUE (login,name)
  )`;

    try {
      const rows = await connection.query(sql_find_game);
      if (rows[0][0].solution) {
        return `{"error":"ER_NAME_IS_TAKEN"}`;
      } else {
        await connection.query(sql_insert_game);
        return `{"result":"OK"}`;
      }
    } catch (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        try {
          await connection.query(sql_create_game_table);
          await connection.query(sql_insert_game);
          return `{"result":"OK"}`;
        } catch (err) {
          return `{"error":"${SQLErrorMgs}"}`;
        }
      } else {
        return `{"error":"${SQLErrorMgs}"}`;
      }
    }
  },

  getGameList: async (login) => {
    var sql = `SELECT name, id,security, iv FROM games WHERE login = '${login}';`;
    try {
      const rows = await connection.query(sql);
      return rows[0];
    } catch (err) {
      return `{"error":"${SQLErrorMgs}"}`;
    }
  },

  getGameIdsList: async () => {
    var sql = `SELECT  id,security, iv  FROM games;`;

    try {
      const rows = await connection.query(sql);
      for (let i = 0; i < rows[0].length; i++) {
        if (!rows[0][i].security) {
          sec = randomstring.generate(32);
          iv = randomstring.generate(16);
          var insert_security = `UPDATE games set security = '${sec}', iv = '${iv}'  WHERE id = '${rows[0][i].id}';`;
          rows[0][i].security = sec;
          rows[0][i].iv = iv;
          await connection.query(insert_security);
        }
      }
      return rows[0];
    } catch (err) {
      return `{"error":"${SQLErrorMgs}"}`;
    }
  },

  getGameByKey: async (id) => {
    var sql = `SELECT id, security, iv  FROM games WHERE id = '${id}';`;
    try {
      const rows = await connection.query(sql);
      if (rows[0].length) {
        return `{"result":${JSON.stringify(rows[0][0])}}`;
      }
      {
        return `{"error":"ER_INVALID_GAMEKEY"}`;
      }
    } catch (err) {
      return `{"error":"${SQLErrorMgs}"}`;
    }
  },

  getPlayerData: async (gameKey, sessionKey) => {
    var sql = `SELECT login, params, const_params, rating FROM ${gameKey} WHERE sessionkey = '${sessionKey}'`;
    try {
      const rows = await connection.query(sql);
      if (rows[0].length) {
        return JSON.stringify(rows[0][0]);
      }
      {
        return `{"useparams":"${null}"}`;
      }
    } catch (err) {
      return `{"error":"${SQLErrorMgs}"}`;
    }
  },

  insertPlayerData: async (gameKey, sessionKey, field, data) => {
    var sql = `UPDATE ${gameKey} SET ${field} = ${data} WHERE sessionkey = '${sessionKey}'`;
    try {
      const rows = await connection.query(sql);
      if (rows[0]) {
        if (rows[0].affectedRows === 1) {
          return `{"result":"OK"}`;
        } else {
          return `{"error":"ER_INVALID_SESSION"}`;
        }
      } else {
        return `{"error":"${SQLErrorMgs}"}`;
      }
    } catch (err) {
      return `{"error":"${SQLErrorMgs}"}`;
    }
  },

  getRating: async (gameKey, sessionKey, count) => {
    var sql = `SELECT r.login, position, rating,const_params
    FROM ${gameKey} u
        JOIN (
            SELECT  login,RANK() over (ORDER BY rating DESC ) position
            from ${gameKey}) r
        ON (u.login = r.login) WHERE position < ${count}
    union
    SELECT r.login, position, rating,const_params
    FROM ${gameKey} u
        JOIN (
            SELECT  sessionkey, login,RANK() over (ORDER BY rating DESC ) position
            from ${gameKey}) r
        ON (u.login = r.login) WHERE r.sessionkey = '${sessionKey}' order by position`;
    try {
      const rows = await connection.query(sql);
      return `{"result" : ${JSON.stringify(rows[0])}}`;
    } catch (err) {
      return `{"error":"${SQLErrorMgs}"}`;
    }
  },
};

module.exports = sql;
