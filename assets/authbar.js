/* authbar.js —— 顶部导航登录态组件（适配 mcnova 风格深/浅色主题）
 * 未登录：显示「登录」按钮 → confirm.html
 * 已登录：显示 QQ 头像 → 点击进入个人主页 profile.html
 */
(function () {
  'use strict';
  var LS_KEY = 'stl_web_session_v1';

  var css = [
    '.ab-avatar-btn{height:36px;min-width:36px;padding:0 3px;border:0;border-radius:9px;background:var(--card);',
    '  color:var(--primary);border:1px solid var(--border);cursor:pointer;display:inline-flex;align-items:center;gap:8px;',
    '  font:inherit;font-size:13px;font-weight:700;text-decoration:none;transition:.18s}',
    '.ab-avatar-btn:hover{border-color:var(--ring)}',
    '.ab-avatar-img{width:28px;height:28px;border-radius:8px;object-fit:cover;background:var(--muted);display:block}',
    '.ab-avatar-btn .ab-initial{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;',
    '  background:var(--primary);color:var(--primary-foreground);font-weight:800;font-size:13px}',
    '.ab-login-btn{padding:7px 16px;border:0;border-radius:9px;background:var(--primary);color:var(--primary-foreground);',
    '  font:inherit;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none;transition:.18s}',
    '.ab-login-btn:hover{opacity:.9}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

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
    if (!host) { host = el('div'); host.id = 'authbar-float'; host.style.cssText = 'position:fixed;top:12px;right:14px;z-index:9999'; document.body.appendChild(host); }
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

  window.__stlSession = function () { return session; };
  window.__stlSaveSession = function (s) { session = s; saveSession(s); renderBar(); };

  function init() { renderBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
