/**
 * @server.js: eSia Server written in Node and Express
 * @author Dileep Basam 
 * @version 0.1
 */
var path = require('path'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	request = require('request');

//Enabling bodyParser module for parsing POST requests 
app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

//Setting directory to enable server find necessary files
app.use(express.static(path.join(__dirname, 'public')));

//Importing routes file and registering the routes
var routes = require('./routes/index.js');
app.use('/', routes);

//Catching any missed exceptions 
process.on('uncaughtException', function (err) {
    console.log(err);
}); 

//Starting the SERVER
app.listen(3000).timeout = 500000;  
console.log('Starting Server on port : 3000 ');


