class AnalysisContext {
  constructor(parent) {
    this.parent = parent;
    this.symbolTable = Object.create(null);
  }
  createChildContext() {
    return new AnalysisContext(this);
  }
  variableMustNotBeAlreadyDeclared(name) {
    if (this.symbolTable[name]) {
      throw `Variable ${name} already declared`;
    }
  }
  addVariable(name, entity) {
    this.symbolTable[name] = entity;
  }
  lookupVariable(name) {
    const variable = this.symbolTable[name];
    if (variable) {
      return variable;
    } else if (!this.parent) {
      throw `Variable ${name} not found`;
    }
    return this.parent.lookupVariable(name);
  }
}

exports.initialContext = () => new AnalysisContext(null);
