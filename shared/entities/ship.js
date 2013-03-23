if(typeof require === 'undefiend'){
  var require = function (){};
}
if(typeof exports == 'undefined'){
  var exports = this['Ship'] = {};
}

var Entity = require("./entity.js")
  , _ = require('underscore');

var Ship = Entity.extend({ });


exports = Ship;
