
var ViewPort = Entity.extend({
  type: 'viewport',
  speed: 800,

  pos: new Vector(0,0),
  vel: new Vector(0,0),
  scrollHitBoxWidth: 100,
  lastDebug: 0,
  size: new Vector($(document).width(), $(document).height()),

  update: function(){
    this.checkBounds();
   //  console.log('viewport at: ' + this.pos.x + ', ' + this.pos.y);
  },


  init: function(){
    this._super();
    var canvas = document.getElementById('mainCanvas');
    canvas.setAttribute('width', this.size.x);
    canvas.setAttribute('height', this.size.y);
    canvas.style.width = this.size.x + "px";
    canvas.style.height = this.size.y + "px";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.bottom = "0px";
    canvas.style.right = "0px";
    canvas.style.zIndex = "10";
    this.bindEvents(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    $(document).mousemove(function(event){
        if(Game.currentPlayer.isSelecting){
            return;
        }
        var mousePos = {x: event.pageX, y:event.pageY};
        this.vel.x = 0;
        this.vel.y = 0;
        if(mousePos.x < this.scrollHitBoxWidth){
           this.vel.add(new Vector(-1, 0));
        }
        if (mousePos.x > (this.size.x - this.scrollHitBoxWidth)){
           this.vel.add(new Vector(1, 0));
        }
        if (mousePos.y < this.scrollHitBoxWidth){
           this.vel.add(new Vector(0, -1));
        }
        if (mousePos.y > (this.size.y - this.scrollHitBoxWidth)){
           this.vel.add(new Vector(0, 1));
        }
        this.setVelocity(this.vel);

    }.bind(this));
  },

  update: function(delta){
     var spaceX = this.pos.x/30 * -1;
     var spaceY = this.pos.y/30 * -1;
     if(Math.abs(spaceX) > this.size.x){
       spaceX = 0;
     }
     if(Math.abs(spaceY) > this.size.y){
       spaceY = 0;
     }
     $(document.body).css({'background-position-x': spaceX, 'background-position-y': spaceY});

  },

  clear: function(){
    this.ctx.clear();
  },

  checkBounds: function(){
    if (this.pos.x <= 0){
      this.pos.x = 0;
    }
    if (this.pos.x > Game.world.size.x - this.size.x){
      this.pos.x = Game.world.size.x - this.size.x;
    }
    if (this.pos.y <= 0){
      this.pos.y = 0;
    }
    if (this.pos.y > Game.world.size.y - this.size.y){
      this.pos.y = Game.world.size.y - this.size.y;
    }
  },

  bindEvents: function(canvas){
    canvas.onmousedown = function(e){
      var coords = utils.getCoords(e);
      Game.currentPlayer.click(coords.x, coords.y);
    };

    canvas.onmousemove = function(e){
      if(!Game.currentPlayer.isSelecting){
        return;
      }
      var coords = utils.getCoords(e);
      Game.currentPlayer.updateSelect(coords.x, coords.y);
    };

    canvas.onmouseup = function(e){
       Game.currentPlayer.stopSelect();
    };
    canvas.onmouseout = function(){
       Game.currentPlayer.stopSelect();
       Game.viewport.vel.x = 0;
       Game.viewport.vel.y = 0;
    }

  },

});

var MiniMap = Entity.extend({
  size: new Vector(400, 400),
  init: function(){
    this._super();
    this.pos.x = Game.viewport.size.x - this.size.x - 80;
    this.pos.y = 20;
    this.xRatio = this.size.x / Game.world.size.x;
    this.yRatio = this.size.y / Game.world.size.y;
    this.constructCanvas();
  },

  constructCanvas: function(){
    canvas = document.getElementById('miniMapLayer');
    canvas.setAttribute('width', this.size.x);
    canvas.setAttribute('height', this.size.y);
    canvas.setAttribute('id', 'miniMapLayer');
    canvas.style.width = this.size.x + 'px';
    canvas.style.height = this.size.y + 'px';
    canvas.style.top = this.pos.y + 'px';
    canvas.style.left = this.pos.x + 'px';
    canvas.style.zIndex =  '100';
    canvas.style.position = 'fixed';
    $(canvas).click(function(e){
      var mm = Game.miniMap;
      var miniMapPosX = e.clientX - mm.pos.x;
      var miniMapPosY = e.clientY - mm.pos.y;
      miniMapPosX /= mm.xRatio;
      miniMapPosY /= mm.yRatio;
      Game.viewport.pos.x = miniMapPosX - Game.viewport.size.x/2;
      Game.viewport.pos.y = miniMapPosY - Game.viewport.size.y/2;
      Game.viewport.vel.x = 0;
      Game.viewport.vel.y = 0;
    });
    this.ctx = canvas.getContext('2d');
  },

  getViewPortCoords: function(){
     Game.viewport.checkBounds();
     return {pos: {x: Game.viewport.pos.x * this.xRatio, y: Game.viewport.pos.y * this.yRatio},
             size: {x: Game.viewport.size.x *  this.xRatio, y: Game.viewport.size.y * this.yRatio}}

  },

  draw: function(){
    var ctx = this.ctx;
    ctx.clear();
    var miniViewport = this.getViewPortCoords();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.size.x, this.size.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();
    ctx.rect(miniViewport.pos.x, miniViewport.pos.y, miniViewport.size.x, miniViewport.size.y);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    _.each(Game.entityManager.getEntitiesByType('island'), function(island){
        var pos = {x: island.pos.x * this.xRatio, y: island.pos.y * this.yRatio};
        if(island.player_id !== 'neutral'){
          ctx.fillStyle = Game.entityManager.entityById(island.player_id).color;
        }
        else{
          ctx.fillStyle = 'gray';
        }
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, island.radius / 10, 0, Math.PI *2);
        ctx.closePath();
        ctx.fill();
    }, this);
    _.each(Game.entityManager.getEntitiesByType('ship'), function(ship){
        var pos = {x: ship.pos.x * this.xRatio, y: ship.pos.y * this.yRatio};
        ctx.fillStyle = Game.entityManager.entityById(ship.player_id).color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 1, 0, Math.PI *2);
        ctx.closePath();
        ctx.fill();
    }, this);
    ctx.restore();

  }
});


