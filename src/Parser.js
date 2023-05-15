const { Tokenizer } = require('./Tokenizer');

class Parser {
  constructor() {
    this._string = '';
    this._tokenizer = new Tokenizer();
  }

  parse(string) {
    this._string = string;
    this._tokenizer.init(string);
    this._lookahead = this._tokenizer.getNextToken();

    return this.Program();
  }

  /**
   * Main entry point.
   *
   * Program
   *   : StatementList
   *   ;
   */
  Program() {
    const body = this.StatementList()

    return {
      type: 'Program',
      body,
    };
  }

  /**
   * StatementList
   *   : Statement
   *   | StatementList Statement -> Statement Statement Statement Statement . . .
   *   ;
   */
  StatementList(stopLookahead = null) {
    const statementList = [this.Statement()];

    while(this._lookahead != null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }

    return statementList;
  }

  /**
   * Statement
   *   : ExpressionStatement
   *   : BlockStatement
   *   : EmptyStatement
   *   : VariableStatement
   *   : IfStatement
   *   : IterationStatement
   *   : FunctionDeclarationStatement
   *   ;
   */
  Statement() {
    switch (this._lookahead.type) {
      case ';':
        return this.EmptyStatement();
      case 'if':
        return this.IfStatement();
      case '{':
        return this.BlockStatement();
      case 'let':
        return this.VariableStatement();
      case 'while':
      case 'do':
      case 'for':
        return this.IterationStatement();
      case 'def':
        return this.FunctionDeclarationStatement();
      case 'return':
        return this.ReturnStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  /**
   * FunctionDeclarationStatement
   *   : 'def' Identifier '(' OptFormalParameterList ')' BlockStatement
   *   ;
   */
  FunctionDeclarationStatement() {
    this._eat('def');

    const name = this.Identifier();

    this._eat('(');
    const params = this._lookahead.type !== ')' ? this.FormalParameterList() : [];
    this._eat(')');

    const body = this.BlockStatement();

    return {
      type: 'FunctionDeclaration',
      name,
      params,
      body
    }
  }

  /**
   * FormalParameterList
   *   : Identifier
   *   | FormalParameterList ',' Identifier
   *   ;
   */
  FormalParameterList() {
    const params = [];

    do {
      params.push(this.Identifier());
    } while (this._lookahead.type === ',' && this._eat(','))

    return params;
  }

  /**
   * ReturnStatement
   *   : 'return' OptExpression ';'
   *   ;
   */
  ReturnStatement() {
    this._eat('return');
    const argument = this._lookahead.type !== ';' ? this.Expression() : null;
    this._eat(';');

    return {
      type: 'ReturnStatement',
      argument
    }
  }

  /**
   * IterationStatement
   *   : WhileStatement
   *   | DoWhileStatement
   *   | ForStatement
   *   ;
   */
  IterationStatement() {
    switch (this._lookahead.type) {
      case 'while':
        return this.WhileStatement();
      case 'do':
        return this.DoWhileStatement();
      case 'for':
        return this.ForStatement();
    }
  }

  /**
   * WhileStatement
   *   : 'while' '(' Expression ')' Statement
   *   ;
   */
  WhileStatement() {
    this._eat('while');

    const test = this.ParenthesizedExpression();

    const body = this.Statement();

    return {
      type: 'WhileStatement',
      test,
      body
    }
  }

  /**
   * DoWhileStatement
   *   : 'do' Statement 'while' '(' Expression ')' ;
   *   ;
   */
  DoWhileStatement() {
    this._eat('do');

    const body = this.Statement();

    this._eat('while');

    const test = this.ParenthesizedExpression();

    this._eat(';');

    return {
      type: 'DoWhileStatement',
      test,
      body
    }
  }

  /**
   * ForStatement
   *   : 'for' '(' OptForStatementInit ';' OptExpression '; ' OptExpression ') ' Statement
   *   ;
   */
  ForStatement() {
    this._eat('for');
    this._eat('(');

    const init = this._lookahead.type !== ';' ? this.ForStatementInit() : null;
    this._eat(';');

    const test = this._lookahead.type !== ';' ? this.Expression() : null;
    this._eat(';');

    const update = this._lookahead.type !== ')' ? this.Expression() : null;
    this._eat(')');

    const body = this.Statement();

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body
    }
  }

  /**
   * ForStatementInit
   *   : VariableStatementInit
   *   | Expression
   *   ;
   */
  ForStatementInit() {
    if (this._lookahead.type === 'let') {
      return this.VariableStatementInit();
    }
    return this.Expression();
  }

  /**
   * IfStatement
   *   : 'if' '(' Expression ')' Statement
   *   | 'if' '(' Expression ')' Statement 'else' Statement
   *   ;
   */
  IfStatement() {
    this._eat('if');

    const test = this.ParenthesizedExpression();

    const consequent = this.Statement();

    const alternate = this._lookahead != null && this._lookahead.type === 'else'
      ? this._eat('else') && this.Statement()
      : null;

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    }
  }

