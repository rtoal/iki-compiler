fs = require 'fs'
assert = require 'assert'
parse = require '../parser'

TEST_DIR = 'test/data/semantic-errors'

describe 'The analyzer detects an error for', () ->
  fs.readdirSync(TEST_DIR).forEach (name) ->
    check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
    it check, (done) ->
      program = parse(fs.readFileSync("#{TEST_DIR}/#{name}", "utf-8"))
      assert.throws(() => program.analyze());
      done()
