# rserving [![Build Status](https://secure.travis-ci.org/ersmo/rserving.png?branch=master)](http://travis-ci.org/ersmo/rserving)

enhance and simplify interacing with rserve

## NPM
[![NPM](https://nodei.co/npm/rserving.png)](https://nodei.co/npm/rserving/)
[![NPM](https://nodei.co/npm-dl/rserving.png?months=1)](https://nodei.co/npm/rserving/)

## Getting Started
Install the module with: `npm install rserving`

```javascript
var rserving = require('rserving').load(r_dir); // r_dir: directory for *.R files

```

## Documentation

- rserving.maxConnection

```javascript
  rserving.maxConnection() // get current maxConnection, default is 15

```

```javascript
  rserving.maxConnection(16) // set maxConnection, you need to test the max connection first

```

- rserving.testMaxConnection(callback, num)

```javascript
  rserving.testMaxConnection(function (result) {
    console.log('Rserve maxConnection is ' + result);
  }, 30)

```

- rserving.express

```javascript
  var express = require('express');
  
  var three = rserving.express
  
  var four = function(req, res, next) {
    var args = {};
  
    args.prods = ["IBM", "YHOO", "MSFT"];
  
    req.rserving_options = {
      name: 'ex2',
      entryPoint: 'getOptimalPortfolio',
      data: args
    };
    next()
  };
  
  var five = function(req, res, next) {
    res.json(req.rserving_data);
  };  
  
  var app = express();
  app.use(four, three, five);

```

## Examples
```javascript

var task = {
    name: 'ex2',
    options: {
      entryPoint: "getOptimalPortfolio",
      data: args,      
      callback: show(i, Date.now())
    }
  };
  
rserving.maxConnection(16); // set/get maxConnection to Rserve

rserving.setOption({
  host: 'x.x.x.x', // default: 'localhost'
  port: 6311, //default: 6311
});

rserving.on('in', function(count) {
  console.log('..........in now ' + count)
})
rserving.on('out', function(count) {
  console.log('..........out now ' + count)
})  

rserving.queue.push(task);
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2013 fanlia  
Licensed under the MIT license.
