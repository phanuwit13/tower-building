/* Classic (non-module) script: runs even when the app bundle fails to parse on an old browser.
   If main.ts has not set the booted flag after 4 s, show the same Thai message as T.noWebGL. */
(function () {
  setTimeout(function () {
    if (window.__cityBooted) return;
    var p = document.createElement('p');
    p.className = 'no-webgl';
    p.setAttribute('role', 'alert');
    p.style.cssText = 'position:fixed;inset:0;margin:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:#e8f6ff;color:#2b2d42;font:20px sans-serif;box-sizing:border-box;z-index:100';
    p.textContent = 'เครื่องนี้เปิดเกม 3 มิติไม่ได้ ลองเปิดด้วย Chrome หรือ Safari รุ่นใหม่';
    document.body.appendChild(p);
  }, 4000);
})();
