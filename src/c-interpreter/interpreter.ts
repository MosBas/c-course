import type { DataType, ProgramNode, FunctionDeclarationNode, BlockNode, StatementNode, ExpressionNode, StructType, StructField } from './types';

export interface VMVariable {
  name: string;
  type: DataType;
  address: number;
  size: number;
}

export interface StackFrame {
  functionName: string;
  variables: Map<string, VMVariable>;
  spStart: number;
  returnAddress?: number; // for tracking line
}

export interface HeapAllocation {
  address: number;
  size: number;
  freed: boolean;
}

export interface VMState {
  memory: Uint8Array;
  dataView: DataView;
  stack: StackFrame[];
  heapAllocations: HeapAllocation[];
  stdout: string;
  sp: number; // Stack Pointer
  hp: number; // Heap Pointer
  currentLine: number;
  globals: Map<string, VMVariable>;
  structTypes: Map<string, StructType>;
  functions: Map<string, FunctionDeclarationNode>;
  error?: string;
  isTerminated: boolean;
}

export function createInitialState(program: ProgramNode): VMState {
  const memory = new Uint8Array(1024);
  const dataView = new DataView(memory.buffer);
  
  const state: VMState = {
    memory,
    dataView,
    stack: [],
    heapAllocations: [],
    stdout: '',
    sp: 1024, // starts at bottom
    hp: 256,  // heap starts at 256
    currentLine: 1,
    globals: new Map(),
    structTypes: new Map(),
    functions: new Map(),
    isTerminated: false
  };

  // Extract functions, global variables, and structs
  for (const decl of program.declarations) {
    if (decl.type === 'StructDeclaration') {
      const fields: StructField[] = [];
      let offset = 0;
      for (const f of decl.fields) {
        const size = getDataTypeSize(f.dataType, state.structTypes);
        fields.push({ name: f.name, type: f.dataType, offset });
        offset += size;
      }
      state.structTypes.set(decl.name, {
        name: decl.name,
        fields,
        size: offset
      });
    } else if (decl.type === 'FunctionDeclaration') {
      state.functions.set(decl.name, decl);
    } else if (decl.type === 'VarDeclaration') {
      // Global variable
      const size = getDataTypeSize(decl.dataType, state.structTypes);
      state.sp -= size; // allocate globally (below stack)
      const address = state.sp;
      state.globals.set(decl.name, {
        name: decl.name,
        type: decl.dataType,
        address,
        size
      });
      // Set initial value if any
      if (decl.initialValue) {
        // We'll evaluate simple literals statically for globals
        const val = evaluateLiteralStatic(decl.initialValue);
        writeMemory(address, decl.dataType, val, state);
      } else {
        // Zero initialize
        for (let i = 0; i < size; i++) {
          state.memory[address + i] = 0;
        }
      }
    }
  }

  return state;
}

function evaluateLiteralStatic(expr: ExpressionNode): any {
  if (expr.type === 'Literal') {
    return expr.value;
  }
  return 0; // fallback
}

export function getDataTypeSize(type: DataType, structTypes: Map<string, StructType>): number {
  if (typeof type === 'string') {
    if (type === 'char') return 1;
    if (type === 'int') return 4;
    if (type === 'float') return 4;
    if (type === 'void') return 0;
  } else if ('pointerTo' in type) {
    return 4; // all pointers are 4 bytes (addresses)
  } else if ('arrayOf' in type) {
    return getDataTypeSize(type.arrayOf, structTypes) * type.size;
  } else if ('structName' in type) {
    const struct = structTypes.get(type.structName);
    if (!struct) throw new Error(`טיפוס struct לא מוכר '${type.structName}'`);
    return struct.size;
  }
  return 4;
}

// Memory read helper
export function readMemory(address: number, type: DataType, state: VMState): any {
  if (address < 0 || address >= 1024) {
    throw new Error(`שגיאת זיכרון: ניסיון לקרוא מכתובת לא חוקית: ${formatAddress(address)}`);
  }
  if (address < 256) {
    throw new Error(`שגיאת זיכרון: ניסיון לקרוא מזיכרון מוגן (NULL pointer dereference) בכתובת: ${formatAddress(address)}`);
  }

  if (typeof type === 'string') {
    if (type === 'char') {
      const val = state.dataView.getUint8(address);
      return String.fromCharCode(val);
    }
    if (type === 'int') {
      return state.dataView.getInt32(address, true);
    }
    if (type === 'float') {
      return state.dataView.getFloat32(address, true);
    }
  } else if ('pointerTo' in type) {
    return state.dataView.getUint32(address, true); // read address
  } else if ('arrayOf' in type) {
    // Array decay: returns the address of the first element
    return address;
  } else if ('structName' in type) {
    // Reading struct returns its start address as reference
    return address;
  }
  return 0;
}

