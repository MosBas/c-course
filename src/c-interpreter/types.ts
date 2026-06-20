export type DataType = 'int' | 'char' | 'float' | 'void' | { structName: string } | { pointerTo: DataType } | { arrayOf: DataType, size: number };

export interface StructField {
  name: string;
  type: DataType;
  offset: number;
}

export interface StructType {
  name: string;
  fields: StructField[];
  size: number;
}

export type ASTNode =
  | ProgramNode
  | VarDeclarationNode
  | StructDeclarationNode
  | FunctionDeclarationNode
  | BlockNode
  | IfNode
  | WhileNode
  | ForNode
  | ReturnNode
  | ExpressionStatementNode
  | LiteralNode
  | IdentifierNode
  | BinaryNode
  | UnaryNode
  | ArrayAccessNode
  | MemberAccessNode
  | CallNode
  | SizeofNode;

export interface ProgramNode {
  type: 'Program';
  declarations: (VarDeclarationNode | StructDeclarationNode | FunctionDeclarationNode)[];
}

export interface VarDeclarationNode {
  type: 'VarDeclaration';
  dataType: DataType;
  name: string;
  initialValue?: ExpressionNode;
  line: number;
}

export interface StructDeclarationNode {
  type: 'StructDeclaration';
  name: string;
  fields: { dataType: DataType; name: string }[];
  line: number;
}

export interface FunctionDeclarationNode {
  type: 'FunctionDeclaration';
  returnType: DataType;
  name: string;
  params: { dataType: DataType; name: string }[];
  body: BlockNode;
  line: number;
}

export interface BlockNode {
  type: 'Block';
  statements: StatementNode[];
  line: number;
}

export type StatementNode =
  | VarDeclarationNode
  | AssignmentNode
  | IfNode
  | WhileNode
  | ForNode
  | ReturnNode
  | ExpressionStatementNode
  | BlockNode;

export interface AssignmentNode {
  type: 'Assignment';
  target: ExpressionNode;
  value: ExpressionNode;
  line: number;
}

export interface IfNode {
  type: 'If';
  condition: ExpressionNode;
  thenBranch: StatementNode;
  elseBranch?: StatementNode;
  line: number;
}

export interface WhileNode {
  type: 'While';
  condition: ExpressionNode;
  body: StatementNode;
  line: number;
}

export interface ForNode {
  type: 'For';
  init?: StatementNode | AssignmentNode;
  condition?: ExpressionNode;
  post?: ExpressionNode | StatementNode;
  body: StatementNode;
  line: number;
}

export interface ReturnNode {
  type: 'Return';
  value?: ExpressionNode;
  line: number;
}

export interface ExpressionStatementNode {
  type: 'ExpressionStatement';
  expression: ExpressionNode;
  line: number;
}

export type ExpressionNode =
  | LiteralNode
  | IdentifierNode
  | BinaryNode
  | UnaryNode
  | ArrayAccessNode
  | MemberAccessNode
  | CallNode
  | SizeofNode
  | ArrayInitializerNode;

export interface ArrayInitializerNode {
  type: 'ArrayInitializer';
  values: ExpressionNode[];
  line: number;
}

export interface LiteralNode {
  type: 'Literal';
  valueType: 'int' | 'char' | 'float' | 'string';
  value: any;
  line: number;
}

export interface IdentifierNode {
  type: 'Identifier';
  name: string;
  line: number;
}

export interface BinaryNode {
  type: 'Binary';
  operator: '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '>' | '<=' | '>=';
  left: ExpressionNode;
  right: ExpressionNode;
  line: number;
}

export interface UnaryNode {
  type: 'Unary';
  operator: '&' | '*' | '-' | '!' | '++' | '--';
  operand: ExpressionNode;
  isPostfix?: boolean;
  line: number;
}

export interface ArrayAccessNode {
  type: 'ArrayAccess';
  array: ExpressionNode;
  index: ExpressionNode;
  line: number;
}

export interface MemberAccessNode {
  type: 'MemberAccess';
  object: ExpressionNode;
  member: string;
  isArrow: boolean;
  line: number;
}

export interface CallNode {
  type: 'Call';
  callee: string;
  arguments: ExpressionNode[];
  line: number;
}

export interface SizeofNode {
  type: 'Sizeof';
  dataType: DataType;
  line: number;
}
