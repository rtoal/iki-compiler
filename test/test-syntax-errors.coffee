fs = require 'fs'
should = require 'should'
ohm = require 'ohm-js'

TEST_DIR = 'test/data/syntax-errors'

describe 'The parser detects a syntax error for', ->
  grammar = ohm.grammar(fs.readFileSync('./iki.ohm'))
  fs.readdirSync(TEST_DIR).forEach (name) ->
    check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
    it check, (done) ->
      sourceCode = fs.readFileSync("#{TEST_DIR}/#{name}", "utf-8")
      grammar.match(sourceCode).succeeded().should.be.false()
      done()
