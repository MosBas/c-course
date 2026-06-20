import { formatAddress, readMemory } from './c-interpreter/interpreter';
import type { VMState } from './c-interpreter/interpreter';

export interface Exercise {
  prompt: string;
  initialCode: string;
  verify: (state: VMState) => { passed: boolean; errorMsg?: string };
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
המטרה של המדריך הזה היא לקחת אותך לעולם של **שפת C** – אחת השפות החשובות והמשפיעות ביותר בהיסטוריה של המחשוב. אבל לפני שנכתוב את שורת הקוד הראשונה שלנו, אנחנו חייבים להבין: מה קורה מתחת למכסה המנוע של המחשב?

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

הנה הקוד המלא ב-C:
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
        }
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
        }
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

### איך מגדירים משתנה ב-C?
\`\`\`c
int age = 25;
char grade = 'A';
float pi = 3.14;
\`\`\`

### איך מדפיסים משתנים?
כדי להדפיס משתנים באמצעות \`printf\`, אנחנו צריכים להשתמש ב"מצייני פורמט" (Format Specifiers) שמסבירים ל-\`printf\` איך להציג את הבייטים שנמצאים בזיכרון:
* \`%d\` - משמש להדפסת מספר שלם (\`int\`).
* \`%c\` - משמש להדפסת תו (\`char\`).
* \`%f\` - משמש להדפסת מספר עשרוני (\`float\`).

דוגמה:
\`\`\`c
int apples = 10;
printf("יש לי %d תפוחים\\n", apples);
\`\`\`

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
        }
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
        }
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

הנה דוגמה:
\`\`\`c
int grade = 85;

if (grade >= 55) {
    printf("עברת!\\n");
} else {
    printf("נכשלת!\\n");
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
        prompt: 'כתוב תנאי הבודק אם המשתנה age הוא 18 ומעלה. הדפס "adult" אם כן, ו-"minor" אם לא. אל תשכח לרדת שורה בסוף ההדפסה (\n).',
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
        }
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
        }
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
\`\`\`c
int count = 1;
while (count <= 3) {
    printf("%d\\n", count);
    count++; // מקדם את המשתנה ב-1. שווה ערך ל- count = count + 1
}
\`\`\`

### לולאת \`for\`
לולאת \`for\` ב-C שונה מהלולאה בפייתון, והיא נחשבת לאחד המבנים החזקים והנוחים ביותר. התחביר שלה מורכב משלושה חלקים המופרדים בנקודה-פסיק \`;\`:
\`\`\`c
for (אתחול ; תנאי עצירה ; קידום) {
    // קוד לביצוע
}
\`\`\`

לדוגמה, הדפסת מספרים מ-1 עד 5:
\`\`\`c
for (int i = 1; i <= 5; i++) {
    printf("%d\\n", i);
}
\`\`\`
1. **אתחול (\`int i = 1\`):** מתבצע פעם אחת בלבד עם תחילת הלולאה.
2. **תנאי עצירה (\`i <= 5\`):** נבדק לפני כל סיבוב. אם הוא אמת - הבלוק יבוצע. אם שקר - הלולאה מסתיימת.
3. **קידום (\`i++\`):** מבוצע בסוף כל סיבוב, רגע לפני בדיקת התנאי מחדש.

### משימה:
עליך לחשב את **העצרת (Factorial)** של מספר. עצרת של מספר היא מכפלת כל המספרים מ-1 ועד אותו מספר. 
לדוגמה, עצרת של 5 היא: \`1 * 2 * 3 * 4 * 5 = 120\`.
לפניך קוד שמגדיר משתנה \`num\` שערכו \`5\`, ומשתנה \`result\` שערכו \`1\`. 
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
        }
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
        }
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
        }
      }
    ]
  },
  {
    id: 6,
    title: '6. פונקציות ומחסנית הזיכרון',
    content: `
פונקציות מאפשרות לנו לפצל את הקוד לחלקים קטנים, קריאים ושימושיים מחדש. ב-C, אנחנו חייבים להצהיר על טיפוס הערך שהפונקציה מחזירה, ועל טיפוס של כל פרמטר שהיא מקבלת.

