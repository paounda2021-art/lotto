const fs = require('fs');

const clean = fs.readFileSync('scratch/clean_bundle.js', 'utf8');

const target = 't},t))})]})]})]});})())';
console.log('clean contains target:', clean.includes(target));

const container = 'n.jsx("div",{})';

// Exactly insert `,container` between the 2nd `]})` and the 3rd `]})`
// Notice target has `]})` (1) `]})` (2) `]})` (3) `;})())`
const replacement = 't},t))})]})]},' + container + '];})())'; // Wait, let's trace carefully:
// target is:
// t},t))})
// ]}) (1: 3D card)
// ]}) (2: grid)
// ]}) (3: main card)
// ;})()) (return and IIFE)

// If we insert container into main card children:
// Main card children array ends with:
// ... grid, container ]
// So grid is closed: `]})`
// Then `,`
// Then `container`
// Then `]` (closes main card children array)
// Then `}` (closes main card props)
// Then `)` (closes main card n.jsxs)
// Then `;` (closes return)
// Then `})()` (invokes inner function)
// Then `)` (closes outer function)
// Which is: `]})` followed by `;})())`!

const correctReplacement = 't},t))})]})]},' + container + ']})' + ';})())';
// Wait, before `,` we need grid to close!
// Grid is: n.jsxs("div", { ... children: [ ... ] })
// So grid closes with:
// `]` (children array)
// `}` (props)
// `)` (n.jsxs)
// So grid closes with `]})`!
// So before `,` there MUST be TWO `]})`:
// 1st `]})` closes 3D card
// 2nd `]})` closes grid!
// Then `,`
// Then container
// Then 3rd `]})` closes main card!
// Then `;})())`!

const realReplacement = 't},t))})]})]})' + ',' + container + ']})' + ';})())';

console.log('target:         ', target);
console.log('realReplacement:', realReplacement);

const testFixed = clean.replace(target, realReplacement);
fs.writeFileSync('scratch/test_fixed.js', testFixed, 'utf8');
console.log('Written test_fixed.js');
