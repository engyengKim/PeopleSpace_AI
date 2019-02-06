var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var elasticsearch = require('elasticsearch');

/** MySQL */
var sqlconn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '1q2w3e4r',
  database : 'account'
});
sqlconn.connect();

/** ElasticSearch test */
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
var resultFile = require('../result_test.json');

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 3000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
}); 


/** Home Page */
router.get(['/', '/start'], function(req, res, next) {
  res.render('index', { title: 'Express' });
  //path.join(__dirname, '../public', 'index.html');

});

/** Login Page */
router.get('/login', function(req, res, next) // GET login page
{
  //path.join(__dirname, '../public', 'index.html');
  res.send('login page');
});
router.post('/login', function(req, res, next)  // POST login page
{
  var selectQuery = 'SELECT * FROM test'; // This will be changed to real table name
  // Get input account data from web
  var inputID = "testID"; // change to "inputID = req.body.username";
  var inputPW = "testPW"; // change to "inputPW = req.body.password";
  var bIsValidID = false;
  // Login
  sqlconn.query(selectQuery, function(err, rows, fields)
  {
    if(err) {console.log(err);}
    else
    {
      // check ID & PW for login
      for(var i in rows)
      {
        if(inputID == rows[i].username && inputPW == rows[i].userpassword) {bIsValidID = true;}
      }
      console.log(rows);
      // When Login Successed
      if(bIsValidID)
      {
        console.log('login success');
      }
      else  // Login Failed
      {
        console.log('login failure');
      }
    }
  });
  res.send('login page');
});

/** Register Page */
router.get('/register', function(req, res, next)  // GET register page
{
  //path.join(__dirname, '../public', 'index.html');
  res.send("register page");
});
router.post('/register', function(req, res, next) // POST register page
{
  var inputID = "testID"; // change to inputID = req.body.username;
  var inputPW = "testPW"; // change to inputPW = req.body.password;
  var selectQuery = 'SELECT * FROM test';
  var insertQuery = 'INSERT INTO test (username, userpassword) VALUES(?, ?)'; // This will be changed to real table name
  // checking if there's no same name user
  sqlconn.query(selectQuery, function(err, rows, fields)
  {
    var bIsUniqueID = true;
    for(var i in rows)
    {
      if(inputID == rows[i].username) {bIsUniqueID = false; break;}
    }
    // if there's no same user
    if(bIsUniqueID)
    {
      console.log('there is no same user');
      /*
      sqlconn.query(insertQuery, [inputID, inputPW], function(err, result, fields)
      {
        if(err) {console.log(err), res.status(500).send('Internal Server Error - Register');}
        else {}
      });
      */
    }
  });
});

/** Search & Result Page */
router.get('/search', function(req, res, next)  // GET search page
{
  //path.join(__dirname, '../public', 'index.html');
  res.send('search page');
});
router.post('/search', function(req, res, next) // POST search page
{
  /** Get submitted file */
  //var submittedFile = req.body.submitted;

  /** Send submitted file to models */

  /** Recieve and store result file */
  client.create({
    index: 'entity',
    type: 'review',
    id: '2',
    body: resultFile
  }, function(err, response, status)
  {
    if(err) {console.log('resultFile put error!'), console.log(err);}
    else
    {
      console.log('==Response==');
      console.log(response);
      console.log('==Status==');
      console.log(status);
    }
  });
   
  /** Search data thru elastic search */
  var searchData = 'mskim'; // change to searchData = req.query.searchData;
  const response = client.search({
    index: 'entity',
    q: `reviewID:${searchData}`
  });

  /** Show result data */
});

/** Python test *
router.get('/pythontest', function(req, res)
{
  // using spawn instead of exec, prefer a stream over a buffer
  // to avoid maxBuffer issue
  var spawn = require("child_process").spawn;
  var process = spawn('python', ['./compute_input.py']);
  var data = [100, 10, 100, 1000];
  var dataString = '';
  process.stdout.on('data', function(data){
    dataString += data.toString();
  });
  process.stdout.on('end', function(){
    console.log('Sum of numbers=', dataString);
  });
  process.stdin.write(JSON.stringify(data));
  process.stdin.end();
  res.send(data);
  console.log(process);
});
*/

/** undefined routing handling */
router.get('/*', function(req, res)
{
  res.send('This is undefined page');
});

module.exports = router;
