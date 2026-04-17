const fs = require('fs');
const path = "D:\\new learning clone git\\LMS-Project-Demo\\src\\pages\\exam\\create-exam\\CreateExam.jsx";

try {
    let content = fs.readFileSync(path, 'utf8');

    // List of prefixes that often have hyphens
    const prefixes = ['btn', 'form', 'text', 'bg', 'border', 'shadow', 'rounded', 'mw', 'mh', 'w', 'h', 'm', 'p', 'my', 'mx', 'py', 'px', 'mt', 'mb', 'ms', 'me', 'pt', 'pb', 'ps', 'pe', 'fw', 'fs', 'ls', 'bi', 'col', 'row', 'gap', 'opacity', 'z', 'input', 'list', 'card', 'object', 'min', 'max', 'justify', 'align', 'flex'];

    // Regex: Match prefix + " - " + suffix
    // We iterate to be safe
    prefixes.forEach(p => {
        // Global replace with regex
        const regex = new RegExp(`\\b${p}\\s-\\s`, 'g');
        content = content.replace(regex, `${p}-`);
    });

    // Specific corrections for some likely missed ones or false positives
    content = content.replace(/btn - sm/g, 'btn-sm');
    content = content.replace(/input - group/g, 'input-group');
    content = content.replace(/form - control/g, 'form-control');
    content = content.replace(/form - select/g, 'form-select');
    content = content.replace(/form - check/g, 'form-check');
    content = content.replace(/form - switch/g, 'form-switch');
    content = content.replace(/no - repeat/g, 'no-repeat');

    // Also fix curly brace spacing artifacts if any: ` { ` -> `{` ? No, that's risky.

    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully fixed spaces in class definitions.");
} catch (e) {
    console.error("Error fixing file:", e);
}