// Memory write helper
export function writeMemory(address: number, type: DataType, value: any, state: VMState): void {
  if (address < 0 || address >= 1024) {
    throw new Error(`שגיאת זיכרון: ניסיון לכתוב לכתובת לא חוקית: ${formatAddress(address)}`);
  }
  if (address < 256) {
    throw new Error(`שגיאת זיכרון: ניסיון לכתוב לזיכרון מוגן (NULL pointer dereference) בכתובת: ${formatAddress(address)}`);
  }

  if (typeof type === 'string') {
    if (type === 'char') {
      const charCode = typeof value === 'string' ? value.charCodeAt(0) : Number(value);
      state.dataView.setUint8(address, charCode);
    } else if (type === 'int') {
      state.dataView.setInt32(address, Math.floor(Number(value)), true);
    } else if (type === 'float') {
      state.dataView.setFloat32(address, Number(value), true);
    }
  } else if ('pointerTo' in type) {
    state.dataView.setUint32(address, Number(value), true);
  } else if ('arrayOf' in type) {
    // Copy array data or initialize
    // In our simplified engine, we can write sequential bytes
    if (Array.isArray(value)) {
      const elemType = type.arrayOf;
      const elemSize = getDataTypeSize(elemType, state.structTypes);
      for (let i = 0; i < Math.min(type.size, value.length); i++) {
        writeMemory(address + i * elemSize, elemType, value[i], state);
      }
    }
  } else if ('structName' in type) {
    // Copy struct memory if value is an address of another struct
    if (typeof value === 'number') {
      const size = getDataTypeSize(type, state.structTypes);
      for (let i = 0; i < size; i++) {
        state.memory[address + i] = state.memory[value + i];
      }
    }
  }
}

export function formatAddress(addr: number): string {
  if (addr === 0) return 'NULL';
  return `0x${addr.toString(16).toUpperCase().padStart(4, '0')}`;
}

export class Interpreter {
  private state: VMState;
  private startTime: number;
  private isSteppingMode: boolean;
  
  constructor(state: VMState, isSteppingMode = false) {
    this.state = state;
    this.startTime = Date.now();
    this.isSteppingMode = isSteppingMode;
  }

  private checkTimeout(): void {
    if (this.isSteppingMode) return;
    if (Date.now() - this.startTime > 3000) {
      throw new Error('שגיאת ריצה: חריגה מזמן הריצה המרבי (3 שניות). ייתכן שהקוד מכיל לולאה אינסופית.');
    }
  }

  public getVMState(): VMState {
    return this.state;
  }

