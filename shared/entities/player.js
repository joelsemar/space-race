if (require){
  var Entity = require('./entity.js'),
      utils = require('../lib/utils.js');

}

var Player = Entity.extend({

   init: function(id, socket){
      this.id = utils.guid();
      this.socket = socket;
   },

});

if(module){
    module.exports = Player;
}
