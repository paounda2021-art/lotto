const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf("HANOI 100% 3-ROUND CHASE CARD");
console.log(content.slice(idx - 2500, idx));
