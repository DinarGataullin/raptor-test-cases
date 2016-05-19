/**
 * @routes/index.js: Server-Side Application logic besides handling Routes in Node.js
 * @author Dileep Basam
 * @version 0.1
 */
var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient;
    processor = require('../processor/index.js');
    discovery = require('./discovery.js');

//Logging a message on any incoming request
router.use(function(req,res,next){
    console.log('Incoming.. !!');
    next();
});

//Routes to handle incoming GET and POST requests
//Route for root folder /
router.get('/', function(req,res) {
  res.sendfile('index.html');
});

//Route for /api
router.get('/api', processor.api);
//Route for all extracting all DOCS stored in mongoDB
router.route('/api/data').get(processor.allData);

//kwd.charAt(0).toUpperCase() + kwd.slice(1)
//Route for getting those DOCS Matching a supplied keyword
router.route('/api/data/:keywd').get(processor.keywordSearch);

//Route for retreiving URLs-Only from DOCS matching Keyword
router.route('/api/docs/:keywd/urls').get(processor.keywordSearchReturnUrl);
//Route for executing a path append operation against selected URLs
router.route('/api/docs/:keywd/urls_exec').get(processor.keywordSearchUrlExec);


//route for handling GET request with unixCommandName, keyWord and http/s preference
router.route('/api/docs/:keywd/exec/:cmd_Name/:look_for/:prefixEnable').get(processor.executeCommandWithFilterOnKeyword);

//Route for accepting POST requests and mongoQuery to insert new Unix commands in to MongoDB
router.route('/api/insert_new_cmd').post(processor.insertNewCommand);

//Route for getting all stored unixcommands and sending the list of names for populating the Dropdown in the UI
router.route('/api/get_all_cmds').get(processor.fetchAllCommands);

//Route for enabling insert new or update rows manually in to MongoDB - pending UI
router.route('/api/insert_new_url').post(processor.insertNewUrl);

//Route for performing discvoery on set subnets - pending UI ( window.stop() in UI is mandatory to avoid repeated requests )
router.route('/api/run_discovery/:subnet').get(discovery.hostDiscovery);

module.exports = router;