  // Evaluates lvalue: returns target address
  private evaluateLValue(expr: ExpressionNode): number {
    if (expr.type === 'Identifier') {
      // Look up variable
      const local = this.findLocalVariable(expr.name);
      if (local) return local.address;
      
      const global = this.state.globals.get(expr.name);
      if (global) return global.address;

      throw new Error(`שגיאת קומפילציה: משתנה '${expr.name}' לא מוכר.`);
    }

    if (expr.type === 'Unary' && expr.operator === '*') {
      // Pointer dereference lvalue is the pointer's VALUE (the address it points to)
      return this.evaluateRValue(expr.operand);
    }

    if (expr.type === 'ArrayAccess') {
      // arr[idx]
      // Address is: base_address + index * elem_size
      const base = this.evaluateLValue(expr.array);
      const index = Number(this.evaluateRValue(expr.index));
      
      const arrayType = this.inferExpressionType(expr.array);
      if (arrayType && typeof arrayType === 'object') {
        if ('arrayOf' in arrayType) {
          const elemSize = getDataTypeSize(arrayType.arrayOf, this.state.structTypes);
          return base + index * elemSize;
        } else if ('pointerTo' in arrayType) {
          // Pointer arithmetic: arr is a pointer, read its value (an address)
          const ptrAddress = this.evaluateRValue(expr.array);
          const elemSize = getDataTypeSize(arrayType.pointerTo, this.state.structTypes);
          return ptrAddress + index * elemSize;
        }
      }
      throw new Error(`שגיאה: ניסיון לגשת לאינדקס של טיפוס שאינו מערך או מצביע`);
    }

    if (expr.type === 'MemberAccess') {
      // obj.member or obj->member
      let structAddr: number;
      let structTypeName = '';

      if (expr.isArrow) {
        // obj->member. obj is pointer to struct.
        structAddr = Number(this.evaluateRValue(expr.object));
        const ptrType = this.inferExpressionType(expr.object);
        if (ptrType && typeof ptrType === 'object' && 'pointerTo' in ptrType) {
          const innerType = ptrType.pointerTo;
          if (innerType && typeof innerType === 'object' && 'structName' in innerType) {
            structTypeName = innerType.structName;
          }
        }
      } else {
        // obj.member. obj is struct itself.
        structAddr = this.evaluateLValue(expr.object);
        const objType = this.inferExpressionType(expr.object);
        if (objType && typeof objType === 'object' && 'structName' in objType) {
          structTypeName = objType.structName;
        }
      }

      if (!structTypeName) {
        throw new Error(`שגיאה: גישה לשדה בטיפוס שאינו struct`);
      }

      const structDef = this.state.structTypes.get(structTypeName);
      if (!structDef) {
        throw new Error(`שגיאה: struct '${structTypeName}' אינו מוגדר`);
      }

      const field = structDef.fields.find(f => f.name === expr.member);
      if (!field) {
        throw new Error(`שגיאה: שדה '${expr.member}' אינו מוגדר ב-struct ${structTypeName}`);
      }

      return structAddr + field.offset;
    }

    throw new Error(`שגיאת קומפילציה: ביטוי לא חוקי בצד שמאל של השמה.`);
  }

