
if(require){
  var Entity = require("./entity.js")
    , _ = require('underscore');
}

var Ship = Entity.extend({ 
   type: 'ship'
});


if(module){
 module.exports = Ship;
}
