const express = require("express");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
var CryptoJS = require("crypto-js");
const router = require("./router");
const sql = require("./sql2");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);
app.use(bodyParser.json());
app.use("/public", express.static("public"));
require('./clientHandler')(app, sql,CryptoJS);

app.post("/auth", async (req, res) => {
  if (req.body.login && req.body.password) {
    let result = await sql.auth(req.body.login, req.body.password, "users");
    console.log(result);
    res.send(result);
  } else {
    res.send(`{"error":"ER_INVALID_FIELDS"}`);
  }
});

app.post("/register", async (req, res) => {
  let login = req.body.login;
  let password = req.body.password;
  if (login && password) {
    let result = await sql.register(login, password, "users", null);
    res.send(result);
  } else {
    res.send(`{"error":"ER_INVALID_FIELDS"}`);
  }
});

app.post("/chekUserSession", async (req, res) => {
  if (req.body.key) {
    let result = await sql.getUserByKey(req.body.key);
    res.send(result);
  } else {
    res.send(`{"error":"ER_INVALID_FIELDS"}`);
  }
});

app.post("/insertGame", async (req, res) => {
  let gameName = req.body.name;
  let sessionKey = req.body.key
  if (gameName, sessionKey) {

    let userSql = await sql.getUserByKey(sessionKey);
    let user = JSON.parse(userSql)
    if(!user.error){
      console.log("user:" + userSql);
      let result = await sql.inesertGame(user.login, gameName);
      res.send(result);
    }else{
      res.send(`{"error":"ER_INVALID_SESSION"}`);
    }
  } else {
    res.send(`{"error":"ER_INVALID_FIELDS"}`);
  }
});

app.post("/getgameslist", async (req, res) => {
  let sessionKey = req.body.key
  if (sessionKey) {

    let userSql = await sql.getUserByKey(sessionKey);
    let user = JSON.parse(userSql)
    if(!user.error){
      let result = await sql.getGameList(user.login);
      res.send(result);
    }else{
      res.send(`{"error":"ER_INVALID_SESSION"}`);
    }
  } else {
    res.send(`{"error":"ER_INVALID_FIELDS"}`);
  }
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
