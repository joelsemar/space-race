
var UIElement = Entity.extend({
  type: 'UIElement',
  zIndex: '100',

  click: function(e){},
  mousemove: function(e){},

  constructCanvas: function(){
    var canvas = document.getElementById(this.canvasId);
    canvas.setAttribute('width', this.size.x);
    canvas.setAttribute('height', this.size.y);
    canvas.style.width = this.size.x + 'px';
    canvas.style.height = this.size.y + 'px';
    canvas.style.top = this.pos.y + 'px';
    canvas.style.left = this.pos.x + 'px';
    canvas.style.zIndex =  this.zIndex;
    canvas.style.position = 'fixed';

    $(canvas).click(function(e){
      this.click(e);
    }.bind(this));

    $(canvas).mousemove(function(e){
     this.mousemove(e)
    }.bind(this));

    $(canvas).mouseout(function(e){
      this.islnadMousedOver = false;
    }.bind(this));

    this.ctx = canvas.getContext('2d');
  },
});


var MiniMap = UIElement.extend({
  size: new Vector(250, 250),
  canvasId: 'miniMapLayer',
  radiusRatio: 10,
  islandMousedOver: false,
  cachedIslandPos: [],
  onInit: function(){
    this.pos.x = Game.viewport.size.x - this.size.x - 80;
    this.pos.y = 20;
    this.xRatio = this.size.x / Game.world.size.x;
    this.yRatio = this.size.y / Game.world.size.y;
    this.constructCanvas();
  },

  translate: function(v){
    return {
      x: v.x - this.pos.x,
      y: v.y - this.pos.y,
    };
  },

  scale: function(v){
    return {
      x: v.x * this.xRatio,
      y: v.y * this.yRatio,
    }
  },

  click: function(e){
      var mm = Game.miniMap;
      var miniMapPosX = e.clientX - mm.pos.x;
      var miniMapPosY = e.clientY - mm.pos.y;
      if(this.islandMousedOver && Game.getCurrentPlayer().selectedIslands.length){
        Game.getCurrentPlayer().attack(Game.entityManager.entityById(this.islandMousedOver.id));
        return;
      }
      miniMapPosX /= mm.xRatio;
      miniMapPosY /= mm.yRatio;
      Game.viewport.pos.x = miniMapPosX - Game.viewport.size.x/2;
      Game.viewport.pos.y = miniMapPosY - Game.viewport.size.y/2;
      Game.viewport.vel.x = 0;
      Game.viewport.vel.y = 0;
   },

  mousemove: function(e){
    var pos = new Vector(e.clientX - this.pos.x, e.clientY - this.pos.y);
    this.islandMousedOver = false;

    if(!this.cachedIslandPos.length){
        this.getCachedIslandPos();
    }

    _.each(this.cachedIslandPos, function(island){
        if(pos.distanceTo(island.center) < island.radius){
            this.islandMousedOver = island;
        }
    }, this);
  },


  getCachedIslandPos: function(){
    var allIslands = Game.entityManager.entitiesByType('island');
    this.cachedIslandPos = _.map(allIslands, function(island){
      var center = this.scale(island.pos), 
          radius = island.radius/this.radiusRatio;
      center.x += radius;
      center.y += radius;
      return {center: center, radius: radius, id: island.id }
    }, this);
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
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    ctx.save();

    _.each(Game.entityManager.entitiesByType('island'), function(island){
        var pos = {x: island.pos.x * this.xRatio, y: island.pos.y * this.yRatio};
        var radius = island.radius / this.radiusRatio;
        if(island.player_id !== 'neutral'){
          ctx.fillStyle = Game.entityManager.entityById(island.player_id).color;
        }
        else{
          ctx.fillStyle = 'gray';
        }
        ctx.beginPath();
        ctx.arc(pos.x + radius, pos.y + radius, radius, 0, Math.PI *2);
        ctx.fill();
        if(island.selected && island.player_id === Game.getCurrentPlayer().id){
          ctx.strokeStyle = Game.getCurrentPlayer().color;
          ctx.arc(pos.x + radius, pos.y + radius, radius + 2, 0, Math.PI *2);
          ctx.stroke();
        }
    }, this);

    _.each(Game.entityManager.entitiesByType('ship'), function(ship){
        var pos = {x: ship.pos.x * this.xRatio + this.scale(ship.size).x/2, y: ship.pos.y * this.yRatio + this.scale(ship.size).y/2};
        ctx.fillStyle = Game.entityManager.entityById(ship.player_id).color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI *2);
        ctx.closePath();
        ctx.fill();
    }, this);

    if(this.islandMousedOver){
        this.drawCrossHairs(ctx, this.islandMousedOver.center, this.islandMousedOver.radius + 2);
    }
    ctx.restore();

  },

  drawCrossHairs: function(ctx, pos, radius){
      var length = 3
      ctx.save();
      ctx.strokeStyle = Game.getCurrentPlayer().color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
      ctx.moveTo(pos.x - radius - length, pos.y);
      ctx.lineTo(pos.x - radius, pos.y);

      ctx.moveTo(pos.x, pos.y - radius - length)
      ctx.lineTo(pos.x, pos.y - radius)

      ctx.moveTo(pos.x + radius, pos.y);
      ctx.lineTo(pos.x + radius + length, pos.y);

      ctx.moveTo(pos.x, pos.y + radius)
      ctx.lineTo(pos.x, pos.y + radius + length)

      ctx.stroke();
      ctx.restore();

  },
  drawDebug: function(){},
});

var ScoreBoard = UIElement.extend({
    type: 'UIElement',
    canvasId: 'scoreboardLayer',

    onInit: function(){
      this.pos = {x: 20, y: 20};
      this.size = {x: 200, y: 200};
      this.constructCanvas();
    },

    draw: function(){
      var ctx = this.ctx;
      ctx.clear();
      ctx.save();
      ctx.font = '18px Helvetica';
      ctx.lineWidth = 1;
    
      var players = Game.world.players.sort(function(a, b){ return b.resourcesGathered - a.resourcesGathered});
      
      _.each(players, function(player, index){
        index += 1;
        var text = player.id + ' -- ' + player.resourcesGathered;
        ctx.strokeStyle = player.color;
        ctx.fillStyle = player.color;
        ctx.fillText(text, 0, (index * 30));
        
      }, this);
      ctx.restore();

    },

  
});
