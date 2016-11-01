initialContext = require('../analyzer').initialContext
HashMap = require('hashmap').HashMap

class Program
  constructor: (@block) ->

  toString: ->
    "(Program #{@block})"

  analyze: ->
    @block.analyze initialContext()

  optimize: ->
    @block = @block.optimize()
    return this

  showSemanticGraph: ->
    tag = 0
    seenEntities = new HashMap()

    dump = (entity, tag) ->
      props = {}
      for key, tree of entity
        value = rep tree
        props[key] = value if value isnt undefined
      console.log "%d %s %j", tag, entity.constructor.name, props

    rep = (e) ->
      if /undefined|function/.test(typeof e)
        return undefined
      else if /number|string|boolean/.test(typeof e)
        return e
      else if Array.isArray e
        return e.map(rep)
      else
        if not seenEntities.has e
          seenEntities.set e, ++tag
          dump e, tag
        return seenEntities.get e

    dump this, 0

module.exports = Program
