fs = require 'fs'
path = require 'path'
should = require 'should'
scan = require '../scanner'
parse = require '../parser'
error = require '../error'

TEST_DIR = 'test/data/good-programs'

describe 'The compiler', ->
  for name in fs.readdirSync TEST_DIR
    it "should compile #{name} without errors", (done) ->
      scan path.join(TEST_DIR, name), (tokens) ->
        priorErrorCount = error.count
        parse(tokens).analyze()
        error.count.should.eql(priorErrorCount)
        done()
