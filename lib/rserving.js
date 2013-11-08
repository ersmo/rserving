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
  , watch = require('watch')
  , path = require('path')
  , basename = path.basename  
  , EventEmitter = require('events').EventEmitter
  , async = require('async')
  , rio_options = {}
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

exports.setOption = function(options) {
  if (!arguments.length) return rio_options;
  exports.merge(rio_options, options);
  return this;
};

exports.merge(exports, EventEmitter.prototype);

exports.connections = 0;

exports.middleware = {};

function commonLoad (dir) {
  if (!dir) return this;
  fs.readdirSync(dir).forEach(function(filename) {
    extend(filename, dir);
  });
  return this;
};

exports.load = smartLoad;

function extend (filename, dir) {
  var l_filename = filename.toLowerCase();
  if (!/\.r$/.test(l_filename)) return;
  var name = basename(l_filename, '.r');
  function load(){ return fs.readFileSync(path.join(dir, filename), 'utf8'); }
  exports.middleware.__defineGetter__(name, load);
  // exports.__defineGetter__(name, load);
}

function smartLoad (dir) {
  if (!dir) return this;
  commonLoad(dir);
  
  watch.createMonitor(dir, function (monitor) {

    monitor.on("created", function (f, stat) {
      // Handle new files
      if (!monitor.files[f]) {
        extend(f, dir);
      }
    })
    monitor.on("changed", function (f, curr, prev) {
      // Handle file changes
      extend(f, dir);
    })
    monitor.on("removed", function (f, stat) {
      // Handle removed files
      var l_filename = f.toLowerCase();
      if (!/\.r$/.test(l_filename)) return;
      var name = basename(l_filename, '.r');
      delete exports.middleware[name];
    })
  });
  return this;  
}

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
  options = exports.merge((options || {}), rio_options);
  if (exports.middleware[name]) {
    exports.evaluate(exports.middleware[name], options);
  } else{
    options.callback && options.callback(name + ' not found')
  };
};

exports.queue = async.queue(function(task, callback) {
  var cb = task.options.callback;
  task.options.callback = function(err, result) {
    cb(err, result);
    callback();
  };
  exports.run(task.name, task.options);
}, 15);

exports.maxConnection = function(x) {
  if (!arguments.length) return exports.queue.concurrency;
  exports.queue.concurrency = x;
  return this;  
};

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

function evaluateR (task, callback) {
  var cb = task.options.callback;
  task.options.callback = function(err, result) {
    cb(err, result);
    callback(false);
  };
  exports.merge(task.options, rio_options);
  rio.sourceAndEval(task.name, task.options);

}

var testMaxConnection = function(callback, number) {
  callback = callback || function() {
    console.log('Rserving maxConnection is ' + exports.queue.concurrency);
  };
  number = number || 30;
  var i = -1
    , ok = 0
    , no = 0
    , time = 0
    ;

  var args = {
      prods: ["IBM", "YHOO", "MSFT"]
  };

  var tasks = [];

  function show (index, start_time) {
    return function(err, res) {
      err ? no++ : ok++;
      time = (Date.now() - start_time)/1000
      console.log(err, index, time);
    };
  }

  while (++i < number) {
    tasks.push({
      name: '../test/ex2.R',
      options: {
        entryPoint: "getOptimalPortfolio",
        data: args,          
        callback: show(i, Date.now())
      }
    });

  }

  async.map(tasks, evaluateR, function() {
    console.log('ok is: ' + ok);
    console.log('no is: ' + no);
    exports.queue.concurrency = Math.floor(ok);
    callback(exports.queue.concurrency);
  });

};

// testMaxConnection();

exports.testMaxConnection = testMaxConnection;
