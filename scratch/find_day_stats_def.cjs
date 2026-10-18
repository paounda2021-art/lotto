const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf('const isStocks = (o==="NIKKEI"');
console.log(content.slice(idx - 33000, idx - 26000));
