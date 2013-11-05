"use strict";

var rserving = require('../lib/rserving').load(__dirname);
// rio.enableDebug(true);
// rio.enableRecordMode(true, {fileName: 'dump.bin'});
// rio.enablePlaybackMode(true, {fileName: 'dump.bin'});
rserving.maxConnection = 17

function show (index, start_time) {
    return function(err, res) {
        console.log(err, index, (Date.now() - start_time)/1000);
    };
}

  rserving.on('in', function(count) {
    console.log('..........in now ' + count)
  })
  rserving.on('out', function(count) {
    console.log('..........out now ' + count)
  })  

var args = {
    prods: ["IBM", "YHOO", "MSFT"]
};

var i = -1;

var tasks = [];
while (++i < 100) {
  tasks.push({
    name: 'ex2',
    options: {
      entryPoint: "getOptimalPortfolio",
      data: args,      
      callback: show(i, Date.now())
    }
  });

}

// rserving.setOption({
//   host: '127.0.0.1',
//   port: 6311,
//   user: null
// });
// rserving.queue.push(tasks);
rserving.testMaxConnection()