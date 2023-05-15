const { Parser } = require('../src/Parser');
const assert = require('assert');

const parser = new Parser();

const tests = [
  require('./literals-test'),
  require('./statement-list-test'),
  require('./block-test'),
  require('./empty-statement-test'),
  require('./math-test'),
  require('./assignment-test'),
  require('./variable-test'),
  require('./if-test'),
  require('./relational-test'),
  require('./equality-test'),
  require('./logical-test'),
  require('./unary-test'),
  require('./while-test'),
  require('./do-while-test'),
  require('./for-test'),
  require('./function-declaration-test'),
];

const test = (program, expected) => {
  const ast = parser.parse(program);
  assert.deepEqual(ast, expected);
}

tests.forEach(t => t(test));

console.log('All assertions passed');


const exec = () => {
  const program =
    `
 x = 51;
`;

  const ast = parser.parse(program);

  console.log(JSON.stringify(ast, null, 2));
}

// exec();
