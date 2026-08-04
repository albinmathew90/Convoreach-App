const fs = require('fs');
const path = 'src/pages/Flows/nodes/NodeBodies.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace all instances of `{(node.body || '').length}` with `{(node.message || '').length}`
content = content.replaceAll("{(node.body || '').length}", "{(node.message || '').length}");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed message vs body');
