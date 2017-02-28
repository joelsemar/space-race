if(require){
   var Class = require("./class.js")
    , _ = require('underscore');
}

var utils = {


  getCoords: function(e, canvas){
    var canvas = canvas || Game.viewport.canvas;
    if (e.offsetX) {
      // Works in Chrome / Safari (except on iPad/iPhone)
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
    else if (e.layerX) {
      // Works in Firefox
      return {
        x: e.layerX,
        y: e.layerY
      };
    }
    else {
      // Works in Safari on iPad/iPhone
      try {
        return {
          x: e.pageX - canvas.offsetLeft,
          y: e.pageY - canvas.offsetTop
        };
      }
      catch (e) {
        alert(e)
      }
    }
  },

  valueInRange: function(value, min, max){
      return value >= min && value <=max;
  },

  parseQueryString: function(){
    var vars = {}, values
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
       values =  hashes[i].split('=');

       vars[values[0]] = values[1];
    }
    return vars;

  },

  rectsIntersect: function(rectA, rectB){
      xOverlap = this.valueInRange(rectA.left(), rectB.left(), rectB.right()) ||
                 this.valueInRange(rectB.left(), rectA.left(), rectA.right());
      yOverlap = this.valueInRange(rectA.top(), rectB.top(), rectB.bottom()) ||
                 this.valueInRange(rectB.top(), rectA.top(), rectA.bottom());
      return xOverlap && yOverlap;
  },

   pointInRect: function(point, rect){
      if(point.x > rect.pos.x && point.x < rect.pos.x + rect.size.x && point.y > rect.pos.y && point.y < rect.pos.y + rect.size.y){
        return true;
      }

   },
   s4: function() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)},

   guid: function() {
    var s4 = this.s4;
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
   },

   capitalize: function(s){
    return s.charAt(0).toUpperCase() + s.slice(1);
   }


}

if(module){
    module.exports = utils;
}
