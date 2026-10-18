const n = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props })
};

const s = {
  hasResult: true,
  hits: []
};

try {
  const res = s.hasResult
    ? n.jsx("div", {
        className: "space-y-1",
        children: s.hits.length > 0
          ? n.jsx("div", {
              className: "flex flex-wrap gap-1",
              children: s.hits.map((h, idx) => n.jsx("span", { key: idx, className: "text-[10px] px-2 py-0.5 rounded-md tracking-tight " + h.badgeClass, children: h.text }))
            })
          : n.jsx("div", { className: "text-[11px] text-rose-400/80 font-medium text-center py-0.5", children: "❌ ไม่เข้าเป้าในรอบนี้" })
      })
    : n.jsx("div", { className: "text-[10px] text-gray-500 text-center py-1", children: "รอยืนยันผลเมื่อออกรางวัล" });

  console.log('Passed correctly!');
} catch (e) {
  console.log('Failed:', e.message);
}
