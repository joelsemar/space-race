if(typeof require === 'undefiend'){
  var require = function (){};
}

if(typeof exports == 'undefined'){
    var exports = this['Entity'] = {};
}

var cls = require("../shared/lib/class.js")
  ,  Vector = require("../shared/lib/vector.js")
  , _ = require('underscore');


var Entity = cls.Class.extend({
    
    pos: new Vector(0, 0),
    vel: new Vector(0, 0),

    init: function(){
      this.id  = guid();
    },
    
    update: function(delta){
      if(this.vel.x && this.vel.y){
        this.pos.add(this.vel.mulNew(delta));
      }
    },

    draw: function(ctx){ },
});

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}


exports = Entity;

