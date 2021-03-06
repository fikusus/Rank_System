const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    res.sendFile(`${__dirname}/public/main/main.html`);
  });
  
  router.get("/lobby", async (req, res) => {
    res.sendFile(`${__dirname}/public/lobby/lobby.html`);
  });
  
  router.get("/register", async (req, res) => {
    res.sendFile(`${__dirname}/public/register/register.html`);
  });
  
  router.get("/auth", async (req, res) => {
    res.sendFile(`${__dirname}/public/auth/auth.html`);
  });

module.exports = router;