error = require '../error'

cache = {}

class Type

  constructor: (@name) ->
    cache[@name] = this

  @BOOL = new Type 'bool'
  @INT = new Type 'int'
  @ARBITRARY = new Type '<arbitrary_type>'

  toString: -> @name

  mustBeInteger: (message, location) ->
    @mustBeCompatibleWith Type.INT, message

  mustBeBoolean: (message, location) ->
    @mustBeCompatibleWith Type.BOOL, message

  mustBeCompatibleWith: (otherType, message, location) ->
    error(message, location) if not @isCompatibleWith(otherType)

  mustBeMutuallyCompatibleWith: (otherType, message, location) ->
    if not (@isCompatibleWith otherType or otherType.isCompatibleWith(this))
      error(message, location)

  isCompatibleWith: (otherType) ->
    # In more sophisticated languages, comapatibility would be more complex
    return this is otherType or this is Type.ARBITRARY or otherType is Type.ARBITRARY

module.exports =
  BOOL: Type.BOOL
  INT: Type.INT
  ARBITRARY: Type.ARBITRARY
  forName: (name) -> cache[name]
