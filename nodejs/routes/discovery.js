var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient;


module.exports = {

      hostDiscovery: function(req, res){
          var subnetArr = req.params.subnet;
          console.log(subnetArr);
          var resultsArr = [];// To be moved inside discoverSubnet function based on decision of UPSERT for each record vs. the whole array
          var discoverSubnet = function(ip){

                  var obj = new Object();
                  //var ip = subnetArr+'.'+'161'+'.'+'133';

                  require('dns').reverse(ip, function(err, domains) {
                      if(err) {
                          //console.log(err.toString());
                          //return;
                      }
                      if(domains && domains[0].indexOf('ebay') > -1){
                          //console.log(domains);
                          //Making request for each URL to be processed
                          request({
                              uri: 'http://'+domains[0],
                              timeout: 500,
                              followRedirect: true,
                              maxRedirects: 10,
                              strictSSL : false
                                  }, function (error, response, body) {
                                      //console.log('Retrieving response headers for : '+ip+'/'+domains[0]);
                                      //Logic for parsing received response and populating jsonObject 'obj' for client-response
                                      if(response){
                                              obj['url'] = domains[0];
                                              obj['ip'] = ip;
                                              obj['platform_4m_hdr']='';
                                              obj['platform_4m_nmap']='';
                                              obj['stack']='';
                                              if(response.headers['server']){
                                                   obj['platform_4m_hdr'] += response.headers['server'];
                                              }
                                              if(response.headers['x-powered-by']){
                                                   obj['stack'] += ', '+response.headers['x-powered-by']+',';
                                              }
                                              if(response.headers['x-generated-by']){
                                                  obj['stack'] += response.headers['x-generated-by'];
                                              }
                                              var sys = require('sys')
                                              var exec = require('child_process').exec;
                                              var octets = ip.split('.');
                                              var cmd = '/usr/local/bin/nmap -sV -F -T4 '+ip;
                                              var regexpCmd= new RegExp('.*open *(.*)');
                                              child = exec(cmd, function (error, stdout, stderr) {
                                                  var str= stdout;
                                                  if(str.match(regexpCmd)){
                                                  obj['platform_4m_nmap']=str.match(regexpCmd)[1].split(' ').slice(1,-1).join(' ').trim();
                                                  }
                                                  resultsArr.push(obj);
                                                  console.dir(obj);
                                                  /*if (error !== null) {
                                                      console.log('exec error: ' + error);
                                                      }*/

                                                  MongoClient.connect('mongodb://localhost:27017/esi_db', function(err, db){
                                                  if(err) throw err;
                                                  if(!(obj['stack']=='' && obj['platform_4m_nmap']=='' && obj['platform_4m_hdr']=='')){
                                                      db.collection('esi_co').update(
                                                          {'ip' : ip},
                                                          {'$set' : {
                                                                      'url' : obj['url'],
                                                                      'platform_4m_nmap' : obj['platform_4m_nmap'],
                                                                      'platform_4m_hdr'  : obj['platform_4m_hdr'],
                                                                      'stack' : obj['stack']

                                                                    }},
                                                          { 'upsert' : true }
                                                      );
                                                  }
                                                  db.close();
                                                  //Recursion
                                                  ip = getNextIPAdress(ip);
                                                  discoverSubnet(ip);
                                                  });
                                              });
                                      }else{
                                          console.log('No response seen');
                                          ip = getNextIPAdress(ip);
                                          discoverSubnet(ip);
                                      }
                                  });
                      }else{
                          ip = getNextIPAdress(ip);
                          discoverSubnet(ip);
                      }
                  });
          }
          var getNextIPAdress = function(ip){
              console.log(ip);
              var octets = ip.split('.');
                          if (parseInt(octets[3])<255){
                              octets[3]=parseInt(octets[3])+1;
                          }else if (parseInt(octets[3])==255){
                              octets[3]='1';
                              octets[2]=parseInt(octets[2])+1;
                          }else if (parseInt(octets[2])==255){
                              res.send('200.. OK');
                          }
                          ip = octets.join('.');

              return ip;
          }

          //call recursive function discoverSubnet for the first time
          discoverSubnet(subnetArr+'.1.1');

      //window.stop() code on front-end to stop further requests


      //upserting the mongoDB asynchronously

      }



}
