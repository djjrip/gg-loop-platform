const fs = require('fs');

const content = fs.readFileSync('server/routes.ts', 'utf8');
const lines = content.split('\n');

let tryCount = 0;
let catchCount = 0;
let stack = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (/^\s*try\s*\{/.test(line)) {
        tryCount++;
        stack.push({ line: lineNum, indent: line.search(/\S/), type: 'try' });
        console.log(`Line ${lineNum}: TRY (stack size: ${stack.length})`);
    }

    if (/}\s*catch\s*\(/.test(line) || /catch\s*\(/.test(line)) {
        catchCount++;
        if (stack.length > 0 && stack[stack.length - 1].type === 'try') {
            const tryLine = stack.pop();
            console.log(`Line ${lineNum}: CATCH (closes try from line ${tryLine.line})`);
        } else {
            console.log(`Line ${lineNum}: CATCH (NO MATCHING TRY - orphaned catch!)`);
        }
    }
}

console.log(`\n===== SUMMARY =====`);
console.log(`Total try blocks: ${tryCount}`);
console.log(`Total catch blocks: ${catchCount}`);
console.log(`Unclosed try blocks: ${stack.length}`);

if (stack.length > 0) {
    console.log(`\n===== UNCLOSED TRY BLOCKS =====`);
    stack.forEach(item => {
        console.log(`Line ${item.line}: ${lines[item.line - 1].trim()}`);
    });
}
