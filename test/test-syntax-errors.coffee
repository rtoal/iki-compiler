fs = require 'fs'
path = require 'path'
should = require 'should'
scan = require '../scanner'
parse = require '../parser'
error = require '../error'

error.quiet = true

TEST_DIR = 'test/data/syntax-errors'

describe 'The parser detects an error for', ->
  fs.readdirSync(TEST_DIR).forEach (name) ->
    check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
    it check, (done) ->
      scan path.join(TEST_DIR, name), (tokens) ->
        priorErrorCount = error.count
        parse tokens
        error.count.should.be.above priorErrorCount
        done()