  /**
   * VariableStatementInit
   *   : 'let' VariableStatement
   * */
  VariableStatementInit() {
    this._eat('let');
    const declarations = this.VariableDeclarationList();
    return {
      type: 'VariableStatement',
      declarations,
    }
  }

  /**
   * VariableStatement
   *   : 'let' VariableDeclarationList ';'
   *   ;
   */
  VariableStatement() {
    const variableStatement = this.VariableStatementInit();
    this._eat(';');
    return variableStatement;
  }

  /**
   * VariableDeclarationList
   *   : VariableDeclaration
   *   | VariableDeclarationList ',' VariableDeclaration
   */
  VariableDeclarationList() {
    const declarations = [];

    do {
      declarations.push(this.VariableDeclaration());
    } while (this._lookahead.type === ',' && this._eat(','));

    return declarations;
  }

  /**
   * VariableDeclaration
   *   : Identifier OptVaribleInitializer
   *   ;
   */
  VariableDeclaration() {
    const id = this.Identifier();

    const init =
      this._lookahead.type !== ';' && this._lookahead.type !== ','
        ? this.VariableInitializer()
        : null;

    return {
      type: 'VariableDeclaration',
      id,
      init
    }
  }

  /**
   * VariableInitializer
   *   : SIMPLE_ASSIGN AssignmentExpression
   *   ;
   */
  VariableInitializer() {
    this._eat('SIMPLE_ASSIGN');
    return this.AssignmentExpression();
  }

  /**
   * EmptyStatement
   *   : ';'
   *   ;
   */
  EmptyStatement() {
    this._eat(';');


    return {
      type: 'EmptyStatement',
    };
  }

  /**
   * BlockStatement
   *   : '{' OptStatementList '}'
   *   ;
   */
  BlockStatement() {
    this._eat('{');

    const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];

    this._eat('}');