הנה פונקציה שמקבלת שני שלמים ומחזירה את הגדול מביניהם:
\`\`\`c
int get_max(int a, int b) {
    if (a > b) {
        return a;
      }
    return b;
}
\`\`\`

### מחסנית הזיכרון (Call Stack)
כאשר התוכנית שלנו קוראת לפונקציה, המחשב מייצר עבורה אזור מיוחד בזיכרון ה-RAM שנקרא **Stack Frame** (מסגרת מחסנית). 
* כל הפרמטרים והמשתנים המקומיים של הפונקציה נוצרים בתוך ה-Stack Frame שלה.
* כשהפונקציה מסיימת לרוץ (מגיעה ל-\`return\`), ה-Stack Frame שלה **נמחק לחלוטין מהזיכרון**, והמחשב חוזר להמשך ריצת פונקציית ה-\`main\`.

הרעיון הזה הוא קריטי! משתנים שהגדרת בתוך פונקציה מסוימת **אינם קיימים** מחוצה לה, והזיכרון שלהם מנוקה אוטומטית על ידי המחשב ללא מעורבות שלך.

בסימולטור משמאל, תוכל לראות את ה-Stack Frames גדלים כלפי מטה בזיכרון בכל פעם שנכנסים לפונקציה, ונעלמים כשיוצאים ממנה.

### משימה:
לפניך קוד התוכנית. 
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
        }
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
        }
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

### מחרוזות ב-C
בפייתון, מחרוזת טקסט היא טיפוס נתונים מתוחכם ומובנה. ב-C, **מחרוזת היא פשוט מערך של תווים (\`char\`)**. 
כדי שהמחשב ידע איפה המחרוזת מסתיימת (שהרי גודל המערך קבוע מראש), שפת C משתמשת בתו מיוחד שנקרא **תו הסיום של המחרוזת**: \`'\\0'\` (תו ה-Null, שערכו המספרי הוא 0).

למשל, כדי לשמור את המילה "Hi" בזיכרון, נצטרך מערך של 3 תווים:
\`\`\`c
char word[3] = {'H', 'i', '\\0'};
// או בקיצור:
char word[] = "Hi"; // המהדר יוסיף אוטומטית את '\0' בסוף ויקבע את גודל המערך ל-3
\`\`\`
התו \`'\\0'\` הוא קריטי! אם ננסה להדפיס מחרוזת שאין לה תו סיום, ה-\`printf\` ימשיך להדפיס את התאים הבאים בזיכרון (מה שיראה כמו ג'יבריש או יגרום לקריסת התוכנית) עד שיפגוש באקראי את הערך 0 בזיכרון.

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
        }
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
        }
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
        }
      },
      {
        prompt: 'לפניך מערך של 3 איברים בשם arr. הגדר מצביע למספר שלם בשם ptr שיצביע לתחילת המערך (arr). שנה את האיבר השני במערך (באינדקס 1) לערך 500 באמצעות גישה דרך המצביע ptr (כלומר ptr[1] = 500), והדפס את האיבר השני בעזרת printf בפורמט "Value: 500\\n".',
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
        }
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
        }
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

### שימוש ב-\`malloc\`
הפונקציה \`malloc\` (Memory Allocation) מבקשת ממערכת ההפעלה להקצות לנו בלוק זיכרון ב-Heap בגודל מסוים של בייטים, ומחזירה לנו את **כתובת ההתחלה של הבלוק** (כלומר, מצביע).
כדי לדעת כמה בייטים להקצות, נשתמש באופרטור \`sizeof\` שמחשב את הגודל של הטיפוס:
\`\`\`c
// מקצה זיכרון למספר שלם אחד על ה-Heap
int *p = (int*) malloc(sizeof(int)); 
\`\`\`
*(הסוגריים \`(int*)\` לפני הקריאה הם המרה (Cast) של טיפוס המצביע, כדי שהמהדר ידע שכתובת הזיכרון המוחזרת תשמש אותנו כמצביע לאינט).*

כעת נוכל לעבוד עם \`*p\` כאילו הוא משתנה רגיל לחלוטין:
\`\`\`c
*p = 100;
\`\`\`

### שחרור זיכרון באמצעות \`free\`
בניגוד למשתנים ב-Stack שנמחקים לבד, משתנים ב-Heap **לעולם לא נמחקים מעצמם**! 
המשמעות היא שאם נסיים לעבוד איתם ולא נשחרר אותם, הם ימשיכו לתפוס מקום ב-RAM עד שהתוכנית כולה תיסגר. מצב זה נקרא **דליפת זיכרון (Memory Leak)** והוא עלול להביא להאטה וקריסה של המחשב.

כדי לשחרר זיכרון שהקצנו דינמית, נשתמש בפונקציה \`free\`:
\`\`\`c
free(p); // משחרר את הבלוק ששמור בכתובת p
\`\`\`
לאחר השחרור, אסור לגשת יותר ל-\`*p\` כיוון שהכתובת הזו כבר לא שייכת לנו (ניסיון כזה נקרא "Use After Free" והוא באג אבטחה חמור).

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
        }
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
        }
      }
    ]
  },
  {
    id: 10,
    title: '10. מבנים (Structs)',
    content: `
לעיתים קרובות, משתנים בסיסיים כמו מספרים או תווים לא מספיקים כדי לתאר ישות מורכבת בעולם האמיתי. למשל, אם נרצה לייצג "נקודה" על גרף דו-ממדי, נצטרך שני משתנים: \`x\` ו-\`y\`.

ב-C נוכל לאגד מספר משתנים מטיפוסים שונים תחת קורת גג אחת בעזרת **מבנה (Struct)**.

### הגדרת Struct
\`\`\`c
struct Point {
    int x;
    int y;
}; // אל תשכח את הנקודה-פסיק בסוף!
\`\`\`

### שימוש במבנה
כדי ליצור משתנה מסוג המבנה שיצרנו, נשתמש במילה \`struct\` ובשם המבנה, וניגש לשדות שלו באמצעות אופרטור הנקודה **\`.\`**:
\`\`\`c
struct Point p1;
p1.x = 10;
p1.y = 20;
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

מבנים מאפשרים לנו לבנות מבני נתונים מורכבים יותר (כמו רשימות מקושרות, עצים ועוד) על ידי יצירת שדות שהם מצביעים למבנים אחרים.

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
        }
      },
      {
        prompt: 'הגדר struct בשם Rect (מלבן) עם שני שדות מסוג int: width ו-height. בתוך main הגדר משתנה r1 מסוג struct Rect. הגדר מצביע למבנה בשם ptr שיצביע ל-r1. השתמש באופרטור החץ (->) כדי לקבוע את ה-width ל-50 ואת ה-height ל-4. הדפס את שטח המלבן (הכפלה של רוחב בגובה) בפורמט: "Area: 200\\n".',
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
        }
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
