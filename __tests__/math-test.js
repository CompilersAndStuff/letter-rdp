module.exports = test => {
//   // Addition:
//   // left: 2
//   // right: 2
  test(`2 + 2;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '+',
          left: {
            type: 'NumericLiteral',
            value: 2,
          },
          right: {
            type: 'NumericLiteral',
            value: 2,
          },
        },
      },
    ],
  });

//   // Nested binary expressions:
//   // left: 3 + 2
//   // right: 2
  test(`3 + 2 - 2;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'BinaryExpression',
            operator: '+',
            left: {
              type: 'NumericLiteral',
              value: 3,
            },
            right: {
              type: 'NumericLiteral',
              value: 2,
            },
          },
          right: {
            type: 'NumericLiteral',
            value: 2,
          },
        },
      },
    ],
  });

  test(`2 * 2;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '*',
          left: {
            type: 'NumericLiteral',
            value: 2,
          },
          right: {
            type: 'NumericLiteral',
            value: 2,
          },
        },
      },
    ],
  });

  test(`2 * 2 * 2;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '*',
          left: {
            type: 'BinaryExpression',
            operator: '*',
            left: {
              type: 'NumericLiteral',
              value: 2,
            },
            right: {
              type: 'NumericLiteral',
              value: 2,
            },
          },
          right: {
            type: 'NumericLiteral',
            value: 2,
          },
        },
      },
    ],
  });

//   // Precedence of operations:
  test(`2 + 2 * 2;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '+',
          left: {
            type: 'NumericLiteral',
            value: 2,
          },
          right: {
            type: 'BinaryExpression',
            operator: '*',
            left: {
              type: 'NumericLiteral',
              value: 2,
            },
            right: {
              type: 'NumericLiteral',
              value: 2,
            },
          },
        },
      },
    ],
  });

//   // Precedence of operations:
  test(`(2 + 2) * 2;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '*',
          left: {
            type: 'BinaryExpression',
            operator: '+',
            left: {
              type: 'NumericLiteral',
              value: 2,
            },
            right: {
              type: 'NumericLiteral',
              value: 2,
            },
          },
          right: {
            type: 'NumericLiteral',
            value: 2,
          },
        },
      },
    ],
  });

  test(`1 + 2 * 3 - 4;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'BinaryExpression',
            operator: '+',
            left: {
              type: 'NumericLiteral',
              value: 1
            },
            right: {
              type: 'BinaryExpression',
              operator: '*',
              left: {
                type: 'NumericLiteral',
                value: 2
              },
              right: {
                type: 'NumericLiteral',
                value: 3
              }
            }
          },
          right: {
            type: 'NumericLiteral',
            value: 4
          }
        }
      }
    ]
  })

};


 // EXPRESSION { type: '(', value: '(' }
 //    ADDITTIVE { type: '(', value: '(' }
 //       BINARY { type: '(', value: '(' }
 //          MULTIPLICATIVE { type: '(', value: '(' }
 //             BINARY { type: '(', value: '(' }
 //                PRIMARY { type: '(', value: '(' }
 //                   PARENS { type: '(', value: '(' }
 //                      EXPRESSION { type: 'NUMBER', value: '2' }
 //                         ADDITTIVE { type: 'NUMBER', value: '2' }
 //                            BINARY { type: 'NUMBER', value: '2' }
 //                               MULTIPLICATIVE { type: 'NUMBER', value: '2' }
 //                                  BINARY { type: 'NUMBER', value: '2' }
 //                                     PRIMARY { type: 'NUMBER', value: '2' }
 //                            WHILE { type: 'ADDITIVE_OPERATOR', value: '+' } ADDITIVE_OPERATOR
 //                               MULTIPLICATIVE { type: 'NUMBER', value: '2' }
 //                                  BINARY { type: 'NUMBER', value: '2' }
 //                                     PRIMARY { type: 'NUMBER', value: '2' }
 //             WHILE { type: 'MULTIPLICATIVE_OPERATOR', value: '*' } MULTIPLICATIVE_OPERATOR
 //                PRIMARY { type: 'NUMBER', value: '2' }
