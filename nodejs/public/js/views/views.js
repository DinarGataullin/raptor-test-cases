/**
 * @public/js/views/views.js: Backbone.js Views for Models and Collections defined in models.js file 
 * @author Dileep Basam 
 * @version 0.1
 */
//Views for 1st model - Doc
// Creating Model View
  var DocView = Backbone.View.extend({
    tagName : 'tr',
    render : function(){
    this.$el.append(this.template(this.model.toJSON()));
    return this;
  },
    template : _.template('<td>' + '<%= url %>' + '</td><td>' + '<%= ip %>' + '</td><td>' + '<%= platform_4m_hdr %>'  + '</td><td>' + '<%= stack %>' + '</td><td>'+'<%= platform_4m_nmap %>'  + '</td>')
    //Alternative (full-esi-view) template
     //template : _.template('<td>' + '<%= url %>' + '</td><td>' + '<%= ip %>' + '</td><td>' + '<%= platform_4m_hdr %>'  + '</td><td>' + '<%= platform_4m_nmap %>' + '</td><td>' + '<%= stack %>' + '</td>' +'<td>' + '<%= service %>' + '</td><td>' + '<%= Last_Pentest_Date %>' + '</td><td>' + '<%= Risk_Level %>'  + '</td><td>' + '<%= Site_Contact_Email %>' + '</td><td>' + '<%= Coverage_Whitehat %>' + '</td>'+'<td>' + '<%= Coverage_Fortify %>' + '</td><td>' + '<%= Coverage_Cenzic %>' + '</td><td>' + '<%= Site_Status %>'  + '</td><td>' + '<%= description %>' + '</td>')
   
  });
 // Creating Collection View for Docs
  var DocsView = Backbone.View.extend({
  tagName: 'tbody', 
  initialize : function(){
      this.collection.on('reset', this.addAll, this);
      },
  render : function(){
              this.$el.html('');
               this.addAll();
      },
  addOne : function(doc){
      var docView = new DocView({ model : doc});
      docView.render();
      this.$el.append(docView.el);
      },
  addAll: function(){
    this.collection.forEach(this.addOne, this);
    }
  });
 //Instantiating the collection view 
 var docsView = new DocsView({
 collection : docsCollection
  });


  //Views for 2nd model - Url
  // Creating Model View
  var UrlView = Backbone.View.extend({
      tagName : 'tr',
      className: 'resultsRow',
      render : function(){
      this.$el.append(this.template(this.model.toJSON()));
  return this;
  },
   // old template : _.template('<td>' + '<%= url %>' +  '</td><td>' + '<%= description %>' + '</td>')
      template : _.template('<td>' + '<%= url %>' +  '</td><td>' + '<%= description %>' + '</td><td>' + "<iframe class = 'if' srcdoc= '<!DOCTYPE html><head><body>"+ '<%= bodyHtml %>'.replace(/'/g,'"') + "</body></head>'>"+'</iframe>' + '</td><td><input type="checkbox"</td><td>'+ '<%= indexy %>' +  '</td>')  
  });
 
 // Creating Collection View 
  var UrlsView = Backbone.View.extend({
      tagName: 'tbody', 
      initialize : function(){
            this.collection.on('reset', this.addAll, this);
},
      render : function(){
            this.$el.html('');
            this.addAll();
},
      addOne : function(doc){
            var urlView = new UrlView({ model : doc});
            urlView.render();
            this.$el.append(urlView.el);
            
      },
      addAll: function(){
            this.collection.forEach(this.addOne, this);
}
});
//Instantiating the collection view 
 var urlsView = new UrlsView({
  collection : urlsCollection
  });
  
 
 
//Views for 3rd model - 
//1st View on scripts Model and Collection
  var ScriptNameView = Backbone.View.extend({
    tagName : 'span',
      render : function(){
        this.$el.append(this.template(this.model.toJSON()));
  return this;
  },
      template : _.template('<option value="'+'<%= name %>'+'">'+ '<%= name %>' +'</option>')  
  });
 
 // Creating scriptNames Collection View 
  var ScriptNamesView = Backbone.View.extend({
      tagName : 'span',
      initialize : function(){
            this.collection.on('reset', this.addAll, this);
},
      render : function(){
            this.$el.html('');
            this.addAll();
            $('#dpdown').html(this.$el.html());
},
      addOne : function(script){
            var scriptNameView = new ScriptNameView({ model : script});
            scriptNameView.render();
            this.$el.append(scriptNameView.el);
            
      },
      addAll: function(){
            this.collection.forEach(this.addOne, this);
}
});
//Instantiating the collection view 
 var scriptNamesView = new ScriptNamesView({
  collection : scriptsCollection
  });


 //2nd View on scripts Model and Collection
 // Creating scriptName Model View
  var ScriptFullView = Backbone.View.extend({
    tagName : 'tr',
      render : function(){
        this.$el.append(this.template(this.model.toJSON()));
  return this;
  },
      template : _.template('<td>' + '<%= name %>' +  '</td><td>' + '<%= cmd %>' + '</td>')  
  });
 
 // Creating scriptNames Collection View 
  var ScriptsFullView = Backbone.View.extend({
      tagName : 'tbody',
      initialize : function(){
            this.collection.on('reset', this.addAll, this);
      },
      render : function(){
            this.$el.html('');
            this.addAll();
      },
      addOne : function(script){
            var scriptFullView = new ScriptFullView({ model : script});
            scriptFullView.render();
            this.$el.append(scriptFullView.el);
            
      },
      addAll: function(){
            this.collection.forEach(this.addOne, this);
      }
});
//Instantiating the collection view 
 var scriptsFullView = new ScriptsFullView({
  collection : scriptsCollection
  });