const fs = require('fs');

const bundlePath = 'downloaded_target_worker/assets/index-CN-5_2d9.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

console.log('Bundle length before patch:', bundle.length);

// 1. Check if already patched
if (bundle.includes('computeHanoiWinSet')) {
  console.log('Already contains computeHanoiWinSet!');
}

// 2. We need to find the location in qy right before s0=["มกราคม"
const s0Pos = bundle.indexOf('s0=["มกราคม"', 760000);
if (s0Pos === -1) {
  console.error('Could not find s0=["มกราคม"');
  process.exit(1);
}

// The tail right before s0Pos is:
// " inline-flex items-center gap-1",children:"⏳ รอประกาศผล"});})())})]})]})]})]})},"
// We want to insert right after the 3rd ]}) and before the 4th ]})
const targetMarker = 'children:"⏳ รอประกาศผล"});})())})]})]})]})';
const markerPos = bundle.indexOf(targetMarker, s0Pos - 200);

if (markerPos === -1) {
  console.error('Could not find targetMarker');
  process.exit(1);
}

console.log('Found targetMarker at:', markerPos);
console.log('Context:\n', bundle.substring(markerPos, markerPos + targetMarker.length + 20));

// Build the helper and JSX
const helperCode = `
const computeHanoiWinSet = (drawsList, dayCode, viewMode, latestDraw) => {
  try {
    let allD = drawsList || [];
    if (viewMode === "VERIFY" && latestDraw && latestDraw.date) {
      allD = allD.filter(d => d.date !== latestDraw.date);
    }
    let vipD = allD.filter(d => d.session === "HANOI_VIP");
    if (vipD.length === 0) {
      try {
        const raw = typeof localStorage !== "undefined" ? localStorage.getItem("lotto_data_hanoi_vip") : null;
        if (raw) vipD = JSON.parse(raw);
        if (viewMode === "VERIFY" && latestDraw && latestDraw.date) {
          vipD = vipD.filter(d => d.date !== latestDraw.date);
        }
      } catch(err) {}
    }
    let all3D = allD.filter(d => ["HANOI_SPECIAL", "HANOI_EVENING", "HANOI_VIP"].includes(d.session));
    if (all3D.length === 0) all3D = allD;
    const vipStats = Ey(vipD, dayCode);
    const all3Stats = Ey(all3D, dayCode);
    const v0 = vipStats.topSingleDigits && vipStats.topSingleDigits[0] ? vipStats.topSingleDigits[0].digit : null;
    const v1 = vipStats.topSingleDigits && vipStats.topSingleDigits[1] ? vipStats.topSingleDigits[1].digit : null;
    const a0 = all3Stats.topSingleDigits && all3Stats.topSingleDigits[0] ? all3Stats.topSingleDigits[0].digit : null;
    const a1 = all3Stats.topSingleDigits && all3Stats.topSingleDigits[1] ? all3Stats.topSingleDigits[1].digit : null;
    let digits = Array.from(new Set([v0, v1, a0, a1].filter(x => x !== null && x !== undefined)));
    if (all3Stats.topSingleDigits) {
      for (const item of all3Stats.topSingleDigits) {
        if (!digits.includes(item.digit)) digits.push(item.digit);
        if (digits.length >= 4) break;
      }
    }
    if (vipStats.topSingleDigits && digits.length < 4) {
      for (const item of vipStats.topSingleDigits) {
        if (!digits.includes(item.digit)) digits.push(item.digit);
        if (digits.length >= 4) break;
      }
    }
    digits = digits.slice(0, 4).sort((x, y) => x - y);
    const pairs2D = [];
    for (let i = 0; i < digits.length; i++) {
      for (let j = 0; j < digits.length; j++) {
        if (i !== j) pairs2D.push(String(digits[i]) + String(digits[j]));
      }
    }
    const triples3D = [];
    for (let i = 0; i < digits.length; i++) {
      for (let j = i + 1; j < digits.length; j++) {
        for (let k = j + 1; k < digits.length; k++) {
          triples3D.push(String(digits[i]) + String(digits[j]) + String(digits[k]));
        }
      }
    }
    return { v0, v1, a0, a1, digits, pairs2D, triples3D };
  } catch(e) { return null; }
};
`;

console.log('Helper code length:', helperCode.length);
