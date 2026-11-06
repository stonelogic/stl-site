/* 自由布局编辑器：任意元素拖动排序 + 自动避让 + 保存到 GitHub 仓库
 * 密码：mcstl-sjwj（SHA-256）
 * 快捷键：Ctrl+Shift+E
 */
(function () {
  'use strict';

  var HASH = '8f4771942294a2d7bea850b27b57f7dfe7a66b6dfb91ffb100ba180a0c48af96';
  var REPO = 'stonelogic/stl-site';
  var PATH = 'assets/layout.json';
  var LS_LAYOUT = 'stl_layout_v1';
  var LS_PAT = 'stl_gh_pat';

  var editing = false, dragEl = null, ph = null, moving = false;

  /* ---------- 样式 ---------- */
  var css = ''
    + '.qe-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;display:flex;gap:8px;align-items:center;flex-wrap:wrap;'
    + 'background:rgba(20,28,42,.96);color:#eef3fa;padding:9px 12px;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.35);font-size:13px;font-family:inherit}'
    + '.qe-bar b{color:#7fb2ff;margin-right:4px}'
    + '.qe-bar button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#eef3fa;'
    + 'padding:6px 11px;border-radius:8px;cursor:pointer;font-size:12px;font-family:inherit}'
    + '.qe-bar button:hover{background:rgba(255,255,255,.18)}'
    + '.qe-bar button.primary{background:#1f6feb;border-color:#1f6feb;color:#fff;font-weight:600}'
    + '.qe-tip{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:99999;background:#1f6feb;color:#fff;'
    + 'padding:8px 16px;border-radius:999px;font-size:13px;opacity:0;transition:opacity .25s;pointer-events:none;max-width:90vw;text-align:center}'
    + '.qe-tip.show{opacity:1}'
    + 'body.qe-editing [data-qe-drag]{outline:1px dashed rgba(31,111,235,.55);outline-offset:3px;cursor:grab;transition:transform .18s ease}'
    + 'body.qe-editing [data-qe-drag]:hover{outline:2px solid #1f6feb;background:rgba(31,111,235,.06)}'
    + 'body.qe-editing [data-qe-drag].qe-dragging{opacity:.35;cursor:grabbing}'
    + '.qe-ph{border:2px dashed #1f6feb;background:rgba(31,111,235,.10);border-radius:10px;min-height:28px;margin:6px 0;'
    + 'box-shadow:0 0 0 4px rgba(31,111,235,.08);transition:all .18s ease}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 工具条 / 提示 ---------- */
  var bar = document.createElement('div');
  bar.className = 'qe-bar';
  bar.innerHTML = '<b>布局编辑</b>'
    + '<button data-act="repo" class="primary">保存到仓库</button>'
    + '<button data-act="local">仅本地预览</button>'
    + '<button data-act="export">导出 JSON</button>'
    + '<button data-act="pat">设置 PAT</button>'
    + '<button data-act="reset">恢复默认</button>'
    + '<button data-act="exit">退出</button>';
  bar.style.display = 'none';
  document.body.appendChild(bar);

  var tip = document.createElement('div');
  tip.className = 'qe-tip';
  document.body.appendChild(tip);
  var tipTimer = null;
  function toast(msg) {
    tip.textContent = msg; tip.classList.add('show');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(function () { tip.classList.remove('show'); }, 2600);
  }

  /* ---------- 元素签名 ---------- */
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, LINK: 1, META: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1, BR: 1, HR: 1, NOSCRIPT: 1, TEMPLATE: 1 };
  var SKIP_BOX = '.qe-bar,.qe-tip,.qe-ph,.ql-mask,.drawer,.drawer-mask,.lightbox,.toast,#toast,#editBar';

  function candidates() {
    return Array.prototype.filter.call(document.querySelectorAll('main *, header *, footer *'), function (el) {
      if (SKIP_TAGS[el.tagName]) return false;
      if (el.hidden || el.hasAttribute('hidden')) return false;
      if (el.closest(SKIP_BOX)) return false;
      if (el.id === 'statusCard' || el.classList.contains('status-card')) return true;
      return el.offsetParent !== null || el.tagName === 'MAIN' || el.tagName === 'HEADER';
    });
  }

  var sigCount = Object.create(null);
  function signature(el) {
    var cls = (el.getAttribute('class') || '').trim().replace(/\s+/g, '.');
    var txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 20);
    var base = el.tagName.toLowerCase() + '|' + cls + '|' + txt + '|' + el.id;
    var n = sigCount[base] || 0;
    sigCount[base] = n + 1;
    return base + '#' + n;
  }
  function findBySig(sig) {
    var all = document.querySelectorAll('[data-qe-sig]');
    for (var i = 0; i < all.length; i++) if (all[i].getAttribute('data-qe-sig') === sig) return all[i];
    return null;
  }

  function scan() {
    sigCount = Object.create(null);
    var list = candidates(), counts = Object.create(null);
    list.forEach(function (el) {
      if (el.hasAttribute('data-qe-sig')) return;
      el.setAttribute('data-qe-sig', signature(el));
    });
    // 给所有容器也打签名（便于记录 parentSig）
    list.forEach(function (el) {
      var p = el.parentElement;
      if (p && !p.hasAttribute('data-qe-sig') && p !== document.body) p.setAttribute('data-qe-sig', signature(p));
    });
    // 同一父下 >=2 个可排列子元素 -> 子元素可拖
    list.forEach(function (el) {
      var p = el.parentElement;
      if (!p || p === document.body) return;
      counts[p.getAttribute('data-qe-sig') || 'x'] = 1;
    });
    list.forEach(function (el) {
      var p = el.parentElement;
      if (!p || p === document.body) return;
      var sibs = Array.prototype.filter.call(p.children, function (c) { return c.hasAttribute('data-qe-sig'); });
      if (sibs.length >= 2) el.setAttribute('data-qe-drag', '1');
    });
  }

  /* ---------- 布局读写 ---------- */
  function currentLayout() {
    var items = [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-qe-drag]'), function (el) {
      var p = el.parentElement;
      var sibs = Array.prototype.filter.call(p.children, function (c) { return c.hasAttribute('data-qe-drag'); });
      items.push({ sig: el.getAttribute('data-qe-sig'), parent: p.getAttribute('data-qe-sig'), idx: sibs.indexOf(el) });
    });
    return { v: 1, items: items };
  }

  var targetOrder = null;

  function rememberTop() {
    var top = document.getElementById('top');
    if (!top) return;
    targetOrder = Array.prototype.filter.call(top.children, function (c) {
      return c.tagName === 'SECTION' && c.hasAttribute('data-qe-sig');
    }).map(function (c) { return c.getAttribute('data-qe-sig'); });
  }

  /* app.js 自带区块排序，可能覆盖我们的顺序；持续纠正 */
  function enforceTop() {
    if (!targetOrder || moving) return;
    var top = document.getElementById('top');
    if (!top) return;
    var now = Array.prototype.filter.call(top.children, function (c) { return c.tagName === 'SECTION'; });
    var wanted = targetOrder.map(findBySig).filter(Boolean);
    if (now.length !== wanted.length || now.some(function (s, i) { return s !== wanted[i]; })) {
      moving = true;
      wanted.forEach(function (s) { top.appendChild(s); });
      moving = false;
    }
  }

  function applyLayout(data) {
    if (!data || !Array.isArray(data.items)) return;
    var groups = Object.create(null);
    data.items.forEach(function (it) {
      var key = it.parent || '_';
      (groups[key] = groups[key] || []).push(it);
    });
    Object.keys(groups).forEach(function (key) {
      var arr = groups[key].sort(function (a, b) { return (a.idx || 0) - (b.idx || 0); });
      arr.forEach(function (it) {
        var el = findBySig(it.sig);
        if (el && el.parentElement) el.parentElement.appendChild(el);
      });
    });
    rememberTop();
  }

  function saveLocal(data) {
    try { localStorage.setItem(LS_LAYOUT, JSON.stringify(data)); } catch (e) {}
  }

  function b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function getPat(force) {
    var p = localStorage.getItem(LS_PAT);
    if (p && !force) return p;
    p = window.prompt('GitHub PAT（仅需 stl-site 仓库 Contents 读写权限，只存本机浏览器）', p || '');
    if (!p) return null;
    localStorage.setItem(LS_PAT, p.trim());
    return p.trim();
  }

  async function saveToRepo(data) {
    var pat = getPat(false);
    if (!pat) { toast('已取消'); return; }
    var api = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
    var headers = { 'Authorization': 'Bearer ' + pat, 'Accept': 'application/vnd.github+json' };
    try {
      toast('读取仓库文件…');
      var cur = await fetch(api, { headers: headers, cache: 'no-store' });
      var sha = null;
      if (cur.ok) { var j = await cur.json(); sha = j.sha; }
      else if (cur.status !== 404) throw new Error('读取失败 HTTP ' + cur.status);
      var body = { message: '更新页面布局', content: b64(JSON.stringify(data, null, 2)), branch: 'main' };
      if (sha) body.sha = sha;
      toast('提交中…');
      var r = await fetch(api, {
        method: 'PUT',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 120));
      toast('已保存到仓库，Pages 约 1 分钟后生效');
    } catch (e) {
      toast('保存失败：' + e.message);
    }
  }

  function exportJSON(data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'layout.json';
    a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('已导出');
  }

  /* ---------- 拖拽 + 自动避让 ---------- */
  function flip(parent, fn) {
    var others = Array.prototype.filter.call(parent.children, function (c) {
      return c !== dragEl && c.hasAttribute('data-qe-drag');
    });
    var first = others.map(function (c) { return [c, c.getBoundingClientRect()]; });
    fn();
    first.forEach(function (pair) {
      var c = pair[0], f = pair[1], n = c.getBoundingClientRect();
      var dx = f.left - n.left, dy = f.top - n.top;
      if (!dx && !dy) return;
      c.style.transition = 'none';
      c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      requestAnimationFrame(function () {
        c.style.transition = 'transform .18s ease';
        c.style.transform = '';
      });
    });
  }

  function onDragStart(e) {
    var el = e.target.closest ? e.target.closest('[data-qe-drag]') : null;
    if (!el) return;
    dragEl = el;
    el.classList.add('qe-dragging');
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', '1'); } catch (err) {}
    ph = document.createElement('div');
    ph.className = 'qe-ph';
    ph.style.minHeight = Math.min(el.getBoundingClientRect().height, 140) + 'px';
  }

  function onDragOver(e) {
    if (!dragEl || !ph) return;
    var t = e.target.closest ? e.target.closest('[data-qe-drag]') : null;
    if (!t || t === dragEl || t.parentElement !== dragEl.parentElement) return;
    e.preventDefault();
    var box = t.getBoundingClientRect();
    var after = (e.clientY - box.top) > box.height / 2;
    var parent = dragEl.parentElement;
    var target = after ? t.nextSibling : t;
    if (ph.parentElement === parent && ph.nextSibling === target) return;
    flip(parent, function () { parent.insertBefore(ph, target); });
  }

  function onDrop(e) {
    if (!dragEl || !ph) return;
    e.preventDefault();
    if (ph.parentElement) {
      var parent = ph.parentElement;
      flip(parent, function () { parent.insertBefore(dragEl, ph); });
    }
    finishDrag();
  }

  function finishDrag() {
    if (dragEl) dragEl.classList.remove('qe-dragging');
    if (ph && ph.parentElement) ph.parentElement.removeChild(ph);
    dragEl = null; ph = null;
    rememberTop();
    var data = currentLayout();
    saveLocal(data);
    toast('布局已更新（记得点「保存到仓库」）');
  }

  /* ---------- 编辑模式 ---------- */
  async function sha256(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  function enableDrag(on) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-qe-drag]'), function (el) {
      if (on) { el.setAttribute('draggable', 'true'); }
      else { el.removeAttribute('draggable'); el.classList.remove('qe-dragging'); }
    });
  }

  async function enter() {
    var pw = window.prompt('请输入编辑密码：');
    if (pw === null) return;
    var ok = false;
    try { ok = (await sha256(pw)) === HASH; } catch (e) {}
    if (!ok) { toast('密码错误'); return; }
    editing = true;
    document.body.classList.add('qe-editing');
    enableDrag(true);
    bar.style.display = 'flex';
    toast('编辑模式：拖动任意元素，其他元素自动避让');
  }

  function exit() {
    editing = false;
    document.body.classList.remove('qe-editing');
    enableDrag(false);
    bar.style.display = 'none';
    toast('已退出编辑');
  }

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var act = b.getAttribute('data-act'), data = currentLayout();
    if (act === 'repo') saveToRepo(data);
    else if (act === 'local') { saveLocal(data); toast('已保存到本机预览'); }
    else if (act === 'export') exportJSON(data);
    else if (act === 'pat') { getPat(true); toast('PAT 已更新'); }
    else if (act === 'reset') {
      localStorage.removeItem(LS_LAYOUT);
      toast('本地布局已清除，刷新后恢复仓库布局');
    } else if (act === 'exit') exit();
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      editing ? exit() : enter();
    }
  }, true);

  document.addEventListener('dragstart', onDragStart, true);
  document.addEventListener('dragover', onDragOver, true);
  document.addEventListener('drop', onDrop, true);
  document.addEventListener('dragend', function () { if (dragEl) finishDrag(); }, true);

  /* ---------- 启动：加载布局 ---------- */
  function boot() {
    // 移除旧版区块编辑器入口，避免两套编辑模式冲突
    var old = document.getElementById('editLayoutBtn');
    if (old) old.remove();
    scan();
    var topEl = document.getElementById('top');
    if (topEl) new MutationObserver(function () { setTimeout(enforceTop, 0); }).observe(topEl, { childList: true });
    var local = null;
    try { local = JSON.parse(localStorage.getItem(LS_LAYOUT) || 'null'); } catch (e) {}
    if (local) applyLayout(local);
    fetch(PATH + '?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && !local) { applyLayout(d); saveLocal(d); } })
      .catch(function () {})
      .then(function () { rememberTop(); enforceTop(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 500); });
  else setTimeout(boot, 500);
})();
