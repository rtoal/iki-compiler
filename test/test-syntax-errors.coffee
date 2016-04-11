fs = require 'fs'
path = require 'path'
should = require 'should'
scan = require '../scanner'
parse = require '../parser'
error = require '../error'

error.quiet = true

TEST_DIR = 'test/data/syntax-errors'

testFileForErrors = (name) ->
  check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
  it check, (done) ->
    scan path.join(TEST_DIR, name), (tokens) ->
      priorErrorCount = error.count
      parse tokens
      error.count.should.be.above priorErrorCount
      done()

describe 'The parser detects an error for', ->
  for name in fs.readdirSync TEST_DIR
    testFileForErrors(name)