const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf('const isStocks = (o==="NIKKEI"');
// Search backward for "function "
let pos = idx;
for (let i = 0; i < 5; i++) {
  pos = content.lastIndexOf("function ", pos - 1);
  console.log(`function at ${pos}:`, content.slice(pos, pos + 100));
}
