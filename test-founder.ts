
import * as fs from 'fs';

console.error("Hello World from TSX Root (Stderr)");
console.log("Hello World from TSX Root (Stdout)");
fs.writeFileSync('test-output-root.txt', 'Hello World from TSX Root\n');

setTimeout(() => {
    console.error("Done waiting");
}, 2000);
