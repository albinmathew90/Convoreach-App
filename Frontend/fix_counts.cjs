const fs = require('fs');
const path = 'src/pages/Flows/nodes/NodeBodies.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('Enter button text here, only 0/20 characters allowed.', "Enter button text here, only {(btnName || '').length}/20 characters allowed.");
content = content.replace('Enter body here, only 0/1024 characters allowed.', "Enter body here, only {(node.body || '').length}/1024 characters allowed.");
content = content.replace('Enter button text here, only 0/20 characters allowed.', "Enter button text here, only {(node.buttonText || '').length}/20 characters allowed.");
content = content.replace('Enter section title here, only 0/20 characters allowed.', "Enter section title here, only {(s.title || '').length}/20 characters allowed.");
content = content.replace('Enter title here, only 0/24 characters allowed.', "Enter title here, only {(item.title || '').length}/24 characters allowed.");
content = content.replace('Enter body here, only 0/1024 characters allowed.', "Enter body here, only {(node.body || '').length}/1024 characters allowed.");
content = content.replace('Enter footer here, only 0/60 characters allowed.', "Enter footer here, only {(node.footer || '').length}/60 characters allowed.");
content = content.replace('Enter body here, only 0/1024 characters allowed.', "Enter body here, only {(node.body || '').length}/1024 characters allowed.");
content = content.replace('Enter footer here, only 0/60 characters allowed.', "Enter footer here, only {(node.footer || '').length}/60 characters allowed.");
content = content.replace('Enter header here, only 0/20 characters allowed.', "Enter header here, only {(node.header || '').length}/20 characters allowed.");
content = content.replace('Enter body here, only 0/1024 characters allowed.', "Enter body here, only {(node.body || '').length}/1024 characters allowed.");
content = content.replace('Enter footer here, only 0/60 characters allowed.', "Enter footer here, only {(node.footer || '').length}/60 characters allowed.");
content = content.replace('Enter message here, only 0/1024 characters allowed.', "Enter message here, only {(node.prompt || '').length}/1024 characters allowed.");
content = content.replace('Enter validation error message here, Only 0/1024 characters allowed.', "Enter validation error message here, only {(node.validationError || '').length}/1024 characters allowed.");
content = content.replace('Enter message here, only 0/1024 characters allowed.', "Enter message here, only {(node.prompt || '').length}/1024 characters allowed.");
content = content.replace('Enter validation error message here, Only 0/1024 characters allowed.', "Enter validation error message here, only {(node.validationError || '').length}/1024 characters allowed.");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed character counts');
