import { useState, useEffect, useRef } from 'react';
import { chapters } from './course-content';
import { tokenize, Parser } from './c-interpreter/parser';
import { createInitialState, Interpreter, getDataTypeSize, readMemory, formatAddress } from './c-interpreter/interpreter';
import type { VMState, VMVariable } from './c-interpreter/interpreter';
import type { DataType } from './c-interpreter/types';

interface Arrow {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromAddr: number;
  toAddr: number;
}

interface FlattenedCell {
  address: number;
  name: string;
  type: string;
  valueStr: string;
  pointerTarget: number | null;
  region: 'global' | 'stack' | 'heap';
  frameName?: string;
  highlighted: boolean;
  size: number;
  isFreed?: boolean;
}

// Deep clone VM state for step-by-step debugger history
function cloneVMState(state: VMState): VMState {
  const memory = new Uint8Array(state.memory);
  const dataView = new DataView(memory.buffer);
  
  const stack = state.stack.map(frame => ({
    ...frame,
    variables: new Map(frame.variables)
  }));
  
  const heapAllocations = state.heapAllocations.map(alloc => ({ ...alloc }));
  const globals = new Map(state.globals);
  const structTypes = new Map(state.structTypes);
  const functions = new Map(state.functions);

  return {
    memory,
    dataView,
    stack,
    heapAllocations,
    stdout: state.stdout,
    sp: state.sp,
    hp: state.hp,
    currentLine: state.currentLine,
    globals,
    structTypes,
    functions,
    isTerminated: state.isTerminated,
    error: state.error
  };
}

interface Pet {
  id: number;
  imageUrl: string;
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  state: 'walking' | 'idling';
  stateTimer: number;
  name: string;
}

