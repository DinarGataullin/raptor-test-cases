var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient;


MongoClient.connect("mongodb://localhost:27017/esi_db", function(err, database) {
	if(err) throw err;
	db = database;
});

var prepareQuery = function(kwd){
    var query = {'$or': [
                {'stack' : {'$regex' : kwd, '$options' : 'i'}},
                {'url' : {'$regex' : kwd, '$options' : 'i'}},
                {'platform_4m_hdr' : {'$regex': kwd, '$options' : 'i'}},
                {'platform_4m_nmap' : {'$regex': kwd, '$options' : 'i'}},
                {'ip' : {'$regex': kwd}},
                {'service' : {'$regex' : kwd}}]};
    //console.log(query);
    return query;
}

module.exports = {

api: function (req, res){
  res.json({ message : 'Welcome to ESI 2.0 API',
      '/api/data' : 'Get all Documents',
      '/api/data/<keyword>' : 'To selectively retrieve documents containing a Keyword',
      '/api/data/<keyword>/urls' : 'To Get URLs of all matching Documents',
      '/api/get_all_cmds' : 'Get list of all commands stored in eSia database'

  });
},

allData: function (req,res){

    db.collection('esi_co', function(err, collection){
      var options = {'sort': {'stack' : -1}};
      collection.find({}, {'id':0}, options).toArray(function(err, data){
        if(err) throw err;
        res.json(data);
      })
    })

},

 keywordSearch: function(req, res){
     var kwd = req.params.keywd;
     kwd = kwd.replace(/slashz/g,'/');
     var kwdUpper = kwd.charAt(0).toUpperCase() + kwd.slice(1);
     var query = prepareQuery(kwd);

         var projection = {'_id' : 0};
         db.collection('esi_co').find(query, projection).toArray(function(err, docs){
             if(err) throw err;
             if(docs){
               res.json(docs);
             }
          });
 },

 keywordSearchReturnUrl: function(req, res){
         var kwd = req.params.keywd;
         kwd = kwd.replace(/slashz/g,'/');
         var kwdUpper = kwd.charAt(0).toUpperCase() + kwd.slice(1);
         var query = prepareQuery(kwd);

         var projection = {'_id' : 0, 'url' : 1};
         db.collection('esi_co').find(query, projection).toArray(function(err, docs){
                 if(err) throw err;
                 if(docs){
                        res.json(docs);
                 }
         });
 },

 keywordSearchUrlExec: function(req, res){

         //Extracting GET parameters and query string values
         var kwd = req.params.keywd;
         var exec_path = req.query.path;
         var lookFor = req.query.look_for;
         var startIndex = parseInt(req.query.current_index);
         var stopIndex = startIndex+parseInt(req.query.page_size);
         var newDocs = [];
         var resultsDocs = [];
         var arrURLS = [];
         //Mongo query
         var kwdUpper = kwd.charAt(0).toUpperCase() + kwd.slice(1);
         var query = prepareQuery(kwd);

         var projection = {'_id' : 0, 'url' : 1};
         //regex pattern for allowing asterik
         var regexPattern = new RegExp(lookFor.replace(/\*/g,'\\*'));
         var stringMatched;
         //decoding the encoded strings
         exec_path = exec_path.replace(/amperznd/g,'&');
         kwd = kwd.replace(/slashz/g,'/');
         // Sending database query and processing results
         db.collection('esi_co').find(query, projection).toArray(function(err, docs){
                 if(err) throw err;
                 if(docs){

                     // boundary checking for pagination indices i.e. startIndex and stopIndex
                     if(startIndex < 0 || startIndex >= docs.length){
                         res.status(404).end('Resource unavailable....You are either already on the first page or last page of results!!');
                     }
                     //Wrapping around when stopIndex going beyond the arrayLength
                     if(stopIndex > docs.length){
                         stopIndex = docs.length;
                     }
                     //code for expanding the array to include https and http
                     docs.slice(startIndex,stopIndex).forEach(function(doc){
                         newDocs.push('http://'+doc['url']+'/'+exec_path);
                         newDocs.push('https://'+doc['url']+'/'+exec_path);
                    });
                     //Recursive function to hit all URLs populated
                     var getURL = function (arrDocs) {
                         var doc = arrDocs.shift();
                         var obj = new Object();
                         var regexpForUrl = new RegExp('.*//(.*?)/');
                         var domain = doc.match(regexpForUrl)[1];
                         var docsArray = Object.keys(docs).map(function(k){return docs[k]['url']});
                         var chkBoxId = docsArray.indexOf(domain);
                         //Making request for each URL to be processed
                         request({
                             uri: doc,
                             timeout: 2000,
                             followRedirect: true,
                             maxRedirects: 10,
                             strictSSL : false
                                 }, function (error, response, body) {
                                     //Logic for parsing received response and populating jsonObject 'obj' for client-response
                                     if (!error && response.statusCode == 200) {
                                         if(body){
                                             if(body.match(regexPattern)){
                                                 obj['url'] = doc;
                                                 obj['description'] = '<xmp>'+body.match(regexPattern)[0].substring(0,200)+ '</xmp>';
                                                 var cheerio = require('cheerio'),
                                                 $ = cheerio.load(body.toString());
                                                 obj['bodyHtml']=$('body').text();//.substring(0,2000);
                                                 obj['indexy']=chkBoxId;
                                                 resultsDocs.push(obj);
                                             }else{
                                                 obj['url'] = doc;
                                                 obj['description'] = 'No match seen in Response body!';
                                                 obj['bodyHtml']='';
                                                 obj['indexy']=chkBoxId;
                                                 if(response && response.headers && response.headers[lookFor]){
                                                     obj['description'] += '<br/>From Resp. Headers --> '+lookFor+' : '+response.headers[lookFor];
                                                 }
                                                 resultsDocs.push(obj);
                                             }
                                         }else{
                                             obj['url'] = doc;
                                             obj['description'] = 'No Response body seen from server';
                                             obj['bodyHtml']='';
                                             obj['indexy']=chkBoxId;
                                             resultsDocs.push(obj);
                                         }
                                     }else if(response){
                                             obj['url'] = doc;
                                             obj['description'] = 'Seeing reponse code : '+response.statusCode;
                                             if(response.headers[lookFor]){
                                                  obj['description'] += '<br/>From Resp. Headers --> '+lookFor+' : '+response.headers[lookFor];
                                             }
                                             obj['bodyHtml']='';
                                             obj['indexy']=chkBoxId;
                                             resultsDocs.push(obj);
                                     }else{
                                         obj['url'] = doc;
                                         obj['description'] = 'No response body/headers seen';
                                         obj['bodyHtml']='';
                                         obj['indexy']=chkBoxId;
                                         resultsDocs.push(obj);
                                      }


                                     if(arrDocs.length == 0){
                                         res.json(resultsDocs);
                                     }else{
                                         console.log('.');
                                         //Recursion
                                         getURL(arrDocs);
                                       }
                                     });

                         }//end of getURL
                     }//end of if(docs)
                //seeding the array arrURLS as a replica of newDocs to pass on to the recursive function
                 arrURLS = newDocs.slice(0);
                 //calling function with recursion once
                 getURL(arrURLS);

             });
 },


 executeCommandWithFilterOnKeyword: function(req, res){

         var kwd = req.params.keywd;
         var lookFor = req.params.look_for;
         var regexPattern = new RegExp(lookFor.replace(/\*/g,'\\*'));
         var cmdName = req.params.cmd_Name;
         var prefixEnableFlag = req.params.prefixEnable;
         var cmdObject;
         var cmdFull;
         //Logic for fetching matching unix commands stored in MongoDB based on user provided CMD keyword
         db.collection('unixCmds').find({'name' : cmdName},{'_id' : 0, 'cmd' : 1}).toArray(function(err, cmdObject){
             cmdFull = cmdObject[0]['cmd'];
            });
         //deciphering the user selected URLs to run the command
         var indexListString = req.query.index_list;
         var indexList = indexListString.split('-');
         var newDocs = [];
         var resultsDocs = [];
         var arrURLS = [];
         kwd = kwd.replace(/slashz/g,'/');
         // Mongo query for matching URLs
         var kwdUpper = kwd.charAt(0).toUpperCase() + kwd.slice(1);
         var query = prepareQuery(kwd);

         var projection = {'_id' : 0, 'url' : 1};

         db.collection('esi_co').find(query, projection).toArray(function(err, docs){
             if(err) throw err;
             if(docs){
                 //requiring sys and child_process packages for running Unix Commands
                 var sys = require('sys')
                 var exec = require('child_process').exec;
                 var index;
                 //Checking to see if user requested HTTP/S prefix
                 if(parseInt(prefixEnableFlag)){
                     indexList.forEach(function(index){
                     newDocs.push('http://'+docs[index]['url']);
                     newDocs.push('https://'+docs[index]['url']);
                 });
                 }else{
                     indexList.forEach(function(index){
                     newDocs.push(docs[index]['url']);
                 });
                 }
                 //Recurisve function for executing unix command selected
                 var execURL = function (arrDocs) {
                     var cmdTemp = cmdFull;
                     var doc = arrDocs.shift();
                     var obj = new Object();
                     var regexpForUrl = new RegExp('.*//(.*)');
                     var domain;
                     var docsArray;
                     var chkBoxId;
                     var child;
                     var str;
                     if(parseInt(prefixEnableFlag)){
                         domain = doc.match(regexpForUrl)[1];

                     }else{
                         domain = doc;
                     }
                     docsArray = Object.keys(docs).map(function(k){return docs[k]['url']});
                     chkBoxId = docsArray.indexOf(domain);
                     cmdTemp = cmdTemp.replace(/#url#/g, doc);
                     child = exec(cmdTemp, function (error, stdout, stderr) {
                     str = 'Command: \n'+cmdTemp;
                     str= str+'\n Output: \n'+stdout;
                     str= str+'Error: \n'+stderr;
                     str = str.replace(/'/g, '_');
                     str = str.replace(/(?:\r\n|\r|\n)/g, '<br/>');
                     obj['url'] = doc;
                     if(str.match(regexPattern)){
                         obj['description'] = '<xmp>'+str.match(regexPattern)[0].substring(0,200)+ '</xmp>';
                     }else{
                         obj['description'] = 'No match seen!';
                     }
                     obj['bodyHtml']=str;
                     obj['indexy']=chkBoxId;
                     resultsDocs.push(obj);
                     /*if (error !== null) {
                         console.log('exec error: ' + error);
                         }*/
                     if(arrDocs.length == 0){
                         //console.log(resultsDocs);
                         res.json(resultsDocs);
                     }else{
                         console.log('.');
                         //Recursion
                         execURL(arrDocs);
                     }
                     });
                 }
                 //seeding the array arrURLS as a replica of newDocs to pass on to the recursive function
                 arrURLS = newDocs.slice(0);
                 //calling function execURL with recursion for the first time
                 execURL(arrURLS);

             }
         });
 },

 insertNewCommand: function(req, res){
         var name = req.body.name;
         var cmd = req.body.cmd;
         db.collection('unixCmds').update(
             {'name' : name},
             {'$set' : {'cmd' : cmd}},
             { 'upsert' : true}
             );
         return res.json({"msg":"Success"});

         return true;
  },

  fetchAllCommands: function(req, res){
          var arrCmds = [];
          var query = {};
          var projection = {  '_id' : 0,
                              'name' : 1,
                              'cmd' : 1
          };
          var options = {'sort': {'name' : -1}};
          db.collection('unixCmds').find(query, projection, options).toArray(function(err, cmds){
                  if(err) throw err;
                  res.json(cmds);
          });

  },

  insertNewUrl: function(req, res){
          var ip = req.body.ip;
          var url = req.body.url;
          var stack = req.body.stack;

          db.collection('esi_co').update(
              {'ip' : ip},
                 {'$set' : {
                              'url' : url,
                              'platform_4m_nmap' : '',
                              'platform_4m_hdr'  : '',
                              'stack' : stack
                          }
                  },
              { 'upsert' : true }
              );
          return res.json({"msg":"Upsert URL Success"});

          return true;
    }


}
