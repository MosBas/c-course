import { formatAddress, readMemory } from './c-interpreter/interpreter';
import type { VMState } from './c-interpreter/interpreter';

export interface Exercise {
  prompt: string;
  initialCode: string;
  verify: (state: VMState) => { passed: boolean; errorMsg?: string };
  hint?: string;
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
  exercises?: Exercise[];
}

export const chapters: Chapter[] = [
  {
    id: 1,
    title: '1. מה זה מחשב ואיך הוא מריץ קוד?',
    content: `
المטרה של המדריך הזה היא לקחת אותך לעולם של **שפת C** – אחת השפות החשובות והמשפיעות ביותר בהיסטוריה של המחשוב. אבל לפני שנכתוב את שורת הקוד הראשונה שלנו, אנחנו חייבים להבין: מה קורה מתחת למכסה המנוע של המחשב?

אם יצא לך לכתוב קוד בפייתון (Python), התרגלת לכך שהמחשב פשוט מריץ את הקוד שלך. בפייתון, ישנה תוכנה בשם "מפרש" (Interpreter) שקוראת את הקוד שלך שורה אחר שורה ומתרגמת אותו לפעולות בזמן אמת. בשפת C, הסיפור שונה לגמרי. C היא שפה **מהודרת** (Compiled).

### זיכרון ה-RAM והמעבד (CPU)
המחשב שלך מורכב משני שחקנים ראשיים:
1. **המעבד (CPU):** ה"מוח" של המחשב. הוא יודע לבצע פעולות מתמטיות פשוטות מאוד (חיבור, חיסור, השוואה) במהירות מטורפת. אבל המעבד לא מבין אנגלית, עברית או פייתון. הוא מבין רק שפת מכונה – סדרה של אפסים ואחדים (\`0\`-ים ו-\`1\`-ים) המייצגים פקודות חשמליות.
2. **זיכרון ה-RAM (זיכרון העבודה):** ה"לוח המחיק" של המחשב. זהו רצף ענק של "תאים" קטנים בזיכרון. כל תא כזה מכיל ערך כלשהו ויש לו **כתובת ייחודית** (כמו מספר בית ברחוב).

### מה זה מהדר (Compiler)?
כיוון שהמעבד מבין רק אפסים ואחדים, אנחנו צריכים כלי שיתרגם את קוד ה-C שלנו לשפת מכונה. הכלי הזה נקרא **מהדר** (Compiler). 
המהדר לוקח את קובץ הטקסט שכתבנו, מנתח אותו, בודק שאין לנו שגיאות כתיב (שגיאות קומפילציה), ומייצר קובץ ריצה בינארי (קובץ \`.exe\` בווינדוס) שמכיל פקודות ישירות למעבד.

### למה ללמוד C?
* **הבנה אמיתית:** פייתון מחביאה ממך את הזיכרון של המחשב. ב-C, אתה שולט ישירות בזיכרון, מקצה אותו ומשחרר אותו.
* **ביצועים:** מכיוון שקוד C מתורגם ישירות לשפת מכונה ללא מתווכים, הוא רץ במהירות מקסימלית ובצריכת זיכרון מינימלית.
* **בסיס להכל:** מערכות הפעלה (Windows, Linux, macOS), מנועי משחקים, ודפדפנים כתובים ברובם ב-C או C++.

בפרק הבא נלמד איך נראית התוכנית הראשונה ב-C ונריץ אותה!
    `
  },
  {
    id: 2,
    title: '2. התוכנית הראשונה שלי',
    content: `
בוא נכתוב את התוכנית הראשונה שלנו בשפת C. התוכנית המפורסמת ביותר בעולם הקידוד היא תוכנית שמדפיסה למסך את המילים: \`Hello, World!\`.

הנה קטע הקוד הקצר שמדפיס את המשפט:
\`\`\`c
printf("Hello, World!\\n");
\`\`\`

וכדי להריץ אותו במחשב, אנחנו צריכים לכתוב תוכנית מלאה (הכוללת את פונקציית ה-main וייבוא ספריית הקלט/פלט):
\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

בוא נפרק את הקוד הזה שורה אחר שורה:

1. **\`#include <stdio.h>\`**:
   זוהי הנחיה למהדר לכלול את הספרייה הסטנדרטית לקלט ופלט (Standard Input Output). בלעדיה, המחשב לא ידע מה זה \`printf\` ואיך להדפיס למסך.
2. **\`int main() { ... }\`**:
   זהו **נקודת ההתחלה** של כל תוכנית C. המעבד תמיד יחפש פונקציה בשם \`main\` ויתחיל להריץ את הקוד מתוכה. ה-\`int\` פירושו שהפונקציה מחזירה מספר שלם בסיום (בדוגמה שלנו \`return 0\` שמסמן למערכת ההפעלה שהתוכנית הסתיימה בהצלחה ללא שגיאות).
3. **\`printf("Hello, World!\\n");\`**:
   זוהי הפקודה שמדפיסה למסך. הצירוף \`\\n\` מייצג ירידת שורה (New Line).
4. **שימו לב לנקודה-פסיק \`;\` בסוף השורה!**
   בניגוד לפייתון, ב-C כל שורת פקודה חייבת להסתיים ב-\`;\`. השמטה שלו היא אחת משגיאות הקומפילציה הנפוצות ביותר.

### משימה:
שנה את קוד ה-C בעורך למטה כך שידפיס את המשפט הבא בעברית:
\`שלום עולם!\` ולאחר מכן הרץ את הקוד.
    `,
    exercises: [
      {
        prompt: 'כתוב תוכנית שמדפיסה למסך את הטקסט "שלום עולם!" (ללא מרכאות, כולל סימן קריאה). בסוף ההדפסה רצוי לרדת שורה (n\\).',
        initialCode: `#include <stdio.h>

int main() {
    // כתוב כאן את קוד ההדפסה שלך
    printf("Hello, World!\\n");
    return 0;
}`,
        verify: (state: VMState) => {
          const cleanedStdout = state.stdout.trim();
          if (cleanedStdout.includes('שלום עולם!')) {
            return { passed: true };
          }
          return { 
            passed: false, 
            errorMsg: `הפלט שהתקבל הוא: "${state.stdout}". ודא שהקוד מדפיס בדיוק "שלום עולם!".` 
          };
        },
        hint: 'החלף את הטקסט "Hello, World!\\n" בפקודת ה-printf לטקסט "שלום עולם!\\n".'
      },
      {
        prompt: 'הדפס את השם שלך בשורה הראשונה ואת הגיל שלך בשורה השנייה בפורמט הבא בדיוק: השורה הראשונה "Name: Moshe" והשורה השנייה "Age: 25" (תוכל להשתמש בשם ובגיל שלך, זכור לרדת שורה בסוף כל הדפסה).',
        initialCode: `#include <stdio.h>

int main() {
    // הדפס כאן את השם ואת הגיל בשורות נפרדות
    
    return 0;
}`,
        verify: (state: VMState) => {
          const cleanedStdout = state.stdout.trim();
          const hasName = cleanedStdout.includes('Name:');
          const hasAge = cleanedStdout.includes('Age:');
          const lines = cleanedStdout.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (hasName && hasAge && lines.length >= 2) {
            return { passed: true };
          }
          return {
            passed: false,
            errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}". ודא שהדפסת בשתי שורות בפורמט: Name: [name] ובשורה הבאה Age: [age].`
          };
        },
        hint: 'התחל בכתיבת שתי פקודות printf נפרדות: הראשונה printf("Name: Moshe\\n"); והשנייה printf("Age: 25\\n"); (תוכל להחליף את הפרטים בשלך).'
      },
      {
        prompt: 'כתוב תוכנית שמדפיסה למסך משולש כוכביות קטן בגובה 3 שורות (בשורה הראשונה כוכבית אחת, בשנייה שתיים ובשלישית שלוש, זכור לרדת שורה בסוף כל הדפסה).',
        initialCode: `#include <stdio.h>

int main() {
    // הדפס כאן משולש כוכביות בגובה 3 שורות
    
    return 0;
}`,
        verify: (state: VMState) => {
          const lines = state.stdout.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length === 3 && lines[0] === '*' && lines[1] === '**' && lines[2] === '***') {
            return { passed: true };
          }
          return {
            passed: false,
            errorMsg: `הפלט המודפס שגוי. צפוי משולש כוכביות בגובה 3, אך התקבל:\n${state.stdout}`
          };
        },
        hint: 'השתמש ב-printf שלוש פעמים ברצף, בכל פעם עם כוכבית נוספת ותו ירידת שורה: printf("*\\n"); לאחר מכן printf("**\\n"); ולבסוף printf("***\\n");'
      }
    ]
  },
  {
    id: 3,
    title: '3. משתנים וטיפוסי נתונים',
    content: `
בפייתון, כשרצינו ליצור משתנה, פשוט כתבנו:
\`\`\`python
x = 5
name = "Daniel"
\`\`\`
השפה הבינה לבד מהו סוג המשתנה. שפת C היא **שפה עם טיפוסים סטטיים** (Statically Typed). זה אומר שכאשר יוצרים משתנה, חייבים להגיד למהדר מראש **בדיוק** כמה מקום הוא יתפוס בזיכרון ומה אנחנו מתכוונים לאחסן בו.

שלושת הטיפוסים הבסיסיים ביותר ב-C הם:
1. **\`int\` (מספר שלם - Integer):** תופס 4 בייטים (Bytes) בזיכרון. משמש למספרים שלמים כמו \`10\`, \`-5\`, \`1000\`.
2. **\`char\` (תו בודד - Character):** תופס בייט 1 (Byte) בזיכרון. משמש לאותיות או סימנים בודדים, למשל \`'A'\`, \`'x'\`, \`'7'\`. ב-C תווים נכתבים תמיד בתוך גרש בודד \`'\`.
3. **\`float\` (מספר עשרוני - Floating Point):** תופס 4 בייטים. משמש למספרים עם נקודה עשרונית כמו \`3.14\`, \`-0.5\`.

### הגדרת משתנים והדפסתם
הנה דוגמה לתוכנית מלאה המגדירה משתנים ומדפיסה אותם בעזרת "מצייני פורמט" (Format Specifiers):
\`\`\`c
#include <stdio.h>

int main() {
    int age = 25;
    char grade = 'A';
    float pi = 3.14;

    printf("Age: %d\\n", age);
    printf("Grade: %c\\n", grade);
    printf("Pi: %f\\n", pi);

    return 0;
}
\`\`\`

מצייני הפורמט מסבירים ל-\`printf\` איך להציג את הבייטים שבזיכרון:
* \`%d\` - משמש להדפסת מספר שלם (\`int\`).
* \`%c\` - משמש להדפסת תו (\`char\`).
* \`%f\` - משמש להדפסת מספר עשרוני (\`float\`).

שים לב למפת הזיכרון בצד שמאל בזמן הרצת הקוד! המשתנים יופיעו בזיכרון בכתובות ייחודיות להם.

### משימה:
צור משתנה שלם בשם \`height\` שערכו \`180\`, ומשתנה עשרוני בשם \`weight\` שערכו \`75.5\`.
הדפס אותם למסך בפורמט הבא בדיוק:
\`Height: 180, Weight: 75.500000\`
    `,
    exercises: [
      {
        prompt: 'הגדר משתנה int בשם height עם הערך 180, ומשתנה float בשם weight עם הערך 75.5. הדפס אותם באותה השורה בפורמט: "Height: 180, Weight: 75.500000" (זכור לרדת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    // הגדר את המשתנים כאן
    
    // הדפס את המשתנים כאן
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const height = mainFrame.variables.get('height');
          const weight = mainFrame.variables.get('weight');

          if (!height || height.type !== 'int') {
            return { passed: false, errorMsg: 'עליך להגדיר משתנה מסוג int בשם height' };
          }
          if (!weight || weight.type !== 'float') {
            return { passed: false, errorMsg: 'עליך להגדיר משתנה מסוג float בשם weight' };
          }

          const hVal = readMemory(height.address, 'int', state);
          const wVal = readMemory(weight.address, 'float', state);

          if (hVal !== 180) return { passed: false, errorMsg: 'הערך של height צריך להיות 180' };
          if (Math.abs(wVal - 75.5) > 0.001) return { passed: false, errorMsg: 'הערך של weight צריך להיות 75.5' };

          if (state.stdout.includes('Height: 180') && state.stdout.includes('Weight: 75.5')) {
            return { passed: true };
          }

          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}". ודא שהדפסת לפי הפורמט הנדרש.` };
        },
        hint: 'בתוך main הגדר: int height = 180; float weight = 75.5; ולאחר מכן הדפס בעזרת printf("Height: %d, Weight: %f\\n", height, weight);'
      },
      {
        prompt: 'הגדר שני משתנים שלמים: a עם ערך 10 ו-b עם ערך 20. בצע החלפה (Swap) בין הערכים של המשתנים (כך ש-a יכיל 20 ו-b יכיל 10) והדפס את הערכים החדשים בפורמט: "a: 20, b: 10" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;
    
    // בצע את ההחלפה כאן (תוכל להשתמש במשתנה עזר temp)
    
    // הדפס את הערכים החדשים של a ו-b
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const aVar = mainFrame.variables.get('a');
          const bVar = mainFrame.variables.get('b');

          if (!aVar || !bVar) return { passed: false, errorMsg: 'אל תמחק את המשתנים a ו-b' };

          const aVal = readMemory(aVar.address, 'int', state);
          const bVal = readMemory(bVar.address, 'int', state);

          if (aVal !== 20 || bVal !== 10) {
            return { passed: false, errorMsg: `ערכי המשתנים הם a: ${aVal}, b: ${bVal}. עליך לבצע החלפה ביניהם.` };
          }

          if (state.stdout.trim() === 'a: 20, b: 10') {
            return { passed: true };
          }

          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}". ודא שהדפסת בדיוק: "a: 20, b: 10"` };
        },
        hint: 'השתמש במשתנה עזר שלישי: int temp = a; a = b; b = temp; ולאחר מכן הדפס את התוצאה.'
      },
      {
        prompt: 'הגדר משתנה int בשם length עם הערך 15, ומשתנה int בשם width עם הערך 6. הגדר משתנה שלישי בשם perimeter וחשב את היקף המלבן (2 כפול סכום האורך והרוחב). הדפס את התוצאה בפורמט: "Perimeter: 42" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    // הגדר את length, width ו-perimeter כאן
    
    // הדפס את perimeter בפורמט: Perimeter: [value]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const lenVar = mainFrame.variables.get('length');
          const widVar = mainFrame.variables.get('width');
          const perVar = mainFrame.variables.get('perimeter');

          if (!lenVar || !widVar || !perVar) {
            return { passed: false, errorMsg: 'עליך להגדיר את כל שלושת המשתנים: length, width ו-perimeter' };
          }

          const lenVal = readMemory(lenVar.address, 'int', state);
          const widVal = readMemory(widVar.address, 'int', state);
          const perVal = readMemory(perVar.address, 'int', state);

          if (lenVal !== 15 || widVal !== 6 || perVal !== 42) {
            return { passed: false, errorMsg: `הערכים צריכים להיות: length = 15, width = 6, perimeter = 42.` };
          }

          if (state.stdout.trim() === 'Perimeter: 42') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}". צפוי: "Perimeter: 42"` };
        },
        hint: 'הגדר int length = 15; int width = 6; int perimeter = 2 * (length + width); והדפס בעזרת מציין הפורמט %d.'
      }
    ]
  },
  {
    id: 4,
    title: '4. תנאים (If-Else)',
    content: `
קבלת החלטות בקוד נעשית באמצעות משפטי תנאי. המבנה של משפט תנאי ב-C דומה מאוד לזה שבפייתון, אך עם שני הבדלים תחביריים קטנים:
1. התנאי חייב להיכתב בתוך סוגריים עגולים \`(...)\`.
2. הבלוק של הקוד שיבוצע נכתב בתוך סוגריים מסולסלים \`{...}\` במקום הזחה (indentation).

הנה תוכנית מלאה המדגימה שימוש בתנאים:
\`\`\`c
#include <stdio.h>

int main() {
    int grade = 85;

    if (grade >= 55) {
        printf("עברת!\\n");
    } else {
        printf("נכשלת!\\n");
    }
    return 0;
}
\`\`\`

### אמת ושקר ב-C
בפייתון היה לנו טיפוס מיוחד \`Boolean\` שיכל להיות \`True\` או \`False\`. 
בשפת C המקורית (C90), **אין טיפוס בוליאני ייעודי**! במקום זאת:
* המספר \`0\` מייצג **שקר** (False).
* **כל מספר שאינו 0** (בדרך כלל \`1\`) מייצג **אמת** (True).

זה אומר שאם תכתוב:
\`\`\`c
if (5) {
    printf("זה תמיד יודפס!\\n");
}
\`\`\`
הקוד ירוץ וידפיס את השורה, כי 5 אינו 0, ולכן הוא נחשב "אמת".

### משימה:
לפניך קוד עם משתנה בשם \`age\`. 
כתוב תנאי ב-C הבודק אם המשתנה \`age\` גדול או שווה ל-\`18\`. 
אם כן, הדפס \`adult\\n\`, אחרת הדפס \`minor\\n\`.
    `,
    exercises: [
      {
        prompt: 'כתוב תנאי הבודק אם המשתנה age הוא 18 ומעלה. הדפס "adult" אם כן, ו-"minor" אם לא. אל תשכח לרדת שורה בסוף ההדפסה (\\n).',
        initialCode: `#include <stdio.h>

int main() {
    int age = 20; // שנה ערך זה כדי לבדוק את התנאי שלך
    
    // כתוב את תנאי ה-if-else כאן
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };
          
          const ageVar = mainFrame.variables.get('age');
          if (!ageVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה age' };
          
          const ageVal = readMemory(ageVar.address, 'int', state);
          const expected = ageVal >= 18 ? 'adult' : 'minor';
          
          if (state.stdout.trim() === expected) {
            return { passed: true };
          }
          
          return { 
            passed: false, 
            errorMsg: `עבור גיל ${ageVal} הפלט הנדרש הוא "${expected}", אך התוכנית שלך הדפיסה "${state.stdout.trim()}"` 
          };
        },
        hint: 'השתמש במבנה הבא: if (age >= 18) { printf("adult\\n"); } else { printf("minor\\n"); }'
      },
      {
        prompt: 'לפניך משתנה בשם number. כתוב תנאי הבודק אם המשתנה חיובי, שלילי או אפס. הדפס "positive" אם הוא גדול מאפס, "negative" אם הוא קטן מאפס, ו-"zero" אם הוא שווה לאפס (ודא שיש ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    int number = -5; // שנה ערך זה כדי לבדוק את התנאי שלך
    
    // כתוב כאן את התנאי הבודק חיובי, שלילי או אפס
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const numVar = mainFrame.variables.get('number');
          if (!numVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה number' };

          const numVal = readMemory(numVar.address, 'int', state);
          const expected = numVal > 0 ? 'positive' : (numVal < 0 ? 'negative' : 'zero');

          if (state.stdout.trim() === expected) {
            return { passed: true };
          }

          return {
            passed: false,
            errorMsg: `עבור מספר ${numVal} הפלט הנדרש הוא "${expected}", אך הודפס "${state.stdout.trim()}"`
          };
        },
        hint: 'השתמש בשרשור תנאים: if (number > 0) { ... } else if (number < 0) { ... } else { ... }'
      },
      {
        prompt: 'לפניך משתנה בשם year. כתוב תנאי הבודק האם השנה היא שנה מעוברת (שנה שמתחלקת ב-4 ללא שארית). אם כן, הדפס "leap" ואם לא הדפס "normal" (ודא שיש ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    int year = 2024; // שנה ערך זה כדי לבדוק את התנאי שלך
    
    // כתוב כאן את התנאי הבודק שנה מעוברת
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const yrVar = mainFrame.variables.get('year');
          if (!yrVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה year' };

          const yrVal = readMemory(yrVar.address, 'int', state);
          const expected = yrVal % 4 === 0 ? 'leap' : 'normal';

          if (state.stdout.trim() === expected) {
            return { passed: true };
          }
          return { passed: false, errorMsg: `עבור השנה ${yrVal} צפוי פלט "${expected}", אך התקבל "${state.stdout.trim()}"` };
        },
        hint: 'השתמש באופרטור השארית %: if (year % 4 == 0) { printf("leap\\n"); } else { printf("normal\\n"); }'
      }
    ]
  },
  {
    id: 5,
    title: '5. לולאות (While, For)',
    content: `
לולאות מאפשרות לנו לחזור על בלוק קוד מספר פעמים. ב-C יש שני סוגים מרכזיים של לולאות:

### לולאת \`while\`
הלולאה ממשיכה לרוץ כל עוד התנאי שבסוגריים הוא אמת (כלומר, לא אפס).
הנה תוכנית מלאה המדפיסה מספרים מ-1 עד 3:
\`\`\`c
#include <stdio.h>

int main() {
    int count = 1;
    while (count <= 3) {
        printf("%d\\n", count);
        count++; // מקדם את המשתנה ב-1. שווה ערך ל- count = count + 1
    }
    return 0;
}
\`\`\`

### לולאת \`for\`
לולאת \`for\` ב-C שונה מהלולאה בפייתון, והיא נחשבת לאחד המבנים החזקים והנוחים ביותר. התחביר שלה מורכב משלושה חלקים המופרדים בנקודה-פסיק \`;\`:
\`\`\`c
for (אתחול ; תנאי עצירה ; קידום) {
    // קוד לביצוע
}
\`\`\`

הנה תוכנית מלאה שמדפיסה מספרים מ-1 עד 5:
\`\`\`c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 5; i++) {
        printf("%d\\n", i);
    }
    return 0;
}
\`\`\`
1. **אתחול (\`int i = 1\`):** מתבצע פעם אחת בלבד עם תחילת הלולאה.
2. **תנאי עצירה (\`i <= 5\`):** נבדק לפני כל סיבוב. אם הוא אמת - הבלוק יבוצע. אם שקר - הלולאה מסתיימת.
3. **קידום (\`i++\`):** מבוצע בסוף כל סיבוב, רגע לפני בדיקת התנאי מחדש.

### משימה:
עליך לחשב את **העצרת (Factorial)** של מספר. עצרת של מספר היא מכפלת כל המספרים מ-1 ועד אותו מספר. 
לדוגמה, עצרת של 5 היא: \`1 * 2 * 3 * 4 * 5 = 120\`.
השתמש בלולאה כדי לחשב את העצרת של \`num\`, שמור את התוצאה ב-\`result\`, והדפס אותה בפורמט הבא: \`Result: 120\` (עם ירידת שורה בסוף).
    `,
    exercises: [
      {
        prompt: 'חשב את העצרת של num (שערכו 5) בעזרת לולאה, שמור את המכפלה במשתנה result, והדפס "Result: 120" (כולל ירידת שורה).',
        initialCode: `#include <stdio.h>

int main() {
    int num = 5;
    int result = 1;
    
    // כתוב כאן לולאה לחישוב העצרת
    
    // הדפס כאן את התוצאה בפורמט Result: [number]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };
          
          const resultVar = mainFrame.variables.get('result');
          if (!resultVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה result' };
          
          const resultVal = readMemory(resultVar.address, 'int', state);
          if (resultVal !== 120) {
            return { passed: false, errorMsg: `המכפלה שחושבה במשתנה result היא ${resultVal}, אך העצרת של 5 צריכה להיות 120.` };
          }
          
          if (state.stdout.trim() === 'Result: 120') {
            return { passed: true };
          }
          
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'רוץ עם לולאת for מ-2 ועד num (כולל), ובכל שלב כפול את result ב-i: result = result * i;'
      },
      {
        prompt: 'כתוב לולאת for שמדפיסה את המספרים מ-1 עד 5, כל אחד בשורה נפרדת (כולל ירידת שורה אחרי המספר 5).',
        initialCode: `#include <stdio.h>

int main() {
    // כתוב כאן לולאה שמדפיסה מ-1 עד 5
    
    return 0;
}`,
        verify: (state: VMState) => {
          const lines = state.stdout.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
          const expected = ['1', '2', '3', '4', '5'];
          const match = lines.length === expected.length && lines.every((val, i) => val === expected[i]);
          if (match) {
            return { passed: true };
          }
          return {
            passed: false,
            errorMsg: `הפלט המודפס שגוי. צפויים המספרים 1 עד 5 בשורות נפרדות, אך התקבל: "${state.stdout.trim()}"`
          };
        },
        hint: 'השתמש בלולאת for (int i = 1; i <= 5; i++) ובתוכה הדפס printf("%d\\n", i);'
      },
      {
        prompt: 'חשב בעזרת לולאה את סכום המספרים מ-1 עד 10, שמור את הסכום במשתנה total והדפס אותו בפורמט "Total: 55" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    int total = 0;
    
    // כתוב כאן לולאה שמסכמת מ-1 עד 10 לתוך total
    
    // הדפס כאן את הסכום
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const totalVar = mainFrame.variables.get('total');
          if (!totalVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה total' };

          const totalVal = readMemory(totalVar.address, 'int', state);
          if (totalVal !== 55) {
            return { passed: false, errorMsg: `הסכום שחושב במשתנה total הוא ${totalVal}, אך הסכום של 1 עד 10 הוא 55.` };
          }

          if (state.stdout.trim() === 'Total: 55') {
            return { passed: true };
          }

          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'כתוב לולאת for (int i = 1; i <= 10; i++) ובתוכה בצע total = total + i;'
      },
      {
        prompt: 'לפניך המשתנה n שערכו 7. עליך לחשב את האיבר ה-n בסדרת פיבונאצ\'י (0, 1, 1, 2, 3, 5, 8, 13...). שמור את התוצאה במשתנה fib והדפס בפורמט: "Fibonacci: 13" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    int n = 7;
    int fib = 0;
    
    // חשב כאן בלולאה את האיבר ה-n בסדרת פיבונאצ\'י
    
    // הדפס כאן את התוצאה בפורמט Fibonacci: [number]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const fibVar = mainFrame.variables.get('fib');
          if (!fibVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה fib' };

          const fibVal = readMemory(fibVar.address, 'int', state);
          if (fibVal !== 13) {
            return { passed: false, errorMsg: `הערך ב-fib הוא ${fibVal}, אך עבור n=7 התשובה הנכונה היא 13.` };
          }

          if (state.stdout.trim() === 'Fibonacci: 13') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר משתנים לאיבר הקודם והאיבר שלפניו: int a = 0, b = 1; בלולאה מ-2 ועד n בצע: int next = a + b; a = b; b = next; ובסיום הלולאה בצע fib = b;'
      }
    ]
  },
  {
    id: 6,
    title: '6. פונקציות ומחסנית הזיכרון',
    content: `
פונקציות מאפשרות לנו לפצל את הקוד לחלקים קטנים, קריאים ושימושיים מחדש. ב-C, אנחנו חייבים להצהיר על טיפוס הערך שהפונקציה מחזירה, ועל טיפוס של כל פרמטר שהיא מקבלת.

הנה תוכנית מלאה המשתמשת בפונקציה \`get_max\` שמקבלת שני שלמים ומחזירה את הגדול מביניהם:
\`\`\`c
#include <stdio.h>

int get_max(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int main() {
    int m = get_max(10, 20);
    printf("Max: %d\\n", m);
    return 0;
}
\`\`\`

### העברה לפי ערך (Pass by Value)
נושא קריטי בשפת C הוא שפרמטרים מועברים לפונקציה **לפי ערך** (Pass by Value). 
המשמעות היא שכאשר אנו מעבירים משתנה כלשהו כארגומנט לפונקציה, המחשב מייצר עבורו **עותק חדש לגמרי** בתוך ה-Stack Frame של הפונקציה החדשה.
כל שינוי שנעשה לפרמטר בתוך הפונקציה ישנה רק את העותק המקומי שלה, **ולא ישפיע כלל** על המשתנה המקורי בפונקציה הקוראת!

הנה דוגמה שממחישה זאת:
\`\`\`c
#include <stdio.h>

void try_to_change(int number) {
    number = 100; // משנה רק את העותק המקומי בתוך try_to_change
}

int main() {
    int x = 5;
    try_to_change(x);
    printf("%d\\n", x); // ידפיס עדיין 5! הערך של x ב-main לא השתנה
    return 0;
}
\`\`\`

### מחסנית הזיכרון (Call Stack)
כאשר התוכנית שלנו קוראת לפונקציה, המחשב מייצר עבורה אזור מיוחד בזיכרון ה-RAM שנקרא **Stack Frame** (מסגרת מחסנית). 
* כל הפרמטרים והמשתנים המקומיים של הפונקציה נוצרים בתוך ה-Stack Frame שלה.
* כשהפונקציה מסיימת לרוץ (מגיעה ל-\`return\`), ה-Stack Frame שלה **נמחק לחלוטין מהזיכרון**, והמחשב חוזר להמשך ריצת פונקציית ה-\`main\`.

מכיוון שהמשתנים נוצרים ונמחקים אוטומטית במחסנית, הם נקראים לעיתים משתנים אוטומטיים (Automatic Variables). המחסנית גדלה וקטנה באופן דינמי עם הקריאות לפונקציות.

בסימולטור משמאל, תוכל לראות את ה-Stack Frames גדלים כלפי מטה בזיכרון בכל פעם שנכנסים לפונקציה, ונעלמים כשיוצאים ממנה.

### משימה:
1. כתוב פונקציה מעל \`main\` בשם \`square\` שמקבלת משתנה שלם \`x\` ומחזירה את הריבוע שלו (\`x * x\`).
2. בתוך פונקציית \`main\`, קרא לפונקציה \`square\` עם הערך \`6\`, שמור את התוצאה במשתנה בשם \`ans\`, והדפס: \`Square: 36\` (כולל ירידת שורה בסוף).
    `,
    exercises: [
      {
        prompt: 'כתוב פונקציה בשם square המקבלת פרמטר int ומחזירה את ריבועו (int). ב-main קרא לה עם הערך 6, שמור במשתנה ans, והדפס "Square: 36\\n".',
        initialCode: `#include <stdio.h>

// כתוב כאן את הפונקציה square


int main() {
    // קרא לפונקציה square עם הערך 6, שמור ב-ans והדפס
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const ansVar = mainFrame.variables.get('ans');
          if (!ansVar) return { passed: false, errorMsg: 'עליך לשמור את התוצאה במשתנה ans בתוך main' };
          
          const ansVal = readMemory(ansVar.address, 'int', state);
          if (ansVal !== 36) {
            return { passed: false, errorMsg: `הערך במשתנה ans הוא ${ansVal}, אך ריבוע של 6 הוא 36.` };
          }

          if (state.stdout.trim() === 'Square: 36') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר מעל main: int square(int x) { return x * x; } ובתוך main: int ans = square(6);'
      },
      {
        prompt: 'כתוב פונקציה בשם multiply המקבלת שני פרמטרים מסוג int ומחזירה את המכפלה שלהם (int). ב-main קרא לפונקציה עם הערכים 7 ו-8, שמור במשתנה בשם result, והדפס "Result: 56" (כולל ירידת שורה).',
        initialCode: `#include <stdio.h>

// כתוב כאן את הפונקציה multiply


int main() {
    // קרא לפונקציה multiply עם הערכים 7 ו-8, שמור ב-result והדפס
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const resVar = mainFrame.variables.get('result');
          if (!resVar) return { passed: false, errorMsg: 'עליך לשמור את התוצאה במשתנה result בתוך main' };

          const resVal = readMemory(resVar.address, 'int', state);
          if (resVal !== 56) {
            return { passed: false, errorMsg: `המכפלה שחושבה היא ${resVal}, אך 7 כפול 8 צריך להיות 56.` };
          }

          if (state.stdout.trim() === 'Result: 56') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר את multiply: int multiply(int a, int b) { return a * b; } וקרא לה בתוך main.'
      },
      {
        prompt: 'כתוב פונקציה בשם is_even המקבלת פרמטר int ומחזירה 1 אם הוא זוגי, ו-0 אחרת. בתוך main קרא לה עם הערך 14, שמור את התוצאה במשתנה check, והדפס "Result: 1" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

// כתוב כאן את הפונקציה is_even


int main() {
    // קרא לפונקציה is_even עם הערך 14, שמור ב-check והדפס
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const chkVar = mainFrame.variables.get('check');
          if (!chkVar) return { passed: false, errorMsg: 'עליך להגדיר משתנה בשם check בתוך main' };

          const chkVal = readMemory(chkVar.address, 'int', state);
          if (chkVal !== 1) {
            return { passed: false, errorMsg: `הערך ב-check הוא ${chkVal}, אך עבור 14 הפונקציה צריכה להחזיר 1.` };
          }

          if (state.stdout.trim() === 'Result: 1') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר: int is_even(int n) { if (n % 2 == 0) return 1; return 0; }'
      }
    ]
  },
  {
    id: 7,
    title: '7. מערכים ומחרוזות',
    content: `
עד כה, כל משתנה שהגדרנו החזיק ערך בודד. מה קורה אם אנחנו רוצים לשמור סדרה של ערכים מאותו סוג? כאן נכנסים **מערכים** (Arrays).

מערך ב-C הוא רצף של תאים בזיכרון בגודל קבוע. המאפיין החשוב ביותר של מערך הוא שכל תאיו ממוקמים בזיכרון **זה אחר זה ללא רווחים**.

### הצהרה ושימוש במערך
\`\`\`c
int grades[3]; // מגדיר מערך של 3 מספרים שלמים
grades[0] = 90; // התא הראשון (אינדקסים מתחילים מ-0!)
grades[1] = 85;
grades[2] = 95;
\`\`\`
כיוון ש-\`int\` תופס 4 בייטים, מערך של 3 אינטים יתפוס בדיוק \`3 * 4 = 12\` בייטים רצופים בזיכרון.

### דיאגרמה: מבנה מערך שלמים (int) בזיכרון
כך נראה המערך \`grades\` בזיכרון ה-RAM (הערכים יושבים במרווחים של 4 בייטים):
\`\`\`text
  int grades[3] = {90, 85, 95};
  
  +---------+---------+---------+
  |   90    |   85    |   95    |  <-- ערכים שלמים (Values)
  +---------+---------+---------+
  |  0x1000 |  0x1004 |  0x1008 |  <-- כתובות בזיכרון (Addresses)
  +---------+---------+---------+
  |  [0]    |  [1]    |  [2]    |  <-- אינדקסים (Indices)
  +---------+---------+---------+
\`\`\`

### מחרוזות ב-C
בפייתון, מחרוזת טקסט היא טיפוס נתונים מתוחכם ומובנה. ב-C, **מחרוזת היא פשוט מערך של תווים (\`char\`)**. 
כדי שהמחשב ידע איפה המחרוזת מסתיימת (שהרי גודל המערך קבוע מראש), שפת C משתמשת בתו מיוחד שנקרא **תו הסיום של המחרוזת**: \`'\\0'\` (תו ה-Null, שערכו המספרי הוא 0).

למשל, כדי לשמור את המילה "Hi" בזיכרון, נצטרך מערך של 3 תווים:
\`\`\`c
char word[3] = {'H', 'i', '\\0'};
// או בקיצור:
char word[] = "Hi"; // המהדר יוסיף אוטומטית את '\0' בסוף ויקבע את גודל המערך ל-3
\`\`\`

### דיאגרמה: מחרוזת בזיכרון ה-RAM
שים לב שתווים תופסים 1 בייט בלבד כל אחד, כך שהכתובות רצות ברצף של 1:
\`\`\`text
  char word[] = "Hi";
  
  +---------+---------+---------+
  |   'H'   |   'i'   |  '\0'   |  <-- תווים (Characters)
  +---------+---------+---------+
  |    72   |   105   |    0    |  <-- ערכי ASCII בזיכרון
  +---------+---------+---------+
  |  0x2000 |  0x2001 |  0x2002 |  <-- כתובות בזיכרון (Addresses)
  +---------+---------+---------+
  |  [0]    |  [1]    |  [2]    |  <-- אינדקסים (Indices)
  +---------+---------+---------+
\`\`\`

התו \`'\\0'\` הוא קריטי! אם ננסה להדפיס מחרוזת שאין לה תו סיום, ה-\`printf\` ימשיך להדפיס את התאים הבאים בזיכרון (מה שיראה כמו ג'יבריש או יגרום לקריסת התוכנית) עד שיפгוש באקראי את הערך 0 בזיכרון.

### תוכנית מלאה לדוגמה
הנה תוכנית מלאה המגדירה מערך מספרים ומחרוזת ומדפיסה אותם:
\`\`\`c
#include <stdio.h>

int main() {
    int grades[3] = {90, 85, 95};
    char name[] = "Alex";
    
    printf("First grade: %d\\n", grades[0]);
    printf("Student name: %s\\n", name); // מציין %s מדפיס מחרוזת שלמה עד ה-'\0'
    
    return 0;
}
\`\`\`

### משימה:
לפניך מערך של 4 שלמים בשם \`numbers\`. 
1. השתמש בלולאה כדי לחשב את סכום האיברים במערך.
2. שמור את הסכום במשתנה בשם \`sum\`.
3. הדפס את התוצאה בפורמט: \`Sum: 100\` (כולל ירידת שורה בסוף).
    `,
    exercises: [
      {
        prompt: 'חשב בלולאה את סכום האיברים במערך numbers (שבו הערכים 10, 20, 30, 40), שמור את הסכום ב-sum, והדפס "Sum: 100\\n".',
        initialCode: `#include <stdio.h>

int main() {
    int numbers[4] = {10, 20, 30, 40};
    int sum = 0;
    
    // כתוב כאן לולאה שרצה על המערך ומסכמת את ערכיו לתוך sum
    
    // הדפס את התוצאה
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const sumVar = mainFrame.variables.get('sum');
          if (!sumVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה sum' };

          const sumVal = readMemory(sumVar.address, 'int', state);
          if (sumVal !== 100) {
            return { passed: false, errorMsg: `הערך ב-sum הוא ${sumVal}, אך סכום האיברים הוא 100.` };
          }

          if (state.stdout.trim() === 'Sum: 100') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'כתוב לולאת for (int i = 0; i < 4; i++) ובתוכה בצע: sum = sum + numbers[i];'
      },
      {
        prompt: 'לפניך מחרוזת str המכילה את המילה "hello". השתמש בלולאה כדי לספור כמה פעמים מופיעה האות \'l\' במחרוזת, שמור את הספירה במשתנה count והדפס את התוצאה בפורמט "Count: 2" (ודא שיש ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    char str[] = "hello";
    int count = 0;
    
    // כתוב לולאה שסופרת את מופעי התו 'l' במחרוזת str
    // רמז: רוץ על המערך עד שאתה מגיע לתו הסיום '\\0'
    
    // הדפס את התוצאה כאן
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const countVar = mainFrame.variables.get('count');
          if (!countVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה count' };

          const countVal = readMemory(countVar.address, 'int', state);
          if (countVal !== 2) {
            return { passed: false, errorMsg: `הספירה היא ${countVal}, אך האות 'l' מופיעה 2 פעמים ב-"hello".` };
          }

          if (state.stdout.trim() === 'Count: 2') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'רוץ בלולאה: for (int i = 0; str[i] != \'\\0\'; i++) ובתוכה בדוק: if (str[i] == \'l\') count++;'
      },
      {
        prompt: 'לפניך מחרוזת msg המכילה את המילה "C-Lang". הפוך את סדר התווים של המחרוזת במקום (in-place) כך שתהפוך ל-"gnaL-C". הדפס את המחרוזת ההפוכה בפורמט: "Reversed: gnaL-C" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>
#include <string.h>

int main() {
    char msg[] = "C-Lang";
    
    // הפוך את המחרוזת msg במקום
    
    // הדפס את התוצאה בפורמט: Reversed: [msg]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };
          const msgVar = mainFrame.variables.get('msg');
          if (!msgVar) return { passed: false, errorMsg: 'אל תמחק את המערך msg' };
          
          let chars = [];
          for (let i = 0; i < 6; i++) {
            chars.push(readMemory(msgVar.address + i, 'char', state));
          }
          const strVal = chars.join('');
          if (strVal !== 'gnaL-C') {
            return { passed: false, errorMsg: `המערך msg מכיל את הערך "${strVal}", אך עליו להכיל את הערך ההפוך "gnaL-C".` };
          }
          if (state.stdout.trim() === 'Reversed: gnaL-C') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'אורך המחרוזת הוא 6. בצע לולאה שרצה מ-i=0 עד 2 (חצי אורך), ובתוכה החלף ערכים: char temp = msg[i]; msg[i] = msg[5 - i]; msg[5 - i] = temp;'
      },
      {
        prompt: 'לפניך מחרוזת word המכילה את המילה "radar". בדוק בעזרת לולאה האם המילה היא פלינדרום (מילה שנקראת זהה משני הכיוונים). אם כן, השאר את המשתנה isPalindrome כ-1, ואם לא שנה אותו ל-0. הדפס בסיום בפורמט: "Palindrome: 1" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    char word[] = "radar";
    int isPalindrome = 1;
    
    // בדוק כאן אם המחרוזת היא פלינדרום
    
    // הדפס את התוצאה בפורמט: Palindrome: [value]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };
          const palVar = mainFrame.variables.get('isPalindrome');
          if (!palVar) return { passed: false, errorMsg: 'עליך להגדיר משתנה בשם isPalindrome' };
          const palVal = readMemory(palVar.address, 'int', state);
          if (palVal !== 1) {
            return { passed: false, errorMsg: `הערך של isPalindrome שונה ל-0, אך המילה "radar" היא כן פלינדרום.` };
          }
          if (state.stdout.trim() === 'Palindrome: 1') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'אורך המילה הוא 5. בדוק בלולאה מ-i=0 עד 2 האם word[i] == word[4 - i]. אם תנאי זה אינו מתקיים, קבע isPalindrome = 0.'
      }
    ]
  },
  {
    id: 8,
    title: '8. הכתובת של... ומצביעים (Pointers)',
    content: `
הגענו לנושא המרתק, החשוב והמאתגר ביותר בשפת C: **מצביעים (Pointers)**. מצביעים הם הסיבה ששפת C היא כל כך חזקה, והבנתם תפריד בינך לבין מתכנתים מתחילים.

### מהו מצביע?
בוא נחזור למה שלמדנו בפרק 1: לכל משתנה בתוכנית שלנו יש ערך (התוכן) ו**כתובת בזיכרון ה-RAM** (המיקום שלו).
מצביע הוא פשוט **משתנה מיוחד ששומר כתובת של משתנה אחר**.

נניח שיש לנו משתנה רגיל:
\`\`\`c
int x = 5;
\`\`\`
נניח שהמהדר מיקם את \`x\` בכתובת הזיכרון \`0x1000\`.
כדי לגלות את הכתובת של \`x\`, נשתמש באופרטור הכתובת **\`&\`** (Address-of):
\`\`\`c
printf("הכתובת של x היא: %p\\n", &x); // ידפיס 0x1000
\`\`\`

כדי לשמור את הכתובת הזו, נגדיר משתנה מצביע. הגדרת מצביע נעשית באמצעות כוכבית **\`*\`** לפני שם המשתנה:
\`\`\`c
int *p = &x; // p הוא מצביע למספר שלם, ושמרנו בו את הכתובת של x
\`\`\`
עכשיו, הערך של \`p\` הוא \`0x1000\` (הכתובת של \`x\`).

### גישה לערך (Dereferencing)
החלק המדהים במצביעים הוא שאנחנו יכולים לגשת אל המשתנה המקורי (זה שנמצא בכתובת המאוחסנת) ולשנות אותו מרחוק! 
פעולה זו נקראת **Dereferencing** ונעשית גם היא באמצעות כוכבית \`*\` לפני המצביע:
\`\`\`c
*p = 42; // "לך לכתובת ששמורה ב-p, ושים שם את הערך 42"
\`\`\`
מכיוון ש-\`p\` מכיל את הכתובת של \`x\`, הפעולה הזו שינתה ישירות את הערך של המשתנה \`x\` ל-42!

### העברת מצביעים לפונקציות (Pass by Reference)
כפי שלמדנו בפרק 6, שפת C מעבירה פרמטרים לפי ערך (העתקת משתנים). לכן, אם פונקציה מסוימת מנסה לשנות משתנה שקיבלה, היא משנה רק עותק מקומי. 
אך מה קורה אם אנחנו **כן רוצים** שפונקציה תוכל לשנות משתנה שנמצא מחוצה לה (למשל ב-\`main\`)?
הפתרון הוא: **העברת הכתובת של המשתנה (מצביע) במקום את הערך שלו!**

כאשר פונקציה מקבלת מצביע, היא יכולה להשתמש ב-Dereferencing (\`*\`) כדי לגשת לתא הזיכרון המקורי ולשנות את ערכו מרחוק.

הנה דוגמה לתוכנית מלאה המדגימה זאת:
\`\`\`c
#include <stdio.h>

// הפונקציה מקבלת מצביע למספר שלם (int *p) ולא מספר רגיל
void increment(int *p) {
    *p = *p + 1; // ניגש לכתובת ששמורה ב-p ומקדם את הערך שם ב-1
}

int main() {
    int x = 10;
    increment(&x); // מעבירים את הכתובת של x (בעזרת &) לפונקציה
    printf("%d\\n", x); // ידפיס 11! הערך של x ב-main באמת השתנה
    return 0;
}
\`\`\`

בזמן הקריאה ל-\`increment(&x)\`, נוצר Stack Frame חדש עבור הפונקציה, והפרמטר \`p\` בתוכו מאותחל לכתובת הזיכרון של \`x\` (למשל \`0x1000\`). כשהפונקציה עושה \`*p = *p + 1\`, היא כותבת ישירות לתא הזיכרון של \`x\`.

### תוכנית מלאה לדוגמה נוספת:
\`\`\`c
#include <stdio.h>

int main() {
    int x = 5;
    int *p = &x;

    printf("Value of x: %d\\n", x); // 5
    *p = 42;
    printf("Value of x after dereferencing: %d\\n", x); // 42

    return 0;
}
\`\`\`

שים לב לוויזואליזציה משמאל: כשתריץ את הקוד, תראה **חץ מיוחד** שנמתח מהתא של \`p\` אל התא של \`x\`. זה בדיוק מה שמצביע עושה!

### משימה:
לפניך משתנה בשם \`val\` שערכו \`7\`.
1. הגדר מצביע למספר שלם בשם \`ptr\` שיכיל את הכתובת של המשתנה \`val\`.
2. שנה את ערכו של \`val\` ל-\`99\` על ידי שימוש במצביע \`ptr\` בלבד (Dereferencing).
3. אל תדפיס דבר.
    `,
    exercises: [
      {
        prompt: 'הגדר משתנה מצביע int* בשם ptr שיצביע לכתובת של val. שנה את ערכו של val ל-99 באמצעות המצביע ptr בלבד.',
        initialCode: `#include <stdio.h>

int main() {
    int val = 7;
    
    // 1. הגדר כאן את ptr שיצביע ל-val
    
    // 2. שנה את הערך ל-99 דרך ptr
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const valVar = mainFrame.variables.get('val');
          const ptrVar = mainFrame.variables.get('ptr');

          if (!valVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה val' };
          if (!ptrVar) return { passed: false, errorMsg: 'עליך להגדיר משתנה מצביע בשם ptr' };

          const isPtr = ptrVar.type && typeof ptrVar.type === 'object' && 'pointerTo' in ptrVar.type;
          if (!isPtr) return { passed: false, errorMsg: 'המשתנה ptr חייב להיות מוגדר כמצביע (למשל *int)' };

          const ptrVal = readMemory(ptrVar.address, ptrVar.type, state);
          if (ptrVal !== valVar.address) {
            return { passed: false, errorMsg: `המצביע ptr מכיל את הכתובת ${formatAddress(ptrVal)}, אך עליו להכיל את כתובת המשתנה val שהיא ${formatAddress(valVar.address)}` };
          }

          const valVal = readMemory(valVar.address, 'int', state);
          if (valVal !== 99) {
            return { passed: false, errorMsg: `הערך במשתנה val נשאר ${valVal}, עליך לשנות אותו ל-99 באמצעות המצביע.` };
          }

          return { passed: true };
        },
        hint: 'הגדר: int *ptr = &val; ולאחר מכן בצע: *ptr = 99;'
      },
      {
        prompt: 'הגדר מצביע למספר שלם בשם ptr שיצביע לתחילת המערך arr. שנה את האיבר השני במערך (באינדקס 1) לערך 500 באמצעות גישה דרך המצביע ptr, והדפס אותו בפורמט "Value: 500\\n".',
        initialCode: `#include <stdio.h>

int main() {
    int arr[3] = {10, 20, 30};
    
    // 1. הגדר כאן מצביע ptr שיצביע ל-arr
    
    // 2. שנה את האיבר השני במערך ל-500 דרך ptr
    
    // 3. הדפס את האיבר השני בפורמט: Value: [number]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const arrVar = mainFrame.variables.get('arr');
          const ptrVar = mainFrame.variables.get('ptr');
          if (!arrVar) return { passed: false, errorMsg: 'אל תמחק את המערך arr' };
          if (!ptrVar) return { passed: false, errorMsg: 'עליך להגדיר מצביע בשם ptr' };

          const isPtr = ptrVar.type && typeof ptrVar.type === 'object' && 'pointerTo' in ptrVar.type;
          if (!isPtr) return { passed: false, errorMsg: 'המשתנה ptr חייב להיות מוגדר כמצביע (int*)' };

          const ptrVal = readMemory(ptrVar.address, ptrVar.type, state);
          if (ptrVal !== arrVar.address) {
            return { passed: false, errorMsg: 'המצביע ptr חייב להצביע לתחילת המערך arr' };
          }

          const arr1Val = readMemory(arrVar.address + 4, 'int', state);
          if (arr1Val !== 500) {
            return { passed: false, errorMsg: `הערך באינדקס 1 של המערך הוא ${arr1Val}, אך עליו להיות 500.` };
          }

          if (state.stdout.trim() === 'Value: 500') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר int *ptr = arr; לאחר מכן בצע ptr[1] = 500; והדפס בעזרת printf("Value: %d\\n", ptr[1]);'
      },
      {
        prompt: 'כתוב פונקציה מסוג void בשם update_value שמקבלת מצביע ל-int (טיפוס *int) בשם p, ומעדכנת את הערך בכתובת זו ל-77. בתוך main, קרא לפונקציה update_value והעבר לה את הכתובת של המשתנה x (שהוגדר כ-10). הדפס את ערכו החדש של x בפורמט "x: 77\\n".',
        initialCode: `#include <stdio.h>

// 1. הגדר כאן את הפונקציה update_value


int main() {
    int x = 10;
    
    // 2. קרא לפונקציה עם הכתובת של x
    
    // 3. הדפס את ערכו של x בפורמט: x: [number]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const xVar = mainFrame.variables.get('x');
          if (!xVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה x' };

          const xVal = readMemory(xVar.address, 'int', state);
          if (xVal !== 77) {
            return { passed: false, errorMsg: `הערך של x הוא ${xVal}, אך עליו להשתנות ל-77 בעזרת הפונקציה.` };
          }

          if (state.stdout.trim() === 'x: 77') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר פונקציה void update_value(int *p) { *p = 77; } ובתוך main קרא לה על ידי העברת הכתובת: update_value(&x);'
      },
      {
        prompt: 'לפניך מערך arr של 4 איברים. הגדר משתנה מצביע בשם p שיצביע לתחילת המערך. בעזרת לולאה שרצה 4 פעמים, הוסף את הערך ש-p מצביע עליו לתוך total, וקדם את המצביע עצמו בכל סיבוב (p++). הדפס את הסכום בפורמט: "Pointer Sum: 100" (כולל ירידת שורה בסוף).',
        initialCode: `#include <stdio.h>

int main() {
    int arr[4] = {10, 20, 30, 40};
    int total = 0;
    
    // 1. הגדר מצביע p שיצביע לתחילת arr
    
    // 2. בצע לולאה שמוסיפה את p* ל-total ומקדמת את p
    
    // הדפס את הסכום כאן בפורמט Pointer Sum: [number]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const totVar = mainFrame.variables.get('total');
          const pVar = mainFrame.variables.get('p');
          if (!totVar || !pVar) return { passed: false, errorMsg: 'עליך להגדיר את המשתנים total ו-p' };

          const totVal = readMemory(totVar.address, 'int', state);
          if (totVal !== 100) {
            return { passed: false, errorMsg: `הערך ב-total הוא ${totVal}, אך עליו להיות 100.` };
          }

          const pVal = readMemory(pVar.address, pVar.type, state);
          const arrVar = mainFrame.variables.get('arr');
          if (arrVar && pVal <= arrVar.address) {
            return { passed: false, errorMsg: 'עליך לקדם את המצביע p עצמו בכל סיבוב בעזרת אריתמטיקת מצביעים.' };
          }

          if (state.stdout.trim() === 'Pointer Sum: 100') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר int *p = arr; בלולאה בצע total += *p; ולאחר מכן קדם את המצביע: p++;'
      }
    ]
  },
  {
    id: 9,
    title: '9. הקצאת זיכרון דינמית (malloc, free)',
    content: `
עד כה, כל המשתנים שלנו הוגדרו על גבי מחסנית הזיכרון (Stack). למדנו שהמשתנים הללו נמחקים אוטומטית ברגע שהפונקציה שבה הם הוגדרו מסתיימת.

אבל מה קורה אם אנחנו רוצים ליצור נתונים שישארו בזיכרון גם אחרי שהפונקציה הסתיימה? או אם אנחנו לא יודעים מראש בזמן כתיבת הקוד כמה זיכרון נצטרך (למשל, גודל המערך נקבע לפי קלט מהמשתמש)?
לשם כך אנחנו משתמשים ב**הקצאת זיכרון דינמית** על גבי אזור זיכרון שנקרא **ה-Heap (הערמה)**.

### שימוש ב-\`malloc\` וביצוע המרה (Casting)
הפונקציה \`malloc\` (Memory Allocation) מבקשת ממערכת ההפעלה להקצות לנו בלוק זיכרון ב-Heap בגודל מסוים של בייטים, ומחזירה לנו את **כתובת ההתחלה של הבלוק**.
בגלל ש-\`malloc\` לא יודעת איזה סוג נתונים אנחנו רוצים לאחסן בזיכרון הזה, היא מחזירה טיפוס מצביע גנרי שנקרא \`void*\` (כתובת זיכרון ללא טיפוס). 
כדי לעבוד איתה בשפה שלנו, אנו מבצעים **המרה** (Casting) לטיפוס המצביע המתאים. למשל, כדי לקבל מצביע למספר שלם (\`int*\`), נכתוב:
\`\`\`c
// (int*) הוא ה-Casting שממיר את ה-void* שחזר מ-malloc למצביע int*
int *p = (int*) malloc(sizeof(int)); 
\`\`\`

כדי לדעת כמה בייטים להקצות, נשתמש באופרטור \`sizeof\` שמחשב את הגודל של הטיפוס בזיכרון (עבור \`int\` זה יחזיר 4 בייטים).

### מערכים דינמיים ב-Heap
כדי להקצות מערך של מספר שלמים, אנו מקצים בלוק רציף בגודל של \`מספר האיברים כפול sizeof(int)\`. המצביע שחוזר מורה על התא הראשון. גישה לאינדקסים במערך דינמי מתבצעת בדיוק כמו במערך רגיל: \`arr[i]\`, אשר מאחורי הקלעים פשוט מחושב ככתובת \`arr + i * sizeof(int)\`.
\`\`\`c
int *arr = (int*) malloc(5 * sizeof(int)); // מקצה זיכרון ל-5 שלמים
arr[0] = 10;
arr[1] = 20;
\`\`\`

### שחרור זיכרון באמצעות \`free\`
בניגוד למשתנים ב-Stack שנמחקים לבד, משתנים ב-Heap **לעולם לא נמחקים מעצמם**! 
המשמעות היא שאם נסיים לעבוד איתם ולא נשחרר אותם, הם ימשיכו לתפוס מקום ב-RAM עד שהתוכנית כולה תיסגר. מצב זה נקרא **דליפת זיכרון (Memory Leak)** והוא עלול להביא להאטה וקריסה של המחשב.

כדי לשחרר זיכרון שהקצנו דינמית, נשתמש בפונקציה \`free\`:
\`\`\`c
free(p); // משחרר את הבלוק ששמור בכתובת p
\`\`\`
לאחר השחרור, אסור לגשת יותר ל-\`*p\` כיוון שהכתובת הזו כבר לא שייכת לנו (ניסיון כזה נקרא "Use After Free" והוא באג אבטחה חמור).

### תוכנית מלאה לדוגמה
\`\`\`c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = (int*) malloc(sizeof(int));
    if (p == NULL) {
        return 1; // הקצאת הזיכרון נכשלה
    }
    
    *p = 100;
    printf("Value: %d\\n", *p);
    
    free(p); // שחרור הזיכרון בסיום
    return 0;
}
\`\`\`

שים לב משמאל: ה-Heap מתחיל מלמעלה ומסומן בצבע שונה. כשתקצה זיכרון דינמי, יופיע תא חדש ב-Heap!

### משימה:
1. הקצה דינמית משתנה שלם (\`int\`) על ה-Heap באמצעות \`malloc\` ושמור את הכתובת במצביע בשם \`heapVal\`.
2. קבע את ערכו של המשתנה ב-Heap ל-\`1337\`.
3. הדפס את הערך בפורמט: \`Heap Value: 1337\` (כולל ירידת שורה).
4. שחרר את הזיכרון בסיום בעזרת \`free\`.
    `,
    exercises: [
      {
        prompt: 'הקצה זיכרון דינמי ל-int, שמור את הכתובת ב-heapVal, קבע את הערך ל-1337, הדפס "Heap Value: 1337\\n", ושחרר את הזיכרון עם free.',
        initialCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // 1. הקצה זיכרון דינמי ל-int ושמור ב-heapVal
    
    // 2. קבע את הערך ל-1337
    
    // 3. הדפס את הערך
    
    // 4. שחרר את הזיכרון
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const heapValVar = mainFrame.variables.get('heapVal');
          if (!heapValVar) return { passed: false, errorMsg: 'עליך להגדיר משתנה מצביע בשם heapVal' };

          const isPtr = heapValVar.type && typeof heapValVar.type === 'object' && 'pointerTo' in heapValVar.type;
          if (!isPtr) return { passed: false, errorMsg: 'המשתנה heapVal חייב להיות מוגדר כמצביע (int*)' };

          if (state.heapAllocations.length === 0) {
            return { passed: false, errorMsg: 'לא התבצעה הקצאת זיכרון דינמית ב-Heap. ודא שהשתמשת ב-malloc.' };
          }

          const allocation = state.heapAllocations[0];
          
          if (!allocation.freed) {
            return { passed: false, errorMsg: 'זיהינו דליפת זיכרון! שכחת לשחרר את הזיכרון שהקצת באמצעות הפונקציה free בסיום.' };
          }

          if (state.stdout.trim() === 'Heap Value: 1337') {
            return { passed: true };
          }

          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הקצה בעזרת int *heapVal = (int*) malloc(sizeof(int)); לאחר מכן קבע *heapVal = 1337; והדפס. לבסוף קרא ל-free(heapVal);'
      },
      {
        prompt: 'הקצה זיכרון עבור 3 איברים מסוג int ב-Heap באמצעות malloc (גודל של 3 כפול sizeof(int)), ושמור את הכתובת במצביע בשם dyArr. שנה את איברי המערך לערכים 100, 200, 300, והדפס את האיבר האחרון (באינדקס 2) בפורמט "Last: 300\\n". אל תשכח לשחרר את הזיכרון עם free בסיום!',
        initialCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // 1. הקצה מערך דינמי בגודל 3 אינטים ושמור ב-dyArr
    
    // 2. אתחל את איברי המערך ל-100, 200, 300
    
    // 3. הדפס את האיבר האחרון (באינדקס 2) בפורמט: Last: [number]
    
    // 4. שחרר את הזיכרון
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const dyArrVar = mainFrame.variables.get('dyArr');
          if (!dyArrVar) return { passed: false, errorMsg: 'עליך להגדיר משתנה מצביע בשם dyArr' };

          const isPtr = dyArrVar.type && typeof dyArrVar.type === 'object' && 'pointerTo' in dyArrVar.type;
          if (!isPtr) return { passed: false, errorMsg: 'המשתנה dyArr חייב להיות מוגדר כמצביע (int*)' };

          if (state.heapAllocations.length === 0) {
            return { passed: false, errorMsg: 'לא התבצעה הקצאת זיכרון דינמית ב-Heap.' };
          }

          const allocation = state.heapAllocations[0];
          if (allocation.size < 12) {
            return { passed: false, errorMsg: 'גודל ההקצאה קטן מדי עבור מערך של 3 אינטים (צריך להיות לפחות 12 בייטים).' };
          }

          if (!allocation.freed) {
            return { passed: false, errorMsg: 'שכחת לשחרר את הזיכרון עם free בסיום.' };
          }

          if (state.stdout.trim() === 'Last: 300') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'בצע הקצאה: int *dyArr = (int*) malloc(3 * sizeof(int)); אתחל: dyArr[0]=100; dyArr[1]=200; dyArr[2]=300; הדפס את dyArr[2], ולבסוף free(dyArr);'
      },
      {
        prompt: 'הקצה מערך דינמי של 5 שלמים (int) על ה-Heap ושמור את הכתובת ב-arr. בעזרת לולאה, אתחל את איברי המערך כך שאיבר במקום ה-i יכיל את ריבוע האינדקס שלו (i * i). חשב את סכום האיברים לתוך total, והדפס בפורמט: "Sum: 30\\n". שחרר את הזיכרון בסיום.',
        initialCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // 1. הקצה מערך דינמי של 5 אינטים בשם arr
    
    // 2. אתחל בריבועי אינדקסים
    
    // 3. סכם את איבריו לתוך total והדפס Sum: [total]
    int total = 0;
    
    // 4. שחרר את הזיכרון
    
    return 0;
}`,
        verify: (state: VMState) => {
          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };
          const arrVar = mainFrame.variables.get('arr');
          if (!arrVar) return { passed: false, errorMsg: 'עליך להגדיר משתנה מצביע בשם arr' };
          
          const totVar = mainFrame.variables.get('total');
          if (!totVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה total' };
          const totVal = readMemory(totVar.address, 'int', state);
          if (totVal !== 30) {
            return { passed: false, errorMsg: `סכום ריבועי האינדקסים הוא 30, אך קיבלת: ${totVal}` };
          }
          
          if (state.heapAllocations.length === 0) {
            return { passed: false, errorMsg: 'לא זיהינו הקצאה דינמית ב-Heap.' };
          }
          const alloc = state.heapAllocations[0];
          if (!alloc.freed) {
            return { passed: false, errorMsg: 'שכחת לשחרר את הזיכרון הדינמי עם free!' };
          }
          
          if (state.stdout.trim() === 'Sum: 30') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הקצה arr בגודל 5 * sizeof(int). בלולאה בצע arr[i] = i * i; ולאחר מכן סכם את האיברים לתוך total. לבסוף בצע free(arr);'
      }
    ]
  },
  {
    id: 10,
    title: '10. מבנים (Structs)',
    content: `
לעיתים קרובות, משתנים בסיסיים כמו מספרים או תווים לא מספיקים כדי לתאר ישות מורכבת בעולם האמיתי. למשל, אם נרצה לייצג "נקודה" על גרף דו-ממדי, נצטרך שני משתנים: \`x\` ו-\`y\`.

ב-C נוכל לאגד מספר משתנים מטיפוסים שונים תחת קורת גג אחת בעזרת **מבנה (Struct)**.

### הגדרת Struct ושימוש בו
הנה תוכנית מלאה המגדירה מבנה \`struct Point\` ומקצה אותו:
\`\`\`c
#include <stdio.h>

struct Point {
    int x;
    int y;
}; // אל תשכח את הנקודה-פסיק בסוף הגדרת המבנה!

int main() {
    struct Point p1;
    p1.x = 10;
    p1.y = 20;

    printf("Point x: %d, y: %d\\n", p1.x, p1.y);
    return 0;
}
\`\`\`

### מצביעים ל-Struct ואופרטור ה-Arrow (\`->\`)
אם יש לנו מצביע למבנה, למשל:
\`\`\`c
struct Point *ptr = &p1;
\`\`\`
כדי לגשת לשדות של המבנה דרך המצביע, נוכל לכתוב:
\`\`\`c
(*ptr).x = 30;
\`\`\`
אבל התחביר הזה מעט מסורבל. לכן, שפת C מספקת קיצור דרך יפהפה ושימושי בשם אופרטור הצינור/חץ **\`->\`**:
\`\`\`c
ptr->x = 30; // שווה ערך בדיוק לשורה הקודמת!
\`\`\`

### מערכים של מבנים (Arrays of Structs)
מבנים יכולים להתאגד לתוך מערכים, בדיוק כמו טיפוסים בסיסיים אחרים. לדוגמה, כדי לייצג מערך של 2 נקודות:
\`\`\`c
struct Point path[2];
path[0].x = 5;
path[0].y = 12;
path[1].x = 8;
path[1].y = 15;
\`\`\`
המחשב מקצה זיכרון רציף המכיל את כל שדות המבנים בזה אחר זה ב-Stack או ב-Heap. הגישה לשדה של איבר מסוים במערך נעשית על ידי שילוב של אינדקס המערך (\`[i]\`) ואופרטור הנקודה (\`.\`).

### משימה:
צור מבנה בשם \`struct Point\` שמכיל שני שדות שלמים (\`int\`): \`x\` ו-\`y\`.
בתוך פונקציית \`main\`:
1. הגדר משתנה של המבנה בשם \`p1\`.
2. קבע את ערך השדה \`x\` ל-\`10\` ואת \`y\` ל-\`20\`.
3. הדפס אותם בפורמט הבא בדיוק: \`Point: 10, 20\` (כולל ירידת שורה בסוף).
    `,
    exercises: [
      {
        prompt: 'הגדר struct בשם Point עם שדות int בשמות x ו-y. ב-main הגדר משתנה p1 מסוג זה, קבע את ערכיו ל-10 ו-20, והדפס "Point: 10, 20\\n".',
        initialCode: `#include <stdio.h>

// 1. הגדר כאן את struct Point


int main() {
    // 2. הגדר את p1, קבע ערכים והדפס
    
    return 0;
}`,
        verify: (state: VMState) => {
          const structDef = state.structTypes.get('Point');
          if (!structDef) {
            return { passed: false, errorMsg: 'עליך להגדיר struct בשם Point' };
          }

          const hasX = structDef.fields.some(f => f.name === 'x' && f.type === 'int');
          const hasY = structDef.fields.some(f => f.name === 'y' && f.type === 'int');

          if (!hasX || !hasY) {
            return { passed: false, errorMsg: 'המבנה Point חייב להכיל את השדות x ו-y מסוג int' };
          }

          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const p1Var = mainFrame.variables.get('p1');
          if (!p1Var) return { passed: false, errorMsg: 'עליך להגדיר משתנה בשם p1 בתוך main' };

          const structType = p1Var.type;
          const isStruct = structType && typeof structType === 'object' && 'structName' in structType && structType.structName === 'Point';
          if (!isStruct) {
            return { passed: false, errorMsg: 'המשתנה p1 חייב להיות מטיפוס struct Point' };
          }

          const xOffset = structDef.fields.find(f => f.name === 'x')?.offset ?? 0;
          const yOffset = structDef.fields.find(f => f.name === 'y')?.offset ?? 0;

          const xVal = state.dataView.getInt32(p1Var.address + xOffset, true);
          const yVal = state.dataView.getInt32(p1Var.address + yOffset, true);

          if (xVal !== 10 || yVal !== 20) {
            return { passed: false, errorMsg: `ערכי השדות של p1 בזיכרון הם {${xVal}, ${yVal}}, אך עליהם להיות {10, 20}.` };
          }

          if (state.stdout.trim() === 'Point: 10, 20') {
            return { passed: true };
          }

          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר מחוץ ל-main: struct Point { int x; int y; }; ובתוך main הגדר: struct Point p1; קבע ערכים בעזרת נקודה p1.x=10; p1.y=20; והדפס.'
      },
      {
        prompt: 'הגדר struct בשם Rect (מלבן) עם שני שדות מסוג int: width ו-height. בתוך main הגדר משתנה r1 מסוג struct Rect. הגדר מצביע למבנה בשם ptr שיצביע ל-r1. השתמש באופרטור החץ (->) כדי קבוע את ה-width ל-50 ואת ה-height ל-4. הדפס את שטח המלבן (הכפלה של רוחב בגובה) בפורמט: "Area: 200\\n".',
        initialCode: `#include <stdio.h>

// 1. הגדר כאן את struct Rect


int main() {
    // 2. הגדר משתנה r1 ומצביע ptr שיצביע אליו
    
    // 3. קבע ערכים בעזרת ptr->
    
    // 4. הדפס את שטח המלבן בפורמט: Area: [number]
    
    return 0;
}`,
        verify: (state: VMState) => {
          const structDef = state.structTypes.get('Rect');
          if (!structDef) return { passed: false, errorMsg: 'עליך להגדיר struct בשם Rect' };

          const hasW = structDef.fields.some(f => f.name === 'width' && f.type === 'int');
          const hasH = structDef.fields.some(f => f.name === 'height' && f.type === 'int');
          if (!hasW || !hasH) {
            return { passed: false, errorMsg: 'המבנה Rect חייב להכיל שדות width ו-height מסוג int' };
          }

          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };

          const r1Var = mainFrame.variables.get('r1');
          if (!r1Var) return { passed: false, errorMsg: 'עליך להגדיר משתנה בשם r1' };

          const ptrVar = mainFrame.variables.get('ptr');
          if (!ptrVar) return { passed: false, errorMsg: 'עליך להגדיר מצביע בשם ptr' };

          const ptrVal = readMemory(ptrVar.address, ptrVar.type, state);
          if (ptrVal !== r1Var.address) {
            return { passed: false, errorMsg: 'המצביע ptr חייב להצביע ל-r1' };
          }

          const wOffset = structDef.fields.find(f => f.name === 'width')?.offset ?? 0;
          const hOffset = structDef.fields.find(f => f.name === 'height')?.offset ?? 0;
          const wVal = state.dataView.getInt32(r1Var.address + wOffset, true);
          const hVal = state.dataView.getInt32(r1Var.address + hOffset, true);
          if (wVal !== 50 || hVal !== 4) {
            return { passed: false, errorMsg: `ערכי השדות של r1 הם {${wVal}, ${hVal}}, אך עליהם להיות {50, 4}.` };
          }

          if (state.stdout.trim() === 'Area: 200') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר struct Rect { int width; int height; }; ובתוך main הגדר struct Rect r1; struct Rect *ptr = &r1; כעת קבע ptr->width = 50; ptr->height = 4; והדפס את מכפלתם.'
      },
      {
        prompt: 'לפניך הגדרה של struct Student עם שדות id ו-grade. בתוך main הגדר מערך של שני סטודנטים בשם classroom. קבע לסטודנט הראשון (אינדקס 0) id=101 ו-grade=95, ולשני id=102 ו-grade=88. חשב את ממוצע הציונים שלהם כמספר שלם, שמור במשתנה avg והדפס בפורמט: "Average: 91\\n".',
        initialCode: `#include <stdio.h>

struct Student {
    int id;
    int grade;
};

int main() {
    // 1. הגדר מערך של 2 סטודנטים בשם classroom
    
    // 2. אתחל את השדות שלהם: 101 עם 95, ו-102 עם 88
    
    // 3. חשב את ממוצע הציונים לתוך avg והדפס Average: [avg]
    int avg = 0;
    
    return 0;
}`,
        verify: (state: VMState) => {
          const structDef = state.structTypes.get('Student');
          if (!structDef) return { passed: false, errorMsg: 'אל תמחק את הגדרת struct Student' };

          const mainFrame = state.stack.find(f => f.functionName === 'main');
          if (!mainFrame) return { passed: false, errorMsg: 'פונקציית main לא הורצה' };
          const classVar = mainFrame.variables.get('classroom');
          if (!classVar) return { passed: false, errorMsg: 'עליך להגדיר מערך בשם classroom' };

          const avgVar = mainFrame.variables.get('avg');
          if (!avgVar) return { passed: false, errorMsg: 'אל תמחק את המשתנה avg' };
          const avgVal = readMemory(avgVar.address, 'int', state);
          if (avgVal !== 91) {
            return { passed: false, errorMsg: `המוצע הוא 91 (סכום 95 ו-88 חלקי 2 בחילוק שלמים), אך קיבלת: ${avgVal}` };
          }

          if (state.stdout.trim() === 'Average: 91') {
            return { passed: true };
          }
          return { passed: false, errorMsg: `הפלט המודפס שגוי: "${state.stdout.trim()}"` };
        },
        hint: 'הגדר: struct Student classroom[2]; לאחר מכן אתחל classroom[0].id = 101; classroom[0].grade = 95; classroom[1].id = 102; classroom[1].grade = 88; חשב avg = (classroom[0].grade + classroom[1].grade) / 2; והדפס.'
      }
    ]
  },
  {
    id: 11,
    title: '11. פיתוח בעולם האמיתי (סביבה מקומית)',
    content: `
כל הכבוד! עברת את כל שלבי הלימוד הבסיסיים של שפת C. למדת על משתנים, זיכרון, Stack, לולאות, מערכים, מצביעים, Heap, ו-Structs. 
עכשיו הגיע הזמן להבין איך מפתחים בעולם האמיתי – כלומר, על המחשב האישי שלך ולא בתוך דפדפן אינטרנט.

כדי להתחיל לתכנן ולפתח אפליקציות C בעצמך, אתה צריך להתקין שתי תוכנות מרכזיות:
1. **סביבת פיתוח (IDE / Editor):** אנחנו ממליצים על **VS Code (Visual Studio Code)** – עורך הקוד הפופולרי בעולם.
2. **מהדר (Compiler):** המחשב שלך צריך מהדר שיכול לתרגם את קבצי ה-\`.c\` שלך לקבצי ריצה בינאריים.

---

### שלב 1: התקנת סביבת פיתוח (VS Code)
1. הורד והתקן את [VS Code](https://code.visualstudio.com/) בחינם.
2. פתח את VS Code, כנס ללשונית ה-Extensions (סמל של 4 ריבועים בצד שמאל) וחפש את התוסף הרשמי של מיקרוסופט: **C/C++**. התקן אותו כדי לקבל השלמה אוטומטית, הדגשת סינטקס, וחיפוש שגיאות תוך כדי כתיבה.

---

### שלב 2: התקנת מהדר C (Compiler)
בהתאם למערכת ההפעלה שלך:

#### בווינדוס (Windows):
1. הדרך הקלה והפופולרית ביותר היא להתקין את חבילת המהדרים **MSYS2** (המכילה את המהדר GCC).
2. כנס לאתר [MSYS2](https://www.msys2.org/) ועקוב אחר הוראות ההתקנה הפשוטות שלהם.
3. לאחר ההתקנה, פתח את מסוף MSYS2 והרץ את הפקודה הבאה כדי להתקין את הכלים של C:
   \`\`\`bash
   pacman -S mingw-w64-ucrt-x86_64-gcc
   \`\`\`
4. יש להוסיף את נתיב התיקייה \`bin\` (בדרך כלל \`C:\\msys64\\ucrt64\\bin\`) למשתני הסביבה (PATH) של ווינדוס כדי שתוכל להריץ את המהדר מכל מקום במחשב.

#### במאק (macOS):
פתח את הטרמינל והרץ את הפקודה הבאה, שתתקין אוטומטית את מהדר Clang של אפל:
\`\`\`bash
xcode-select --install
\`\`\`

#### בלינוקס (Linux):
במערכות הפצה מבוססות אובונטו/דביאן, הרץ בטרמינל:
\`\`\`bash
sudo apt update
sudo apt install build-essential
\`\`\`

---

### שלב 3: כתיבה, הידור והרצה של הקוד הראשון שלך!
1. פתח תיקייה חדשה בתוך VS Code.
2. צור קובץ חדש בשם \`main.c\` וכתוב בו את תוכנית ה-Hello World שלמדת בפרק 2.
3. פתח את הטרמינל המובנה בתוך VS Code (על ידי קיצור המקשים \`Ctrl + \` \` או דרך התפריט העליון Terminal -> New Terminal).
4. הרץ את פקודת ההידור (Compilation):
   \`\`\`bash
   gcc main.c -o program
   \`\`\`
   *פקודה זו אומרת למהדר gcc לקחת את הקובץ \`main.c\` וליצור קובץ פלט (output) בשם \`program\` (בחלונות זה ייצר קובץ \`program.exe\`).*
5. כעת הרץ את התוכנית המהודרת שלך מהטרמינל!
   * בווינדוס:
     \`\`\`bash
     .\\program.exe
     \`\`\`
   * במאק ובלינוקס:
     \`\`\`bash
     ./program
     \`\`\`

מזל טוב! כעת יש לך את הכלים הדרושים כדי לפתח כל תוכנית שתרצה בשפת C. בהצלחה בהמשך הדרך!
    `
  }
];
