"use strict";


var routing = {

  callMap: {
    "GET": 'read',
    "POST": 'create',
    "PUT": 'update',
    "DELETE": 'delete',
  },

  bindRoutes: function(routes, server){
    for(var route in routes){
      server.all(route, function(_route){
        return function(req, res){
          res.set('Content-Type', 'application/json');
          var controller = routes[_route];
          var method = routing.callMap[req.method]
          if(!controller.hasOwnProperty(method)){
            res.send("METHOD NOT ALLOWED");
            return;
          }

            controller[method](req, routing.getResponse(), function(response){
                res.statusCode = response.status || 200;
                res.send(JSON.stringify(response, undefined, 2));
                res.end()
          });
        }
      }(route));
    }
  },

  getResponse: function(){
    return {
      success: true,
      data: {},
      error: ""
    };
  },

};

module.exports = routing;