  // Evaluates rvalue: returns value
  private evaluateRValue(expr: ExpressionNode): any {
    if (expr.type === 'ArrayInitializer') {
      return expr.values.map(val => this.evaluateRValue(val));
    }

    if (expr.type === 'Literal') {
      return expr.value;
    }

    if (expr.type === 'Identifier') {
      const local = this.findLocalVariable(expr.name);
      if (local) {
        return readMemory(local.address, local.type, this.state);
      }
      
      const global = this.state.globals.get(expr.name);
      if (global) {
        return readMemory(global.address, global.type, this.state);
      }

      throw new Error(`שגיאה: משתנה '${expr.name}' אינו מוגדר.`);
    }

    if (expr.type === 'Unary') {
      if (expr.operator === '&') {
        // Address-of: returns the lvalue address of the operand
        return this.evaluateLValue(expr.operand);
      }
      if (expr.operator === '*') {
        // Dereference: evaluate inner value (address) and read memory at that address
        const addr = this.evaluateRValue(expr.operand);
        const ptrType = this.inferExpressionType(expr.operand);
        let innerType: DataType = 'int'; // fallback
        if (ptrType && typeof ptrType === 'object' && 'pointerTo' in ptrType) {
          innerType = ptrType.pointerTo;
        }
        return readMemory(addr, innerType, this.state);
      }
      if (expr.operator === '-') {
        return -Number(this.evaluateRValue(expr.operand));
      }
      if (expr.operator === '!') {
        return this.evaluateRValue(expr.operand) ? 0 : 1;
      }
      if (expr.operator === '++') {
        const addr = this.evaluateLValue(expr.operand);
        const type = this.inferExpressionType(expr.operand) || 'int';
        const val = this.evaluateRValue(expr.operand);
        let step = 1;
        if (type && typeof type === 'object' && 'pointerTo' in type) {
          step = getDataTypeSize(type.pointerTo, this.state.structTypes);
        }
        const numericVal = typeof val === 'string' ? val.charCodeAt(0) : Number(val);
        const numericNewVal = numericVal + step;
        const newVal = type === 'char' ? String.fromCharCode(numericNewVal) : numericNewVal;
        writeMemory(addr, type, newVal, this.state);
        return expr.isPostfix ? val : newVal;
      }
      if (expr.operator === '--') {
        const addr = this.evaluateLValue(expr.operand);
        const type = this.inferExpressionType(expr.operand) || 'int';
        const val = this.evaluateRValue(expr.operand);
        let step = 1;
        if (type && typeof type === 'object' && 'pointerTo' in type) {
          step = getDataTypeSize(type.pointerTo, this.state.structTypes);
        }
        const numericVal = typeof val === 'string' ? val.charCodeAt(0) : Number(val);
        const numericNewVal = numericVal - step;
        const newVal = type === 'char' ? String.fromCharCode(numericNewVal) : numericNewVal;
        writeMemory(addr, type, newVal, this.state);
        return expr.isPostfix ? val : newVal;
      }
    }

    if (expr.type === 'Binary') {
      const left = this.evaluateRValue(expr.left);
      const right = this.evaluateRValue(expr.right);

      switch (expr.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return right === 0 ? (() => { throw new Error('שגיאת ריצה: חלוקה באפס!'); })() : (expr.operator === '/' ? Math.floor(left / right) : left / right);
        case '%': return right === 0 ? (() => { throw new Error('שגיאת ריצה: חלוקה באפס!'); })() : (left % right);
        case '==': return left === right ? 1 : 0;
        case '!=': return left !== right ? 1 : 0;
        case '<': return left < right ? 1 : 0;
        case '>': return left > right ? 1 : 0;
        case '<=': return left <= right ? 1 : 0;
        case '>=': return left >= right ? 1 : 0;
      }
    }

    if (expr.type === 'ArrayAccess') {
      const addr = this.evaluateLValue(expr);
      const arrayType = this.inferExpressionType(expr.array);
      let elemType: DataType = 'int';
      if (arrayType && typeof arrayType === 'object') {
        if ('arrayOf' in arrayType) elemType = arrayType.arrayOf;
        else if ('pointerTo' in arrayType) elemType = arrayType.pointerTo;
      }
      return readMemory(addr, elemType, this.state);
    }

    if (expr.type === 'MemberAccess') {
      const addr = this.evaluateLValue(expr);
      const objType = this.inferExpressionType(expr.object);
      let structTypeName = '';
      if (expr.isArrow) {
        if (objType && typeof objType === 'object' && 'pointerTo' in objType) {
          const inner = objType.pointerTo;
          if (inner && typeof inner === 'object' && 'structName' in inner) structTypeName = inner.structName;
        }
      } else {
        if (objType && typeof objType === 'object' && 'structName' in objType) structTypeName = objType.structName;
      }
      const structDef = this.state.structTypes.get(structTypeName);
      const field = structDef?.fields.find(f => f.name === expr.member);
      if (!field) throw new Error('שגיאה בקריאת שדה struct');
      
      return readMemory(addr, field.type, this.state);
    }

    if (expr.type === 'Sizeof') {
      return getDataTypeSize(expr.dataType, this.state.structTypes);
    }

    if (expr.type === 'Call') {
      if (expr.callee === 'malloc') {
        const size = Number(this.evaluateRValue(expr.arguments[0]));
        return this.malloc(size);
      }
      return this.evaluateCall(expr.callee, expr.arguments);
    }

    return 0;
  }

  private inferExpressionType(expr: ExpressionNode): DataType | null {
    if (expr.type === 'Identifier') {
      const local = this.findLocalVariable(expr.name);
      if (local) return local.type;
      const global = this.state.globals.get(expr.name);
      if (global) return global.type;
    }
    if (expr.type === 'Unary') {
      if (expr.operator === '&') {
        const innerType = this.inferExpressionType(expr.operand);
        return innerType ? { pointerTo: innerType } : null;
      }
      if (expr.operator === '*') {
        const innerType = this.inferExpressionType(expr.operand);
        if (innerType && typeof innerType === 'object' && 'pointerTo' in innerType) {
          return innerType.pointerTo;
        }
      }
      if (expr.operator === '++' || expr.operator === '--') {
        return this.inferExpressionType(expr.operand);
      }
    }
    if (expr.type === 'ArrayAccess') {
      const arrType = this.inferExpressionType(expr.array);
      if (arrType && typeof arrType === 'object') {
        if ('arrayOf' in arrType) return arrType.arrayOf;
        if ('pointerTo' in arrType) return arrType.pointerTo;
      }
    }
    if (expr.type === 'MemberAccess') {
      let structTypeName = '';
      const objType = this.inferExpressionType(expr.object);
      if (expr.isArrow) {
        if (objType && typeof objType === 'object' && 'pointerTo' in objType) {
          const inner = objType.pointerTo;
          if (inner && typeof inner === 'object' && 'structName' in inner) structTypeName = inner.structName;
        }
      } else {
        if (objType && typeof objType === 'object' && 'structName' in objType) structTypeName = objType.structName;
      }
      const structDef = this.state.structTypes.get(structTypeName);
      const field = structDef?.fields.find(f => f.name === expr.member);
      return field ? field.type : null;
    }
    return 'int'; // default fallback
  }

