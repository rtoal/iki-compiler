fs = require 'fs'
parse = require '../parser'

TEST_DIR = 'test/data/good-programs'

describe 'The compiler', ->
  fs.readdirSync(TEST_DIR).forEach (name) ->
    it "should compile #{name} without errors", (done) ->
      program = parse(fs.readFileSync("#{TEST_DIR}/#{name}", "utf-8"))
      program.analyze()
      done()
