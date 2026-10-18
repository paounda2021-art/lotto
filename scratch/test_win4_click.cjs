global.window = { __KV_DRAWS__: {} };
let capturedHtml = '';
let textareaContent = '';
let filterBtns = [];
global.document = {
  body: { appendChild: (el) => {} },
  createElement: (tag) => {
    const el = {
      tagName: tag,
      style: {},
      querySelector: (sel) => {
        if (sel === '#chase-slip-textarea') return { value: textareaContent };
        return { onclick: null };
      },
      querySelectorAll: (sel) => {
        if (sel === '.filter-tab-btn') return filterBtns;
        if (sel === '.day-tab-btn') return [];
        return [];
      },
      set innerHTML(val) {
        capturedHtml = val;
        const match = val.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/);
        if (match) textareaContent = match[1];
        
        const regex = /class="filter-tab-btn[^"]*"\s+data-filter="([^"]+)"/g;
        let m;
        filterBtns = [];
        while ((m = regex.exec(val)) !== null) {
          const filterName = m[1];
          filterBtns.push({
            getAttribute: (k) => k === 'data-filter' ? filterName : null,
            onclick: null
          });
        }
      }
    };
    return el;
  },
  getElementById: (id) => null,
  querySelectorAll: (sel) => []
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.MutationObserver = class { observe() {} };

const fs = require('fs');
const code = fs.readFileSync('downloaded_target_worker/assets/export_modal.js', 'utf8');
eval(code);

window.openChaseSlipModal();

console.log('Filter buttons found:', filterBtns.map(b => b.getAttribute('data-filter')));

const win4Btn = filterBtns.find(b => b.getAttribute('data-filter') === 'WIN4');
console.log('Found WIN4 button:', !!win4Btn);
if (win4Btn && win4Btn.onclick) {
  win4Btn.onclick();
  console.log('\n=== TEXTAREA CONTENT AFTER CLICKING WIN4 ===');
  console.log(textareaContent);
}

process.exit(0);
