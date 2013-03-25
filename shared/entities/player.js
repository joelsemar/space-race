if (require){
  var Entity = require('./entity.js');

}

var Player = Entity.extend({

   init: function(id, socket){
      this.id = guid();
      this.socket = socket;
   },

});

if(module){
    module.exports = Player;
}
