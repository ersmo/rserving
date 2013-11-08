"use strict";

var rserving = require('../lib/rserving').load(__dirname);
// rserving.rio.enableDebug(true);

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
while (++i < 20) {
  tasks.push({
    name: 'ex2',
    options: {
      entryPoint: "getOptimalPortfolio",
      data: args,      
      callback: show(i, Date.now())
    }
  });

}
rserving.maxConnection(16)

// rserving.setOption({
//   host: '192.168.6.5',
//   port: 6311
// });
rserving.queue.push(tasks);
// rserving.testMaxConnection(null, 40)