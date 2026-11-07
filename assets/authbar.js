/* authbar.js —— 导航右侧登录态组件（浅色主题）
 * 未登录：显示「登录」按钮 → confirm.html
 * 已登录：显示 QQ 头像 → 点击进入个人主页 profile.html
 */
(function () {
  'use strict';
  var LS_KEY = 'stl_web_session_v1';

  /* ---------- 注入样式（浅色） ---------- */
  var css = [
    '#navActions .ab-avatar-btn,#authbar-float .ab-avatar-btn{height:38px;min-width:38px;padding:0 4px;border:0;border-radius:20px;',
    '  background:rgba(255,255,255,.7);color:#1f7a3a;border:1px solid rgba(255,255,255,.85);cursor:pointer;display:inline-flex;align-items:center;gap:8px;',
    '  font:inherit;font-size:13px;font-weight:700;text-decoration:none;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    '  box-shadow:0 2px 8px rgba(28,80,52,.1)}',
    '#authbar-float{position:fixed;top:12px;right:14px;z-index:9999}',
    '.ab-avatar-img{width:30px;height:30px;border-radius:50%;object-fit:cover;background:#f3f8f4;display:block}',
    '.ab-avatar-btn .ab-initial{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;',
    '  background:linear-gradient(135deg,#57c46e,#2f9e54);color:#fff;font-weight:800;font-size:14px}',
    '.ab-login-btn{padding:8px 16px;border:0;border-radius:18px;background:linear-gradient(135deg,#57c46e,#2f9e54);color:#fff;',
    '  font:inherit;font-weight:800;font-size:13px;cursor:pointer;text-decoration:none;box-shadow:0 6px 16px rgba(47,158,84,.25)}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- 工具 ---------- */
  function $id(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function loadSession() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (s && s.token && s.qq && s.exp && s.exp > Date.now()) return s;
    } catch (e) {}
    return null;
  }
  function saveSession(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {} }

  var session = loadSession();

  function avatarHtml(qq) {
    var url = 'https://q1.qlogo.cn/g?b=qq&nk=' + encodeURIComponent(qq) + '&s=100';
    return '<img class="ab-avatar-img" src="' + url + '" alt="头像" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">' +
      '<span class="ab-initial" style="display:none">' + String(qq).slice(-2) + '</span>';
  }

  function buildHost() {
    var host = $id('navActions');
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
    } else {
      var l = el('a', 'ab-login-btn'); l.href = 'confirm.html'; l.textContent = '登录';
      host.appendChild(l);
    }
  }

  /* ---------- 供其他页面复用（当前 confirm/profile 自行读取 localStorage，此导出保留兼容） ---------- */
  window.__stlSession = function () { return session; };
  window.__stlSaveSession = function (s) { session = s; saveSession(s); renderBar(); };

  function init() { renderBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
