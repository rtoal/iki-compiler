fs = require 'fs'
path = require 'path'
should = require 'should'
ohm = require 'ohm-js'

TEST_DIR = 'test/data/syntax-errors'

describe 'The parser detects a syntax error for', ->
  grammar = ohm.grammar(fs.readFileSync('./iki.ohm'));
  fs.readdirSync(TEST_DIR).forEach (name) ->
    it name, (done) ->
      program = fs.readFileSync(path.join(TEST_DIR, name)).toString()
      grammar.match(program).succeeded().should.be.false()
      done()