  private getTargetDataType(target: ExpressionNode): DataType {
    let type: DataType = 'int';
    if (target.type === 'Identifier') {
      const v = this.findLocalVariable(target.name) || this.state.globals.get(target.name);
      if (v) type = v.type;
    } else if (target.type === 'Unary' && target.operator === '*') {
      const ptrType = this.inferExpressionType(target.operand);
      if (ptrType && typeof ptrType === 'object' && 'pointerTo' in ptrType) {
        type = ptrType.pointerTo;
      }
    } else if (target.type === 'ArrayAccess') {
      const arrType = this.inferExpressionType(target.array);
      if (arrType && typeof arrType === 'object') {
        if ('arrayOf' in arrType) type = arrType.arrayOf;
        else if ('pointerTo' in arrType) type = arrType.pointerTo;
      }
    } else if (target.type === 'MemberAccess') {
      let structTypeName = '';
      const objType = this.inferExpressionType(target.object);
      if (target.isArrow) {
        if (objType && typeof objType === 'object' && 'pointerTo' in objType) {
          const inner = objType.pointerTo;
          if (inner && typeof inner === 'object' && 'structName' in inner) structTypeName = inner.structName;
        }
      } else {
        if (objType && typeof objType === 'object' && 'structName' in objType) structTypeName = objType.structName;
      }
      const structDef = this.state.structTypes.get(structTypeName);
      const field = structDef?.fields.find(f => f.name === target.member);
      if (field) type = field.type;
    }
    return type;
  }

