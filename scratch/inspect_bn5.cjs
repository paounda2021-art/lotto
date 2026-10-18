const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf('function Bn(');
console.log(content.slice(idx + 10000, idx + 12500));
