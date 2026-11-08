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

  /* ---------- 消息总线 / 反馈去向 ---------- */
  var NTFY_BASE = 'https://ntfy.sh';
  var NTFY_TOPIC = 'stl-ql-6bd1ae0f4e7e7968';
  var REPO_URL = 'https://github.com/stonelogic/stl-site';

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
      { icon: 'surv', title: '生存 + 小游戏', desc: '双服务器自由切换，玩法丰富', tint: 'blue' },
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

  /* ===========================================================
     实时服务器状态（地址旁的绿点 / 红点）
     -----------------------------------------------------------
     数据源只用 mclists：它从国内节点真的能连上 frp 隧道做 SLP 探测。
     mcstatus.io / mcsrvstat.us 的探测机在国外，连不进隧道，一律返回 offline，
     拿它们判断会永远显示「离线」，所以不用。
     在线/离线与人数都取它的实时结果；玩家名单仍取仓库里的 online.json
     （名单必须靠 RCON 导出，天生慢 1~2 分钟）。
     连续失败不立刻判离线——先按指数退避重试，避免把网络抖动误报成服务器挂了。
     =========================================================== */
  var TICK = 5000;    // 状态刷新间隔（5 秒）
  var LIVE = {
    known: false,     // 是否拿到过可信结果（false = 显示"检测中/状态未知"）
    ok: false,        // 服务器是否在线
    now: 0,           // 当前在线人数
    max: 0,           // 人数上限（取自 online.json，接口给的是脏值）
    ping: null,
    ver: '',
    motd: '',
    fail: 0,          // 连续失败次数
    off: 0,           // 连续"离线"采样次数（≥2 才判定离线）
    at: 0,            // 最近一次成功时间
    busy: false,      // 有没有正在飞的请求（避免重复打接口）
    timer: null,
    onUpdate: null    // 当前页面注册的额外刷新函数
  };

  function liveUrl() {
    return STATUS_API.replace('{host}', JAVA_HOST).replace('{port}', JAVA_PORT);
  }

  function setBadge(node, state, text) {
    if (!node) return;
    node.classList.remove('is-on', 'is-off');
    if (state === 'on') node.classList.add('is-on');
    else if (state === 'off') node.classList.add('is-off');
    var t = node.querySelector('.live-txt');
    if (t) t.textContent = text;
    node.setAttribute('title', text);
  }

  /* 把 LIVE 状态刷到所有徽标 / 胶囊 / 人数上（页面切换后元素不存在就自动跳过） */
  function renderLive() {
    var state = !LIVE.known ? 'unk' : (LIVE.ok ? 'on' : 'off');
    var full;
    if (!LIVE.known) full = '状态检测中…';
    else if (LIVE.ok) full = LIVE.now > 0 ? ('在线 · ' + LIVE.now + ' 人') : '在线 · 空闲';
    else full = '离线';

    setBadge($id('heroLive'), state, full);
    setBadge($id('navLive'), state,
      !LIVE.known ? '—' : (LIVE.ok ? (LIVE.now > 0 ? LIVE.now + ' 人' : '在线') : '离线'));

    var pillClass = 'status-pill ' + (LIVE.known ? (LIVE.ok ? 'on' : 'off') : '');
    var pillText = !LIVE.known ? '检测中…' : (LIVE.ok ? '● 在线' : '● 离线');
    var sp = $id('stPill');
    if (sp) { sp.className = pillClass; sp.textContent = pillText; }
    var op = $id('olPill');
    if (op) { op.className = pillClass; op.textContent = pillText; }

    // 大数字：在线时显示实时人数，离线归零，未知显示 —
    var so = $id('stOnline');
    if (so) so.textContent = !LIVE.known ? '—' : (LIVE.ok ? String(LIVE.now) : '0');
    var oc = $id('olCount');
    if (oc) {
      oc.textContent = !LIVE.known ? '—'
        : (LIVE.ok ? ('在线 ' + LIVE.now + ' / ' + (LIVE.max || '—') + ' 人') : '在线 0 / ' + (LIVE.max || '—') + ' 人');
    }
    // 首页那条链接固定文案（人数已经显示在旁边的徽标里，不重复报数）
    var ho = $id('heroOnline');
    if (ho) {
      ho.innerHTML = '查看在线玩家 <span class="ho-arrow">→</span>';
    }
  }

  function applyLive(d) {
    var isOn = !!d.online;
    if (isOn) {
      LIVE.ok = true;
      LIVE.off = 0;
    } else {
      // 单次「离线」采样先按住不翻红：第三方探测偶尔抖一下，
      // 误报离线会让玩家以为服务器挂了直接走人。连续两次才确认离线。
      LIVE.off = (LIVE.off || 0) + 1;
      if (!LIVE.known || LIVE.ok === false || LIVE.off >= 2) LIVE.ok = false;
    }
    LIVE.known = true;
    // 已经确定在线时，别让一次「离线」采样把人数清掉
    if (isOn || LIVE.ok === false) {
      var p = d.players || {};
      LIVE.now = Number(p.now) || 0;
    }
    LIVE.ping = (typeof d.latency === 'number' && d.latency > 0) ? d.latency : LIVE.ping;
    LIVE.ver = d.version || d.name || LIVE.ver;
    LIVE.motd = typeof d.description === 'string' ? d.description
      : (d.description && d.description.text ? d.description.text : LIVE.motd);
    LIVE.fail = 0;
    LIVE.at = Date.now();
    renderLive();
    if (typeof LIVE.onUpdate === 'function') LIVE.onUpdate();
  }

  function pollLive() {
    if (LIVE.busy) return;            // 上一个还飞着就别再发一个
    LIVE.busy = true;
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    var opts = ctrl ? { signal: ctrl.signal, cache: 'no-store' } : { cache: 'no-store' };
    fetch(liveUrl() + '&_=' + Date.now(), opts)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (x) {
        var d = (x && x.data) ? x.data : null;
        if (!d || typeof d.online !== 'boolean') throw new Error('bad payload');
        applyLive(d);
      })
      .catch(function () {
        // 拿不到数据 ≠ 服务器离线：连续 3 次失败才把徽标降级成"状态未知"
        LIVE.fail++;
        if (LIVE.fail >= 3 && LIVE.known) {
          LIVE.known = false;
          renderLive();
          if (typeof LIVE.onUpdate === 'function') LIVE.onUpdate();
        }
      })
      .then(function () {
        clearTimeout(to);
        LIVE.busy = false;
      });
  }

  /* 单一心跳：5 秒一次；失败次数越多间隔越长（最多 60 秒），页面隐藏时停手 */
  function startLiveTicker() {
    if (LIVE.timer) clearTimeout(LIVE.timer);
    function step() {
      if (!document.hidden) pollLive();
      var delay = LIVE.fail >= 3 ? Math.min(60000, TICK * Math.pow(2, LIVE.fail - 2)) : TICK;
      LIVE.timer = setTimeout(step, delay);
    }
    step();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) pollLive();   // 切回前台立刻补一次，不用等下一个 5 秒
    });
  }

  /* 顶部导航里的迷你状态徽标（全站可见，点进在线状态页） */
  function mountNavLive() {
    var right = document.querySelector('.nav-right');
    if (!right || $id('navLive')) return;
    var a = document.createElement('a');
    a.id = 'navLive';
    a.className = 'live-badge nav-live';
    a.href = '#/online';
    a.innerHTML = '<i class="live-dot"></i><span class="live-txt">—</span>';
    right.insertBefore(a, right.firstChild);
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
    { label: '论坛', href: '#/forum' },
    { label: '聊天', href: '#/chat' },
    { label: '申诉', href: '#/appeal' }
  ];
  function renderNav(activePath) {
    var nav = $id('navMain');
    if (!nav) return;
    nav.innerHTML = NAV.map(function (n) {
      var path = n.href.replace('#', '') || '/';
      var isActive = activePath === path ||
        (path === '/forum' && String(activePath || '').indexOf('/forum') === 0);
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
      '<span class="live-badge" id="heroLive" title="服务器状态"><i class="live-dot"></i><span class="live-txt">状态检测中…</span></span>' +
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

  /* 首页：地址旁的徽标与「查看在线玩家」文字都交给统一的 LIVE 心跳渲染，
     这里只负责在页面刚渲染出来时先把当前值铺上去（避免闪一下空白） */
  function loadHeroOnline() {
    clearInterval(window.__stlHeroTimer);
    renderLive();
    if (!LIVE.at) pollLive();   // 首次进入还没拿到过数据就立刻问一次
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
    container.innerHTML = pageHead('首页', '服务器状态', '每 5 秒自动刷新；在线玩家名单由服务端每 1 分钟同步');
    var card = el('div', 'card');
    card.innerHTML = '<div class="status-hero">' +
      '<div><div class="online-count" id="stOnline">—</div><div style="font-size:13px;color:var(--muted-foreground);margin-top:4px">当前在线玩家</div></div>' +
      '<div><span class="status-pill" id="stPill">检测中…</span></div>' +
      '</div>' +
      '<div class="stat-row" id="stStats"></div>' +
      '<div class="motd" id="stMotd">正在获取服务器 MOTD…</div>' +
      '<div style="margin-top:20px"><div style="font-size:14px;font-weight:700;margin-bottom:12px">在线玩家</div><div class="player-grid" id="stPlayers"></div></div>';
    container.appendChild(card);
    renderLive();               // 先把已知状态铺上去，别等接口
    loadStatus();
    LIVE.onUpdate = loadStatus;  // 跟着 5 秒心跳刷（不再单独 setInterval）
  }
  var ONLINE_TOPIC = 'stl-online-6bd1ae0f4e7e7968';

  /* 站点统一的在线数据源：仓库里的 online.json（由 tools/export_online.py 经 RCON 导出）
     人数与名单必须同源，否则会出现「显示在线 1 人却列出 2 个头像」这种自相矛盾。 */
  function fetchLocalOnline(cb) {
    fetch('online.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('no file'); return r.json(); })
      .then(function (d) { cb(d, null); })
      .catch(function (e) { cb(null, e); });
  }

  function loadStatus() {
    // 人数 / 在线判定已由 LIVE（实时接口）负责，这里只补两样东西：
    //   1) 人数上限（第三方接口给的上限是脏值，用 online.json 的 server.properties 真实值）
    //   2) 在线玩家名单（只能靠 RCON 导出的 online.json，天生滞后 1 分钟）
    fetchLocalOnline(function (d) {
      if (d && Number(d.max)) LIVE.max = Number(d.max);
      // 首次进入、接口还没回来时，先用 online.json 兜个底，别让页面空着
      if (!LIVE.at && d && typeof d.online === 'boolean') {
        LIVE.known = true;
        LIVE.ok = !!d.online;
        LIVE.now = Number(d.now) || 0;
      }
      var ok = LIVE.known ? LIVE.ok : !!(d && d.online);
      var pg = $id('stPlayers');
      if (pg) {
        var age = (d && d.updated) ? Math.max(0, Math.round(Date.now() / 1000 - d.updated)) : -1;
        renderPlayerGrid(pg, (d && d.players) || [], ok, age);
      }
      fillStatusStats(ok);
      renderLive();
    });
  }

  /* 延迟 / 版本 / MOTD 来自实时接口，拿不到就显示 — */
  function fillStatusStats(ok) {
    var ping = LIVE.ping;
    var stats = $id('stStats');
    if (stats) {
      stats.innerHTML = '<div class="stat-box"><div class="k">在线/最大</div><div class="v">' +
        ((LIVE.known && LIVE.ok) ? LIVE.now : 0) + ' / ' + (LIVE.max || '—') + '</div></div>' +
        '<div class="stat-box"><div class="k">延迟</div><div class="v">' +
        ((!LIVE.ok || ping == null || ping <= 0) ? '—' : ping + 'ms') + '</div></div>' +
        '<div class="stat-box"><div class="k">版本</div><div class="v">' + esc(LIVE.ver || '—') + '</div></div>' +
        '<div class="stat-box"><div class="k">地址</div><div class="v" style="font-size:14px">' + esc(SITE.javaIp) + '</div></div>';
    }
    var motd = $id('stMotd');
    if (motd) motd.textContent = LIVE.motd || (ok ? 'MOTD 未返回' : '服务器离线或不可达');
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
    // 服务器已经离线：不管 online.json 里还留着谁，都不能再显示（那是停机前的快照）
    if (LIVE.known && !LIVE.ok) {
      pg.innerHTML = emptyState('🕹️', '服务器离线');
      return;
    }
    // 实时接口说现在 0 人，名单里却还有名字 —— 那只是 online.json 滞后，
    // 以实时为准，否则会出现「显示 0 人在线却挂着 1 个头像」的自相矛盾
    if (LIVE.known && LIVE.ok && LIVE.now === 0) {
      pg.innerHTML = emptyState('🕹️', '暂无在线玩家');
      return;
    }
    if (!players || !players.length) {
      pg.innerHTML = emptyState('🕹️', ok ? '暂无在线玩家' : '服务器离线');
      return;
    }
    var html = players.map(function (name) {
      var face = avatarUrl(name, 96);
      return '<div class="player-cell"><img src="' + face + '" alt="" loading="lazy" data-fb="' + identicon(name) + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')"><span class="nm">' + esc(name) + '</span></div>';
    }).join('');
    // 实时人数和名单条数对不上时说明原因（名单靠 RCON 导出，慢约 1 分钟），
    // 否则又会被当成「显示 3 人却只有 2 个头像」的 bug
    if (LIVE.known && LIVE.ok && LIVE.now !== players.length) {
      html += '<div class="list-note">实时在线 ' + LIVE.now + ' 人，名单同步约有 1 分钟延迟</div>';
    }
    // updated = 本地脚本最后一次成功同步的时间（名单没变时也会每 20 分钟刷新一次心跳），
    // 超过 30 分钟没动才说明同步真的停了，这时提示一下免得误导
    if (age > 1800) {
      var mins = Math.round(age / 60);
      html += '<div class="list-note">自动同步已 ' +
        (mins > 90 ? Math.round(mins / 60) + ' 小时' : mins + ' 分钟') + ' 没运行，以下名单可能不是最新的</div>';
    }
    pg.innerHTML = html;
  }

  /* --- 在线状态页（在线玩家 ID + 头像） --- */
  function renderOnline(container) {
    container.innerHTML = pageHead('在线', '在线状态', '状态每 5 秒刷新；玩家名单由服务端每 1 分钟同步');
    var card = el('div', 'card'); container.appendChild(card);
    card.innerHTML = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap">' +
      '<span class="status-pill" id="olPill">检测中…</span>' +
      '<span style="font-size:15px;font-weight:700" id="olCount">—</span>' +
      '</div>' +
      '<div class="player-grid" id="olPlayers"></div>';
    renderLive();
    loadOnline();
    LIVE.onUpdate = loadOnline;   // 人数/胶囊由 renderLive 写，这里只负责名单
  }
  function loadOnline() {
    fetchLocalOnline(function (d, err) {
      var pg = $id('olPlayers');
      if (err || !d) {
        // 实时接口说在线、但名单文件取不到：如实说明，别直接报"离线"
        if (pg) pg.innerHTML = emptyState('🕹️',
          (LIVE.known && LIVE.ok) ? ('在线 ' + LIVE.now + ' 人，名单同步中…') : '服务器离线或不可达');
        renderLive();
        return;
      }
      if (Number(d.max)) LIVE.max = Number(d.max);
      var ok = LIVE.known ? LIVE.ok : !!d.online;
      var age = d.updated ? Math.max(0, Math.round(Date.now() / 1000 - d.updated)) : -1;
      renderPlayerGrid(pg, d.players || [], ok, age);
      renderLive();
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


  /* --- 三端聊天（官网 ⇄ QQ 群 ⇄ 游戏服） --- */
  function renderChat(container) {
    container.innerHTML = pageHead('聊天', '三端聊天',
      '服务器里、QQ 群里、官网上说的话实时互通；用已登录的官网账号发言');
    var box = el('div', 'card');
    container.appendChild(box);
    box.innerHTML =
      '<div class="chat-note">消息由本地服务转发，服务器 / QQ 群 / 网页三端互通。请文明发言。</div>' +
      '<div id="chatList" class="chat-list"><div class="chat-empty">正在加载最近消息…</div></div>' +
      '<div id="chatLogin" class="chat-login" hidden>' +
        '发消息需要先登录官网账号。<a href="confirm.html">去登录</a>' +
      '</div>' +
      '<div class="chat-compose">' +
        '<input id="chatInput" type="text" maxlength="500" placeholder="说点什么…" autocomplete="off">' +
        '<button id="chatSend" class="btn btn-primary" type="button">发送</button>' +
      '</div>' +
      '<div id="chatMsg" class="chat-status"></div>';

    var list = box.querySelector('#chatList');
    var input = box.querySelector('#chatInput');
    var btn = box.querySelector('#chatSend');
    var loginTip = box.querySelector('#chatLogin');
    var status = box.querySelector('#chatMsg');
    var seen = {};            // msg.id -> true，避免 SSE / 快照 / 缓存重复
    var items = [];
    var gotData = false;
    var myQq = '';
    var sess = null;
    var rid = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    var es = null;

    try {
      var raw = JSON.parse(localStorage.getItem('stl_web_session_v1') || 'null');
      if (raw && raw.token && raw.qq && raw.exp > Date.now()) sess = raw;
    } catch (e) {}
    if (sess) myQq = String(sess.qq);

    function say(t, cls) { status.textContent = t; status.className = 'chat-status' + (cls ? ' ' + cls : ''); }
    function post(obj) {
      return fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
        method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(obj)
      });
    }
    function timeOf(ts) {
      var d = new Date(Number(ts) || Date.now());
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    function labelOf(m) {
      if (m.src === 'qq') return 'QQ群';
      if (m.src === 'mc') return m.server || '游戏';
      if (m.src === 'web') return '网页';
      return '消息';
    }
    function nearBottom() {
      return list.scrollHeight - list.scrollTop - list.clientHeight < 60;
    }

    /* 全部用 textContent 写：消息来自 QQ 群，绝不能当 HTML 解析 */
    function appendMsg(m) {
      if (!m || !m.id || seen[m.id]) return;
      if (!/^(qq|mc|web)$/.test(m.src)) return;
      var stick = nearBottom();
      gotData = true;
      seen[m.id] = true;
      items.push(m);
      var empty = list.querySelector('.chat-empty');
      if (empty) list.removeChild(empty);

      var row = document.createElement('div');
      row.className = 'chat-row' + (m.src === 'web' && myQq && String(m.qq) === myQq ? ' mine' : '');
      var tag = document.createElement('span');
      tag.className = 'chat-tag src-' + m.src;
      tag.textContent = labelOf(m);
      var name = document.createElement('span');
      name.className = 'chat-name';
      name.textContent = String(m.name || '匿名');
      var time = document.createElement('span');
      time.className = 'chat-time';
      time.textContent = timeOf(m.ts);
      var text = document.createElement('span');
      text.className = 'chat-text';
      text.textContent = String(m.text || '');
      row.appendChild(tag); row.appendChild(name); row.appendChild(time); row.appendChild(text);
      list.appendChild(row);
      if (stick) list.scrollTop = list.scrollHeight;
    }
    function addMany(arr) {
      if (!Array.isArray(arr)) return;
      arr.slice().sort(function (a, b) { return (a.seq || 0) - (b.seq || 0); })
        .forEach(appendMsg);
      if (!items.length) list.innerHTML = '<div class="chat-empty">还没有消息，来打个招呼吧</div>';
    }

    /* 历史：先问服务端拿内存快照（最可靠），再补一遍 ntfy 缓存 */
    post({ type: 'chatHistory', rid: rid, limit: 60 }).catch(function () {});
    fetch(NTFY_BASE + '/' + NTFY_TOPIC + '/json?poll=1&since=' + (Math.floor(Date.now() / 1000) - 7200))
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var arr = [];
        t.split('\n').forEach(function (ln) {
          if (!ln) return;
          try {
            var o = JSON.parse(ln);
            if (o.event !== 'message' || !o.message) return;
            var m = JSON.parse(o.message);
            if (m.type === 'chatMsg' && m.msg) arr.push(m.msg);
          } catch (e) {}
        });
        addMany(arr);
      })
      .catch(function () {});

    es = new EventSource(NTFY_BASE + '/' + NTFY_TOPIC + '/sse?since=30s');
    es.onmessage = function (ev) {
      var d; try { d = JSON.parse(ev.data); } catch (e) { return; }
      if (d.event !== 'message' || !d.message) return;
      var m; try { m = JSON.parse(d.message); } catch (e) { return; }
      if (m.type === 'chatMsg' && m.msg) { appendMsg(m.msg); return; }
      if (m.type === 'chatSnapshot' && m.rid === rid) { gotData = true; addMany(m.items); return; }
      if (m.type === 'chatSent' && m.rid === rid) { say('已发送'); return; }
      if (m.type === 'chatFail' && m.rid === rid) { say(m.reason || '发送失败', 'err'); return; }
    };
    es.onerror = function () { say('连接中断，正在自动重连…', 'busy'); };
    // 服务没重启 / 消息总线不通时，别让用户对着「正在加载」干等
    setTimeout(function () {
      if (gotData || !list.isConnected) return;
      list.innerHTML = '<div class="chat-empty">暂时没收到消息，消息服务可能没在线，稍后再试</div>';
      say('连不上消息服务', 'busy');
    }, 12000);

    if (!sess) {
      loginTip.hidden = false;
      input.disabled = true;
      btn.disabled = true;
      say('登录后即可发言', 'busy');
    } else {
      say('以 ' + (sess.names && sess.names[0] ? sess.names[0] : ('QQ ' + myQq)) + ' 的身份发言');
    }

    function send() {
      if (!sess) return;
      var text = input.value.trim();
      if (!text) { say('先写点什么吧', 'err'); return; }
      if (text.length > 500) { say('最多 500 字', 'err'); return; }
      btn.disabled = true;
      say('正在发送…', 'busy');
      post({ type: 'chatSend', rid: rid, token: sess.token, text: text })
        .then(function () {
          input.value = '';
          btn.disabled = false;
          // 消息本身由服务端以 chatMsg 广播回来，这里不做乐观显示
        })
        .catch(function () {
          btn.disabled = false;
          say('网络错误，没发出去', 'err');
        });
    }
    btn.addEventListener('click', send);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); send(); }
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

  /* ================= 论坛（纯静态：数据来自仓库内 forum.json） ================= */
  var FORUM_FAV_KEY = 'stl_forum_fav';
  var FORUM_LIKE_KEY = 'stl_forum_liked';
  var forumState = { cat: 0, q: '', favOnly: false };

  function timeAgo(ts) {
    var s = Math.floor((Date.now() - Number(ts || 0)) / 1000);
    if (s < 0) s = 0;
    if (s < 60) return '刚刚';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    if (s < 86400 * 30) return Math.floor(s / 86400) + ' 天前';
    if (s < 86400 * 365) return Math.floor(s / 86400 / 30) + ' 个月前';
    return Math.floor(s / 86400 / 365) + ' 年前';
  }
  function forumFavSet() {
    try { return new Set(JSON.parse(localStorage.getItem(FORUM_FAV_KEY) || '[]')); } catch (e) { return new Set(); }
  }
  function forumToggleFav(id) {
    var s = forumFavSet();
    if (s.has(id)) s.delete(id); else s.add(id);
    try { localStorage.setItem(FORUM_FAV_KEY, JSON.stringify(Array.from(s))); } catch (e) {}
    return s.has(id);
  }
  function forumLikeSet() {
    try { return new Set(JSON.parse(localStorage.getItem(FORUM_LIKE_KEY) || '[]')); } catch (e) { return new Set(); }
  }
  function forumToggleLike(id) {
    var s = forumLikeSet();
    if (s.has(id)) s.delete(id); else s.add(id);
    try { localStorage.setItem(FORUM_LIKE_KEY, JSON.stringify(Array.from(s))); } catch (e) {}
    return s.has(id);
  }
  function catName(data, id) {
    var c = (data.categories || []).find(function (x) { return x.id === id; });
    return c ? c.name : '未分类';
  }
  function fetchForum(cb) {
    fetch('forum.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { cb(d, d ? null : 'http'); })
      .catch(function (e) { cb(null, e); });
  }
  /* 等 ntfy 回执：论坛用 forumOk/forumErr，反馈兼容 fbOk/fbErr */
  function waitForumAck(rid, cb) {
    var deadline = Date.now() + 15000;
    (function tick() {
      fetch(NTFY_BASE + '/' + NTFY_TOPIC + '/json?poll=1&since=' + Math.floor(Date.now() / 1000 - 120))
        .then(function (r) { return r.text(); })
        .then(function (txt) {
          var lines = txt.split('\n');
          for (var i = 0; i < lines.length; i++) {
            if (!lines[i]) continue;
            try {
              var o = JSON.parse(lines[i]);
              if (o.event !== 'message' || !o.message) continue;
              var m = JSON.parse(o.message);
              if (!m || m.rid !== rid) continue;
              if (m.type === 'forumOk' || m.type === 'fbOk' || m.type === 'forumErr' || m.type === 'fbErr') return cb(m);
            } catch (e) {}
          }
          if (Date.now() > deadline) return cb(null);
          setTimeout(tick, 1500);
        })
        .catch(function () { if (Date.now() > deadline) return cb(null); setTimeout(tick, 2000); });
    })();
  }
  function randomHex(n) {
    var b = new Uint8Array(n || 8);
    crypto.getRandomValues(b);
    var s = '';
    for (var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
    return s;
  }

  /* --- 论坛列表页 --- */
  function renderForum(container) {
    container.innerHTML = pageHead('论坛', 'Stone Logic 论坛',
      '玩法讨论、技术求助、BUG 反馈、建筑晒图，这里都能聊。无需登录，任何人都能发帖。');
    var wrap = el('div', 'forum-wrap');
    container.appendChild(wrap);
    var side = el('div', 'forum-side');
    side.innerHTML =
      '<a class="btn btn-primary side-new" href="#/forum/new">✏️ 发新贴</a>' +
      '<h4>导航</h4><div class="forum-nav" id="fNav"></div>' +
      '<h4>搜索</h4><input class="side-search" id="fSearch" placeholder="搜标题 / 内容 / 作者…">' +
      '<h4>我的收藏</h4><a class="forum-nav-link" id="fFav" href="#/forum" style="display:block;padding:8px 10px;border-radius:9px;color:var(--foreground);text-decoration:none">⭐ 我收藏的帖子</a>' +
      '<h4>经验排行</h4><div id="fRank"></div>' +
      '<h4>分类</h4><div class="forum-cat" id="fCats"></div>';
    wrap.appendChild(side);
    var main = el('div', 'forum-main');
    wrap.appendChild(main);

    fetchForum(function (data, err) {
      if (err || !data || !Array.isArray(data.posts)) {
        main.innerHTML = emptyState('📭', '论坛数据加载失败，请刷新重试');
        return;
      }
      // 侧栏：导航（所有分类 + 我的收藏）
      var nav = side.querySelector('#fNav');
      nav.innerHTML = '<a href="#/forum" class="' + (forumState.cat === 0 && !forumState.favOnly ? 'active' : '') + '">🗂️ 所有分类</a>';
      // 侧栏：分类（带数量）
      var counts = {};
      data.posts.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
      var cats = side.querySelector('#fCats');
      cats.innerHTML = (data.categories || []).map(function (c) {
        var active = (forumState.cat === c.id && !forumState.favOnly) ? ' style="background:color-mix(in oklab,var(--primary) 14%,transparent);color:var(--primary);font-weight:700"' : '';
        return '<a href="#/forum" data-cat="' + c.id + '"' + active + '><span>' + esc(c.name) + '</span><span class="cnt">' + (counts[c.id] || 0) + '</span></a>';
      }).join('');
      cats.querySelectorAll('a[data-cat]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          forumState.cat = Number(a.getAttribute('data-cat'));
          forumState.favOnly = false;
          renderForum(container);
        });
      });
      // 侧栏：经验排行（排除匿名）
      var rank = side.querySelector('#fRank');
      var score = {};
      data.posts.forEach(function (p) {
        if (p.author && p.author !== '匿名玩家') score[p.author] = (score[p.author] || 0) + 1;
        (p.replies || []).forEach(function (r) {
          if (r.author && r.author !== '匿名玩家') score[r.author] = (score[r.author] || 0) + 1;
        });
      });
      var top = Object.keys(score).map(function (k) { return { n: k, v: score[k] }; })
        .sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
      rank.innerHTML = top.length ? top.map(function (t, i) {
        return '<div class="forum-rank"><img class="rk-av" src="' + avatarUrl(t.n, 32) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'"><span class="rk-name">' + esc(t.n) + '</span><span class="rk-num">' + t.v + '</span></div>';
      }).join('') : '<div style="font-size:13px;color:var(--muted-foreground);padding:4px 8px">还没有数据</div>';
      // 我的收藏 入口
      var fav = side.querySelector('#fFav');
      fav.addEventListener('click', function (e) {
        e.preventDefault();
        forumState.favOnly = !forumState.favOnly;
        forumState.cat = 0;
        renderForum(container);
      });
      if (forumState.favOnly) fav.style.background = 'color-mix(in oklab,var(--primary) 14%,transparent)';
      // 搜索
      var search = side.querySelector('#fSearch');
      search.value = forumState.q || '';
      search.addEventListener('input', function () { forumState.q = search.value.trim(); renderForumList(main, data); });

      renderForumList(main, data);
    });
  }

  function renderForumList(main, data) {
    var posts = (data.posts || []).slice().sort(function (a, b) { return b.created - a.created; });
    var fav = forumFavSet();
    if (forumState.cat > 0) posts = posts.filter(function (p) { return p.category === forumState.cat; });
    if (forumState.favOnly) posts = posts.filter(function (p) { return fav.has(p.id); });
    if (forumState.q) {
      var q = forumState.q.toLowerCase();
      posts = posts.filter(function (p) {
        return (p.title || '').toLowerCase().indexOf(q) >= 0 ||
          (p.content || '').toLowerCase().indexOf(q) >= 0 ||
          (p.author || '').toLowerCase().indexOf(q) >= 0;
      });
    }
    if (!posts.length) {
      main.innerHTML = '<div class="forum-empty">' +
        (forumState.favOnly ? '你还没有收藏任何帖子，点开帖子右上角 ⭐ 即可收藏。' : '这个分类下还没有帖子，来发第一条吧！') +
        '</div>';
      return;
    }
    var html = posts.map(function (p) {
      var c = catName(data, p.category);
      var av = avatarUrl(p.author, 44);
      var excerpt = (p.content || '').replace(/\s+/g, ' ');
      if (excerpt.length > 80) excerpt = excerpt.slice(0, 80) + '…';
      return '<a class="post-card" href="#/forum/post/' + esc(p.id) + '">' +
        '<span class="cat-badge">' + esc(c) + '</span>' +
        '<h3 class="post-title">' + esc(p.title) + '</h3>' +
        '<p class="post-excerpt">' + esc(excerpt) + '</p>' +
        '<div class="post-meta">' +
          '<img src="' + av + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' +
          '<span class="pm-name">' + esc(p.author || '匿名玩家') + '</span>' +
          '<span class="dot">·</span><span>' + timeAgo(p.created) + '</span>' +
          '<span class="dot">·</span><span>💬 ' + ((p.replies || []).length) + '</span>' +
          '<span class="dot">·</span><span>👍 ' + (p.likes || 0) + '</span>' +
        '</div></a>';
    }).join('');
    main.innerHTML = html;
  }

  /* --- 帖子详情页 --- */
  function renderForumPost(container, id) {
    container.innerHTML = pageHead('论坛', '帖子详情', '');
    var box = el('div', 'forum-detail');
    box.innerHTML = '<div class="forum-empty">正在加载…</div>';
    container.appendChild(box);

    fetchForum(function (data, err) {
      if (err || !data) { box.innerHTML = emptyState('📭', '加载失败，请返回重试'); return; }
      var post = (data.posts || []).find(function (p) { return p.id === id; });
      if (!post) { box.innerHTML = emptyState('🔍', '帖子不存在或已被删除'); return; }
      var fav = forumFavSet();
      var liked = forumLikeSet().has(post.id);
      var c = catName(data, post.category);
      box.innerHTML = '';
      // 头部
      var head = el('div');
      head.innerHTML = '<span class="fd-cat">' + esc(c) + '</span>' +
        '<h1 class="fd-title">' + esc(post.title) + '</h1>' +
        '<div class="fd-meta">' +
          '<img src="' + avatarUrl(post.author, 56) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
          '<span class="pm-name">' + esc(post.author || '匿名玩家') + '</span>' +
          '<span>·</span><span>' + timeAgo(post.created) + '</span>' +
          '<span>·</span><span>💬 ' + ((post.replies || []).length) + ' 回复</span>' +
        '</div>';
      box.appendChild(head);
      // 正文（textContent 防 XSS，pre-wrap 保留换行）
      var body = el('div', 'fd-body');
      body.textContent = post.content || '';
      box.appendChild(body);
      // 操作区：点赞 / 收藏 / 返回
      var actions = el('div', 'fd-actions');
      var likeBtn = el('button', 'fd-like' + (liked ? ' on' : ''));
      likeBtn.textContent = (liked ? '👍 已赞 ' : '👍 点赞 ') + ((post.likes || 0) + (liked ? 1 : 0));
      var favBtn = el('button', 'fd-like' + (fav.has(post.id) ? ' on' : ''));
      favBtn.textContent = fav.has(post.id) ? '⭐ 已收藏' : '☆ 收藏';
      var back = el('a', 'btn btn-outline btn-sm');
      back.href = '#/forum';
      back.textContent = '← 返回列表';
      actions.appendChild(likeBtn); actions.appendChild(favBtn); actions.appendChild(back);
      box.appendChild(actions);
      likeBtn.addEventListener('click', function () {
        var on = forumToggleLike(post.id);
        likeBtn.classList.toggle('on', on);
        likeBtn.textContent = (on ? '👍 已赞 ' : '👍 点赞 ') + ((post.likes || 0) + (on ? 1 : 0));
      });
      favBtn.addEventListener('click', function () {
        var on = forumToggleFav(post.id);
        favBtn.classList.toggle('on', on);
        favBtn.textContent = on ? '⭐ 已收藏' : '☆ 收藏';
        toast(on ? '已加入收藏' : '已取消收藏');
      });
      // 回复列表
      var rl = el('div', 'reply-list');
      box.appendChild(rl);
      renderReplies(rl, post);
      // 回复表单（任何人可回，无需登录）
      var rf = el('div', 'reply-form');
      rf.innerHTML =
        '<div class="forum-note">无需登录即可回复；留空昵称将以「匿名玩家」发表。</div>' +
        '<div class="field"><label>回复内容</label><textarea id="rfText" maxlength="1000" placeholder="说点什么…"></textarea></div>' +
        '<div class="rf-row">' +
          '<input id="rfName" type="text" maxlength="24" placeholder="昵称（选填）" style="flex:1;min-width:120px;background:var(--card);border:1px solid var(--input);border-radius:9px;padding:9px 11px;color:var(--foreground);outline:none">' +
          '<label class="rf-anon"><input id="rfAnon" type="checkbox" checked> 匿名发表</label>' +
          '<button class="btn btn-primary btn-sm" id="rfSend" type="button">发表回复</button>' +
        '</div>' +
        '<div id="rfMsg" style="font-size:13px;min-height:18px;margin-top:8px"></div>';
      box.appendChild(rf);
      var rfText = rf.querySelector('#rfText');
      var rfName = rf.querySelector('#rfName');
      var rfAnon = rf.querySelector('#rfAnon');
      var rfSend = rf.querySelector('#rfSend');
      var rfMsg = rf.querySelector('#rfMsg');
      rfSend.addEventListener('click', function () {
        var text = rfText.value.trim();
        if (text.length < 2) { rfMsg.textContent = '回复至少写 2 个字'; rfMsg.style.color = 'var(--destructive)'; return; }
        var rid = randomHex();
        var since = Math.floor(Date.now() / 1000) - 120;
        rfSend.disabled = true; rfMsg.textContent = '正在发表…'; rfMsg.style.color = 'var(--muted-foreground)';
        fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
          method: 'POST', headers: { 'content-type': 'text/plain' },
          body: JSON.stringify({ type: 'forum_reply', rid: rid, post_id: post.id, content: text, author: rfName.value.trim(), anonymous: rfAnon.checked, ts: Date.now() })
        }).then(function () {
          waitForumAck(rid, function (m) {
            rfSend.disabled = false;
            if (m && (m.type === 'forumOk')) {
              rfText.value = ''; rfMsg.textContent = '回复成功！'; rfMsg.style.color = 'var(--primary)';
              // 重新拉取最新数据再渲染
              fetchForum(function (nd) {
                if (nd) { var np = (nd.posts || []).find(function (x) { return x.id === post.id; }); if (np) { post = np; rl.innerHTML = ''; renderReplies(rl, post); } }
              });
            } else if (m && (m.type === 'forumErr')) {
              rfMsg.textContent = '发表失败：' + (m.reason || '未知错误'); rfMsg.style.color = 'var(--destructive)';
            } else {
              rfMsg.textContent = '等了 15 秒没收到回执，可能服务端没在线，稍后刷新看看。'; rfMsg.style.color = 'var(--destructive)';
            }
          });
        }).catch(function () {
          rfSend.disabled = false;
          rfMsg.textContent = '网络错误，没发出去。'; rfMsg.style.color = 'var(--destructive)';
        });
      });
    });
  }
  function renderReplies(container, post) {
    var list = post.replies || [];
    if (!list.length) { container.innerHTML = '<div style="font-size:13.5px;color:var(--muted-foreground);padding:6px 2px">还没有回复，来抢沙发～</div>'; return; }
    container.innerHTML = list.slice().sort(function (a, b) { return a.created - b.created; }).map(function (r) {
      return '<div class="reply-item">' +
        '<img src="' + avatarUrl(r.author, 60) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<div class="ri-main">' +
          '<div class="ri-head"><span class="ri-name">' + esc(r.author || '匿名玩家') + '</span><span class="ri-time">' + timeAgo(r.created) + '</span></div>' +
          '<div class="ri-body"></div>' +
        '</div></div>';
    }).join('');
    // 用 textContent 填充回复正文，避免 XSS
    var bodies = container.querySelectorAll('.ri-body');
    list.slice().sort(function (a, b) { return a.created - b.created; }).forEach(function (r, i) {
      if (bodies[i]) bodies[i].textContent = r.content || '';
    });
  }

  /* --- 发新贴页 --- */
  function renderForumNew(container) {
    container.innerHTML = pageHead('论坛', '发新贴', '提个想法、问个问题、晒个作品。无需登录，直接发表（也可填写昵称）。');
    var box = el('div', 'card forum-form');
    container.appendChild(box);
    box.innerHTML =
      '<div class="forum-note">发表内容会公开展示在论坛上，请不要填写密码、手机号等敏感信息。恶意刷屏或违规内容将被删除。</div>' +
      '<div class="field"><label>选择分类</label><select id="fnCat"></select></div>' +
      '<div class="field"><label>标题<span id="fnCount" style="float:right;color:var(--muted-foreground)">0 / 100</span></label>' +
        '<input id="fnTitle" type="text" maxlength="100" placeholder="一句话说清你要聊什么"></div>' +
      '<div class="field"><label>正文<span id="fnCount2" style="float:right;color:var(--muted-foreground)">0 / 2000</span></label>' +
        '<textarea id="fnContent" maxlength="2000" placeholder="展开说说，第一行会作为标题的补充说明"></textarea></div>' +
      '<div class="rf-row" style="margin-bottom:14px">' +
        '<input id="fnName" type="text" maxlength="24" placeholder="昵称（选填，留空则匿名）" style="flex:1;min-width:120px;background:var(--card);border:1px solid var(--input);border-radius:9px;padding:9px 11px;color:var(--foreground);outline:none">' +
        '<label class="rf-anon"><input id="fnAnon" type="checkbox" checked> 匿名发表</label>' +
      '</div>' +
      '<div id="fnMsg" class="fb-msg"></div>' +
      '<div class="fb-actions"><button class="btn btn-primary" id="fnSubmit" type="button">发布帖子</button>' +
        '<a class="btn btn-outline" href="#/forum">取消</a></div>';

    // 分类下拉（默认沿用列表页当前选中的分类）
    fetchForum(function (data) {
      var sel = box.querySelector('#fnCat');
      var cats = (data && data.categories) || [];
      sel.innerHTML = cats.map(function (c) {
        var def = (forumState.cat && forumState.cat === c.id) ? ' selected' : '';
        return '<option value="' + c.id + '"' + def + '>' + esc(c.name) + '</option>';
      }).join('');
    });

    var title = box.querySelector('#fnTitle');
    var content = box.querySelector('#fnContent');
    var name = box.querySelector('#fnName');
    var anon = box.querySelector('#fnAnon');
    var submit = box.querySelector('#fnSubmit');
    var msg = box.querySelector('#fnMsg');
    var c1 = box.querySelector('#fnCount');
    var c2 = box.querySelector('#fnCount2');
    function setMsg(t, cls) { msg.textContent = t; msg.className = 'fb-msg' + (cls ? ' ' + cls : ''); }
    title.addEventListener('input', function () { c1.textContent = title.value.length + ' / 100'; });
    content.addEventListener('input', function () { c2.textContent = content.value.length + ' / 2000'; });

    submit.addEventListener('click', function () {
      var t = title.value.trim();
      var ct = content.value.trim();
      if (t.length < 2) { setMsg('标题至少 2 个字', 'err'); return; }
      if (ct.length < 2) { setMsg('正文至少 2 个字', 'err'); return; }
      var rid = randomHex();
      var since = Math.floor(Date.now() / 1000) - 120;
      submit.disabled = true; setMsg('正在发布…', 'busy');
      fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
        method: 'POST', headers: { 'content-type': 'text/plain' },
        body: JSON.stringify({
          type: 'forum_post', rid: rid, category: Number(box.querySelector('#fnCat').value),
          title: t, content: ct, author: name.value.trim(), anonymous: anon.checked, ts: Date.now()
        })
      }).then(function () {
        waitForumAck(rid, function (m) {
          submit.disabled = false;
          if (m && (m.type === 'forumOk')) {
            setMsg('发布成功！正在跳转…', 'ok');
            setTimeout(function () { location.hash = '#/forum/post/' + (m.id || ''); }, 600);
          } else if (m && (m.type === 'forumErr')) {
            setMsg('发布失败：' + (m.reason || '未知错误'), 'err');
          } else {
            setMsg('等了 15 秒没收到回执，可能服务端没在线，请稍后重试。', 'err');
          }
        });
      }).catch(function () {
        submit.disabled = false;
        setMsg('网络错误，没发出去。', 'err');
      });
    });
  }

  var routes = {
    '/': renderHome,
    '/status': renderStatus,
    '/online': renderOnline,
    '/rank': renderRank,
    '/guide': renderGuide,
    '/rules': renderRules,
    '/forum': renderForum,
    '/forum/new': renderForumNew,
    '/chat': renderChat,
    '/appeal': renderAppeal
  };

  function resolve(hash) {
    var path = (hash || '#/').replace(/^#/, '');
    if (!path || path === '/') return { page: renderHome, param: '' };
    // 论坛子路由：详情页 /forum/post/<id>
    if (path.indexOf('/forum/post/') === 0) return { page: renderForumPost, param: path.split('/')[3] || '' };
    if (path === '/forum/new') return { page: renderForumNew, param: '' };
    if (path === '/forum') return { page: renderForum, param: '' };
    if (routes[path]) return { page: routes[path], param: '' };
    return { page: renderHome, param: '' };
  }

  function render() {
    clearInterval(window.__stlHeroTimer);
    LIVE.onUpdate = null;   // 换页了，别再把上一页的刷新函数带着跑
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
    // 配置加载完再起实时心跳：config.json 可能改掉服务器地址，避免第一次探测打错地址
    loadAvatars(function () {
      loadConfig(function () {
        mountNavLive();
        render();
        startLiveTicker();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