  private evaluateCall(callee: string, args: ExpressionNode[]): any {
    const funcDecl = this.state.functions.get(callee);
    if (!funcDecl) {
      throw new Error(`שגיאה: פונקציה '${callee}' אינה מוגדרת.`);
    }

    // Evaluate params
    const paramValues = args.map(arg => this.evaluateRValue(arg));

    // Push new stack frame
    const prevSp = this.state.sp;
    const newFrame: StackFrame = {
      functionName: callee,
      variables: new Map(),
      spStart: prevSp
    };
    this.state.stack.push(newFrame);

    // Assign values to params inside new stack frame
    for (let i = 0; i < funcDecl.params.length; i++) {
      const param = funcDecl.params[i];
      const size = getDataTypeSize(param.dataType, this.state.structTypes);
      this.state.sp -= size;
      const address = this.state.sp;
      newFrame.variables.set(param.name, {
        name: param.name,
        type: param.dataType,
        address,
        size
      });
      writeMemory(address, param.dataType, paramValues[i], this.state);
    }

    // Execute function body synchronously
    let returnValue: any = undefined;
    
    const executeBlockSync = (block: BlockNode) => {
      for (const stmt of block.statements) {
        this.checkTimeout();
        executeStatementSync(stmt);
        if (returnValue !== undefined) return;
      }
    };

    const executeStatementSync = (stmt: StatementNode) => {
      if (stmt.type === 'VarDeclaration') {
        let dataType = stmt.dataType;
        if (dataType && typeof dataType === 'object' && 'arrayOf' in dataType && dataType.size === 0) {
          let inferredSize = 0;
          if (stmt.initialValue) {
            if (stmt.initialValue.type === 'Literal' && stmt.initialValue.valueType === 'string') {
              inferredSize = stmt.initialValue.value.length + 1; // null terminator
            } else if (stmt.initialValue.type === 'ArrayInitializer') {
              inferredSize = stmt.initialValue.values.length;
            }
          }
          dataType = { arrayOf: dataType.arrayOf, size: inferredSize };
          stmt.dataType = dataType;
        }
        const size = getDataTypeSize(dataType, this.state.structTypes);
        this.state.sp -= size;
        const address = this.state.sp;
        const frame = this.state.stack[this.state.stack.length - 1];
        frame.variables.set(stmt.name, {
          name: stmt.name,
          type: dataType,
          address,
          size
        });
        if (stmt.initialValue) {
          const val = this.evaluateRValue(stmt.initialValue);
          writeMemory(address, dataType, val, this.state);
        } else {
          for (let i = 0; i < size; i++) {
            this.state.memory[address + i] = 0;
          }
        }
      } else if (stmt.type === 'Assignment') {
        const addr = this.evaluateLValue(stmt.target);
        const val = this.evaluateRValue(stmt.value);
        const type = this.getTargetDataType(stmt.target);
        writeMemory(addr, type, val, this.state);
      } else if (stmt.type === 'Return') {
        if (stmt.value) {
          returnValue = this.evaluateRValue(stmt.value);
        } else {
          returnValue = 0;
        }
      } else if (stmt.type === 'Block') {
        executeBlockSync(stmt);
      } else if (stmt.type === 'ExpressionStatement') {
        const expr = stmt.expression;
        if (expr.type === 'Call') {
          if (expr.callee === 'printf') {
            const formatStr = this.evaluateRValue(expr.arguments[0]);
            const printArgs = expr.arguments.slice(1);
            this.runPrintf(formatStr, printArgs);
          } else if (expr.callee === 'free') {
            const addr = Number(this.evaluateRValue(expr.arguments[0]));
            this.free(addr);
          } else {
            this.evaluateCall(expr.callee, expr.arguments);
          }
        } else {
          this.evaluateRValue(expr);
        }
      } else if (stmt.type === 'If') {
        const cond = this.evaluateRValue(stmt.condition);
        if (cond !== 0) {
          executeStatementSync(stmt.thenBranch);
        } else if (stmt.elseBranch) {
          executeStatementSync(stmt.elseBranch);
        }
      } else if (stmt.type === 'While') {
        while (true) {
          this.checkTimeout();
          const cond = this.evaluateRValue(stmt.condition);
          if (cond === 0) break;
          executeStatementSync(stmt.body);
          if (returnValue !== undefined) break;
        }
      }
    };

    executeBlockSync(funcDecl.body);

    // Pop frame and restore SP
    this.state.stack.pop();
    this.state.sp = prevSp;

    return returnValue !== undefined ? returnValue : 0;
  }

  private findLocalVariable(name: string): VMVariable | null {
    if (this.state.stack.length === 0) return null;
    const currentFrame = this.state.stack[this.state.stack.length - 1];
    return currentFrame.variables.get(name) || null;
  }

  // Heap Allocator (simple bump allocator + freed blocks metadata)
  private malloc(size: number): number {
    if (size <= 0) return 0; // return NULL
    
    // Check if we have space in Heap
    // Stack Pointer grows down, Heap Pointer grows up.
    // Ensure we don't collide: hp + size < sp
    if (this.state.hp + size >= this.state.sp) {
      throw new Error('שגיאת ריצה: מחוץ לזיכרון! (Stack-Heap collision / Out of memory)');
    }

    const address = this.state.hp;
    this.state.hp += size;
    
    this.state.heapAllocations.push({
      address,
      size,
      freed: false
    });

    return address;
  }

  private free(address: number): void {
    if (address === 0) return; // free(NULL) is no-op

    const allocation = this.state.heapAllocations.find(a => a.address === address);
    if (!allocation) {
      throw new Error(`שגיאת זיכרון: ניסיון לשחרר (free) כתובת לא חוקית או שלא הוקצתה דינמית: ${formatAddress(address)}`);
    }

    if (allocation.freed) {
      throw new Error(`שגיאת זיכרון: שחרור כפול (double free) בכתובת: ${formatAddress(address)}`);
    }

    allocation.freed = true;
    
    // Zero out the memory block for security simulation
    for (let i = 0; i < allocation.size; i++) {
      this.state.memory[address + i] = 0;
    }
  }

