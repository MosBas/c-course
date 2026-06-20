import type { DataType, ProgramNode, VarDeclarationNode, StructDeclarationNode, FunctionDeclarationNode, BlockNode, StatementNode, ExpressionNode, AssignmentNode } from './types';

export interface Token {
  type: 'KEYWORD' | 'IDENTIFIER' | 'NUMBER' | 'STRING' | 'CHAR' | 'OPERATOR' | 'PUNCTUATION' | 'EOF';
  value: string;
  line: number;
}

const KEYWORDS = new Set(['int', 'char', 'float', 'void', 'if', 'else', 'while', 'for', 'return', 'struct', 'sizeof']);
const OPERATORS = new Set(['++', '--', '+', '-', '*', '/', '%', '==', '!=', '<=', '>=', '<', '>', '=', '&', '!', '->', '.']);
const PUNCTUATION = new Set([';', ',', '(', ')', '{', '}', '[', ']']);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;

  while (index < code.length) {
    const char = code[index];

    // Handle newlines
    if (char === '\n') {
      line++;
      index++;
      continue;
    }

    // Handle whitespace
    if (/\s/.test(char)) {
      index++;
      continue;
    }

    // Handle comments
    if (char === '/' && code[index + 1] === '/') {
      index += 2;
      while (index < code.length && code[index] !== '\n') {
        index++;
      }
      continue;
    }
    if (char === '/' && code[index + 1] === '*') {
      index += 2;
      while (index < code.length && !(code[index] === '*' && code[index + 1] === '/')) {
        if (code[index] === '\n') line++;
        index++;
      }
      if (index < code.length) index += 2; // skip */
      continue;
    }

    // Handle preprocessor directives (like #include <stdio.h>) - we just skip them!
    if (char === '#') {
      while (index < code.length && code[index] !== '\n') {
        index++;
      }
      continue;
    }

    // Handle string literals
    if (char === '"') {
      let value = '';
      index++; // skip opening quote
      while (index < code.length && code[index] !== '"') {
        if (code[index] === '\\') {
          const next = code[index + 1];
          if (next === 'n') {
            value += '\n';
          } else if (next === '0') {
            value += '\0';
          } else if (next === 't') {
            value += '\t';
          } else if (next === '\\') {
            value += '\\';
          } else {
            value += next;
          }
          index += 2;
        } else {
          value += code[index];
          index++;
        }
      }
      index++; // skip closing quote
      tokens.push({ type: 'STRING', value, line });
      continue;
    }

    // Handle character literals
    if (char === "'") {
      index++; // skip opening quote
      let value: string;
      if (code[index] === '\\') {
        const next = code[index + 1];
        if (next === 'n') {
          value = '\n';
        } else if (next === '0') {
          value = '\0';
        } else if (next === 't') {
          value = '\t';
        } else if (next === '\\') {
          value = '\\';
        } else {
          value = next;
        }
        index += 2;
      } else {
        value = code[index];
        index++;
      }
      if (code[index] === "'") {
        index++; // skip closing quote
      } else {
        throw new Error(`שגיאת קומפילציה (שורה ${line}): תו לא סגור כראוי`);
      }
      tokens.push({ type: 'CHAR', value, line });
      continue;
    }

    // Handle numbers
    if (/[0-9]/.test(char)) {
      let value = '';
      while (index < code.length && /[0-9.]/.test(code[index])) {
        value += code[index];
        index++;
      }
      tokens.push({ type: 'NUMBER', value, line });
      continue;
    }

    // Handle identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      while (index < code.length && /[a-zA-Z0-9_]/.test(code[index])) {
        value += code[index];
        index++;
      }
      if (KEYWORDS.has(value)) {
        tokens.push({ type: 'KEYWORD', value, line });
      } else {
        tokens.push({ type: 'IDENTIFIER', value, line });
      }
      continue;
    }

    // Handle operators that can be 2 chars
    if (index + 1 < code.length) {
      const doubleOp = code.substring(index, index + 2);
      if (OPERATORS.has(doubleOp)) {
        tokens.push({ type: 'OPERATOR', value: doubleOp, line });
        index += 2;
        continue;
      }
    }

    // Handle single char operators
    if (OPERATORS.has(char)) {
      tokens.push({ type: 'OPERATOR', value: char, line });
      index++;
      continue;
    }

    // Handle punctuation
    if (PUNCTUATION.has(char)) {
      tokens.push({ type: 'PUNCTUATION', value: char, line });
      index++;
      continue;
    }

    // Skip unknown characters
    index++;
  }

  tokens.push({ type: 'EOF', value: '', line });
  return tokens;
}

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: string, value?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    return true;
  }

  private match(type: string, value?: string): boolean {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: string, message: string, value?: string): Token {
    if (this.check(type, value)) return this.advance();
    const token = this.peek();
    throw new Error(`שגיאת קומפילציה (שורה ${token.line}): ${message}. קיבלנו '${token.value}'`);
  }

  public parse(): ProgramNode {
    const declarations: (VarDeclarationNode | StructDeclarationNode | FunctionDeclarationNode)[] = [];
    while (!this.isAtEnd()) {
      declarations.push(this.parseDeclaration());
    }
    return { type: 'Program', declarations };
  }

  private parseDeclaration(): VarDeclarationNode | StructDeclarationNode | FunctionDeclarationNode {
    const token = this.peek();

    if (this.match('KEYWORD', 'struct')) {
      // Could be struct declaration or struct variable declaration
      // e.g., struct Point { int x; int y; };
      // or struct Point p;
      const structName = this.consume('IDENTIFIER', 'צפוי שם ל-struct').value;
      if (this.check('PUNCTUATION', '{')) {
        // Struct declaration
        this.advance(); // consume '{'
        const fields: { dataType: DataType; name: string }[] = [];
        while (!this.check('PUNCTUATION', '}')) {
          const fieldType = this.parseDataType();
          const fieldName = this.consume('IDENTIFIER', 'צפוי שם לשדה בתוך ה-struct').value;
          
          // Handle field arrays, e.g. char name[20];
          if (this.match('PUNCTUATION', '[')) {
            const sizeToken = this.consume('NUMBER', 'צפוי גודל מערך בשדה ה-struct');
            const size = parseInt(sizeToken.value, 10);
            this.consume('PUNCTUATION', 'צפוי ] סוגר', ']');
            fields.push({ dataType: { arrayOf: fieldType, size }, name: fieldName });
          } else {
            fields.push({ dataType: fieldType, name: fieldName });
          }
          
          this.consume('PUNCTUATION', 'צפוי ; בסוף הגדרת שדה', ';');
        }
        this.consume('PUNCTUATION', 'צפוי } סוגר ל-struct', '}');
        this.consume('PUNCTUATION', 'צפוי ; בסוף הגדרת struct', ';');
        return {
          type: 'StructDeclaration',
          name: structName,
          fields,
          line: token.line
        };
      } else {
        // Struct variable declaration: struct Point p; or struct Point *ptr;
        let type: DataType = { structName };
        while (this.match('OPERATOR', '*')) {
          type = { pointerTo: type };
        }
        const varName = this.consume('IDENTIFIER', 'צפוי שם משתנה').value;

        // Handle array declaration e.g. struct Point arr[5];
        if (this.match('PUNCTUATION', '[')) {
          let size: number | undefined;
          if (!this.check('PUNCTUATION', ']')) {
            const sizeToken = this.consume('NUMBER', 'צפוי גודל מערך');
            size = parseInt(sizeToken.value, 10);
          }
          this.consume('PUNCTUATION', 'צפוי ] סוגר', ']');
          type = { arrayOf: type, size: size ?? 0 };
        }
        
        let initialValue: ExpressionNode | undefined;
        if (this.match('OPERATOR', '=')) {
          initialValue = this.parseExpression();
        }
        this.consume('PUNCTUATION', 'צפוי ; בסוף הגדרת משתנה', ';');
        return {
          type: 'VarDeclaration',
          dataType: type,
          name: varName,
          initialValue,
          line: token.line
        };
      }
    }

    // Normal variable or function declaration
    const baseType = this.parseDataType();
    
    // Check if pointer or variable
    let actualType = baseType;
    while (this.match('OPERATOR', '*')) {
      actualType = { pointerTo: actualType };
    }

    const name = this.consume('IDENTIFIER', 'צפוי שם למשתנה או פונקציה').value;

    // Check if function or variable
    if (this.match('PUNCTUATION', '(')) {
      // Function declaration: int add(int a, int b) { ... }
      const params: { dataType: DataType; name: string }[] = [];
      if (!this.check('PUNCTUATION', ')')) {
        do {
          const paramTypeBase = this.parseDataType();
          let paramType = paramTypeBase;
          while (this.match('OPERATOR', '*')) {
            paramType = { pointerTo: paramType };
          }
          const paramName = this.consume('IDENTIFIER', 'צפוי שם לפרמטר').value;
          
          if (this.match('PUNCTUATION', '[')) {
            // Param as array decay to pointer
            this.consume('PUNCTUATION', 'צפוי ] סוגר', ']');
            paramType = { pointerTo: paramType };
          }
          
          params.push({ dataType: paramType, name: paramName });
        } while (this.match('PUNCTUATION', ','));
      }
      this.consume('PUNCTUATION', 'צפוי ) בסוף פרמטרים של פונקציה', ')');
      
      const body = this.parseBlock();
      return {
        type: 'FunctionDeclaration',
        returnType: actualType,
        name,
        params,
        body,
        line: token.line
      };
    } else {
      // Variable declaration
      let finalType = actualType;
      
      // Handle array declaration e.g. int arr[5]; or int arr[];
      if (this.match('PUNCTUATION', '[')) {
        let size: number | undefined;
        if (!this.check('PUNCTUATION', ']')) {
          const sizeToken = this.consume('NUMBER', 'צפוי גודל מערך');
          size = parseInt(sizeToken.value, 10);
        }
        this.consume('PUNCTUATION', 'צפוי ] סוגר', ']');
        finalType = { arrayOf: finalType, size: size ?? 0 };
      }

      let initialValue: ExpressionNode | undefined;
      if (this.match('OPERATOR', '=')) {
        initialValue = this.parseExpression();
      }
      this.consume('PUNCTUATION', 'צפוי ; בסוף הגדרת משתנה', ';');
      return {
        type: 'VarDeclaration',
        dataType: finalType,
        name,
        initialValue,
        line: token.line
      };
    }
  }

  private parseDataType(): DataType {
    const token = this.peek();
    if (this.match('KEYWORD', 'struct')) {
      const name = this.consume('IDENTIFIER', 'צפוי שם ל-struct').value;
      return { structName: name };
    }
    if (this.match('KEYWORD', 'int')) return 'int';
    if (this.match('KEYWORD', 'char')) return 'char';
    if (this.match('KEYWORD', 'float')) return 'float';
    if (this.match('KEYWORD', 'void')) return 'void';

    throw new Error(`שגיאת קומפילציה (שורה ${token.line}): טיפוס נתונים לא מוכר '${token.value}'`);
  }

  private parseBlock(): BlockNode {
    const token = this.consume('PUNCTUATION', "צפוי '{' בתחילת בלוק", '{');
    const statements: StatementNode[] = [];
    while (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    this.consume('PUNCTUATION', "צפוי '}' בסוף בלוק", '}');
    return {
      type: 'Block',
      statements,
      line: token.line
    };
  }

  private parseStatement(): StatementNode {
    const token = this.peek();

    // Check if variable declaration
    if (this.check('KEYWORD', 'int') || this.check('KEYWORD', 'char') || this.check('KEYWORD', 'float') || this.check('KEYWORD', 'struct')) {
      const decl = this.parseDeclaration();
      if (decl.type === 'StructDeclaration' || decl.type === 'FunctionDeclaration') {
        throw new Error(`שגיאת קומפילציה (שורה ${token.line}): הגדרת פונקציה או struct לא מורשית בתוך בלוק`);
      }
      return decl;
    }

    if (this.match('KEYWORD', 'if')) {
      this.consume('PUNCTUATION', "צפוי '(' אחרי if", '(');
      const condition = this.parseExpression();
      this.consume('PUNCTUATION', "צפוי ')' אחרי תנאי ה-if", ')');
      
      // Allow single statement or block
      const thenBranch = this.parseStatement();
      let elseBranch: StatementNode | undefined;
      
      if (this.match('KEYWORD', 'else')) {
        elseBranch = this.parseStatement();
      }
      
      return {
        type: 'If',
        condition,
        thenBranch,
        elseBranch,
        line: token.line
      };
    }

    if (this.match('KEYWORD', 'while')) {
      this.consume('PUNCTUATION', "צפוי '(' אחרי while", '(');
      const condition = this.parseExpression();
      this.consume('PUNCTUATION', "צפוי ')' אחרי תנאי ה-while", ')');
      const body = this.parseStatement();
      return {
        type: 'While',
        condition,
        body,
        line: token.line
      };
    }

    if (this.match('KEYWORD', 'for')) {
      this.consume('PUNCTUATION', "צפוי '(' אחרי for", '(');
      
      let init: StatementNode | AssignmentNode | undefined;
      if (!this.check('PUNCTUATION', ';')) {
        // Can be int i = 0 or i = 0
        if (this.check('KEYWORD', 'int') || this.check('KEYWORD', 'char') || this.check('KEYWORD', 'float')) {
          const baseType = this.parseDataType();
          let type = baseType;
          while (this.match('OPERATOR', '*')) {
            type = { pointerTo: type };
          }
          const name = this.consume('IDENTIFIER', 'צפוי שם משתנה').value;
          this.consume('OPERATOR', "צפוי '=' באתחול לולאת for", '=');
          const value = this.parseExpression();
          init = {
            type: 'VarDeclaration',
            dataType: type,
            name,
            initialValue: value,
            line: token.line
          };
        } else {
          const target = this.parseExpression();
          this.consume('OPERATOR', "צפוי '=' בלולאת for", '=');
          const value = this.parseExpression();
          init = {
            type: 'Assignment',
            target,
            value,
            line: token.line
          };
        }
      }
      this.consume('PUNCTUATION', "צפוי ';' אחרי אתחול לולאת for", ';');

      let condition: ExpressionNode | undefined;
      if (!this.check('PUNCTUATION', ';')) {
        condition = this.parseExpression();
      }
      this.consume('PUNCTUATION', "צפוי ';' אחרי תנאי לולאת for", ';');

      let post: any;
      if (!this.check('PUNCTUATION', ')')) {
        const expr = this.parseExpression();
        if (this.match('OPERATOR', '=')) {
          const val = this.parseExpression();
          post = {
            type: 'Assignment',
            target: expr,
            value: val,
            line: token.line
          };
        } else if (this.match('OPERATOR', '++')) {
          post = {
            type: 'Assignment',
            target: expr,
            value: {
              type: 'Binary',
              operator: '+',
              left: expr,
              right: { type: 'Literal', valueType: 'int', value: 1, line: token.line },
              line: token.line
            },
            line: token.line
          };
        } else if (this.match('OPERATOR', '--')) {
          post = {
            type: 'Assignment',
            target: expr,
            value: {
              type: 'Binary',
              operator: '-',
              left: expr,
              right: { type: 'Literal', valueType: 'int', value: 1, line: token.line },
              line: token.line
            },
            line: token.line
          };
        } else {
          post = expr;
        }
      }
      this.consume('PUNCTUATION', "צפוי ')' בסוף הגדרת לולאת for", ')');

      const body = this.parseStatement();
      return {
        type: 'For',
        init,
        condition,
        post,
        body,
        line: token.line
      };
    }

    if (this.match('KEYWORD', 'return')) {
      let value: ExpressionNode | undefined;
      if (!this.check('PUNCTUATION', ';')) {
        value = this.parseExpression();
      }
      this.consume('PUNCTUATION', "צפוי ';' בסוף return", ';');
      return {
        type: 'Return',
        value,
        line: token.line
      };
    }

    // Block statement
    if (this.check('PUNCTUATION', '{')) {
      return this.parseBlock();
    }

    // Expression statement or assignment
    const expr = this.parseExpression();
    
    // Assignment check: target = expression
    // Note: our expression parser might parse '=' but let's separate statement level assignment
    if (this.match('OPERATOR', '=')) {
      const val = this.parseExpression();
      this.consume('PUNCTUATION', "צפוי ';' בסוף השמה", ';');
      return {
        type: 'Assignment',
        target: expr,
        value: val,
        line: token.line
      };
    }

    // Handles syntax like i++; which translates to i = i + 1
    if (this.match('OPERATOR', '++')) {
      this.consume('PUNCTUATION', "צפוי ';'", ';');
      return {
        type: 'Assignment',
        target: expr,
        value: {
          type: 'Binary',
          operator: '+',
          left: expr,
          right: { type: 'Literal', valueType: 'int', value: 1, line: token.line },
          line: token.line
        },
        line: token.line
      } as AssignmentNode;
    }

    // Handles syntax like i--; which translates to i = i - 1
    if (this.match('OPERATOR', '--')) {
      this.consume('PUNCTUATION', "צפוי ';'", ';');
      return {
        type: 'Assignment',
        target: expr,
        value: {
          type: 'Binary',
          operator: '-',
          left: expr,
          right: { type: 'Literal', valueType: 'int', value: 1, line: token.line },
          line: token.line
        },
        line: token.line
      } as AssignmentNode;
    }

    this.consume('PUNCTUATION', "צפוי ';' בסוף שורה", ';');
    return {
      type: 'ExpressionStatement',
      expression: expr,
      line: token.line
    };
  }

  private parseExpression(): ExpressionNode {
    return this.parseEquality();
  }

  private parseEquality(): ExpressionNode {
    let expr = this.parseComparison();
    while (this.match('OPERATOR', '==') || this.match('OPERATOR', '!=')) {
      const operator = this.previous().value as '==' | '!=';
      const right = this.parseComparison();
      expr = {
        type: 'Binary',
        operator,
        left: expr,
        right,
        line: expr.line
      };
    }
    return expr;
  }

  private parseComparison(): ExpressionNode {
    let expr = this.parseAddition();
    while (this.match('OPERATOR', '<') || this.match('OPERATOR', '>') || this.match('OPERATOR', '<=') || this.match('OPERATOR', '>=')) {
      const operator = this.previous().value as '<' | '>' | '<=' | '>=';
      const right = this.parseAddition();
      expr = {
        type: 'Binary',
        operator,
        left: expr,
        right,
        line: expr.line
      };
    }
    return expr;
  }

  private parseAddition(): ExpressionNode {
    let expr = this.parseMultiplication();
    while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
      const operator = this.previous().value as '+' | '-';
      const right = this.parseMultiplication();
      expr = {
        type: 'Binary',
        operator,
        left: expr,
        right,
        line: expr.line
      };
    }
    return expr;
  }

  private parseMultiplication(): ExpressionNode {
    let expr = this.parseUnary();
    while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/') || this.match('OPERATOR', '%')) {
      const operator = this.previous().value as '*' | '/' | '%';
      const right = this.parseUnary();
      expr = {
        type: 'Binary',
        operator,
        left: expr,
        right,
        line: expr.line
      };
    }
    return expr;
  }

  private parseUnary(): ExpressionNode {
    const token = this.peek();
    if (this.match('OPERATOR', '&') || this.match('OPERATOR', '*') || this.match('OPERATOR', '-') || this.match('OPERATOR', '!') || this.match('OPERATOR', '++') || this.match('OPERATOR', '--')) {
      const operator = this.previous().value as '&' | '*' | '-' | '!' | '++' | '--';
      const operand = this.parseUnary();
      return {
        type: 'Unary',
        operator,
        operand,
        isPostfix: false,
        line: token.line
      };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): ExpressionNode {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match('PUNCTUATION', '[')) {
        // Array access e.g., arr[5]
        const index = this.parseExpression();
        this.consume('PUNCTUATION', "צפוי ']' בסוף גישה למערך", ']');
        expr = {
          type: 'ArrayAccess',
          array: expr,
          index,
          line: expr.line
        };
      } else if (this.match('OPERATOR', '.')) {
        // Struct member access e.g., p.x
        const member = this.consume('IDENTIFIER', 'צפוי שם שדה').value;
        expr = {
          type: 'MemberAccess',
          object: expr,
          member,
          isArrow: false,
          line: expr.line
        };
      } else if (this.match('OPERATOR', '->')) {
        // Struct pointer member access e.g., p->x
        const member = this.consume('IDENTIFIER', 'צפוי שם שדה').value;
        expr = {
          type: 'MemberAccess',
          object: expr,
          member,
          isArrow: true,
          line: expr.line
        };
      } else if (this.match('OPERATOR', '++')) {
        expr = {
          type: 'Unary',
          operator: '++',
          operand: expr,
          isPostfix: true,
          line: expr.line
        };
      } else if (this.match('OPERATOR', '--')) {
        expr = {
          type: 'Unary',
          operator: '--',
          operand: expr,
          isPostfix: true,
          line: expr.line
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): ExpressionNode {
    const token = this.peek();

    if (this.match('PUNCTUATION', '{')) {
      const values: ExpressionNode[] = [];
      if (!this.check('PUNCTUATION', '}')) {
        do {
          values.push(this.parseExpression());
        } while (this.match('PUNCTUATION', ','));
      }
      this.consume('PUNCTUATION', "צפוי '}' בסוף רשימת אתחול", '}');
      return {
        type: 'ArrayInitializer',
        values,
        line: token.line
      };
    }

    if (this.match('KEYWORD', 'sizeof')) {
      this.consume('PUNCTUATION', "צפוי '(' אחרי sizeof", '(');
      const dataType = this.parseDataType();
      this.consume('PUNCTUATION', "צפוי ')' אחרי טיפוס הנתונים ב-sizeof", ')');
      return {
        type: 'Sizeof',
        dataType,
        line: token.line
      };
    }

    if (this.match('NUMBER')) {
      const valueStr = this.previous().value;
      const isFloat = valueStr.includes('.');
      return {
        type: 'Literal',
        valueType: isFloat ? 'float' : 'int',
        value: isFloat ? parseFloat(valueStr) : parseInt(valueStr, 10),
        line: token.line
      };
    }

    if (this.match('STRING')) {
      return {
        type: 'Literal',
        valueType: 'string',
        value: this.previous().value,
        line: token.line
      };
    }

    if (this.match('CHAR')) {
      return {
        type: 'Literal',
        valueType: 'char',
        value: this.previous().value,
        line: token.line
      };
    }

    if (this.match('IDENTIFIER')) {
      const name = this.previous().value;
      
      // Function call e.g., printf(...)
      if (this.match('PUNCTUATION', '(')) {
        const args: ExpressionNode[] = [];
        if (!this.check('PUNCTUATION', ')')) {
          do {
            args.push(this.parseExpression());
          } while (this.match('PUNCTUATION', ','));
        }
        this.consume('PUNCTUATION', "צפוי ')' בסוף קריאה לפונקציה", ')');
        return {
          type: 'Call',
          callee: name,
          arguments: args,
          line: token.line
        };
      }
      
      // Simple variable reference
      return {
        type: 'Identifier',
        name,
        line: token.line
      };
    }

    if (this.match('PUNCTUATION', '(')) {
      // Cast expression, e.g. (int*)malloc(...)
      // Or just parentheses (expr)
      
      // Check if it looks like a cast, i.e., inside parentheses is a DataType
      // To keep parser simple, we'll try to parse a data type. If it succeeds and we have a '*' or standard type, followed by ')'
      // Otherwise, it's just a normal nested expression.
      let isCast = false;
      const savedCurrent = this.current;
      try {
        this.parseDataType();
        while (this.match('OPERATOR', '*')) {
          // empty
        }
        if (this.check('PUNCTUATION', ')')) {
          isCast = true;
        }
      } catch {
        // Not a cast
      }
      this.current = savedCurrent; // reset parser pointer

      if (isCast) {
        // Cast: (type) expr
        // We'll parse the data type, skip ')', and then parse the unary expression.
        // For simplicity in our VM, we will just parse it but evaluate it as the inner expression (since casts are mostly syntactic in C tutorial, except pointer casting which we can handle implicitly).
        this.parseDataType();
        while (this.match('OPERATOR', '*')) {
          // empty
        }
        this.consume('PUNCTUATION', "צפוי ')'", ')');
        // Return the cast target directly!
        return this.parseUnary();
      } else {
        // Parentheses expression: (expr)
        const expr = this.parseExpression();
        this.consume('PUNCTUATION', "צפוי ')' בסוף ביטוי", ')');
        return expr;
      }
    }

    throw new Error(`שגיאת קומפילציה (שורה ${token.line}): ביטוי לא חוקי '${token.value}'`);
  }
}
