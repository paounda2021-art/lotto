const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf('Ey=');
if (idx !== -1) {
  console.log(content.slice(idx - 200, idx + 1000));
} else {
  const idx2 = content.indexOf('function Ey(');
  console.log(content.slice(idx2, idx2 + 1000));
}
