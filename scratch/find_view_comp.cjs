const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf('const isStocks = (o==="NIKKEI"');
// Look at 3000 chars before idx
console.log(content.slice(idx - 3000, idx - 1000));
