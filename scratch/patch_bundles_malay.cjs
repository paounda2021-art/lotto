const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, '..', 'cloudflare_download_faae1b0f', 'assets', 'index-CN-5_2d9.js'),
  path.join(__dirname, '..', 'cloudflare_latest_download', 'assets', 'index-CN-5_2d9.js')
];

const malayJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch', 'malay_data.json'), 'utf8'));
const malayMinStr = JSON.stringify(malayJson);

for (const fp of filePaths) {
  if (!fs.existsSync(fp)) {
    console.log('File not found:', fp);
    continue;
  }
  let code = fs.readFileSync(fp, 'utf8');

  // Inject initial Malay data variable if not present
  if (!code.includes('malayData_init=')) {
    code = code.replace('}],e0=[', `}],malayData_init=${malayMinStr},e0=[`);
  }

  // 1. Header button tab for MALAY
  const laosStarBtnStr = 'n.jsx("button",{onClick:()=>t("LAOS_STAR"),className:`px-3 py-1 rounded-lg text-xs font-bold transition-all ${e==="LAOS_STAR"?"bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-glow-gold font-extrabold":"text-gray-400 hover:text-white"}`,children:"⭐ ลาวสตาร์"})';
  const malayBtnStr = ',n.jsx("button",{onClick:()=>t("MALAY"),className:`px-3 py-1 rounded-lg text-xs font-bold transition-all ${e==="MALAY"?"bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-extrabold":"text-gray-400 hover:text-white"}`,children:"🇲🇾 หวยมาเลย์"})';

  if (!code.includes('children:"🇲🇾 หวยมาเลย์"')) {
    code = code.replace(laosStarBtnStr, laosStarBtnStr + malayBtnStr);
  }

  // 2. Header subtitle
  const laosStarSubStr = 'e==="LAOS_STAR"?"วิเคราะห์สถิติหวยลาวสตาร์ย้อนหลัง (ออกทุกวัน รอบ 15:45 น.)":';
  const malaySubStr = 'e==="LAOS_STAR"?"วิเคราะห์สถิติหวยลาวสตาร์ย้อนหลัง (ออกทุกวัน รอบ 15:45 น.)":e==="MALAY"?"วิเคราะห์สถิติหวยมาเลย์ (Magnum 4D) ย้อนหลัง (รอบ 18:30 น.)":';
  if (!code.includes('วิเคราะห์สถิติหวยมาเลย์')) {
    code = code.replace(laosStarSubStr, malaySubStr);
  }

  // 3. Header session banner
  const laosStarBanner = 'e==="LAOS_STAR"&&n.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5",children:[n.jsx(zo,{className:"w-3.5 h-3.5 text-amber-400"}),n.jsx("span",{children:"รอบ 15:45 น. (ออกทุกวัน หวยลาวสตาร์)"})]})';
  const malayBanner = ',e==="MALAY"&&n.jsxs("div",{className:"bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5",children:[n.jsx(zo,{className:"w-3.5 h-3.5 text-blue-400"}),n.jsx("span",{children:"รอบ 18:30 น. (ออกทุกวันพุธ, เสาร์, อาทิตย์ - หวยมาเลย์)"})]})';
  if (!code.includes('รอบ 18:30 น. (ออกทุกวันพุธ, เสาร์, อาทิตย์ - หวยมาเลย์)')) {
    code = code.replace(laosStarBanner, laosStarBanner + malayBanner);
  }

  // 4. History table title
  const laosStarTableTitle = 't==="LAOS_STAR"?"⭐ หวยลาวสตาร์ (ออกทุกวัน รอบ 15:45 น.)":';
  const malayTableTitle = 't==="LAOS_STAR"?"⭐ หวยลาวสตาร์ (ออกทุกวัน รอบ 15:45 น.)":t==="MALAY"?"🇲🇾 หวยมาเลย์ (Magnum 4D รอบ 18:30 น.)":';
  if (!code.includes('🇲🇾 หวยมาเลย์ (Magnum 4D รอบ 18:30 น.)')) {
    code = code.replace(laosStarTableTitle, malayTableTitle);
  }

  // 5. History table subtitle
  const laosStarTableSub = 't==="LAOS_STAR"?"แสดงผลหวยลาวสตาร์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ออกทุกวัน รอบ 15:45 น.":';
  const malayTableSub = 't==="LAOS_STAR"?"แสดงผลหวยลาวสตาร์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง ออกทุกวัน รอบ 15:45 น.":t==="MALAY"?"แสดงผลหวยมาเลย์ 3 ตัวบน, 2 ตัวบน, 2 ตัวล่าง (Magnum 4D) ย้อนหลัง":';
  if (!code.includes('แสดงผลหวยมาเลย์')) {
    code = code.replace(laosStarTableSub, malayTableSub);
  }

  // 6. History table badge
  const laosStarBadge = 't==="LAOS_STAR"?"⭐ ลาวสตาร์ (15:45)":';
  const malayBadge = 't==="LAOS_STAR"?"⭐ ลาวสตาร์ (15:45)":t==="MALAY"?"🇲🇾 หวยมาเลย์ (18:30)":';
  if (!code.includes('🇲🇾 หวยมาเลย์ (18:30)')) {
    code = code.replace(laosStarBadge, malayBadge);
  }

  // 7. State initialization for malayData
  if (!code.includes('[ml,setMl]')) {
    code = code.replace(
      '[Y,q]=W.useState(()=>Se("lotto_data_laos_star",e0)),',
      '[Y,q]=W.useState(()=>Se("lotto_data_laos_star",e0)),[ml,setMl]=W.useState(()=>Se("lotto_data_malay",malayData_init)),'
    );
  }

  // 8. activeDataset switch
  const activeDataLaosStar = 'e==="LAOS_STAR"?Y:';
  const activeDataMalay = 'e==="LAOS_STAR"?Y:e==="MALAY"?ml:';
  if (!code.includes('e==="MALAY"?ml:')) {
    code = code.replace(activeDataLaosStar, activeDataMalay);
  }

  // 9. handleResetData
  const resetLaosStar = 'e==="LAOS_STAR"?(localStorage.removeItem("lotto_data_laos_star"),q(e0)):';
  const resetMalay = 'e==="LAOS_STAR"?(localStorage.removeItem("lotto_data_laos_star"),q(e0)):e==="MALAY"?(localStorage.removeItem("lotto_data_malay"),setMl(malayData_init)):';
  if (!code.includes('localStorage.removeItem("lotto_data_malay")')) {
    code = code.replace(resetLaosStar, resetMalay);
  }

  // 10. nameMap in auto fetch
  const nameMapLaosStar = 'LAOS_STAR:"ลาวสตาร์",';
  const nameMapMalay = 'LAOS_STAR:"ลาวสตาร์",MALAY:"หวยมาเลย์",';
  if (!code.includes('MALAY:"หวยมาเลย์",')) {
    code = code.replace(nameMapLaosStar, nameMapMalay);
  }

  // 11. Icon helper for prediction card
  const iconLaosStar = 'e==="LAOS_STAR"?"⭐":';
  const iconMalay = 'e==="LAOS_STAR"?"⭐":e==="MALAY"?"🇲🇾":';
  if (!code.includes('e==="MALAY"?"🇲🇾":')) {
    code = code.replace(iconLaosStar, iconMalay);
  }

  // 12. Auto sync updater call in auto-fetch
  const syncLaosStarCall = 'const sr=_e(Y,"LAOS_STAR_DAY","LAOS_STAR");sr.updatedCount>0&&(q(sr.list),B+=sr.updatedCount);';
  const syncMalayCall = 'const sr_m=_e(ml,"MALAY_EVENING","MALAY");sr_m.updatedCount>0&&(setMl(sr_m.list),B+=sr_m.updatedCount);';
  if (code.includes(syncLaosStarCall) && !code.includes('sr_m=')) {
    code = code.replace(syncLaosStarCall, syncLaosStarCall + syncMalayCall);
  }

  fs.writeFileSync(fp, code, 'utf8');
  console.log('Successfully patched Malay into bundle:', fp);
}
