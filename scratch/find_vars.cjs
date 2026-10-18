const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf("HANOI 100% 6-PRIZE WIN4 CARD");
console.log(content.slice(idx - 1500, idx));
