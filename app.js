// It's an Iki Compiler for node.js

var scan = require('./scanner');
var parse = require('./parser');

var DEBUG = true

// TODO pass file to parse as a command line parameter
scan('test/01.iki', function (tokens) {
  if (DEBUG) tokens.forEach(function (t) {console.log(t)})
  parse(tokens, function (program) {
     if (DEBUG) console.log(program.toString())
     program.analyze();
  })
})
