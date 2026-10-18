const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf('o==="NIKKEI"');
// Let's search backward for function definition
console.log(content.slice(idx - 4000, idx - 2000));
