var initialContext = require('../analyzer').initialContext
var HashMap = require('hashmap').HashMap

function Program(block) {
  this.block = block
}

Program.prototype.toString = function () {
  return '(Program ' + this.block + ')' 
}

Program.prototype.analyze = function () {
  this.block.analyze(initialContext())
}

Program.prototype.optimize = function () {
  console.log('Optimization is not yet implemented')
  return this
}

Program.prototype.showSemanticGraph = function () {
  var tag = 0
  var seenEntities = new HashMap();

  function dump(e, tag) {
    var props = {}
    for (var p in e) {
      var value = rep(e[p])
      if (value !== undefined) props[p] = value
    }
    console.log("%d %s %j", tag, e.constructor.name, props)
  }

  function rep(e) {
    if (/undefined|function/.test(typeof e)) {
      return undefined
    } else if (/number|string|boolean/.test(typeof e)) {
      return e
    } else if (Array.isArray(e)) {
      return e.map(rep)
    } else if (e.kind) {
      return e.lexeme
    } else {
      if (!seenEntities.has(e)) {
        seenEntities.set(e, ++tag)
        dump(e, tag)
      }
      return seenEntities.get(e)
    }
  }

  dump(this, 0)
}

module.exports = Program
