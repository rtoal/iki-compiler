fs = require 'fs'
path = require 'path'
should = require 'should'
scan = require '../scanner'
parse = require '../parser'
error = require '../error'

error.quiet = true

TEST_DIR = 'test/data/semantic-errors'

describe 'The analyzer detects an error for', () ->
  for name in fs.readdirSync TEST_DIR
    check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
    it check, (done) ->
      scan path.join(TEST_DIR, name), (tokens) ->
        priorErrorCount = error.count
        program = parse tokens
        error.count.should.equal priorErrorCount
        program.analyze()
        error.count.should.be.above priorErrorCount
        done()
