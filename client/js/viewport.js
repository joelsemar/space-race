
var ViewPort = Entity.extend({
  type: 'viewport',
  speed: 800,

  pos: new Vector(0,0),
  vel: new Vector(0,0),
  scrollHitBoxWidth: 100,
  lastDebug: 0,
  size: new Vector($(document).width(), $(document).height()),
  cachedIslands: [],

  update: function(){
    this.checkBounds();
   //  console.log('viewport at: ' + this.pos.x + ', ' + this.pos.y);
  },


  init: function(obj){
    this._super(obj);
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
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bindEvents();
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

  getOffset: function(pos){
    return new Vector(Math.round(pos.x - this.pos.x), Math.round(pos.y - this.pos.y))
  },


  drawDebug: function(){
    var ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.font = '12px';
    ctx.strokeText(this.pos.print(), 15, 15)
    if(this.currMousePos){
      ctx.strokeText(this.currMousePos.print(), this.currMousePos.x - 5, this.currMousePos.y - 5)
      ctx.strokeStyle = 'yellow';
      ctx.strokeText(Math.round(this.pos.x + this.currMousePos.x) + ', ' + Math.round(this.pos.y + this.currMousePos.y), this.currMousePos.x + 15, this.currMousePos.y + 15)
    }
    ctx.restore();

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

  bindEvents: function(){
    this.canvas.onmousedown = function(e){
      var coords = utils.getCoords(e);
      Game.currentPlayer.click(coords.x, coords.y);
    };

    this.canvas.onmousemove = function(e){
      var coords = utils.getCoords(e);
      Game.viewport.currMousePos = new Vector(coords.x, coords.y);
      if(!Game.currentPlayer.isSelecting){
        return;
      }
      Game.currentPlayer.updateSelect(coords.x, coords.y);
    };

    this.canvas.onmouseup = function(e){
      Game.currentPlayer.stopSelect();
    };
    this.canvas.onmouseout = function(){
      Game.currentPlayer.stopSelect();
    }

    $(document).mousemove(function(event){
        var mousePos = {x: event.pageX, y:event.pageY};

        this.vel.x = 0;
        this.vel.y = 0;
        if(Game.currentPlayer.isSelecting || event.shiftKey){
            return;
        }
        if(mousePos.x < this.scrollHitBoxWidth && this.pos.x > 0){
           this.vel.add(new Vector(-1, 0));
        }
        if (mousePos.x > (this.size.x - this.scrollHitBoxWidth) && this.pos.x < (Game.world.size.x - this.size.x)){
           this.vel.add(new Vector(1, 0));
        }
        if (mousePos.y < this.scrollHitBoxWidth && this.pos.y > 0){
           this.vel.add(new Vector(0, -1));
        }
        if (mousePos.y > (this.size.y - this.scrollHitBoxWidth) && this.pos.y < (Game.world.size.y - this.size.y)){
           this.vel.add(new Vector(0, 1));
        }
        this.setVelocity(this.vel);

    }.bind(this));
  },
});



