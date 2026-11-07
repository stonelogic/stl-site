/* authbar.js —— 导航右侧登录态组件（浅色主题）
 * 未登录：显示「登录」按钮 → confirm.html
 * 已登录：显示 QQ 头像 → 点击进入个人主页 profile.html；
 *         有登录请求时头像旁出现「⚡」快速授权入口。
 * 依赖：页面需引入本文件；ntfy topic 取 URL 参数 ?topic= 或默认值。
 */
(function () {
  'use strict';
  var TOPIC_DEFAULT = 'stl-ql-6bd1ae0f4e7e7968';
  var LS_KEY = 'stl_web_session_v1';
  var DAY = 86400000;

  /* ---------- 注入样式（浅色） ---------- */
  var css = [
    '#navActions .ab-avatar-btn,#authbar-float .ab-avatar-btn{height:38px;min-width:38px;padding:0 4px;border:0;border-radius:20px;',
    '  background:#fff;color:#1f7a3a;border:1px solid rgba(58,168,86,.28);cursor:pointer;display:inline-flex;align-items:center;gap:8px;',
    '  font:inherit;font-size:13px;font-weight:700;text-decoration:none;box-shadow:0 2px 8px rgba(28,80,52,.08)}',
    '#authbar-float{position:fixed;top:12px;right:14px;z-index:9999}',
    '.ab-avatar-img{width:30px;height:30px;border-radius:50%;object-fit:cover;background:#f3f8f4;display:block}',
    '.ab-avatar-btn .ab-initial{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;',
    '  background:linear-gradient(135deg,#57c46e,#2f9e54);color:#fff;font-weight:800;font-size:14px}',
    '.ab-login-btn{padding:8px 16px;border:0;border-radius:18px;background:linear-gradient(135deg,#57c46e,#2f9e54);color:#fff;',
    '  font:inherit;font-weight:800;font-size:13px;cursor:pointer;text-decoration:none;box-shadow:0 6px 16px rgba(47,158,84,.25)}',
    '.ab-quick-btn{height:34px;min-width:34px;padding:0 8px;border:1px solid rgba(58,168,86,.28);border-radius:17px;background:#fff;',
    '  color:#1f7a3a;cursor:pointer;font:inherit;font-size:15px;font-weight:800;position:relative;display:none}',
    '.ab-badge{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:#ff5d5d;color:#fff;',
    '  font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px}',
    '.ab-modal-mask{position:fixed;inset:0;z-index:10000;background:rgba(22,35,28,.35);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;padding:20px}',
    '.ab-modal-mask.open{display:flex}',
    '.ab-panel{width:min(92vw,440px);max-height:84vh;overflow:auto;background:#fff;border:1px solid #e3ede6;',
    '  border-radius:18px;padding:22px;box-shadow:0 24px 70px rgba(28,80,52,.18)}',
    '.ab-panel h3{margin:0 0 14px;font-size:17px;color:#16231c;display:flex;align-items:center;gap:10px}',
    '.ab-panel .ab-close{margin-left:auto;background:none;border:0;color:#5f7268;font-size:20px;cursor:pointer;line-height:1}',
    '.ab-req{border:1px solid #e3ede6;border-radius:12px;padding:12px;margin-bottom:10px;background:#f3f8f4}',
    '.ab-req.match{border-color:rgba(47,158,84,.45)}',
    '.ab-req .ab-req-top{display:flex;justify-content:space-between;align-items:center;gap:8px}',
    '.ab-req .ab-pname{font-size:15px;font-weight:800;color:#16231c}',
    '.ab-req .ab-state{font-size:12px;font-weight:700;padding:3px 9px;border-radius:8px}',
    '.ab-req .ab-state.ok{background:rgba(47,158,84,.14);color:#1f7a3a}',
    '.ab-req .ab-state.bad{background:rgba(210,72,60,.14);color:#b23b30}',
    '.ab-req .ab-reason{margin:8px 0 0;font-size:12.5px;color:#b23b30;line-height:1.6}',
    '.ab-req .ab-done{margin:8px 0 0;font-size:13px;color:#1f7a3a;font-weight:700}',
    '.ab-req button.ab-go{padding:8px 16px;border:0;border-radius:9px;background:linear-gradient(135deg,#57c46e,#2f9e54);color:#fff;font:inherit;font-weight:800;cursor:pointer}',
    '.ab-req button.ab-go:disabled{opacity:.5;cursor:not-allowed}',
    '.ab-empty{font-size:13px;color:#5f7268;text-align:center;padding:18px 0}',
    '.ab-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:10001;background:#fff;',
    '  border:1px solid #e3ede6;color:#16231c;font-size:13px;padding:11px 18px;border-radius:12px;box-shadow:0 12px 30px rgba(28,80,52,.15);opacity:0;transition:opacity .25s;pointer-events:none;max-width:90vw}',
    '.ab-toast.show{opacity:1}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- 工具 ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function param(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  function topic() { return param('topic') || TOPIC_DEFAULT; }
  function ntfyUrl() { return 'https://ntfy.sh/' + encodeURIComponent(topic()); }

  function loadSession() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (s && s.token && s.qq && s.exp && s.exp > Date.now()) return s;
    } catch (e) {}
    return null;
  }
  function saveSession(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {} }
  function clearSession() { try { localStorage.removeItem(LS_KEY); } catch (e) {} }

  function myRid() {
    var k = 'stl_ab_rid';
    var v = sessionStorage.getItem(k);
    if (!v) { v = Array.from(crypto.getRandomValues(new Uint8Array(12))).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); sessionStorage.setItem(k, v); }
    return v;
  }
  var RID = myRid();

  function avatarHtml(qq) {
    var url = 'https://q1.qlogo.cn/g?b=qq&nk=' + encodeURIComponent(qq) + '&s=100';
    return '<img class="ab-avatar-img" src="' + url + '" alt="头像" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
      '<span class="ab-initial" style="display:none">' + String(qq).slice(-2) + '</span>';
  }
  function toast(msg) {
    var t = $('abToast'); if (!t) { t = el('div', '', ''); t.id = 'abToast'; t.className = 'ab-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- 状态 ---------- */
  var session = loadSession();
  var pendingMap = {}; // player -> {player, reqId, match, reason, done}

  /* ---------- 渲染头像 / 登录入口 ---------- */
  function buildHost() {
    var host = $('navActions');
    if (!host) { host = el('div'); host.id = 'authbar-float'; document.body.appendChild(host); }
    return host;
  }

  function renderBar() {
    var host = buildHost();
    host.innerHTML = '';
    if (session) {
      var a = el('a', 'ab-avatar-btn');
      a.href = 'profile.html';
      a.title = '个人主页';
      a.innerHTML = avatarHtml(session.qq);
      host.appendChild(a);

      var qb = el('button', 'ab-quick-btn');
      qb.type = 'button'; qb.id = 'abQuickBtn'; qb.title = '快速授权';
      qb.innerHTML = '⚡<span class="ab-badge" id="abBadge" style="display:none">0</span>';
      qb.addEventListener('click', function () { openQuick(); });
      host.appendChild(qb);
      updateBadge();
    } else {
      var l = el('a', 'ab-login-btn'); l.href = 'confirm.html'; l.textContent = '登录';
      host.appendChild(l);
    }
  }

  function updateBadge() {
    var b = $('abBadge'); if (!b) return;
    var n = Object.keys(pendingMap).length;
    b.style.display = n ? 'flex' : 'none'; b.textContent = n;
    var qb = $('abQuickBtn'); if (qb) qb.style.display = n ? 'inline-flex' : 'none';
  }

  /* ---------- 快速授权面板 ---------- */
  function ensureModal() {
    var mask = $('abModal');
    if (mask) return mask;
    mask = el('div', 'ab-modal-mask'); mask.id = 'abModal';
    mask.addEventListener('click', function (e) { if (e.target === mask) mask.classList.remove('open'); });
    document.body.appendChild(mask);
    return mask;
  }
  function openQuick() {
    var mask = ensureModal();
    var panel = el('div', 'ab-panel');
    panel.innerHTML = '<h3>⚡ 快速授权 <button class="ab-close" type="button">✕</button></h3><div id="abQuickList"></div>';
    panel.querySelector('.ab-close').addEventListener('click', function () { mask.classList.remove('open'); });
    mask.innerHTML = ''; mask.appendChild(panel); mask.classList.add('open');
    renderQuickList();
  }
  function renderQuickList() {
    var list = $('abQuickList'); if (!list) return;
    var keys = Object.keys(pendingMap);
    if (!keys.length) { list.innerHTML = '<div class="ab-empty">暂无待授权的登录请求。<br>当你的游戏账号登录服务器时，这里会出现一键授权。</div>'; return; }
    list.innerHTML = '';
    keys.forEach(function (k) {
      var it = pendingMap[k];
      var box = el('div', 'ab-req' + (it.match ? ' match' : ''));
      var state = it.done ? '<span class="ab-state ok">已授权</span>'
        : it.match === true ? '<span class="ab-state ok">已匹配</span>'
        : it.match === false ? '<span class="ab-state bad">不匹配</span>'
        : '<span class="ab-state">检测中</span>';
      box.innerHTML = '<div class="ab-req-top"><span class="ab-pname">' + it.player + '</span>' + state + '</div>';
      if (it.match === false && it.reason) box.innerHTML += '<p class="ab-reason">' + it.reason + '</p>';
      if (it.done) box.innerHTML += '<div class="ab-done">✓ 已直接授权，请回游戏进入服务器</div>';
      if (it.match === true && !it.done) {
        var b = el('button', 'ab-go'); b.type = 'button'; b.textContent = '登录';
        b.addEventListener('click', function () { doQuickAuth(it, b); });
        box.appendChild(b);
      }
      list.appendChild(box);
    });
  }
  function doQuickAuth(it, btn) {
    if (!session) { toast('登录已过期，请重新登录'); return; }
    btn.disabled = true; btn.textContent = '授权中…';
    post({ type: 'authReqQuick', token: session.token, player: it.player, reqId: it.reqId, rid: RID });
  }

  /* ---------- ntfy 收发 ---------- */
  function post(obj) {
    try { fetch(ntfyUrl(), { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(obj) }).catch(function () {}); } catch (e) {}
  }
  function handleJoin(player, reqId) {
    if (!session) return;
    if (pendingMap[player]) { pendingMap[player].reqId = reqId; }
    else { pendingMap[player] = { player: player, reqId: reqId, match: null, reason: '', done: false }; }
    updateBadge();
    toast('检测到 ' + player + ' 登录请求，正在自动匹配…');
    post({ type: 'quickCheck', token: session.token, player: player, rid: RID });
  }
  function handleMatch(m) {
    var it = pendingMap[m.player]; if (!it) { it = pendingMap[m.player] = { player: m.player, reqId: m.reqId || '', match: null, reason: '', done: false }; }
    it.match = m.match; it.reason = m.reason || ''; it.reqId = m.reqId || it.reqId;
    updateBadge();
    if (m.match) toast('✓ ' + m.player + ' 已匹配，可点击 ⚡ 一键授权');
    else if (m.reason) toast('⚠ ' + m.reason);
    if ($('abModal') && $('abModal').classList.contains('open')) renderQuickList();
  }
  function startSubscribe() {
    try {
      var es = new EventSource(ntfyUrl() + '/sse');
      es.onmessage = function (ev) {
        var d; try { d = JSON.parse(ev.data); } catch (e) { return; }
        if (d.event !== 'message' || !d.message) return;
        var m; try { m = JSON.parse(d.message); } catch (e) { return; }
        if (m.rid && m.rid !== RID) return;
        if (m.type === 'joinReq') handleJoin(String(m.player), String(m.reqId || ''));
        else if (m.type === 'quickMatch') handleMatch(m);
        else if (m.type === 'authOk' && m.player && pendingMap[m.player]) { pendingMap[m.player].done = true; pendingMap[m.player].match = true; toast('✓ 已授权 ' + m.player); if ($('abModal') && $('abModal').classList.contains('open')) renderQuickList(); }
        else if (m.type === 'authFail' && m.reason) { toast('⚠ ' + m.reason); }
      };
    } catch (e) {}
  }

  /* ---------- 提供会话给 confirm.html / profile.html 复用 ---------- */
  window.__stlSession = function () { return session; };
  window.__stlSaveSession = function (s) { session = s; saveSession(s); renderBar(); };

  /* ---------- 初始化 ---------- */
  function init() { renderBar(); startSubscribe(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
