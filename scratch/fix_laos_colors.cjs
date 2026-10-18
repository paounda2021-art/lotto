const fs = require('fs');

function fixColorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const laosIdx = content.indexOf('if (isLaos) {');
  if (laosIdx === -1) {
    console.error(`'if (isLaos) {' not found in ${filePath}`);
    return false;
  }

  // Target 1: Badge and h4
  const oldHeader = `n.jsx("span", {
                  className: "bg-gradient-to-r from-orange-400 to-amber-400 text-black text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm",
                  children: isNextMode ? "🔥 ชุดคัดเน้นพิเศษ 4 เลข (คำนวณสดจากเลขชุด 6 ตัวงวดล่าสุด)" : "🔥 ชุดคัดเน้นพิเศษ 4 เลข (สูตรคำนวณเลขชุด 6 ตัว 100%)"
                }),
                n.jsx("h4", {
                  className: "text-sm sm:text-base font-extrabold text-orange-200",
                  children: isNextMode ? ("ชุดเลขวินเน้น 4 ตัว งวดวัน" + h.dayName + "ที่จะถึง (หวยลาวพัฒนา)") : "ชุดเลขวินเน้น 4 ตัว รอบต่อรอบ (หวยลาวพัฒนา เข้าเป้า 100%)"
                })`;

  const newHeader = `n.jsx("span", {
                  style: {
                    background: "linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    boxShadow: "0 2px 10px rgba(249, 115, 22, 0.45)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                  },
                  className: "text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm",
                  children: isNextMode ? "🔥 ชุดคัดเน้นพิเศษ 4 เลข (คำนวณสดจากเลขชุด 6 ตัวงวดล่าสุด)" : "🔥 ชุดคัดเน้นพิเศษ 4 เลข (สูตรคำนวณเลขชุด 6 ตัว 100%)"
                }),
                n.jsx("h4", {
                  style: {
                    color: "#ffedd5",
                    textShadow: "0 0 14px rgba(249, 115, 22, 0.6)"
                  },
                  className: "text-sm sm:text-base font-extrabold",
                  children: isNextMode ? ("ชุดเลขวินเน้น 4 ตัว งวดวัน" + h.dayName + "ที่จะถึง (หวยลาวพัฒนา)") : "ชุดเลขวินเน้น 4 ตัว รอบต่อรอบ (หวยลาวพัฒนา เข้าเป้า 100%)"
                })`;

  // Target 2: Day buttons
  const oldButtons = `className: "px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer " +
                        (isSel
                          ? "bg-gradient-to-r from-orange-400 to-amber-400 text-black shadow-[0_0_12px_rgba(249,115,22,0.6)] scale-105 border border-orange-200 ring-2 ring-orange-400"
                          : "bg-black/50 text-gray-300 hover:text-white hover:bg-orange-950/50 border border-gray-700/60 active:scale-95"),
                      children: dItem.label`;

  const newButtons = `style: isSel ? {
                        background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
                        color: "#ffffff",
                        border: "1px solid #fed7aa",
                        boxShadow: "0 0 14px rgba(249, 115, 22, 0.8)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      } : {
                        color: "#d1d5db"
                      },
                      className: "px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer " +
                        (isSel
                          ? "scale-105 ring-2 ring-orange-400"
                          : "bg-black/50 hover:text-white hover:bg-orange-950/50 border border-gray-700/60 active:scale-95"),
                      children: dItem.label`;

  const pos1 = content.indexOf(oldHeader, laosIdx);
  if (pos1 === -1) {
    console.error(`Target 1 (header) not found in ${filePath}`);
    return false;
  }
  content = content.slice(0, pos1) + newHeader + content.slice(pos1 + oldHeader.length);

  const pos2 = content.indexOf(oldButtons, laosIdx);
  if (pos2 === -1) {
    console.error(`Target 2 (buttons) not found in ${filePath}`);
    return false;
  }
  content = content.slice(0, pos2) + newButtons + content.slice(pos2 + oldButtons.length);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated styles in ${filePath}`);
  return true;
}

fixColorsInFile('downloaded_target_worker/assets/index-CN-5_2d9.js');
fixColorsInFile('scratch/apply_win4_card_patch.cjs');
if (fs.existsSync('scratch/index_patched.js')) {
  fixColorsInFile('scratch/index_patched.js');
}
