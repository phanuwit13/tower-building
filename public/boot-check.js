/* Classic (non-module) script: runs even when the app bundle fails to parse on an old browser.
   Once the page has fully loaded (the app bundle has downloaded and run, or failed), wait a short
   grace period; if main.ts still has not set the booted flag, show the same Thai message as
   T.noWebGL. A slow download therefore never triggers it, and main.ts removes the overlay
   (id "boot-fallback") if it is ever showing when the app does boot. */
(function () {
  var GRACE_MS = 3000;
  function check() {
    if (window.__cityBooted || document.getElementById('boot-fallback')) return;
    var p = document.createElement('p');
    p.id = 'boot-fallback';
    p.className = 'no-webgl';
    p.setAttribute('role', 'alert');
    p.style.cssText = 'position:fixed;inset:0;margin:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:#e8f6ff;color:#2b2d42;font:20px sans-serif;box-sizing:border-box;z-index:100';
    p.textContent = 'เครื่องนี้เปิดเกม 3 มิติไม่ได้ ลองกดโหลดหน้าใหม่ หรือเปิดด้วย Chrome หรือ Safari รุ่นใหม่';
    document.body.appendChild(p);
  }
  function arm() { setTimeout(check, GRACE_MS); }
  if (document.readyState === 'complete') arm();
  else window.addEventListener('load', arm);
})();
