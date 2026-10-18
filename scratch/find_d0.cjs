const fs = require("fs");
const content = fs.readFileSync("downloaded_target_worker/assets/index-CN-5_2d9.js", "utf8");
const idx = content.indexOf('d0=');
if (idx !== -1) {
  console.log(content.slice(idx - 200, idx + 1000));
} else {
  const idx2 = content.indexOf('function d0(');
  if (idx2 !== -1) {
    console.log(content.slice(idx2, idx2 + 1000));
  } else {
    // search for d0 definition
    const m = content.match(/d0\s*=\s*\([^)]*\)\s*=>/);
    console.log("match:", m);
  }
}
