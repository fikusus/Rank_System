const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'danil',
  password : '12345',
  database : 'test'
});
 
connection.connect();
 
connection.query(`SELECT EXISTS (
   SELECT 1 
   FROM   information_schema.tables 
   WHERE  table_schema = 'test'
   AND    table_name = 'users'
   ) as solution;`, function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 

app.use('/public', express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/main/main.html`)
})


app.get('/register', (req, res) => {
    res.sendFile(`${__dirname}/public/register/register.html`)
  })

  app.post('/register', (req, res) => {
      console.log(req.body);
      if(req.body.login !==  null && req.body.login !==  "" && req.body.password !==  null && req.body.password !==  "" && req.body.psw_repeat !==  null && req.body.psw_repeat !==  "" && req.body.password  === req.body.psw_repeat){
        connection.query(`SELECT EXISTS (
            SELECT 1 
            FROM   information_schema.tables 
            WHERE  table_schema = 'test'
            AND    table_name = 'users'
            ) as solution;`, function (error, results, fields) {
           if (error) throw error;
           if(results[0].solution === 1){

           }else{
            connection.query(`CREATE TABLE users (
                    login VARCHAR(30) PRIMARY KEY,
                    password VARCHAR(30) NOT NULL,
                    params JSON
                )`, function (error, results, fields) {
                if (error) throw error;
                console.log('The solution is: ', results);
              });
           }    
         });
      }else{
        res.send('{"test":"error"}')
      }

  })
  
  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})