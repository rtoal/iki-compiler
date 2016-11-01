#!/usr/bin/env coffee

argv = require 'yargs'
  .usage '$0 [-a] [-o] [-i] [--target [x86|c|js]] filename'
  .boolean ['a','o','i']
  .describe 'a', 'show abstract syntax tree after parsing then stop'
  .describe 'o', 'do optimizations'
  .describe 'i', 'generate and show the intermediate code then stop'
  .describe 'target', 'generate code for x86, C, or JavaScript'
  .default {target: 'js'}
  .demand(1)
  .argv

fs = require 'fs'
parse = require './parser'
generate = (require './generator') argv.target
error = require './error'

fs.readFile argv._[0], 'utf-8', (err, text) ->
  program = parse text
  return if error.count > 0
  if argv.a
    console.log program.toString()
    return
  program.analyze()
  return if error.count > 0
  if argv.o
    program = program.optimize()
  if argv.i
    program.showSemanticGraph()
    return
  generate program
