This is a compiler for the little programming language called Iki. The compiler is a node.js app.  It is very much under development.

## Usage

```
iki.js [-t] [-a] [-o] [-s] [--target [js|c|x86]] filename

  -t dumps the tokens after scanning
  -a dumps the abstract syntax tree after parsing
  -o does optimizations
  -s dumps the semantic graph
  --target selects the output format
```

## Grammar

Iki programs are free-format.  Comments start with `--` and extend to the end of the line.  The predefined tokens are `Intlit`, a sequence of one or more decimal digits, and `Id`, a sequence of Basic Latin letters, decimal digits, and underscores, beginning with a letter.

```
Program -> Block
Block   -> (Stmt ';')+
Stmt    -> var Id ':' Type
        |  Id = Exp
        |  read Id (',' Id)*
        |  write Exp (',' Exp)*
        |  while Exp loop Block end
Type    -> int | bool
Exp     -> Exp1 ('or' Exp1)*
Exp1    -> Exp2 ('and' Exp2)*
Exp2    -> Exp3 (('<' | '<=' | '==' | '!=' | '>=' | '>') Exp3)?
Exp3    -> Exp4 ([+-] Exp4)*
Exp4    -> Exp5 ([*/] Exp5)*
Exp5    -> ('not' | '-')? Exp6
Exp6    -> 'true' | 'false' | Intlit | Id | '(' Exp ')'
```
