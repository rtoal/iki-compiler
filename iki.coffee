#!/usr/bin/env coffee

argv = require 'yargs'
  .usage '$0 [-t] [-a] [-o] [-i] [--target [x86|c|js]] filename'
  .boolean ['t','a','o','i']
  .describe 't', 'show tokens after scanning then stop'
  .describe 'a', 'show abstract syntax tree after parsing then stop'
  .describe 'o', 'do optimizations'
  .describe 'i', 'generate and show the intermediate code then stop'
  .describe 'target', 'generate code for target language: x86, C, or JavaScript'
  .default {target:'js'}
  .demand(1)
  .argv

scan = require './scanner'
parse = require './parser'
generate = (require './generator')(argv.target)
error = require './error'

scan argv._[0], (tokens) ->
  return if error.count > 0
  if argv.t
    console.log t for t in tokens
    return
  program = parse tokens
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