  // Prints variables according to specifiers
  private runPrintf(formatStr: string, args: ExpressionNode[]): void {
    let output = '';
    let argIndex = 0;
    let i = 0;

    while (i < formatStr.length) {
      if (formatStr[i] === '%' && i + 1 < formatStr.length) {
        const specifier = formatStr[i + 1];
        i += 2;

        if (argIndex >= args.length) {
          throw new Error('שגיאת printf: פחות מדי ארגומנטים עבור תבנית הפלט.');
        }

        const rawVal = this.evaluateRValue(args[argIndex]);
        argIndex++;

        switch (specifier) {
          case 'd':
            output += Math.floor(Number(rawVal)).toString();
            break;
          case 'f':
            output += Number(rawVal).toFixed(6);
            break;
          case 'c':
            output += typeof rawVal === 'string' ? rawVal[0] : String.fromCharCode(Number(rawVal));
            break;
          case 's':
            // C string in memory: read character by character until \0
            if (typeof rawVal === 'number') {
              let addr = rawVal;
              let s = '';
              while (addr < 1024) {
                const charVal = this.state.memory[addr];
                if (charVal === 0) break;
                s += String.fromCharCode(charVal);
                addr++;
              }
              output += s;
            } else {
              output += rawVal.toString();
            }
            break;
          case 'p':
            output += formatAddress(Number(rawVal));
            break;
          default:
            output += '%' + specifier;
        }
      } else {
        output += formatStr[i];
        i++;
      }
    }

    this.state.stdout += output;
  }

  // Generator statement executor for step-by-step debug
  public *executeProgram(): Generator<VMState, void, any> {
    const mainFunc = this.state.functions.get('main');
    if (!mainFunc) {
      this.state.error = "שגיאה: פונקציית main לא נמצאה בתוכנית C";
      this.state.isTerminated = true;
      yield this.state;
      return;
    }

    try {
      // Enter main stack frame
      this.state.stack.push({
        functionName: 'main',
        variables: new Map(),
        spStart: this.state.sp
      });

      yield* this.executeBlock(mainFunc.body);
      
      // Exit main stack frame (we keep it for visual verification of final state variables)
      this.state.isTerminated = true;
      yield this.state;

    } catch (e: any) {
      this.state.error = e.message;
      this.state.isTerminated = true;
      yield this.state;
    }
  }

  private *executeBlock(block: BlockNode): Generator<VMState, void, any> {
    for (const stmt of block.statements) {
      this.checkTimeout();
      if (this.state.isTerminated) return;
      this.state.currentLine = stmt.line;
      yield this.state; // yield at the beginning of each statement

      yield* this.executeStatement(stmt);
    }
  }

