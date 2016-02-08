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
    try {
      var result = JSON.parse(data);

      /** @todo: validate format */
      done(null, result);
    } catch(Ex) {
      done(Ex);
    }
  }

  self.onConnected = function(client) {
    var self = this;
    self.emit('connected', client);

    client.on('data', function(data) {
      data = data.toString('utf8');
      debug.info('<<<', data);
      validateRequest(data, function(err, result) {
        if (!err && result) {
          self.emit('call', result);
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
  net.createServer(self.onConnected).listen(self.address);
  debug.info('Listening on ' + pipeName);
};

module.exports = Pipe;
