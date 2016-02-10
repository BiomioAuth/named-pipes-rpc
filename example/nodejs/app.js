var Pipe = require('../../');

var server = new Pipe();

var pipeName = 'biomio-pipe';
server.listen(pipeName);

server.on('connected', function(client) {
  console.log('<<<connected');

  server.on('call', function(req) {
    console.log('<<<call', req);

    switch(req.method) {
      case "run_auth":
        console.info('run_auth');
        /* perform RPC call: run_auth */

        /* return answer */
        var answer = JSON.stringify({"result": "true", "id": 1});
        client.write(answer);
        client.end();

        break;
      default:
        console.error('unhandled method!');
    }
  });

});
