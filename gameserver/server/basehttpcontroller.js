
const callMap =  {
    "GET": 'read',
    "POST": 'create',
    "PUT": 'update',
    "DELETE": 'delete'
};

class BaseHttpController {

    constructor(server){
        this.server = server;
    }

    get notAllowed() {
        return {status: 405}
    }
    success(msg) {
        return {status: 200, msg: msg}
    }

    request(req, res){
      var method = callMap[req.method]
      res.set('Content-Type', 'application/json');


      this[method](req,  (response) => {
            if(typeof response === 'object'){
                res.statusCode = response.status || 200;
                res.send(JSON.stringify(response, undefined, 2));
            }
            res.end()
      });

    }


    create (req, onComplete){
        onComplete(this.notAllowed);
    }
    read (req, onComplete){
        onComplete(this.notAllowed);
    }
    update (req, onComplete){
        onComplete(this.notAllowed);
    }
    delete (req, onComplete){
        onComplete(this.notAllowed);
    }

}

class AliveController extends BaseHttpController{
    read (req, onComplete){
        onComplete(this.success(this.server.prefix + " is alive at " + new Date()));
    }

}


module.exports = {BaseHttpController: BaseHttpController, AliveController: AliveController};
