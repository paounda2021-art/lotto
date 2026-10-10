const fs = require('fs');
const path = require('path');

// 1. Patch target JS bundle to remove LAOS_STAR button
const jsPath = path.join(__dirname, '..', 'downloaded_target_worker', 'assets', 'index-CN-5_2d9.js');
if (fs.existsSync(jsPath)) {
  let js = fs.readFileSync(jsPath, 'utf8');
  // Match: n.jsx("button",{onClick:()=>t("LAOS_STAR"),...children:"⭐ ลาวสตาร์"}),
  const searchStr = 'n.jsx("button",{onClick:()=>t("LAOS_STAR"),className:';
  if (js.includes(searchStr)) {
    const startIdx = js.indexOf(searchStr);
    const endIdx = js.indexOf('children:"⭐ ลาวสตาร์"}),', startIdx);
    if (startIdx !== -1 && endIdx !== -1) {
      const fullMatch = js.slice(startIdx, endIdx + 'children:"⭐ ลาวสตาร์"}),'.length);
      js = js.replace(fullMatch, '');
      fs.writeFileSync(jsPath, js, 'utf8');
      console.log('Successfully patched index-CN-5_2d9.js to remove LAOS_STAR button!');
    }
  }
}

// 2. Sync to dist
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
copyDir(path.join(__dirname, '..', 'downloaded_target_worker'), path.join(__dirname, '..', 'dist'));
console.log('Synced downloaded_target_worker into dist directory!');

// 3. Update serve_target_5173.cjs
const servePath = path.join(__dirname, 'serve_target_5173.cjs');
if (fs.existsSync(servePath)) {
  let serveCode = fs.readFileSync(servePath, 'utf8');
  serveCode = serveCode.replace(
    "const PUBLIC_DIR = path.join(__dirname, '..', 'dist');",
    "const PUBLIC_DIR = path.join(__dirname, '..', 'downloaded_target_worker');"
  );
  fs.writeFileSync(servePath, serveCode, 'utf8');
  console.log('Updated serve_target_5173.cjs to serve downloaded_target_worker directly!');
}