  private *executeStatement(stmt: StatementNode): Generator<VMState, void, any> {
    if (stmt.type === 'VarDeclaration') {
      let dataType = stmt.dataType;
      if (dataType && typeof dataType === 'object' && 'arrayOf' in dataType && dataType.size === 0) {
        let inferredSize = 0;
        if (stmt.initialValue) {
          if (stmt.initialValue.type === 'Literal' && stmt.initialValue.valueType === 'string') {
            inferredSize = stmt.initialValue.value.length + 1; // null terminator
          } else if (stmt.initialValue.type === 'ArrayInitializer') {
            inferredSize = stmt.initialValue.values.length;
          }
        }
        dataType = { arrayOf: dataType.arrayOf, size: inferredSize };
        stmt.dataType = dataType;
      }
      const size = getDataTypeSize(dataType, this.state.structTypes);
      
      // Alloc on stack
      if (this.state.sp - size <= this.state.hp) {
        throw new Error('שגיאת ריצה: מחוץ לזיכרון במחסנית! Stack Overflow');
      }
      this.state.sp -= size;
      const address = this.state.sp;
      
      const frame = this.state.stack[this.state.stack.length - 1];
      frame.variables.set(stmt.name, {
        name: stmt.name,
        type: dataType,
        address,
        size
      });

      if (stmt.initialValue) {
        // String literal array initialization helper e.g., char str[] = "Hi";
        if (dataType && typeof dataType === 'object' && 'arrayOf' in dataType && dataType.arrayOf === 'char' && stmt.initialValue.type === 'Literal' && stmt.initialValue.valueType === 'string') {
          const strVal = stmt.initialValue.value;
          for (let i = 0; i < strVal.length; i++) {
            this.state.memory[address + i] = strVal.charCodeAt(i);
          }
          this.state.memory[address + strVal.length] = 0; // null terminator
        } 
        // Array aggregate initialization, e.g. int arr[3] = {1, 2, 3};
        else {
          const val = this.evaluateRValue(stmt.initialValue);
          writeMemory(address, dataType, val, this.state);
        }
      } else {
        // Zero out memory
        for (let i = 0; i < size; i++) {
          this.state.memory[address + i] = 0;
        }
      }
    }

    else if (stmt.type === 'Assignment') {
      const target = stmt.target;
      const addr = this.evaluateLValue(target);
      const val = this.evaluateRValue(stmt.value);
      const type = this.getTargetDataType(target);
      writeMemory(addr, type, val, this.state);
    }

    else if (stmt.type === 'If') {
      const cond = this.evaluateRValue(stmt.condition);
      if (cond !== 0) {
        yield* this.executeStatement(stmt.thenBranch);
      } else if (stmt.elseBranch) {
        yield* this.executeStatement(stmt.elseBranch);
      }
    }

    else if (stmt.type === 'While') {
      while (true) {
        this.checkTimeout();
        const cond = this.evaluateRValue(stmt.condition);
        if (cond === 0) break;
        
        yield* this.executeStatement(stmt.body);
      }
    }

    else if (stmt.type === 'For') {
      if (stmt.init) {
        yield* this.executeStatement(stmt.init);
      }

      while (true) {
        this.checkTimeout();
        if (stmt.condition) {
          const cond = this.evaluateRValue(stmt.condition);
          if (cond === 0) break;
        }

        yield* this.executeStatement(stmt.body);

        if (stmt.post) {
          if (stmt.post.type === 'Assignment') {
            yield* this.executeStatement(stmt.post);
          } else {
            this.evaluateRValue(stmt.post as ExpressionNode); // execute side-effect (increment/decrement etc.)
          }
        }
      }
    }

    else if (stmt.type === 'Return') {
      // In our simple VM, return just pops the current stack frame
      // and terminates block execution. Since we don't have deeply nested custom calls in early chapters,
      // it is sufficient. If we want full function call supports, we would push/pop frame.
      const frame = this.state.stack[this.state.stack.length - 1];
      if (frame.functionName !== 'main') {
        // Pop and restore sp
        this.state.stack.pop();
        this.state.sp = frame.spStart;
      }
    }

    else if (stmt.type === 'Block') {
      yield* this.executeBlock(stmt);
    }

    else if (stmt.type === 'ExpressionStatement') {
      const expr = stmt.expression;
      if (expr.type === 'Call') {
        if (expr.callee === 'printf') {
          const formatStr = this.evaluateRValue(expr.arguments[0]);
          const printArgs = expr.arguments.slice(1);
          this.runPrintf(formatStr, printArgs);
        } else if (expr.callee === 'free') {
          const addr = Number(this.evaluateRValue(expr.arguments[0]));
          this.free(addr);
        } else {
          // Custom user function call
          const funcDecl = this.state.functions.get(expr.callee);
          if (!funcDecl) {
            throw new Error(`שגיאה: פונקציה '${expr.callee}' אינה מוגדרת.`);
          }

          // Evaluate params
          const paramValues = expr.arguments.map(arg => this.evaluateRValue(arg));

          // Save current stack frame start
          const prevSp = this.state.sp;
          
          // Push new stack frame
          const newFrame: StackFrame = {
            functionName: expr.callee,
            variables: new Map(),
            spStart: prevSp
          };
          this.state.stack.push(newFrame);

          // Assign values to params inside new stack frame
          for (let i = 0; i < funcDecl.params.length; i++) {
            const param = funcDecl.params[i];
            const size = getDataTypeSize(param.dataType, this.state.structTypes);
            this.state.sp -= size;
            const address = this.state.sp;
            newFrame.variables.set(param.name, {
              name: param.name,
              type: param.dataType,
              address,
              size
            });
            writeMemory(address, param.dataType, paramValues[i], this.state);
          }

          // Execute function body
          yield* this.executeBlock(funcDecl.body);

          // Exit function stack frame
          const popped = this.state.stack.pop();
          if (popped) {
            this.state.sp = popped.spStart;
          }
        }
      } else {
        this.evaluateRValue(expr);
      }
    }
  }
}
