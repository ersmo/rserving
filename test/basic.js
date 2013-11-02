"use strict";

var rserving = require('../lib/rserving').load(__dirname);
// rio.enableDebug(true);
// rio.enableRecordMode(true, {fileName: 'dump.bin'});
// rio.enablePlaybackMode(true, {fileName: 'dump.bin'});
rserving.maxConnection = 17
// rserving.testMaxConnection(20, function(i) {
//   console.log('Rserve MaxConnection is ' + i)
// });
function show (index, start_time) {
    return function(err, res) {
        console.log(err, index, (Date.now() - start_time)/1000);
    };
}

  // rserving.on('in', function(count) {
  //   console.log('..........in now ' + count)
  // })
  rserving.on('out', function(count) {
    console.log('..........out now ' + count)
  })  

var i = -1;

var tasks = [];
while (++i < 50) {
  tasks.push({
    name: 'ex1',
    options: {
      callback: show(i, Date.now())
    }
  });

}

rserving.queue.push(tasks);