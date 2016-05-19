/**
 * @public/js/models/models.js: Backbone.js Models and Collections used in Front-End logic public/index.html
 * @author Dileep Basam 
 * @version 0.1
 */
// BackboneJS 1st Model definition for the main-table #allDocs in landingPage  
var Doc = Backbone.Model.extend({
    defaults : {
    "service": " ",
    "domain": " ",
    "Risk_Level": "",
    "Coverage_Whitehat": "",
    "Coverage_Pentest": "",
    "Site_Contact_Email": "",
    "url": "",
    "Site_Status": "",
    "platform_4m_hdr": "",
    "Last_Pentest_Date": "",
    "Coverage_Fortify": "",
    "Coverage_Cenzic": "",
    "ip": "",
    "platform_4m_nmap": "",
    "stack": " ",
    "Site_Size": "",
    "description": ""
  }
});
// BackboneJS Docs Collection definition and instantiation
var DocsCollection = Backbone.Collection.extend();
var docsCollection = new DocsCollection({ 
    model : Doc, 
});

//2nd Model for the table to display results table for a specific path or unixCommand 
// Model definition   
var Url = Backbone.Model.extend({
    defaults : {
    "url": "",
    "description": "",
    "bodyHtml" : "",
    "indexy" : ""
  }
});
 //Collection definition 
  var UrlsCollection = Backbone.Collection.extend();
  var urlsCollection = new UrlsCollection({
    model : Url
  });

//3rd model
//Script Model, Collections
 var Script = Backbone.Model.extend({
    defaults : {
    "name": "",
    "cmd" : ""
    }
});
 //Collection definition and Instantiating Collection
var ScriptsCollection = Backbone.Collection.extend();
var scriptsCollection  = new ScriptsCollection({model : Script});

//4th Model
//Backbone Model to submit a POST request on script upload 
var scriptInsert = Backbone.Model.extend({
    defaults: {
        name: '',
        cmd: ''
    },
    url: function() {
        return 'api/insert_new_cmd';
    }
});


//5th Model
//Backbone Model to submit a POST request on URL upload 
var URLInsert = Backbone.Model.extend({
    defaults: {
          ip: '',
          url: '',
          stack: ''
    },
    url: function() {
        return 'api/insert_new_url';
    }
});
