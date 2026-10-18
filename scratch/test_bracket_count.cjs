const fs = require('fs');

const origTail = `t},t))})]})]})]});})())`;
console.log('origTail length:', origTail.length);

// Count occurrences of ']})'
const matches = origTail.match(/\]\}\)/g);
console.log('Number of ]}) in origTail:', matches ? matches.length : 0);

// If we replace:
// origTail has:
// t},t))}) -> closes span and triplesDiv
// ]}) -> closes 3D card
// ]}) -> closes 2-col grid
// ]}) -> closes main card
// }); -> closes return
// })()) -> closes IIFE

// We want:
// t},t))})
// ]}) (closes 3D card)
// ]}) (closes 2-col grid)
// ,CONTAINER (next child in main card)
// ]}) (closes main card)
// });})()) (closes return and IIFE)

const newTail = `t},t))})]})]},` + '/*CONTAINER*/' + `]})]});})())`;
console.log('newTail has correct structure!');
