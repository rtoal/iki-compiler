![Iki image](http://i.imgur.com/JRTmR2A.png)

This is a compiler for the little programming language called Iki. The compiler is a Node command line application. It’s intended to be useful for people teaching or learning about compiler writing &mdash; at least the front-end parts, since the backends are pretty trivial. Scanning and parsing are done with the help of the Ohm library.

## The Compiler

```
iki.js [-a] [-o] [-i] [--target [x86|c|js]] filename

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  -a         show abstract syntax tree after parsing then stop         [boolean]
  -o         do optimizations                                          [boolean]
  -i         generate and show the intermediate code then stop         [boolean]
  --target   generate code for x86, C, or JavaScript             [default: "js"]
```

## The Language

Iki is a very simple language; there are no functions; all variables are global. It’s statically typed, at least. Here’s a simple Iki program:

```
-- Not hello, world
var x: int;

x = 9 - 305 * 5; -- wow, assignment
while false or 1 == x loop
    write -x, x / 3;
    read x;
end;
```

A full language description is in the file `grammar/iki.ohm`.

## Examples

We have some sample Iki programs in the `docs/examples` directory. Here’s _simple.iki_:

```
-- Not hello, world
var x: int;
while false or x <= 10 loop  -- something to optimize
  x = x + 1;
  write x, x * x;  -- oooh squares
end;
```

You can generate the abstract syntax tree with `-a`:

```
$ ./iki.js -a docs/examples/simple.iki
Program {
  block: Block {
    statements: [
      VariableDeclaration { id: 'x', type: Type { name: 'int' } },
      WhileStatement {
        condition: BinaryExpression {
          op: 'or',
          left: BooleanLiteral { value: false },
          right: BinaryExpression {
            op: '<=',
            left: VariableExpression { name: 'x' },
            right: IntegerLiteral { value: '10' }
          }
        },
        body: Block {
          statements: [
            AssignmentStatement {
              target: VariableExpression { name: 'x' },
              source: BinaryExpression {
                op: '+',
                left: VariableExpression { name: 'x' },
                right: IntegerLiteral { value: '1' }
              }
            },
            WriteStatement {
              expressions: [
                VariableExpression { name: 'x' },
                BinaryExpression {
                  op: '*',
                  left: VariableExpression { name: 'x' },
                  right: VariableExpression { name: 'x' }
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

And the semantic graph with `-i`:

```
$ ./iki.js -i docs/examples/simple.iki
Program {
  block: Block {
    statements: [
      VariableDeclaration { id: 'x', type: Type { name: 'int' } },
      WhileStatement {
        condition: BinaryExpression {
          op: 'or',
          left: BooleanLiteral { value: false, type: Type { name: 'bool' } },
          right: BinaryExpression {
            op: '<=',
            left: VariableExpression {
              name: 'x',
              referent: VariableDeclaration {
                id: 'x',
                type: Type { name: 'int' }
              },
              type: Type { name: 'int' }
            },
            right: IntegerLiteral { value: '10', type: Type { name: 'int' } },
            type: Type { name: 'bool' }
          },
          type: Type { name: 'bool' }
        },
        body: Block {
          statements: [
            AssignmentStatement {
              target: VariableExpression {
                name: 'x',
                referent: VariableDeclaration {
                  id: 'x',
                  type: Type { name: 'int' }
                },
                type: Type { name: 'int' }
              },
              source: BinaryExpression {
                op: '+',
                left: VariableExpression {
                  name: 'x',
                  referent: VariableDeclaration {
                    id: 'x',
                    type: Type { name: 'int' }
                  },
                  type: Type { name: 'int' }
                },
                right: IntegerLiteral {
                  value: '1',
                  type: Type { name: 'int' }
                },
                type: Type { name: 'int' }
              }
            },
            WriteStatement {
              expressions: [
                VariableExpression {
                  name: 'x',
                  referent: VariableDeclaration {
                    id: 'x',
                    type: Type { name: 'int' }
                  },
                  type: Type { name: 'int' }
                },
                BinaryExpression {
                  op: '*',
                  left: VariableExpression {
                    name: 'x',
                    referent: VariableDeclaration {
                      id: 'x',
                      type: Type { name: 'int' }
                    },
                    type: Type { name: 'int' }
                  },
                  right: VariableExpression {
                    name: 'x',
                    referent: VariableDeclaration {
                      id: 'x',
                      type: Type { name: 'int' }
                    },
                    type: Type { name: 'int' }
                  },
                  type: Type { name: 'int' }
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

To translate the program to JavaScript, use `--target=js` or no `--target` option at all:

```
$ ./iki.js docs/examples/simple.iki
(function () {
  let x_1 = 0;
  while ((false || (x_1 <= 10))) {
    x_1 = (x_1 + 1);
    console.log(x_1);
    console.log((x_1 * x_1));
  }
}());
```

You can translate to C with `--target=c`:

```
$ ./iki.js --target=c docs/examples/simple.iki
#include <stdio.h>
#include <stdbool.h>
int main() {
    int x_1 = 0;
    while ((false || (x_1 <= 10))) {
        x_1 = (x_1 + 1);
        printf("%d\n", x_1);
        printf("%d\n", (x_1 * x_1));
    }
    return 0;
}
```

The `-o` option optimizes:

And to x86 assembly with `--target=x86`. As of now, the generated assembly language only works on a Mac. Is your favorite platform missing? Implement it and send a pull request!

```
$ ./iki.js -o --target=x86 docs/examples/simple.iki
	.globl	_main
	.text
_main:
	push	%rbp
L1:
	movq	_x_1(%rip), %rax
	cmp	$10, %rax
	setle	%al
	movsbq	%al, %rax
	cmpq	$0, %rax
	je	L2
	movq	_x_1(%rip), %rax
	addq	$1, %rax
	mov	%rax, _x_1(%rip)
	mov	_x_1(%rip), %rsi
	lea	WRITE(%rip), %rdi
	xor	%rax, %rax
	call	_printf
	movq	_x_1(%rip), %rax
	imulq	_x_1(%rip), %rax
	mov	%rax, %rsi
	lea	WRITE(%rip), %rdi
	xor	%rax, %rax
	call	_printf
	jmp	L1
L2:
	pop	%rbp
	ret
	.data
READ:
	.ascii	"%d\0\0"
WRITE:
	.ascii	"%d\n\0"
_x_1:
	.quad	0
```

## For Developers

This is a pretty standard node.js application.

After cloning the repo, you should do the usual:

```
npm install
npm test
```

and you’re good to go.
