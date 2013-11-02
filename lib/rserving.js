/*
 * rserving
 * https://github.com/ersmo/rserving
 *
 * Copyright (c) 2013 fanlia
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs')
  , rio = require('rio')
  , path = require('path')
  , basename = path.basename  
  , EventEmitter = require('events').EventEmitter
  , async = require('async')
  ;

exports.awesome = function() {
  return 'awesome';
};

exports.rio = rio;

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

exports.merge(exports, EventEmitter.prototype);

exports.connections = 0;

exports.middleware = {};

exports.load = function(dir) {
  if (!dir) return this;
  fs.readdirSync(dir).forEach(function(filename){
    var l_filename = filename.toLowerCase();
    if (!/\.r$/.test(l_filename)) return;
    var name = basename(l_filename, '.r');
    function load(){ return fs.readFileSync(path.join(dir, filename), 'utf8'); }
    exports.middleware.__defineGetter__(name, load);
    // exports.__defineGetter__(name, load);
  });
  return this;
};

exports.evaluate = function(source, options) {
  options = options || {};
  var cmd;
  cmd = source.replace(/(\r\n)/g, "\n");
  if (options.entryPoint) {
      cmd += "\n" + options.entryPoint + "(";
      if (options.data) {
          cmd += "'" + JSON.stringify(options.data) + "')";
      } else {
          cmd += ")";
      }
  }
  exports.connections++;
  exports.emit('in', exports.connections);
  var callback = options.callback;
  options.callback = function(err, result) {
    exports.connections--;
    exports.emit('out', exports.connections);
    callback(err, result);
  };
  rio.evaluate(cmd, options);  
};

exports.add = function(name, source) {
  exports.middleware[name] = source;
};

exports.del = function(name) {
  delete exports.middleware[name];
};

exports.run = function(name, options) {
  options = options || {};
  if (exports.middleware[name]) {
    exports.evaluate(exports.middleware[name], options);
  } else{
    options.callback && options.callback(name + ' not found')
  };
};

exports.maxConnection = 15;

var getMaxConnection = function() {
  return exports.maxConnection;
};

exports.queue = async.queue(function(task, callback) {
  var cb = task.options.callback;
  task.options.callback = function(err, result) {
    cb(err, result);
    callback();
  };
  exports.run(task.name, task.options);
}, getMaxConnection());

exports.express = function(req, res, next) {
  var options = req.rserving_options;
  var task = {
    name: options.name,
    options: {
        entryPoint: options.entryPoint,
        data: options.data,
        callback: function(err, result) {
          console.log(err)
          if (err) return res.json(500, err);
          req.rserving_data = JSON.parse(result);
          next()
        }
    }
  };
  exports.queue.push(task);
};