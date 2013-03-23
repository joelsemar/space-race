
if(typeof require === 'undefiend'){
  var require = function (){};
}
if(typeof exports == 'undefined'){
  var exports = this['Island'] = {};
}

var Entity = require("./entity.js")
  , _ = require('underscore');

var Island = Entity.extend({ 
  
  init: function(islandData){
    this.x = islandData.x;
    this.y = islandData.y;
    this.radius = islandData.radius;
  }

});


exports = Island;

