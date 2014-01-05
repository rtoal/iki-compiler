#!/usr/bin/env node

var argv = require('optimist')
  .usage('$0 [-t] [-a] [-o] [-i] [--target x86|c|js] filename')
  .boolean(['t','a','o','i'])
  .describe('t', 'dump tokens after scanning then stop')
  .describe('a', 'dump abstract syntax tree after parsing then stop')
  .describe('o', 'do optimizations')
  .describe('i', 'generate and show the intermediate code then stop')
  .describe('target', 'generate code for target language: x86, C, or JavaScript')
  .default({target:'js'})
  .check(function (argv) {return /^(x86|c|js)$/.test(argv.target)})
  .demand(1)
  .argv

var scan = require('./scanner');
var parse = require('./parser');
var generate = require('./generators/' + argv.target + 'generator')

scan(argv._[0], function (tokens) {
  if (argv.t) {
    tokens.forEach(function (t) {console.log(t)})
    return
  }
  var program = parse(tokens)
  if (argv.a) {
    console.log(program.toString())
    return
  }
  if (argv.o) {
    program.optimize()
  }
  program.analyze()
  if (argv.i) {
    program.showSemanticGraph()
    return
  }
  generate(program)
})
