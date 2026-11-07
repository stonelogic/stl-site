/* ===========================================================
   Stone Logic 官网 · 页面逻辑（纯静态 SPA，GitHub Pages 极限）
   hash 路由 + 深浅色主题 + 外部公开 API（mclists / minotar / ntfy）
   =========================================================== */
(function () {
  'use strict';

  /* ---------- 服务器地址（用于状态查询） ---------- */
  var STATUS_API = 'https://www.mclists.cn/api/server-status/?host={host}&port={port}';
  var JAVA_HOST = 'frp-top.com';
  var JAVA_PORT = '44558';

  /* ---------- 站点配置（纯静态文案） ---------- */
  var SITE = {
    name: 'Stone Logic',
    tagline: '生存 | 小游戏 | 与朋友一起探索无限可能',
    slogan: '生存 or 小游戏 你想要的，都在STL！',
    javaIp: JAVA_HOST + ':' + JAVA_PORT,
    groupUrl: 'https://qm.qq.com/q/UhSK4yuLGG',
    ownerQq: '1477211972',
    features: [
      { icon: '⚔️', title: '起床战争', desc: '独立 BedWars 竞技场，自动排队开局，输赢都不影响生存进度。' },
      { icon: '🫥', title: '方块躲猫猫', desc: 'BlockHideAndSeek：伪装成方块藏好，别被猎人抓到。' },
      { icon: '🏹', title: 'PVP 竞技场', desc: '多个 PVP 世界加决斗系统，约架公平对战，不爆装备。' },
      { icon: '🏡', title: '地皮与建筑', desc: 'PlotSquared 地皮，配 WorldEdit 和建筑权杖，随便造。' },
      { icon: '👥', title: '公会系统', desc: 'PlayerGuild 公会、好友、TPA、地标传送，和朋友一起发展。' },
      { icon: '💰', title: '自由经济', desc: 'QuickShop 摆摊、市场交易、点券、抽奖红包，经济全靠自己经营。' },
      { icon: '⭐', title: '技能与职业', desc: 'mcMMO 技能、Jobs 职业、每日任务和签到，边玩边成长。' },
      { icon: '🎁', title: '节日活动', desc: 'AeternumSeasons 四季轮转 + 节日活动，登录礼包拿到手软。' }
    ],
    worlds: [
      { name: 'world', tag: '主世界', desc: '不删档，长期保存你的建筑与家园' },
      { name: 'world_nether', tag: '地狱', desc: '资源采集与快速交通' },
      { name: 'world_the_end', tag: '末地', desc: '主末地，通过传送门进入，不重置' },
      { name: 'resource', tag: '资源世界', desc: '定期轮换重置，持续获取资源' },
      { name: 'plot', tag: '地皮', desc: 'PlotSquared 地皮世界，安心造家' },
      { name: 'bedwars', tag: '起床战争', desc: '独立小游戏竞技场' }
    ],
    rules: [
      '禁止使用外挂、作弊客户端（矿透、自动挖矿、加速等），一经查实永久封禁。',
      '禁止恶意破坏他人建筑、偷窃物品；发现可联系管理员回滚并封禁对方。',
      '禁止在聊天中发布广告、辱骂、刷屏或传播不良信息。',
      '地皮与领地内请互相尊重，长期不在线的建筑可能被回收。',
      '尊重管理员与其他玩家，有问题先在群内反馈，服从管理最终裁定。'
    ],
    guide: [
      { t: '注册与登录', c: '首次进服输入 /register 设置密码（需先在 QQ 群绑定账号），之后每次进服 /login 登录。' },
      { t: '领取新手礼包', c: '进服会收到一本《服务器游玩指南》，在聊天框输入「同意」即可领取全套铁装备、32 个牛排和 500 货币。' },
      { t: '传送与地皮', c: '主城 spawn 有传送菜单与地标传送（/warp），也可输入 /warp plot 去地皮世界圈地造家。' },
      { t: '语音聊天', c: '想语音请安装 Simple Voice Chat 客户端模组；服务器已配置 ForcePack，进服自动加载材质包。' },
      { t: '小游戏', c: '起床战争、方块躲猫猫、PVP 等小游戏在世界 lobby 的菜单里进入，不影响生存进度。' }
    ],
    feat4: [
      { icon: 'surv', title: '生存 + 小游戏', desc: '双模式同服，自由切换，体验丰富玩法', tint: 'blue' },
      { icon: 'game', title: '两种模式', desc: '纯净生存 + 多种小游戏，总有适合你的', tint: 'pink' },
      { icon: 'shield', title: '正版 / 离线均可', desc: '两种验证模式都支持，欢迎所有玩家', tint: 'blue' },
      { icon: 'wifi', title: '跨版本互通', desc: '1.21.X 版本均可进入，无需担心版本问题', tint: 'pink' }
    ],
    staff: [
      { name: 'sjwj12517', roles: [{ t: '服主', c: 'gold' }] },
      { name: 'xiaoran8083', roles: [{ t: '管理', c: 'red' }] },
      { name: 'feng_56', roles: [{ t: '工程师', c: 'blue' }] }
    ]
  };

  /* ---------- 工具 ---------- */
  function $id(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function toast(msg) {
    var t = $id('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function fmtDur(sec) {
    sec = Number(sec) || 0;
    if (sec < 60) return sec + ' 秒';
    if (sec < 3600) return Math.floor(sec / 60) + ' 分钟';
    if (sec < 86400) return Math.floor(sec / 3600) + ' 小时 ' + Math.floor((sec % 3600) / 60) + ' 分';
    return Math.floor(sec / 86400) + ' 天 ' + Math.floor((sec % 86400) / 3600) + ' 小时';
  }

  /* ---------- 内联线描图标（24x24，随 currentColor） ---------- */
  var SVG = {
    penguin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8c-3.1 0-5.2 2.3-5.2 5.6v5.4c0 3.4 2.1 5.8 5.2 5.8s5.2-2.4 5.2-5.8V8.4c0-3.3-2.1-5.6-5.2-5.6Z"/><path d="M9.6 9.2h.01M14.4 9.2h.01"/><path d="M10.4 11.2h3.2L12 13l-1.6-1.8Z"/><path d="M6.9 12.2c-1.2.5-1.9 1.4-1.9 2.5 0 1 .8 1.7 1.9 1.7M17.1 12.2c1.2.5 1.9 1.4 1.9 2.5 0 1-.8 1.7-1.9 1.7"/><path d="M9.4 20.4l.5-2M14.6 20.4l-.5-2"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.2"/><path d="M5 15V5.2A2.2 2.2 0 0 1 7.2 3H15"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-3 8.2-7 9.4C8 19.2 5 15.4 5 11V6l7-3Z"/><path d="m9 11.6 2 2 4-4"/></svg>',
    surv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13.6 4.4c2.2-1.4 5.2-.6 6.4 1.6.3.6-.4 1.2-1 .9l-1.9-.9-1.6 1.6.9 1.9c.3.6-.3 1.3-.9 1-2.2-1.2-3-4.2-1.6-6.1Z"/><path d="M11.7 8.1 4.6 15.2a1.6 1.6 0 0 0 0 2.3l1.9 1.9a1.6 1.6 0 0 0 2.3 0l7.1-7.1"/></svg>',
    game: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="10" rx="5"/><path d="M7 10.2v3M5.5 11.7h3M15.6 11h.01M18 13h.01"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8.6a15 15 0 0 1 19 0M5.6 12a10.4 10.4 0 0 1 12.8 0M8.7 15.4a5.8 5.8 0 0 1 6.6 0"/><path d="M12 19h.01"/></svg>'
  };

  /* 按 ID 生成像素 identicon 头像（data URI，永不空白；可通过 avatar 字段覆盖） */
  function identicon(name) {
    name = String(name || '?');
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    var hue = h % 360;
    var bg = 'hsl(' + hue + ',42%,92%)';
    var fg = 'hsl(' + hue + ',58%,48%)';
    var seed = (h | 0) || 1, cells = 5, size = 10, pad = 3;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect width="56" height="56" rx="12" fill="' + bg + '"/>';
    for (var y = 0; y < cells; y++) {
      for (var x = 0; x < 3; x++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        if ((seed >> 9) & 1) {
          var p = pad + x * size, q = pad + y * size;
          s += '<rect x="' + p + '" y="' + q + '" width="' + size + '" height="' + size + '" fill="' + fg + '"/>';
          var mx = pad + (4 - x) * size;
          if (mx !== p) s += '<rect x="' + mx + '" y="' + q + '" width="' + size + '" height="' + size + '" fill="' + fg + '"/>';
        }
      }
    }
    s += '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }

  /* ---------- 头像 ----------
     优先级：config 里显式写 avatar → 本地皮肤库导出图（assets/avatars/，由
     tools/export_avatars.py 从 SkinsRestorer 裁正脸生成）→ minotar → identicon。
     离线服玩家没有正版皮肤，minotar 只会给史蒂夫，所以本地这张才是真实皮肤。 */
  var AVATARS = {};

  function avatarLocal(name) {
    var k = String(name == null ? '' : name).trim();
    if (!k) return '';
    var hit = AVATARS[k.toLowerCase()];
    return hit ? 'assets/avatars/' + encodeURIComponent(hit) + '.png' : '';
  }

  function avatarUrl(name, size) {
    return avatarLocal(name) ||
      ('https://minotar.net/helm/' + encodeURIComponent(name) + '/' + (size || 128) + '.png');
  }

  /* 加载本地头像清单；失败也无所谓，退回 minotar */
  function loadAvatars(done) {
    fetch('assets/avatars/index.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var list = d && (d.names || d);
        if (Array.isArray(list)) {
          var m = {};
          list.forEach(function (n) { if (n) m[String(n).toLowerCase()] = String(n); });
          AVATARS = m;
        }
      })
      .catch(function () {})
      .then(function () { done(); });
  }

  /* ---------- 主题 ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('stl_theme', t); } catch (e) {}
    var moon = $id('themeIconMoon'), sun = $id('themeIconSun');
    if (moon) moon.style.display = t === 'dark' ? 'none' : '';
    if (sun) sun.style.display = t === 'dark' ? '' : 'none';
  }
  function initTheme() {
    var saved = null; try { saved = localStorage.getItem('stl_theme'); } catch (e) {}
    if (!saved) saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(saved);
    var btn = $id('themeToggle');
    if (btn) btn.addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- 导航 ---------- */
  var NAV = [
    { label: '状态', href: '#/status' },
    { label: '在线', href: '#/online' },
    { label: '排行榜', href: '#/rank' },
    { label: '指南', href: '#/guide' },
    { label: '规则', href: '#/rules' },
    { label: '申诉', href: '#/appeal' }
  ];
  function renderNav(activePath) {
    var nav = $id('navMain');
    if (!nav) return;
    nav.innerHTML = NAV.map(function (n) {
      var path = n.href.replace('#', '') || '/';
      var isActive = activePath === path;
      return '<a href="' + n.href + '" class="' + (isActive ? 'active' : '') + '">' + n.label + '</a>';
    }).join('');
  }

  /* ---------- 通用页面外壳 ---------- */
  function pageHead(crumb, title, desc) {
    return '<div class="page-head">' +
      (crumb ? '<div class="crumb">' + crumb + '</div>' : '') +
      '<h1>' + esc(title) + '</h1>' +
      (desc ? '<p>' + esc(desc) + '</p>' : '') +
      '</div>';
  }
  function emptyState(ico, text) {
    return '<div class="empty"><div class="ico">' + ico + '</div><p>' + esc(text) + '</p></div>';
  }

  /* ================= 各页面 ================= */

  /* --- 首页（介绍） --- */
  function renderHome(container) {
    container.innerHTML = '';
    // Hero（Minecraft 像素风大标题，天空渐变背景）
    var hero = el('div', 'hero');
    hero.innerHTML = '<div class="hero-sky">' +
      '<span class="flower f1">❀</span><span class="flower f2">✿</span>' +
      '<span class="flower f3">❀</span><span class="flower f4">✿</span>' +
      '<h1 class="hero-title"><span>STONE</span><span>LOGIC</span></h1>' +
      '<p class="hero-slogan">' + esc(SITE.slogan) + '</p>' +
      '<div class="hero-meta">' +
      '<a class="hero-qq" href="' + SITE.groupUrl + '" target="_blank" rel="noopener" title="加入 QQ 群" aria-label="加入 QQ 群">' + SVG.penguin + '</a>' +
      '<span class="hero-addr"><span class="hero-ip">' + esc(SITE.javaIp) + '</span>' +
      '<button class="hero-copy" id="heroCopy" type="button" title="复制服务器地址" aria-label="复制服务器地址">' + SVG.copy + '</button></span>' +
      '</div>' +
      '<a class="hero-online" id="heroOnline" href="#/online">查看在线玩家 <span class="ho-arrow">→</span></a>' +
      '</div>' +
      '<button class="hero-scroll" id="heroScroll" type="button" aria-label="向下浏览玩法特色">' + SVG.chevron + '</button>' +
      '<div class="hero-glow"></div>';
    container.appendChild(hero);
    // 鼠标跟随光晕
    var glow = hero.querySelector('.hero-glow');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + 'px';
      glow.style.top = (e.clientY - r.top) + 'px';
      glow.style.opacity = '1';
    });
    hero.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });

    // 复制地址 / 向下滚动 / 在线人数
    var copyBtn = hero.querySelector('#heroCopy');
    if (copyBtn) copyBtn.addEventListener('click', function () { copyText(SITE.javaIp, copyBtn); });
    var scrollBtn = hero.querySelector('#heroScroll');
    if (scrollBtn) scrollBtn.addEventListener('click', function () {
      var f = $id('features'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    loadHeroOnline();

    // 玩法特色（4 张概览卡）
    var feat = el('section', 'home-section'); feat.id = 'features';
    feat.innerHTML = '<h2 class="section-title">玩法特色</h2><div class="feat4">' +
      SITE.feat4.map(function (f) {
        return '<div class="feat4-card"><span class="feat4-ico tint-' + f.tint + '">' + SVG[f.icon] + '</span>' +
          '<h3>' + esc(f.title) + '</h3><p>' + esc(f.desc) + '</p></div>';
      }).join('') + '</div>';
    container.appendChild(feat);

    // 服务器管理人员（ID 与头像可在 config 中自定义：name / avatar / roles）
    var stf = el('section', 'home-section'); stf.id = 'staff';
    stf.innerHTML = '<h2 class="section-title"><span class="sec-ico">' + SVG.shield + '</span>服务器管理人员</h2><div class="staff-grid">' +
      SITE.staff.map(function (m) {
        var fb = identicon(m.name);
        // 直接按名字试本地图（手放一张 assets/avatars/<ID>.png 也能生效），
        // 没有则退到 minotar，再没有就用 identicon。
        var av = m.avatar || ('assets/avatars/' + encodeURIComponent(m.name) + '.png');
        var alt = m.avatar ? '' : ('https://minotar.net/helm/' + encodeURIComponent(m.name) + '/128.png');
        var roles = (m.roles || []).map(function (r) { return '<span class="badge badge-' + (r.c || 'muted') + '">' + esc(r.t) + '</span>'; }).join('');
        return '<div class="staff-card"><img class="staff-av" src="' + av + '" style="background-image:url(\'' + fb + '\')"' +
          ' data-fb="' + fb + '"' + (alt ? ' data-alt="' + alt + '"' : '') + ' alt="' + esc(m.name) + '"' +
          ' onerror="if(this.getAttribute(\'data-alt\')){this.src=this.getAttribute(\'data-alt\');this.removeAttribute(\'data-alt\')}else{this.onerror=null;this.src=this.getAttribute(\'data-fb\')}">' +
          '<div class="staff-nm">' + esc(m.name) + '</div><div class="staff-roles">' + roles + '</div></div>';
      }).join('') + '</div>';
    container.appendChild(stf);
  }

  /* 首页在线人数：进入首页时拉取，显示「当前在线 X 名玩家」 */
  function loadHeroOnline() {
    clearInterval(window.__stlHeroTimer);
    function upd() {
      var url = STATUS_API.replace('{host}', JAVA_HOST).replace('{port}', JAVA_PORT);
      fetch(url).then(function (r) { return r.json(); }).then(function (d) {
        var data = (d && d.data) ? d.data : d;
        var ok = data && data.online === true;
        var p = (data && data.players) || {};
        var e = $id('heroOnline'); if (!e) return;
        if (ok) e.innerHTML = '当前在线 <strong>' + (p.now || 0) + '</strong> 名玩家 <span class="ho-arrow">→</span>';
        else e.innerHTML = '查看在线玩家 <span class="ho-arrow">→</span>';
      }).catch(function () {
        var e = $id('heroOnline'); if (e) e.innerHTML = '查看在线玩家 <span class="ho-arrow">→</span>';
      });
    }
    upd();
    window.__stlHeroTimer = setInterval(upd, 60000);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    } catch (e) {}
  }
  function copyText(text, btn) {
    function done() {
      toast('已复制服务器地址：' + text);
      if (btn) {
        var old = btn.innerHTML;
        btn.innerHTML = SVG.check; btn.classList.add('ok');
        setTimeout(function () { btn.innerHTML = old; btn.classList.remove('ok'); }, 1400);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }

  /* --- 状态页 --- */
  function renderStatus(container) {
    container.innerHTML = pageHead('首页', '服务器状态', '实时在线人数与延迟，每 60 秒自动刷新');
    var card = el('div', 'card');
    card.innerHTML = '<div class="status-hero">' +
      '<div><div class="online-count" id="stOnline">—</div><div style="font-size:13px;color:var(--muted-foreground);margin-top:4px">当前在线玩家</div></div>' +
      '<div><span class="status-pill" id="stPill">检测中…</span></div>' +
      '</div>' +
      '<div class="stat-row" id="stStats"></div>' +
      '<div class="motd" id="stMotd">正在获取服务器 MOTD…</div>' +
      '<div style="margin-top:20px"><div style="font-size:14px;font-weight:700;margin-bottom:12px">在线玩家</div><div class="player-grid" id="stPlayers"></div></div>';
    container.appendChild(card);
    loadStatus();
    // 60 秒自动刷新
    clearInterval(loadStatus._t);
    loadStatus._t = setInterval(loadStatus, 60000);
  }
  var ONLINE_TOPIC = 'stl-online-6bd1ae0f4e7e7968';
  function loadStatus() {
    var url = STATUS_API.replace('{host}', JAVA_HOST).replace('{port}', JAVA_PORT);
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var data = (d && d.data) ? d.data : d;
      var ok = data && data.online === true;
      var p = (data && data.players) || {};
      var now = p.now || 0;
      var max = p.max || 0;
      var pill = $id('stPill'), on = $id('stOnline');
      if (pill) { pill.textContent = ok ? '● 在线' : '● 离线'; pill.className = 'status-pill ' + (ok ? 'on' : 'off'); }
      if (on) on.textContent = ok ? now : '0';
      var stats = $id('stStats');
      if (stats) {
        var ping = (data.latency != null) ? data.latency : '—';
        var ver = data.version || data.name || '—';
        stats.innerHTML = '<div class="stat-box"><div class="k">在线/最大</div><div class="v">' + now + ' / ' + max + '</div></div>' +
          '<div class="stat-box"><div class="k">延迟</div><div class="v">' + (ping === '—' ? '—' : ping + 'ms') + '</div></div>' +
          '<div class="stat-box"><div class="k">版本</div><div class="v">' + esc(ver || '—') + '</div></div>' +
          '<div class="stat-box"><div class="k">地址</div><div class="v" style="font-size:14px">' + esc(SITE.javaIp) + '</div></div>';
      }
      var motd = $id('stMotd');
      if (motd) motd.textContent = data.description || (ok ? 'MOTD 未返回' : '服务器离线或不可达');
      var pg = $id('stPlayers');
      if (pg) loadOnlineInto(pg, ok, p.now);
    }).catch(function () {
      var pill = $id('stPill'); if (pill) { pill.textContent = '● 离线'; pill.className = 'status-pill off'; }
      var on = $id('stOnline'); if (on) on.textContent = '0';
      var motd = $id('stMotd'); if (motd) motd.textContent = '无法获取服务器状态（请检查网络）';
      var pg = $id('stPlayers'); if (pg) pg.innerHTML = emptyState('🕹️', '服务器离线或不可达');
    });
  }

  function renderEmpty(pg, ok, now) {
    if (now > 0) pg.innerHTML = emptyState('🕹️', '在线 ' + now + ' 人，名单同步中…');
    else if (ok) pg.innerHTML = emptyState('🕹️', '暂无在线玩家');
    else pg.innerHTML = emptyState('🕹️', '服务器离线');
  }

  /* 在线名单：读仓库里的 online.json（由 tools/export_online.py 通过 RCON 生成）
     online.json 拿不到时才退回旧的 ntfy 中转方案。 */
  function loadOnlineInto(pg, ok, now) {
    if (!pg) return;
    pg.innerHTML = '<div class="empty"><div class="ico">⏳</div><p>正在获取在线玩家…</p></div>';
    fetch('online.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('no file'); return r.json(); })
      .then(function (d) {
        if (!d || !Array.isArray(d.players)) throw new Error('bad json');
        var age = d.updated ? Math.max(0, Math.round(Date.now() / 1000 - d.updated)) : -1;
        renderPlayerGrid(pg, d.players, ok, age);
      })
      .catch(function () { loadOnlineFromNtfy(pg, ok, now); });
  }

  /* 旧通道：从 ntfy 主题读本地脚本发布的消息（保留作兜底） */
  function loadOnlineFromNtfy(pg, ok, now) {
    var got = false;
    var es;
    try {
      es = new EventSource('https://ntfy.sh/' + ONLINE_TOPIC + '/json?since=all');
    } catch (e) { renderEmpty(pg, ok, now); return; }
    es.onmessage = function (ev) {
      var msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.event !== 'message' || !msg.message) return;
      var m;
      try { m = JSON.parse(msg.message); } catch (e) { return; }
      if (m && Array.isArray(m.players) && m.players.length) {
        got = true;
        renderPlayerGrid(pg, m.players, ok, -1);
      }
    };
    es.onerror = function () { es.close(); if (!got) renderEmpty(pg, ok, now); };
    setTimeout(function () { es.close(); if (!got) renderEmpty(pg, ok, now); }, 2500);
  }

  function renderPlayerGrid(pg, players, ok, age) {
    if (!players || !players.length) {
      pg.innerHTML = emptyState('🕹️', ok ? '暂无在线玩家' : '服务器离线');
      return;
    }
    var html = players.map(function (name) {
      var face = avatarUrl(name, 96);
      return '<div class="player-cell"><img src="' + face + '" alt="" loading="lazy" data-fb="' + identicon(name) + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')"><span class="nm">' + esc(name) + '</span></div>';
    }).join('');
    // 名单由本地脚本定时同步，半小时没动过说明同步大概率停了，提示一下免得误导
    if (age > 1800) {
      var mins = Math.round(age / 60);
      html += '<div style="grid-column:1/-1;margin-top:6px;font-size:12.5px;color:var(--muted-foreground)">名单最后更新于 ' +
        (mins > 90 ? Math.round(mins / 60) + ' 小时前' : mins + ' 分钟前') + '，同步可能已停止</div>';
    }
    pg.innerHTML = html;
  }

  /* --- 在线状态页（在线玩家 ID + 头像） --- */
  function renderOnline(container) {
    container.innerHTML = pageHead('在线', '在线状态', '当前在线玩家列表，每 30 秒自动刷新');
    var card = el('div', 'card'); container.appendChild(card);
    card.innerHTML = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap">' +
      '<span class="status-pill" id="olPill">检测中…</span>' +
      '<span style="font-size:15px;font-weight:700" id="olCount">—</span>' +
      '</div>' +
      '<div class="player-grid" id="olPlayers"></div>';
    loadOnline();
    clearInterval(loadOnline._t);
    loadOnline._t = setInterval(loadOnline, 30000);
  }
  function loadOnline() {
    var url = STATUS_API.replace('{host}', JAVA_HOST).replace('{port}', JAVA_PORT);
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var data = (d && d.data) ? d.data : d;
      var ok = data && data.online === true;
      var p = (data && data.players) || {};
      var pill = $id('olPill'), cnt = $id('olCount');
      if (pill) { pill.textContent = ok ? '● 在线' : '● 离线'; pill.className = 'status-pill ' + (ok ? 'on' : 'off'); }
      if (cnt) cnt.textContent = '在线 ' + (p.now || 0) + ' / ' + (p.max || 0) + ' 人';
      loadOnlineInto($id('olPlayers'), ok, p.now);
    }).catch(function () {
      var pill = $id('olPill'); if (pill) { pill.textContent = '● 离线'; pill.className = 'status-pill off'; }
      var cnt = $id('olCount'); if (cnt) cnt.textContent = '在线 0 / 0 人';
      loadOnlineInto($id('olPlayers'), false);
    });
  }

  /* --- 指南页 --- */
  function renderGuide(container) {
    container.innerHTML = pageHead('指南', '新手指南', '快速上手，玩得明白');
    var box = el('div', 'card'); container.appendChild(box);
    box.innerHTML = SITE.guide.map(function (g, i) {
      return '<div style="margin-bottom:18px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span class="badge badge-green">' + (i + 1) + '</span><span style="font-weight:700;font-size:15px">' + esc(g.t) + '</span></div><div style="color:var(--muted-foreground);font-size:14px;line-height:1.8">' + esc(g.c) + '</div></div>';
    }).join('');
  }

  /* --- 规则页 --- */
  function renderRules(container) {
    container.innerHTML = pageHead('规则', '服务器规则', '进服前请先了解，遵守是对所有人的保护');
    var box = el('div', 'card'); container.appendChild(box);
    box.innerHTML = SITE.rules.map(function (r, i) {
      return '<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)"><span style="color:var(--primary);font-weight:800;font-family:monospace">' + String(i + 1).padStart(2, '0') + '</span><span style="font-size:14.5px;line-height:1.7">' + esc(r) + '</span></div>';
    }).join('');
  }

  /* --- 申诉页（ntfy 消息总线 → 腐竹私聊） --- */
  function renderAppeal(container) {
    container.innerHTML = pageHead('申诉', '封禁申诉', '认为被误封？填好信息，腐竹会通过临时会话联系你');
    var box = el('div', 'card'); container.appendChild(box);
    box.innerHTML = '<div class="row2">' +
      '<div class="field"><label>游戏 ID</label><input id="apPlayer" type="text" placeholder="你在服务器里的名字"></div>' +
      '<div class="field"><label>绑定 QQ</label><input id="apQq" type="text" inputmode="numeric" placeholder="申诉用的 QQ 号"></div></div>' +
      '<div class="field"><label>申诉说明</label><textarea id="apReason" placeholder="发生了什么、为什么认为应该解封"></textarea></div>' +
      '<div class="field"><label>联系方式（选填）</label><input id="apContact" type="text" placeholder="微信 / QQ / 邮箱"></div>' +
      '<div id="apMsg" style="font-size:13px;min-height:18px;margin-bottom:10px"></div>' +
      '<button class="btn btn-primary" id="apSubmit">提交申诉</button>';
    box.querySelector('#apSubmit').addEventListener('click', function () {
      var player = box.querySelector('#apPlayer').value.trim();
      var qq = box.querySelector('#apQq').value.replace(/\D/g, '');
      var reason = box.querySelector('#apReason').value.trim();
      var contact = box.querySelector('#apContact').value.trim();
      var msg = box.querySelector('#apMsg');
      if (!player || !qq || !reason) { msg.textContent = '请把游戏 ID、绑定 QQ 和申诉说明都填好。'; msg.style.color = 'var(--destructive)'; return; }
      if (qq.length < 5) { msg.textContent = 'QQ 号格式不对。'; msg.style.color = 'var(--destructive)'; return; }
      msg.textContent = '正在提交…'; msg.style.color = 'var(--muted-foreground)';
      var payload = { type: 'appeal', player: player, qq: qq, reason: reason, contact: contact, ts: Date.now() };
      fetch('https://ntfy.sh/stl-ql-6bd1ae0f4e7e7968', {
        method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(payload)
      }).then(function () {
        msg.textContent = '已提交，腐竹会通过临时会话联系你。'; msg.style.color = 'var(--primary)';
        box.querySelector('#apPlayer').value = ''; box.querySelector('#apQq').value = ''; box.querySelector('#apReason').value = ''; box.querySelector('#apContact').value = '';
      }).catch(function () {
        msg.textContent = '提交失败，请稍后重试，或直接在 QQ 群联系腐竹。'; msg.style.color = 'var(--destructive)';
      });
    });
  }

  /* ================= 路由 ================= */

  /* --- 排行榜（在线时长 + 起床战绩，两个子榜切换） --- */
  function renderRank(container) {
    container.innerHTML = pageHead('首页', '排行榜',
      '在线时长来自 cyutime，起床战绩来自小游戏服 BedWars；均由本地脚本定时导出，每数分钟更新（略滞后实时）');
    var box = el('div', 'card'); container.appendChild(box);
    box.innerHTML = '<div class="rank-tabs" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">' +
      '<button class="btn btn-sm rank-tab btn-primary" data-tab="play" type="button">🕒 在线时长</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="bw" type="button">⚔️ 起床战绩</button>' +
      '</div><div id="rankBody"></div>';
    var body = box.querySelector('#rankBody');

    function showPlay() {
      body.innerHTML = '<div id="rankMeta" style="font-size:13px;color:var(--muted-foreground);margin-bottom:14px">加载中…</div><div id="rankList"></div>';
      var list = body.querySelector('#rankList');
      list.innerHTML = '<div class="empty"><div class="ico">⏳</div><p>正在加载榜单…</p></div>';
      fetch('playtime.json?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !Array.isArray(d.players) || !d.players.length) {
            list.innerHTML = emptyState('🏆', '暂无任何在线时长记录');
            body.querySelector('#rankMeta').textContent = '';
            return;
          }
          var meta = body.querySelector('#rankMeta');
          var gt = d.generatedAt ? new Date(d.generatedAt * 1000) : null;
          meta.textContent = '共 ' + d.count + ' 名玩家 · 数据更新于 ' + (gt ? gt.toLocaleString('zh-CN') : '未知');
          var top = d.players[0].total || 1;
          var medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
          list.innerHTML = d.players.map(function (p) {
            var m = medals[p.rank] || ('#' + p.rank);
            var pct = Math.max(4, Math.round(p.total / top * 100));
            var sub = [];
            if (p.month) sub.push('本月 ' + fmtDur(p.month));
            if (p.week) sub.push('本周 ' + fmtDur(p.week));
            var subHtml = sub.length ? '<span style="color:var(--muted-foreground);font-weight:500">· ' + sub.join(' · ') + '</span>' : '';
            return '<div style="display:flex;align-items:center;gap:14px;padding:12px 4px;border-bottom:1px solid var(--border)">' +
              '<div style="width:34px;text-align:center;font-size:18px;font-weight:800;flex:none">' + m + '</div>' +
              '<img src="' + avatarUrl(p.name, 40) + '" alt="" loading="lazy" data-fb="' + identicon(p.name) + '" style="width:36px;height:36px;border-radius:8px;background:var(--muted);flex:none" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">' +
              '<div style="flex:1;min-width:0">' +
              '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-weight:700;font-size:15px">' + esc(p.name) + '</span>' + subHtml + '</div>' +
              '<div style="margin-top:6px;height:8px;border-radius:6px;background:var(--muted);overflow:hidden">' +
              '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary),oklch(78% .10 238));border-radius:6px"></div></div>' +
              '</div>' +
              '<div style="flex:none;text-align:right;font-weight:800;font-size:15px;color:var(--primary);white-space:nowrap">' + fmtDur(p.total) + '</div>' +
              '</div>';
          }).join('');
        })
        .catch(function () { list.innerHTML = emptyState('📡', '榜单加载失败，请稍后刷新'); });
    }

    function showBw() {
      body.innerHTML = '<div id="bwMeta" style="font-size:13px;color:var(--muted-foreground);margin-bottom:14px">加载中…</div>' +
        '<div style="overflow-x:auto"><table class="table" id="bwTable"><thead><tr><th>#</th><th>玩家</th><th>积分</th><th>胜 / 负</th><th>胜率</th><th>击杀</th><th>死亡</th><th>破床</th></tr></thead><tbody id="bwBody"></tbody></table></div>';
      var tbody = body.querySelector('#bwBody');
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted-foreground)">加载中…</td></tr>';
      fetch('bedwars.json?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !Array.isArray(d.players) || !d.players.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted-foreground)">暂无起床战争战绩记录</td></tr>';
            body.querySelector('#bwMeta').textContent = '';
            return;
          }
          var meta = body.querySelector('#bwMeta');
          var gt = d.generatedAt ? new Date(d.generatedAt * 1000) : null;
          meta.textContent = '共 ' + d.count + ' 名玩家 · 数据更新于 ' + (gt ? gt.toLocaleString('zh-CN') : '未知');
          var medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
          tbody.innerHTML = d.players.map(function (p) {
            var m = medals[p.rank] || p.rank;
            var kd = (typeof p.kd === 'number') ? (Number.isInteger(p.kd) ? p.kd : p.kd.toFixed(2)) : p.kd;
            return '<tr>' +
              '<td class="rank' + (p.rank === 1 ? ' top1' : '') + '">' + m + '</td>' +
              '<td><div style="display:flex;align-items:center;gap:8px"><img src="' + avatarUrl(p.name, 32) + '" alt="" loading="lazy" data-fb="' + identicon(p.name) + '" style="width:26px;height:26px;border-radius:6px;background:var(--muted)" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')"><span style="font-weight:700">' + esc(p.name) + '</span></div></td>' +
              '<td style="font-weight:800;color:var(--primary)">' + (p.score || 0) + '</td>' +
              '<td>' + (p.wins || 0) + ' / ' + (p.loses || 0) + '</td>' +
              '<td>' + (p.winRate || 0) + '%</td>' +
              '<td>' + (p.kills || 0) + ' <span style="color:var(--muted-foreground);font-size:12px">KD ' + kd + '</span></td>' +
              '<td>' + (p.deaths || 0) + '</td>' +
              '<td>' + (p.destroyedBeds || 0) + '</td>' +
              '</tr>';
          }).join('');
        })
        .catch(function () { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--destructive)">战绩加载失败，请稍后刷新</td></tr>'; });
    }

    box.querySelectorAll('.rank-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        box.querySelectorAll('.rank-tab').forEach(function (b) { b.classList.remove('btn-primary'); });
        btn.classList.add('btn-primary');
        if (btn.getAttribute('data-tab') === 'play') showPlay(); else showBw();
      });
    });
    showPlay();
  }

  var routes = {
    '/': renderHome,
    '/status': renderStatus,
    '/online': renderOnline,
    '/rank': renderRank,
    '/guide': renderGuide,
    '/rules': renderRules,
    '/appeal': renderAppeal
  };

  function resolve(hash) {
    var path = (hash || '#/').replace(/^#/, '');
    if (!path || path === '/') return { page: renderHome, param: '' };
    if (routes[path]) return { page: routes[path], param: '' };
    return { page: renderHome, param: '' };
  }

  function render() {
    clearInterval(window.__stlHeroTimer);
    var r = resolve(location.hash);
    var main = $id('main');
    if (!main) return;
    var path = (location.hash || '#/').replace(/^#/, '');
    if (!path) path = '/';
    renderNav(path);
    r.page(main, r.param);
    window.scrollTo(0, 0);
  }

  /* ---------- 配置加载（config.json 覆盖默认，localStorage 本机预览优先） ---------- */
  function applyConfig(cfg) {
    if (!cfg) return;
    if (cfg.name) SITE.name = cfg.name;
    if (cfg.tagline) SITE.tagline = cfg.tagline;
    if (cfg.slogan) SITE.slogan = cfg.slogan;
    if (cfg.javaHost) JAVA_HOST = cfg.javaHost;
    if (cfg.javaPort) JAVA_PORT = String(cfg.javaPort);
    SITE.javaIp = JAVA_HOST + ':' + JAVA_PORT;
    if (cfg.groupUrl) SITE.groupUrl = cfg.groupUrl;
    if (Array.isArray(cfg.features) && cfg.features.length) SITE.features = cfg.features;
    if (Array.isArray(cfg.feat4) && cfg.feat4.length) SITE.feat4 = cfg.feat4;
    if (Array.isArray(cfg.staff) && cfg.staff.length) SITE.staff = cfg.staff;
    if (Array.isArray(cfg.worlds) && cfg.worlds.length) SITE.worlds = cfg.worlds;
    if (Array.isArray(cfg.rules) && cfg.rules.length) SITE.rules = cfg.rules;
    if (Array.isArray(cfg.guide) && cfg.guide.length) SITE.guide = cfg.guide;
    // name / tagline 也要落到页面可见处（导航品牌名 + 文档标题 + 首页副标题）
    try {
      if (SITE.name) {
        if (document.title.indexOf(SITE.name) === -1) document.title = SITE.name + ' 服务器';
        var bn = document.querySelector('.brand-name');
        if (bn) bn.textContent = SITE.name;
      }
    } catch (e) {}
    syncFooter();
  }
  function loadConfig(done) {
    var local = null;
    try { local = JSON.parse(localStorage.getItem('stl_config') || 'null'); } catch (e) {}
    if (local) { applyConfig(local); done(); return; }
    fetch('assets/config.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) applyConfig(d); })
      .catch(function () {})
      .then(function () { done(); });
  }

  /* 暴露给编辑器（editor.js）使用 */
  window.__stlSite = SITE;
  window.__stlApplyConfig = applyConfig;
  window.__stlRender = render;

  function syncFooter() {
    var ip = $id('footerIp'); if (ip) ip.textContent = SITE.javaIp;
    var qq = $id('footerQq'); if (qq) qq.href = SITE.groupUrl;
    var nm = $id('footerName'); if (nm) nm.textContent = SITE.name + ' 服务器';
  }

  function init() {
    initTheme();
    syncFooter();
    $id('footerYear').textContent = new Date().getFullYear();
    window.addEventListener('hashchange', render);
    loadAvatars(function () { loadConfig(render); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
