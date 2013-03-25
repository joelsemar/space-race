var World = BaseWorld.extend({

  fps: 30,
  islandImageSrc: 'img/island.png',
  planeImageSrc: 'img/plane.png',
  init: function(){
     this._super();
     this.islandImage = new Image();
     this.islandImage.src = this.islandImageSrc;
     
  },
  receiveServerUpdate: function(data){
    this.islands = [];
    _.each(data.islands, function(island){
       var localIsland = this.entityManager.entityById(island.id);
       if(localIsland){
         localIsland.loadFromData(island);
       }
       else{
          new Island(island);
       }
    },this);
    //this.ships = data.ships;
    this.size = data.size;
    this.players = data.players;
  },

});


var currentWorld;
var DrawLoop = Class.extend({


  init: function(world){
    this.world = world;  
    window.requestAnimationFrame =  window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  },

  run: function(){
   requestAnimationFrame(this.draw.bind(this));
  },

  draw: function(){
    this.world.ctx.clear();
    this.world.entityManager.drawEntities();
    requestAnimationFrame(this.draw.bind(this));
  },
 
});

var ViewPort = Entity.extend({
  type: 'viewport',

  pos: new Vector(0,0),
  vel: new Vector(0,0),
  scrollSpeed: 1,
  scrollHitBoxWidth: 300,
  lastDebug: 0,
  size: new Vector($(document).width(), $(document).height()),

  update: function(delta){
    this._super(delta);
    if (this.pos.x <= 0){
      this.pos.x = 0;
      this.stop();
    }
    if (this.pos.x > currentWorld.size.x - this.size.x){
      this.pos.x = currentWorld.size.x - this.size.x;
      this.stop();
    }
    if (this.pos.y <= 0){
      this.pos.y = 0;
      this.stop();
    }
    if (this.pos.y > currentWorld.size.y - this.size.y){
      this.pos.y = currentWorld.size.y - this.size.y;
      this.stop();
    }
   //  console.log('viewport at: ' + this.pos.x + ', ' + this.pos.y);
  }, 
  init: function(world){
    world.viewport = this;
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
    canvas.style.zIndex = "10000";
    world.ctx = canvas.getContext('2d');
    $(document).mousemove(function(event){
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
        this.vel.normalize().mul(this.scrollSpeed);
        
    }.bind(this));
  },
  
});


$(function(){
  currentWorld = new World();
  new ViewPort(currentWorld);
  new MiniMap(currentWorld);
  currentWorld.run();
  new DrawLoop(currentWorld).run();
  this.socket = io.connect();
  this.socket.on('world_update', function(data){
    currentWorld.receiveServerUpdate(data);
  });
});

var MiniMap = Entity.extend({
  size: new Vector(400, 400),
  init: function(world){
    this.world = world;
    this._super();
    this.pos.x = this.world.viewport.size.x - this.size.x - 80;
    this.pos.y = 20;
    this.xRatio = this.size.x / this.world.size.x;
    this.yRatio = this.size.y / this.world.size.y;
  },

  getViewPortCoords: function(){
     return {pos: {x:this.world.viewport.pos.x * this.xRatio, y: this.world.viewport.pos.y * this.yRatio}, 
             size: {x: this.world.viewport.size.x *  this.xRatio, y: this.world.viewport.size.y * this.yRatio}}
   
  },
   
  draw: function(){
    var ctx = this.world.ctx;
    var miniViewport = this.getViewPortCoords();
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.closePath();
    ctx.rect(this.pos.x + miniViewport.pos.x, this.pos.y + miniViewport.pos.y, miniViewport.size.x, miniViewport.size.y);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    _.each(this.world.entityManager.getEntitiesByType('island'), function(island){
        var pos = {x: island.pos.x * this.xRatio, y: island.pos.y * this.yRatio};
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(this.pos.x + pos.x, this.pos.y + pos.y, island.radius / 10, 0, Math.PI *2);
        ctx.closePath();
        ctx.fill();
    }, this);
    ctx.restore();

  }
});