    return {
      type: 'BlockStatement',
      body,
    };
  }

  /**
   * ExpressionStatement
   *   : Expression ';'
   *   ;
   */
  ExpressionStatement() {
    const expression = this.Expression();
    this._eat(';');
    return {
      type: 'ExpressionStatement',
      expression,
    }
  }

  /**
   * Expression
   *   : AdditiveExpression
   *   ;
   */
  Expression() {
    return this.AssignmentExpression();
  }

  /**
   * AssignmentExpression
   *   : LogicalORExpression
   *   ; LeftHandSideExpression AssignmentOperator AssignmentExpression
   */
  AssignmentExpression() {
    const left = this.LogicalORExpression();

    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left;
    }

    return {
      type: 'AssignmentExpression',
      operator: this.AssignmentOpertator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
    }
  }

  /**
   * Identifier
   *   : IDENTIFIER
   *   ;
   */
  Identifier() {
    const name = this._eat('IDENTIFIER').value;
    return {
      type: 'Identifier',
      name,
    }
  }

  /**
   * Extra check whether it's valid assignment target.
   */
  _checkValidAssignmentTarget(node) {
    if (node.type === 'Identifier') {
      return node;
    }
    throw new SyntaxError('Invalid left-hand side in assignment expression');
  }

  /**
   * Whether the token is an assignment opertator
   */
  _isAssignmentOperator(tokenType) {
    return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
  }

  /**
   * AssignmentOpertator
   *   : SIMPLE_ASSIGN
   *   | COMPLEX_ASSIGN
   *   ;
   */
  AssignmentOpertator() {
    if (this._lookahead.type === 'SIMPLE_ASSIGN') {
      return this._eat('SIMPLE_ASSIGN');
    }
    return this._eat('COMPLEX_ASSIGN');
  }


  /**
   * LogicalORExpression
   *   : LogicalANDExpression
   *   | LogicalANDExpression LOG_OR LogicalORExpression
   *   ;
   */
  LogicalORExpression() {
    return this._LogicalExpression('LogicalANDExpression', 'LOGICAL_OR');
  }


  /**
   * LogicalANDExpression
   *   : EqualityExpression
   *   | EqualityExpression LOGICAL_AND LogicalANDExpression
   *   ;
   */
  LogicalANDExpression() {
    return this._LogicalExpression('EqualityExpression', 'LOGICAL_AND');
  }

  /**
   * EqualityExpression
   *   : RelationalExpression
   *   | RelationalExpression EQUALITY_OPERATOR EqualityExpression
   *   ;
   */
  EqualityExpression() {
    return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR');
  }

  /**
   * RelationalExpression
   *   : AdditiveExpression
   *   | AdditivieExpression RELATIONAL_OPERATOR RelationalExpression
   *   ;
   */
  RelationalExpression() {
    return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
  }

  /**
   * AdditiveExpression
   *   : MultiplicativeExpression
   *   | MultiplicativeExpression ADDITIVE_OPERATOR AdditiveExpression
   *   ;
   */
  AdditiveExpression() {
    return this._BinaryExpression('MultiplicativeExpression', 'ADDITIVE_OPERATOR');
  }

  /**
   * MultiplicativeExpression
   *   : UnaryExpression
   *   | UnaryExpression MULTIPLICATIVE_OPERATOR MultiplicativeExpression
   *   ;
   */
  MultiplicativeExpression() {
    return this._BinaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR');
  }

  _LogicalExpression(builderName, operatorToken) {
    let left = this[builderName]();

    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;

      const right = this[builderName]();

      left = {
        type: 'LogicalExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  _BinaryExpression(builderName, operatorToken) {
    let left = this[builderName]();

    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;

      const right = this[builderName]();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  /**
   * UnaryExpression
   *   : LeftHandSideExpression
   *   | ADDITIVE_OPERATOR UnaryExpression
   *   | LOGICAL_NOT UnaryExpression
   *   ;
   */
  UnaryExpression() {
    let operator;
    switch (this._lookahead.type) {
      case 'ADDITIVE_OPERATOR':
        operator = this._eat('ADDITIVE_OPERATOR').value;
        break;
      case 'LOGICAL_NOT':
        operator = this._eat('LOGICAL_NOT').value;
        break;
    }
    if (operator != null) {
      return {
        type: 'UnaryExpression',
        operator,
        argument: this.UnaryExpression()
      }
    }
    return this.LeftHandSideExpression();
  }

  /**
   * LeftHandSideExpression
   *   : PrimaryExpression
   *   ;
   */
  LeftHandSideExpression() {
    return this.PrimaryExpression();
  }


  /**
   * PrimaryExpression
   *   : Literal
   *   | ParenthesizedExpression
   *   | Identifier
   *   ;
   */
  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal();
    }

    switch (this._lookahead.type) {
      case '(':
        return this.ParenthesizedExpression();
      case 'IDENTIFIER':
        return this.Identifier();
      default:
        return this.LeftHandSideExpression();
    }
  }

  /**
   * Whether the token is a literal
   */
  _isLiteral(tokenType) {
    return (
      tokenType === 'NUMBER' ||
      tokenType === 'STRING' ||
      tokenType === 'true' ||
      tokenType === 'false' ||
      tokenType === 'null'
    );
  }

  /**
   * ParenthesizedExpression
   *   : '(' Expression ')'
   *   ;
   */
  ParenthesizedExpression() {
    this._eat('(');
    const expression = this.Expression();
    this._eat(')');
    return expression;
  }

  /**
   * Lileral
   *   : NumericLiteral
   *   | StringLiteral
   *   | BooleanLiteral
   *   | NullLiteral
   *   ;
   */
  Literal() {
    switch (this._lookahead.type) {
      case 'NUMBER':
        return this.NumericLiteral();
      case 'STRING':
        return this.StringLiteral();
      case 'true':
        return this.BooleanLiteral(true);
      case 'false':
        return this.BooleanLiteral(false);
      case 'null':
        return this.NumericLiteral();
    }
    throw new SyntaxError(`Literal: unexpected literal production`);
  }

  /**
   * BooleanLiteral
   *   : 'true'
   *   | 'false'
   *   ;
   */
  BooleanLiteral(value) {
    this._eat(value ? 'true' : 'false');
    return {
      type: 'BooleanLiteral',
      value
    }
  }

  /**
   * NullLiteral
   *   : 'null'
   *   ;
   */
  NullLiteral() {
    this._eat('null');
    return {
      type: 'NullLiteral',
      value: null
    }
  }

  /**
   * StringLiteral
   *   : STRING
   *   ;
   */
  StringLiteral() {
    const token = this._eat('STRING');
    return {
      type: 'StringLiteral',
      value: token.value.slice(1, -1),
    };
  }

  /**
   * NumericLiteral
   *   : NUMBER
   *   ;
   */
  NumericLiteral() {
    const token = this._eat('NUMBER');
    return {
      type: 'NumericLiteral',
      value: Number(token.value),
    };
  }

  _eat(tokenType) {
    const token = this._lookahead;

    if (token == null) {
      throw new SyntaxError(
        `Unexpected end of input, expected: "${tokenType}"`,
      );
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}", expected: "${tokenType}"`,
      );
    }

    this._lookahead = this._tokenizer.getNextToken();

    return token;
  }
}

module.exports = {
  Parser,
};