function highlightC(code: string): string {
  if (!code) return '';
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const combinedRegex = new RegExp(
    '(//[^\\n]*|/\\*[\\s\\S]*?\\*/)' + 
    '|(#[ \\t]*(?:include|define)\\b[^\\n]*)' + 
    '|("(?:[^"\\\\]|\\\\.)*")' + 
    '|(\'(?:[^\'\\\\]|\\\\.)\')' + 
    '|\\b(0x[0-9a-fA-F]+|\\d+(?:\\.\\d+)?)\\b' + 
    '|\\b(int|char|float|double|void|struct|union|typedef|if|else|for|while|do|return|switch|case|break|continue|const|unsigned|signed|sizeof|volatile|static|extern)\\b' + 
    '|(-&gt;|\\+{1,2}|-{1,2}|={1,2}|!=|&lt;=|&gt;=|&lt;|&gt;|(?:&amp;){1,2}|\\|{1,2}|[*/%~^!?:;.])',
    'g'
  );

  return html.replace(combinedRegex, (match, comment, include, str, char, num, keyword, op) => {
    if (comment !== undefined) return `<span class="hl-comment">${comment}</span>`;
    if (include !== undefined) return `<span class="hl-include">${include}</span>`;
    if (str !== undefined) return `<span class="hl-string">${str}</span>`;
    if (char !== undefined) return `<span class="hl-char">${char}</span>`;
    if (num !== undefined) return `<span class="hl-number">${num}</span>`;
    if (keyword !== undefined) return `<span class="hl-keyword">${keyword}</span>`;
    if (op !== undefined) return `<span class="hl-operator">${op}</span>`;
    return match;
  });
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('c-course-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [petsEnabled, setPetsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('c-course-pets-enabled');
    return saved === 'true';
  });

  const [pets, setPets] = useState<Pet[]>([]);

  const togglePets = () => {
    setPetsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('c-course-pets-enabled', String(next));
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('c-course-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load progress from LocalStorage
  const [activeChapterId, setActiveChapterId] = useState<number>(() => {
    const saved = localStorage.getItem('c-course-active-chapter');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [completedChapters, setCompletedChapters] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('c-course-completed-chapters');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  // Editor and Running State
  const [code, setCode] = useState('');
  const [vmState, setVmState] = useState<VMState | null>(null);
  const [history, setHistory] = useState<VMState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [stepMode, setStepMode] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ text: string; type: 'stdout' | 'error' | 'success' | 'info' }[]>([]);
  const [verification, setVerification] = useState<{ passed: boolean; errorMsg?: string } | null>(null);
  const [showHint, setShowHint] = useState(false);

  // References
  const visualizerBodyRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const generatorRef = useRef<any>(null);

  // Reset editor and VM state when active chapter or active exercise changes
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);

  const [completedExercises, setCompletedExercises] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('c-course-completed-exercises');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });

  // Save completed exercises to localstorage
  useEffect(() => {
    localStorage.setItem('c-course-completed-exercises', JSON.stringify(Array.from(completedExercises)));
  }, [completedExercises]);

  useEffect(() => {
    localStorage.setItem('c-course-active-chapter', activeChapterId.toString());
    if (activeChapter.exercises && activeChapter.exercises.length > 0) {
      const savedCode = localStorage.getItem(`c-course-code-ch-${activeChapter.id}-ex-${activeExerciseIndex}`);
      setCode(savedCode || activeChapter.exercises[activeExerciseIndex]?.initialCode || '');
    } else {
      setCode('');
    }
    resetVM();
    setVerification(null);
    setShowHint(false);
  }, [activeChapterId, activeExerciseIndex]);

  // Save completed chapters to localstorage
  useEffect(() => {
    localStorage.setItem('c-course-completed-chapters', JSON.stringify(Array.from(completedChapters)));
  }, [completedChapters]);

  // Keep code saved in localstorage as user types
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (activeChapter.exercises && activeChapter.exercises[activeExerciseIndex]) {
      localStorage.setItem(`c-course-code-ch-${activeChapter.id}-ex-${activeExerciseIndex}`, newCode);
    }
  };

  const addConsoleLog = (text: string, type: 'stdout' | 'error' | 'success' | 'info') => {
    setConsoleLogs(prev => [...prev, { text, type }]);
  };

  const resetVM = () => {
    setVmState(null);
    setHistory([]);
    setHistoryIndex(-1);
    setStepMode(false);
    setConsoleLogs([]);
    setArrows([]);
    generatorRef.current = null;
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  useEffect(() => {
    if (!petsEnabled) {
      setPets([]);
      return;
    }

    const initialPets: Pet[] = [
      { id: 1, imageUrl: 'https://ssl.gstatic.com/colaboratory-static/common/e8283f159efececdafd4f8722fa65905/v2/common/img/chocolatechip.gif', x: 10, y: 0, speed: 12, direction: 1, state: 'walking', stateTimer: 2 + Math.random() * 3, name: 'שוקולד צ\'יפ (קולי)' },
      { id: 2, imageUrl: 'https://ssl.gstatic.com/colaboratory-static/common/e8283f159efececdafd4f8722fa65905/v2/common/img/oreo.gif', x: 35, y: 0, speed: 15, direction: -1, state: 'idling', stateTimer: 1 + Math.random() * 2, name: 'אוראו (קולי)' },
      { id: 3, imageUrl: 'https://ssl.gstatic.com/colaboratory-static/common/e8283f159efececdafd4f8722fa65905/v2/common/img/MIDNIGHT.gif', x: 60, y: 0, speed: 10, direction: 1, state: 'walking', stateTimer: 3 + Math.random() * 3, name: 'חתול חצות' },
      { id: 4, imageUrl: 'https://ssl.gstatic.com/colaboratory-static/common/e8283f159efececdafd4f8722fa65905/v2/common/img/crab.gif', x: 85, y: 0, speed: 14, direction: -1, state: 'idling', stateTimer: 2 + Math.random() * 2, name: 'סרטן קטן' }
    ];
    setPets(initialPets);

    let lastTime = performance.now();
    let animationFrameId: number;

    const updateLoop = (now: number) => {
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      setPets(prevPets =>
        prevPets.map(pet => {
          let { x, speed, direction, state, stateTimer } = pet;
          stateTimer -= deltaTime;

          if (stateTimer <= 0) {
            if (state === 'walking') {
              state = 'idling';
              stateTimer = 1 + Math.random() * 3;
            } else {
              state = 'walking';
              stateTimer = 3 + Math.random() * 5;
              if (Math.random() < 0.5) {
                direction = direction === 1 ? -1 : 1;
              }
            }
          }

          if (state === 'walking') {
            x += direction * speed * deltaTime;
            if (x >= 95) {
              x = 95;
              direction = -1;
            } else if (x <= 1) {
              x = 1;
              direction = 1;
            }
          }

          return {
            ...pet,
            x,
            direction,
            state,
            stateTimer
          };
        })
      );

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [petsEnabled]);

  const handleResetCode = () => {
    if (activeChapter.exercises && activeChapter.exercises[activeExerciseIndex]) {
      if (window.confirm('האם אתה בטוח שברצונך לאתחל את הקוד לגרסת המקור? כל השינויים שלך יימחקו.')) {
        handleCodeChange(activeChapter.exercises[activeExerciseIndex].initialCode);
        resetVM();
        setVerification(null);
      }
    }
  };

  // Compile and run C code completely
  const runCode = () => {
    resetVM();
    addConsoleLog('מריץ קומפילציה...', 'info');

    try {
      const tokens = tokenize(code);
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const state = createInitialState(ast);
      const interpreter = new Interpreter(state);
      const executor = interpreter.executeProgram();

      let step = executor.next();
      while (!step.done) {
        if (step.value.error) {
          throw new Error(step.value.error);
        }
        step = executor.next();
      }

      const finalState = ((step.value as any) || state) as VMState;
      setVmState(finalState);
      
      if (finalState.stdout) {
        addConsoleLog(finalState.stdout, 'stdout');
      }

      if (finalState.error) {
        addConsoleLog(`שגיאת ריצה: ${finalState.error}`, 'error');
        setVerification({ passed: false, errorMsg: finalState.error });
      } else {
        addConsoleLog('הריצה הסתיימה בהצלחה.', 'success');
        verifyExercise(finalState);
      }
    } catch (err: any) {
      addConsoleLog(err.message, 'error');
      setVerification({ passed: false, errorMsg: err.message });
    }
  };

  // Step-by-step debugger controls
  const startStepMode = () => {
    resetVM();
    addConsoleLog('מאתחל ריצה שלב-אחר-שלב...', 'info');

    try {
      const tokens = tokenize(code);
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const state = createInitialState(ast);
      const interpreter = new Interpreter(state, true);
      
      generatorRef.current = interpreter.executeProgram();
      setStepMode(true);
      
      // Execute the first yielded step (which is right before main starts)
      stepForward();
    } catch (err: any) {
      addConsoleLog(err.message, 'error');
      setVerification({ passed: false, errorMsg: err.message });
    }
  };

  const stepForward = () => {
    if (!generatorRef.current) return;

    // If we are looking at past history steps, we simply step forward in history
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setVmState(history[nextIdx]);
      return;
    }

    const nextStep = generatorRef.current.next();
    if (nextStep.done) {
      addConsoleLog('התוכנית הסתיימה.', 'info');
      if (vmState) {
        verifyExercise(vmState);
      }
      return;
    }

    const newState = cloneVMState(nextStep.value);
    
    // Track new outputs to console
    const oldStdout = vmState?.stdout || '';
    if (newState.stdout && newState.stdout !== oldStdout) {
      const diff = newState.stdout.slice(oldStdout.length);
      addConsoleLog(diff, 'stdout');
    }

    if (newState.error) {
      addConsoleLog(`שגיאת ריצה (שורה ${newState.currentLine}): ${newState.error}`, 'error');
      setVerification({ passed: false, errorMsg: newState.error });
    }

    const newHistory = [...history, newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setVmState(newState);
  };

  const stepBackward = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setVmState(history[prevIdx]);
    }
  };

  // Run user verification checks
  const verifyExercise = (state: VMState) => {
    if (activeChapter.exercises && activeChapter.exercises[activeExerciseIndex]) {
      const activeExercise = activeChapter.exercises[activeExerciseIndex];
      try {
        const res = activeExercise.verify(state);
        setVerification(res);
        if (res.passed) {
          const exerciseKey = `${activeChapter.id}-${activeExerciseIndex}`;
          setCompletedExercises(prev => {
            const next = new Set(prev);
            next.add(exerciseKey);
            return next;
          });
          addConsoleLog('משימה זו הושלמה בהצלחה! כל הכבוד 🎉', 'success');

          // Check if all exercises for the active chapter are completed
          const nextCompletedExercises = new Set(completedExercises);
          nextCompletedExercises.add(exerciseKey);

          const allCompleted = activeChapter.exercises.every((_, idx) =>
            nextCompletedExercises.has(`${activeChapter.id}-${idx}`)
          );

          if (allCompleted) {
            setCompletedChapters(prev => {
              const next = new Set(prev);
              next.add(activeChapter.id);
              return next;
            });
            addConsoleLog('פרק זה הושלם במלואו! כל הכבוד 🏆', 'success');
          }
        } else {
          addConsoleLog(`התרגיל נכשל: ${res.errorMsg || ''}`, 'error');
        }
      } catch (err: any) {
        setVerification({ passed: false, errorMsg: err.message });
      }
    }
  };

  // Flatten active memory blocks for display
  const getFlattenedCells = (state: VMState | null): FlattenedCell[] => {
    if (!state) return [];
    const list: FlattenedCell[] = [];

    // 1. Globals
    state.globals.forEach(g => {
      list.push(...flattenVariable(g.name, g.type, g.address, 'global', state));
    });

    // 2. Heap Allocations
    state.heapAllocations.forEach((alloc, index) => {
      // Find pointer variables pointing to this heap allocation
      let inferredType: DataType = 'int';
      let name = `Heap Allocation #${index + 1}`;
      
      const allVars: VMVariable[] = [];
      state.globals.forEach(v => allVars.push(v));
      state.stack.forEach(frame => {
        frame.variables.forEach(v => allVars.push(v));
      });

      const pointingVar = allVars.find(v => {
        if (v.type && typeof v.type === 'object' && 'pointerTo' in v.type) {
          const val = state.dataView.getUint32(v.address, true);
          return val === alloc.address;
        }
        return false;
      });

      if (pointingVar && typeof pointingVar.type === 'object' && 'pointerTo' in pointingVar.type) {
        inferredType = pointingVar.type.pointerTo;
        name = `Heap Block (*${pointingVar.name})`;
      }

      if (alloc.freed) {
        list.push({
          address: alloc.address,
          name,
          type: 'Freed Memory',
          valueStr: 'FREED',
          pointerTarget: null,
          region: 'heap',
          highlighted: false,
          size: alloc.size,
          isFreed: true
        });
      } else {
        list.push(...flattenVariable(name, inferredType, alloc.address, 'heap', state));
      }
    });

    // 3. Stack Frames
    state.stack.forEach(frame => {
      frame.variables.forEach(v => {
        const highlighted = state.currentLine > 1 && state.stack.length > 0; 
        list.push(...flattenVariable(v.name, v.type, v.address, 'stack', state, frame.functionName, highlighted));
      });
    });

    return list.sort((a, b) => b.address - a.address); // sort descending (stack top-down)
  };

  const flattenVariable = (
    name: string,
    type: DataType,
    address: number,
    region: 'global' | 'stack' | 'heap',
    state: VMState,
    frameName?: string,
    highlighted = false
  ): FlattenedCell[] => {
    const size = getDataTypeSize(type, state.structTypes);

    if (typeof type === 'string' || 'pointerTo' in type) {
      const isPtr = typeof type === 'object' && 'pointerTo' in type;
      const val = readMemory(address, type, state);
      
      let valStr = '';
      let pointerTarget: number | null = null;
      
      if (isPtr) {
        pointerTarget = Number(val);
        valStr = formatAddress(pointerTarget);
      } else if (type === 'char') {
        const code = val.charCodeAt(0);
        valStr = code === 0 ? '\\0' : `'${val}' (${code})`;
      } else {
        valStr = val.toString();
      }

      return [{
        address,
        name,
        type: stringifyType(type),
        valueStr: valStr,
        pointerTarget,
        region,
        frameName,
        highlighted,
        size
      }];
    }

    if ('arrayOf' in type) {
      const cells: FlattenedCell[] = [];
      const elemSize = getDataTypeSize(type.arrayOf, state.structTypes);
      for (let i = 0; i < type.size; i++) {
        const itemAddr = address + i * elemSize;
        cells.push(...flattenVariable(`${name}[${i}]`, type.arrayOf, itemAddr, region, state, frameName, highlighted));
      }
      return cells;
    }

    if ('structName' in type) {
      const cells: FlattenedCell[] = [];
      const structDef = state.structTypes.get(type.structName);
      if (structDef) {
        structDef.fields.forEach(field => {
          const fieldAddr = address + field.offset;
          cells.push(...flattenVariable(`${name}.${field.name}`, field.type, fieldAddr, region, state, frameName, highlighted));
        });
      }
      return cells;
    }

    return [];
  };

  const stringifyType = (type: DataType): string => {
    if (typeof type === 'string') return type;
    if ('pointerTo' in type) return `${stringifyType(type.pointerTo)}*`;
    if ('arrayOf' in type) return `${stringifyType(type.arrayOf)}[${type.size}]`;
    if ('structName' in type) return `struct ${type.structName}`;
    return 'void';
  };

  // Recalculate pointer coordinate connections for overlay SVGs
  const updateArrows = () => {
    const body = visualizerBodyRef.current;
    if (!body || !vmState) return;

    const bodyRect = body.getBoundingClientRect();
    const cells = getFlattenedCells(vmState);
    const newArrows: Arrow[] = [];

    cells.forEach(cell => {
      if (cell.pointerTarget !== null && cell.pointerTarget > 0) {
        const fromEl = document.getElementById(`mem-val-${cell.address}`);
        const toEl = document.getElementById(`mem-cell-${cell.pointerTarget}`);

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          // Left/Right sides calculation depending on screen RTL direction
          const fromX = (fromRect.left + fromRect.width / 2) - bodyRect.left;
          const fromY = (fromRect.top + fromRect.height / 2) - bodyRect.top;
          
          // Draw arrow to the left/right border of cell box depending on alignment
          const toX = toRect.left - bodyRect.left + 5;
          const toY = (toRect.top + toRect.height / 2) - bodyRect.top;

          newArrows.push({
            fromX,
            fromY,
            toX,
            toY,
            fromAddr: cell.address,
            toAddr: cell.pointerTarget
          });
        }
      }
    });

    setArrows(newArrows);
  };

  // Recalculate arrow draw coordinates when stepIndex changes or resize occurs
  useEffect(() => {
    updateArrows();
    // Tiny delay to ensure layout updates beforehand
    const timer = setTimeout(updateArrows, 50);
    return () => clearTimeout(timer);
  }, [vmState, historyIndex]);

  useEffect(() => {
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [vmState]);

  // Custom key binder for editor Tab, Enter key, auto-closing and backspace deletion pairs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const start = e.currentTarget.selectionStart;
    const end = e.currentTarget.selectionEnd;
    const val = e.currentTarget.value;

    if (e.key === 'Tab') {
      e.preventDefault();
      const newVal = val.substring(0, start) + '    ' + val.substring(end);
      handleCodeChange(newVal);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4;
        }
      }, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Find current line spacing to duplicate
      const lastNewLine = val.lastIndexOf('\n', start - 1);
      const currentLine = val.substring(lastNewLine + 1, start);
      const match = currentLine.match(/^(\s*)/);
      const spaces = match ? match[1] : '';

      const newVal = val.substring(0, start) + '\n' + spaces + val.substring(end);
      handleCodeChange(newVal);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 1 + spaces.length;
        }
      }, 0);
    } else {
      const openChars = ['(', '[', '{', '"', "'"];
      const closeChars = [')', ']', '}', '"', "'"];
      const pairMap: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'"
      };

      const key = e.key;

      if (closeChars.includes(key) && start === end && start < val.length && val.charAt(start) === key) {
        e.preventDefault();
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 1;
          }
        }, 0);
      } else if (openChars.includes(key)) {
        e.preventDefault();
        const closingChar = pairMap[key];
        const selectedText = val.substring(start, end);
        const newVal = val.substring(0, start) + key + selectedText + closingChar + val.substring(end);
        handleCodeChange(newVal);
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = start + 1;
            editorRef.current.selectionEnd = start + 1 + selectedText.length;
          }
        }, 0);
      } else if (key === 'Backspace') {
        if (start === end && start > 0 && start < val.length) {
          const leftChar = val.charAt(start - 1);
          const rightChar = val.charAt(start);
          if (pairMap[leftChar] === rightChar) {
            e.preventDefault();
            const newVal = val.substring(0, start - 1) + val.substring(start + 1);
            handleCodeChange(newVal);
            setTimeout(() => {
              if (editorRef.current) {
                editorRef.current.selectionStart = editorRef.current.selectionEnd = start - 1;
              }
            }, 0);
          }
        }
      }
    }
  };

  // Custom Markdown parsing helper
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    let insideList = false;
    const jsxElements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Headings
      if (trimmed.startsWith('### ')) {
        closeListIfNeeded(jsxElements, insideList);
        insideList = false;
        jsxElements.push(<h3 key={index}>{parseInlineMarkdown(trimmed.substring(4))}</h3>);
        return;
      }
      if (trimmed.startsWith('## ')) {
        closeListIfNeeded(jsxElements, insideList);
        insideList = false;
        jsxElements.push(<h2 key={index}>{parseInlineMarkdown(trimmed.substring(3))}</h2>);
        return;
      }
      if (trimmed.startsWith('# ')) {
        closeListIfNeeded(jsxElements, insideList);
        insideList = false;
        jsxElements.push(<h1 key={index}>{parseInlineMarkdown(trimmed.substring(2))}</h1>);
        return;
      }

      // Static code blocks: check blocks
      if (trimmed.startsWith('```')) {
        closeListIfNeeded(jsxElements, insideList);
        insideList = false;
        
        const lang = trimmed.substring(3).trim();
        const headerText = lang === 'text' ? 'תרשים זיכרון' : 'שפת C';
        
        // Accumulate full block code
        let codeStr = '';
        let j = index + 1;
        while (j < lines.length && !lines[j].trim().startsWith('```')) {
          codeStr += lines[j] + '\n';
          j++;
        }
        
        jsxElements.push(
          <div className="code-block-container" key={index}>
            <div className="code-block-header">
              <span>{headerText}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(codeStr);
                alert('הקוד הועתק ללוח!');
              }}>העתק קוד</button>
            </div>
            <pre className="code-block"><code>{codeStr}</code></pre>
          </div>
        );
        // Advance outer loop index
        lines.splice(index, j - index);
        return;
      }

      // Lists
      if (trimmed.startsWith('* ')) {
        if (!insideList) {
          insideList = true;
          // Create ul element
        }
        jsxElements.push(<li key={index} style={{ marginRight: '20px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>{parseInlineMarkdown(trimmed.substring(2))}</li>);
        return;
      }

      // Break lists if normal paragraph
      if (trimmed === '') {
        return;
      }

      closeListIfNeeded(jsxElements, insideList);
      insideList = false;

      // Callout box tips/warnings
      if (trimmed.startsWith('> [!TIP]')) {
        let blockText = '';
        let j = index + 1;
        while (j < lines.length && lines[j].trim().startsWith('>')) {
          blockText += lines[j].trim().substring(1).trim() + ' ';
          j++;
        }
        jsxElements.push(
          <div className="callout tip" key={index}>
            <div className="callout-title">💡 טיפ ללמידה</div>
            <p style={{ margin: 0 }}>{parseInlineMarkdown(blockText)}</p>
          </div>
        );
        lines.splice(index, j - index);
        return;
      }

      if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!IMPORTANT]')) {
        let blockText = '';
        let j = index + 1;
        while (j < lines.length && lines[j].trim().startsWith('>')) {
          blockText += lines[j].trim().substring(1).trim() + ' ';
          j++;
        }
        jsxElements.push(
          <div className="callout warning" key={index}>
            <div className="callout-title">⚠️ הערה חשובה</div>
            <p style={{ margin: 0 }}>{parseInlineMarkdown(blockText)}</p>
          </div>
        );
        lines.splice(index, j - index);
        return;
      }

      // Normal paragraph
      jsxElements.push(<p key={index}>{parseInlineMarkdown(trimmed)}</p>);
    });

    return jsxElements;
  };

  const closeListIfNeeded = (_elements: any[], _insideList: boolean) => {
    // For react list structures we just render li elements. Wrapping list in ul is cleaner but for this simplified parser list works directly.
  };

  const parseInlineMarkdown = (
    text: string,
    codeBlocks: string[] = [],
    boldBlocks: string[] = []
  ): React.ReactNode[] => {
    // 1. Extract code blocks first (between backticks)
    let tempText = text;
    
    // Find all `code` and replace with placeholders
    const codeRegex = /`(.*?)`/g;
    let match;
    let index = codeBlocks.length;
    while ((match = codeRegex.exec(tempText)) !== null) {
      const placeholder = `___CODE_PLACEHOLDER_${index}___`;
      codeBlocks.push(match[1]);
      tempText = tempText.replace(match[0], placeholder);
      codeRegex.lastIndex = 0; // reset regex index because we modified the string
      index++;
    }

    // 2. Extract bold blocks (between **)
    const boldRegex = /\*\*(.*?)\*\*/g;
    index = boldBlocks.length;
    while ((match = boldRegex.exec(tempText)) !== null) {
      const placeholder = `___BOLD_PLACEHOLDER_${index}___`;
      boldBlocks.push(match[1]);
      tempText = tempText.replace(match[0], placeholder);
      boldRegex.lastIndex = 0; // reset
      index++;
    }

    // 3. Now split by placeholders and map them back to React elements
    const placeholderRegex = /(___CODE_PLACEHOLDER_\d+___|___BOLD_PLACEHOLDER_\d+___)/g;
    const parts = tempText.split(placeholderRegex);

    return parts.map((part, partIdx) => {
      const codeMatch = part.match(/___CODE_PLACEHOLDER_(\d+)___/);
      if (codeMatch) {
        const codeIdx = parseInt(codeMatch[1], 10);
        return (
          <code className="inline-code" key={partIdx} dir="ltr">
            {codeBlocks[codeIdx]}
          </code>
        );
      }

      const boldMatch = part.match(/___BOLD_PLACEHOLDER_(\d+)___/);
      if (boldMatch) {
        const boldIdx = parseInt(boldMatch[1], 10);
        const innerText = boldBlocks[boldIdx];
        return (
          <strong key={partIdx} style={{ color: 'var(--text-bold, white)', fontWeight: 'bold' }}>
            {parseInlineMarkdown(innerText, codeBlocks, boldBlocks)}
          </strong>
        );
      }

      return part;
    });
  };

  const flattenedCells = getFlattenedCells(vmState);
  const stackCells = flattenedCells.filter(c => c.region === 'stack');
  const heapCells = flattenedCells.filter(c => c.region === 'heap');
  const globalCells = flattenedCells.filter(c => c.region === 'global');

  return (
    <div className="app-container">
      {/* Sidebar Chapters navigation */}
      <aside className="sidebar">
        <div className="logo-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-icon">C</div>
            <span className="logo-text">C Book בעברית</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`pet-toggle-btn ${petsEnabled ? 'enabled' : ''}`}
              onClick={togglePets}
              title="הפעל חיות מחמד מונפשות 🐾"
              aria-label="Toggle Animated Pets"
            >
              🐾
            </button>
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title="שנה ערכת נושא"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        
        <ul className="chapter-list">
          {chapters.map(ch => (
            <li
              key={ch.id}
              className={`chapter-item ${ch.id === activeChapterId ? 'active' : ''}`}
              onClick={() => setActiveChapterId(ch.id)}
            >
              <div className="chapter-title">
                <span className={`chapter-status-dot ${completedChapters.has(ch.id) ? 'completed' : ''}`} />
                <span>{ch.title}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Chapter Content scroll panel */}
      <main className="main-content">
        <article>
          {renderMarkdown(activeChapter.content)}
        </article>

        {/* Playground Exercises widget if active chapter has exercises */}
        {activeChapter.exercises && activeChapter.exercises.length > 0 && (
          <section className="playground-section">
            <div className="playground-header-row">
              <h3 className="playground-title">סדנת תרגול אינטראקטיבית</h3>
              <div className="exercise-tabs">
                {activeChapter.exercises.map((_, idx) => {
                  const isCompleted = completedExercises.has(`${activeChapter.id}-${idx}`);
                  const isActive = idx === activeExerciseIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveExerciseIndex(idx)}
                      className={`exercise-tab-btn ${isActive ? 'active' : ''}`}
                    >
                      <span>משימה {idx + 1}</span>
                      {isCompleted && <span style={{ color: isActive ? 'white' : 'var(--accent-success)', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="exercise-prompt">
              <p style={{ fontWeight: '600', color: 'var(--text-bold, white)', marginBottom: '8px' }}>המשימה שלך:</p>
              <p style={{ margin: 0, fontSize: '15px', whiteSpace: 'pre-line' }}>{activeChapter.exercises[activeExerciseIndex]?.prompt}</p>
              {activeChapter.exercises[activeExerciseIndex]?.hint && (
                <div style={{ marginTop: '14px' }}>
                  <button
                    className="btn-hint"
                    onClick={() => setShowHint(prev => !prev)}
                  >
                    {showHint ? '💡 הסתר רמז' : '💡 הצג רמז'}
                  </button>
                  {showHint && (
                    <div className="hint-box">
                      <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--accent-primary)' }}>רמז:</strong>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {activeChapter.exercises[activeExerciseIndex].hint}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="playground-grid">
              {/* Left Column: Code Editor & Console panel */}
              <div className="editor-panel">
                <div className="panel-header">
                  <span className="panel-title">עורך הקוד C (main.c)</span>
                  <div className="panel-actions">
                    <button className="btn btn-secondary" onClick={handleResetCode}>אתחל</button>
                    <button className="btn btn-secondary" onClick={startStepMode}>צעד-אחר-צעד</button>
                    <button className="btn btn-primary" onClick={runCode}>הרץ קוד</button>
                  </div>
                </div>

                <div className="code-editor-wrapper">
                  <div className="line-numbers-gutter" ref={gutterRef}>
                    {code.split('\n').map((_, i) => (
                      <div key={i} className="line-number">{i + 1}</div>
                    ))}
                  </div>
                  <div className="editor-container">
                    <pre 
                      ref={highlightRef} 
                      className="editor-highlight" 
                      dangerouslySetInnerHTML={{ __html: highlightC(code) + (code.endsWith('\n') ? ' ' : '') }}
                    />
                    <textarea
                      ref={editorRef}
                      className="code-editor"
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onScroll={handleScroll}
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Step controls overlays */}
                {stepMode && vmState && (
                  <div className="panel-header" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      שורה נוכחית: <strong>{vmState.currentLine}</strong> {vmState.isTerminated && '(הסתיים)'}
                    </span>
                    <div className="panel-actions">
                      <button className="btn btn-secondary" onClick={stepBackward} disabled={historyIndex <= 0}>צעד אחורה</button>
                      <button className="btn btn-primary" onClick={stepForward} disabled={vmState.isTerminated}>צעד קדימה</button>
                    </div>
                  </div>
                )}

                <div className="console-panel">
                  {consoleLogs.map((log, index) => (
                    <div key={index} className={`console-line console-${log.type}`}>
                      {log.type === 'info' && '> '}
                      {log.type === 'error' && '❌ '}
                      {log.type === 'success' && '✅ '}
                      {log.text}
                    </div>
                  ))}
                  {consoleLogs.length === 0 && <span style={{ color: 'var(--text-muted)' }}>פלט התוכנית יוצג כאן...</span>}
                </div>
              </div>

              {/* Right Column: Visual RAM Memory visualizer */}
              <div className="visualizer-panel">
                <div className="panel-header">
                  <span className="panel-title">מפת זיכרון RAM חיה</span>
                  {vmState && (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      SP: {formatAddress(vmState.sp)} | HP: {formatAddress(vmState.hp)}
                    </span>
                  )}
                </div>

                <div ref={visualizerBodyRef} className="visualizer-body">
                  {!vmState ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '15px', minHeight: '300px' }}>
                      הרץ את הקוד או הפעל מצב צעד-אחר-צעד כדי לראות את מפת הזיכרון החיה.
                    </div>
                  ) : (
                    <>
                      {/* Connection SVG overlay for arrows */}
                      <svg className="pointer-overlay">
                        <defs>
                          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="var(--accent-secondary)" />
                          </marker>
                        </defs>
                        {arrows.map((arrow, index) => (
                          <path
                            key={index}
                            d={`M ${arrow.fromX} ${arrow.fromY} C ${(arrow.fromX + arrow.toX) / 2} ${arrow.fromY}, ${(arrow.fromX + arrow.toX) / 2} ${arrow.toY}, ${arrow.toX} ${arrow.toY}`}
                            stroke="var(--accent-secondary)"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                          />
                        ))}
                      </svg>

                      {/* Globals */}
                      {globalCells.length > 0 && (
                        <div>
                          <div className="memory-section-title">משתנים גלובליים (Globals)</div>
                          <div className="memory-grid">
                            {globalCells.map(cell => (
                              <div
                                key={cell.address}
                                id={`mem-cell-${cell.address}`}
                                className={`memory-cell ${cell.highlighted ? 'highlighted' : ''}`}
                              >
                                <span className="cell-address">{formatAddress(cell.address)}</span>
                                <span className="cell-name">{cell.name}</span>
                                <span className="cell-type">{cell.type}</span>
                                <span id={`mem-val-${cell.address}`} className="cell-value">{cell.valueStr}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Heap area */}
                      {(heapCells.length > 0 || vmState.hp > 256) && (
                        <div>
                          <div className="memory-section-title">
                            <span>הערמה (Heap - הקצאה דינמית)</span>
                            <span style={{ fontSize: '11px', textTransform: 'none' }}>כתובות 256 ומעלה</span>
                          </div>
                          <div className="memory-grid">
                            {heapCells.map(cell => (
                              <div
                                key={cell.address}
                                id={`mem-cell-${cell.address}`}
                                className={`memory-cell ${cell.isFreed ? 'pointer-target' : ''}`}
                                style={cell.isFreed ? { opacity: 0.5, borderStyle: 'dashed' } : {}}
                              >
                                <span className="cell-address">{formatAddress(cell.address)}</span>
                                <span className="cell-name" style={cell.isFreed ? { textDecoration: 'line-through' } : {}}>{cell.name}</span>
                                <span className="cell-type">{cell.type}</span>
                                <span id={`mem-val-${cell.address}`} className="cell-value">{cell.valueStr}</span>
                              </div>
                            ))}
                            {heapCells.length === 0 && (
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                                (ערמה ריקה - לא בוצעו הקצאות malloc)
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Stack area */}
                      <div>
                        <div className="memory-section-title">
                          <span>המחסנית (Stack - משתנים מקומיים)</span>
                          <span style={{ fontSize: '11px', textTransform: 'none' }}>כתובות גדלות כלפי מטה</span>
                        </div>
                        <div className="memory-grid">
                          {/* Group by stack frames */}
                          {vmState.stack.length === 0 ? (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                              (מחסנית ריקה)
                            </div>
                          ) : (
                            vmState.stack.map((frame, frameIdx) => {
                              const frameCells = stackCells.filter(c => c.frameName === frame.functionName);
                              return (
                                <div key={frameIdx} className="stack-frame-container">
                                  <div className="stack-frame-title">{frame.functionName}() Frame</div>
                                  {frameCells.map(cell => (
                                    <div
                                      key={cell.address}
                                      id={`mem-cell-${cell.address}`}
                                      className={`memory-cell ${cell.highlighted && vmState.currentLine > 1 ? 'highlighted' : ''}`}
                                      style={{ marginBottom: '4px' }}
                                    >
                                      <span className="cell-address">{formatAddress(cell.address)}</span>
                                      <span className="cell-name">{cell.name}</span>
                                      <span className="cell-type">{cell.type}</span>
                                      <span id={`mem-val-${cell.address}`} className="cell-value">{cell.valueStr}</span>
                                    </div>
                                  ))}
                                  {frameCells.length === 0 && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', paddingRight: '8px' }}>
                                      (אין משתנים מקומיים)
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Verification status output */}
            {verification && (
              <div className={`verification-box ${verification.passed ? 'success' : 'failed'}`}>
                <div className="verification-icon">{verification.passed ? '🎉' : '❌'}</div>
                <div className="verification-text">
                  <h4>{verification.passed ? 'התרגיל הושלם בהצלחה!' : 'התרגיל לא הושלם עדיין'}</h4>
                  <p>{verification.passed ? 'כל הכבוד! פתרת את המשימה כראוי. תוכל להמשיך לפרק הבא.' : verification.errorMsg}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Chapter progression links */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '40px' }}>
          {activeChapterId < chapters.length ? (
            <button
              className="btn-next-chapter"
              onClick={() => setActiveChapterId(activeChapterId + 1)}
            >
              המשך לפרק הבא &larr;
            </button>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', padding: '20px', borderRadius: '12px', marginTop: '32px', width: '100%' }}>
              <h3 style={{ color: 'var(--accent-success)', marginTop: 0 }}>הגעת לסוף המדריך! 🎓</h3>
              <p style={{ margin: 0 }}>סיימת בהצלחה את כל פרקי מדריך שפת C. עכשיו יש לך את הידע והכלים הדרושים כדי לפתח פרויקטים אמיתיים במחשב האישי שלך.</p>
            </div>
          )}
        </div>
      </main>
      {petsEnabled && (
        <div className="pets-overlay">
          {pets.map(pet => (
            <img
              key={pet.id}
              className={`pet-character ${pet.state} ${pet.direction === -1 ? 'flipped' : ''}`}
              style={{ left: `${pet.x}%`, bottom: `${pet.y}px` }}
              src={pet.imageUrl}
              alt={pet.name}
              title={pet.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
