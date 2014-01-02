#!/usr/bin/env node

var argv = require('optimist')
  .usage('$0 [-t] [-a] [-o] [-s] [--target x86|c|js] filename')
  .boolean(['t','a','o','s'])
  .describe('t', 'dump tokens after scanning')
  .describe('a', 'dump abstract syntax tree after parsing')
  .describe('o', 'do optimizations')
  .describe('s', 'show semantic graph')
  .describe('target', 'select target language: x86, c, or js')
  .default({target:'js'})
  .check(function (argv) {return /^(x86|c|js)$/.test(argv.target)})
  .demand(1)
  .argv

var scan = require('./scanner');
var parse = require('./parser');
var generate = require('./generators/' + argv.target + 'generator')

scan(argv._[0], function (tokens) {
  if (argv.t) tokens.forEach(function (t) {console.log(t)})
  var program = parse(tokens)
  if (argv.a) console.log(program.toString())
  if (argv.o) program.optimize()
  program.analyze();
  generate(program);
})
