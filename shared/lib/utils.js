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
          x: e.pageX - canvas.offsetLeft - offset/2,
          y: e.pageY - canvas.offsetTop
        };
      }
      catch (e) {
        alert(e)
      }
    }
  },

  rectsIntersect: function(rectA, rectB){
    //rect being a loosely defined type that has at least a size and pos vector (like Entity)
    var rectBPoints = rectB.points();
    for(var i=0;i<rectBPoints.length;i++){
      if (this.pointInRect(rectBPoints[i], rectA)){
         return true;
      }
    }
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
   },

}

if(module){
    module.exports = utils;
}
