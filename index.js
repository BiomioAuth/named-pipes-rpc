var net = require('net');
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var debug = {
  debug: require('debug')('named-pipes-rpc:debug'),
  info: require('debug')('named-pipes-rpc:info'),
  log: require('debug')('named-pipes-rpc:log'),
  error: require('debug')('named-pipes-rpc:error')
};

util.inherits(Pipe, EventEmitter);

function Pipe() {
  var self = this;
  EventEmitter.call(self);
  self.address = '\\\\?\\pipe\\';

  function validateRequest(data, done) {
    /*
     {"method": "run_auth", "params": "user@email.com", "id": 1}
     */
    try {
      var obj = JSON.parse(data);

      /* validate format */
      if (typeof obj !== 'object' || !obj.method) {
        var error = "Request must be an object and has an attribute 'method'";
        debug.error(error);
        done(error);
      } else {
        done(null, obj);
      }
    } catch(Ex) {
      debug.error(Ex);
      done(Ex);
    }
  }

  self.onConnected = function(client) {
    self.emit('connected', client);

    client.on('data', function(data) {
      data = data.toString('utf8');
      debug.info('<<<', data);
      validateRequest(data, function(err, req) {
        if (!err && req) {
          self.emit('call', req);
        } else {
          debug.error(err);
        }
      });
    });
  }

};

Pipe.prototype.listen = function(pipeName) {
  var self = this;
  if(!pipeName) {
    throw new Error('Name of pipe is required!');
  }

  self.address = self.address + pipeName;
  self.server = net.createServer(self.onConnected);
  self.server.listen(self.address);

  self.server.on('error', function(e) {

    // reconnect if pipe is used
    if (e.code == 'EADDRINUSE') {
      debug.error('Address in use, retrying...');
      setTimeout(function() {
        self.server.close();
        self.server.listen(self.address);
      }, 1000);
    }
  });

  debug.info('Listening on ' + pipeName);
};

module.exports = Pipe;
