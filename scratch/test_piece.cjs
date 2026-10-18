const fs = require('fs');

// Test pieces of Snippet 2
const piece1 = `
  (() => {
    const finished = [];
    const hitCount = 0;
    if (finished.length === 0) {
      return n.jsx("span", {});
    }
    if (hitCount > 0) {
      return n.jsxs("span", {});
    }
    return n.jsxs("span", {});
  })()
`;

try {
  new Function('n', 'return ' + piece1);
  console.log('Piece 1 passed!');
} catch (e) {
  console.log('Piece 1 failed:', e.message);
}

const piece2 = `
  (winData.sessionHits || []).map(s => n.jsxs("div", {
    children: [
      s.hasResult
        ? n.jsx("div", {
            children: s.hits.length > 0
              ? n.jsx("div", {})
              : n.jsx("div", {})
          })
        : n.jsx("div", {})
    ]
  }, s.key))
`;

try {
  new Function('n', 'winData', 'return ' + piece2);
  console.log('Piece 2 passed!');
} catch (e) {
  console.log('Piece 2 failed:', e.message);
}
