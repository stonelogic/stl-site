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
    { label: '玩家', href: '#/players' },
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
      '<img class="hero-logo" src="assets/title-logo.png" alt="STONE LOGIC">' +
      '<p class="hero-slogan">生存 or 小游戏 你想要的，都在STL！</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="' + SITE.groupUrl + '" target="_blank" rel="noopener">加入 QQ 群</a>' +
      '<a class="btn btn-outline" href="#/players">查玩家皮肤</a>' +
      '</div>' +
      '<div><span class="hero-ip">' + esc(SITE.javaIp) + '</span></div>' +
      '</div>';
    container.appendChild(hero);

    // 简介
    var intro = el('div', 'card'); container.appendChild(intro);
    intro.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:8px">' +
      '<span class="badge badge-green">Java 版</span>' +
      '<span style="font-size:13px;color:var(--muted-foreground)">主世界不删档 · 小游戏随时玩 · 被封禁可申诉</span>' +
      '</div>' +
      '<p style="color:var(--muted-foreground);font-size:14px;line-height:1.8;margin:0">' +
      '长期稳定的纯生存服，主世界不删档，起床战争、方块躲猫猫等小游戏随时能玩。被封禁的玩家可到「申诉」页提交申请。' +
      '</p>';

    // 玩法特色
    var fh = el('div', ''); fh.innerHTML = '<h2 style="font-size:20px;font-weight:800;margin:28px 0 16px">玩法特色</h2>';
    container.appendChild(fh);
    var fg = el('div', 'grid grid-4');
    fg.innerHTML = SITE.features.map(function (f) {
      return '<div class="card card-hover"><div style="font-size:26px">' + f.icon + '</div><h3 style="margin:10px 0 6px;font-size:15px">' + esc(f.title) + '</h3><p style="font-size:13px;color:var(--muted-foreground);margin:0;line-height:1.7">' + esc(f.desc) + '</p></div>';
    }).join('');
    container.appendChild(fg);

    // 世界
    var wh = el('div', ''); wh.innerHTML = '<h2 style="font-size:20px;font-weight:800;margin:28px 0 16px">世界一览</h2>';
    container.appendChild(wh);
    var wg = el('div', 'grid grid-3');
    wg.innerHTML = SITE.worlds.map(function (w) {
      return '<div class="card"><span class="badge badge-green">' + esc(w.tag) + '</span><div style="font-family:monospace;font-size:14px;margin:8px 0 4px">' + esc(w.name) + '</div><div style="font-size:13px;color:var(--muted-foreground)">' + esc(w.desc) + '</div></div>';
    }).join('');
    container.appendChild(wg);
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
  function loadStatus() {
    var url = STATUS_API.replace('{host}', JAVA_HOST).replace('{port}', JAVA_PORT);
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var ok = d && (d.online === true || d.status === true || (d.online !== undefined && d.online !== false));
      var players = (d && (d.players && d.players.list)) || [];
      var now = (d && (d.players && d.players.online)) || players.length || 0;
      var max = (d && d.players && d.players.max) || 0;
      var pill = $id('stPill'), on = $id('stOnline');
      if (pill) { pill.textContent = ok ? '● 在线' : '● 离线'; pill.className = 'status-pill ' + (ok ? 'on' : 'off'); }
      if (on) on.textContent = ok ? now : '0';
      var stats = $id('stStats');
      if (stats) {
        var ping = (d && (d.ping !== undefined)) ? d.ping : '—';
        var ver = (d && d.version) ? (typeof d.version === 'string' ? d.version : d.version.name) : '—';
        stats.innerHTML = '<div class="stat-box"><div class="k">在线/最大</div><div class="v">' + now + ' / ' + max + '</div></div>' +
          '<div class="stat-box"><div class="k">延迟</div><div class="v">' + (ping === '—' ? '—' : ping + 'ms') + '</div></div>' +
          '<div class="stat-box"><div class="k">版本</div><div class="v">' + esc(ver || '—') + '</div></div>' +
          '<div class="stat-box"><div class="k">地址</div><div class="v" style="font-size:14px">' + esc(SITE.javaIp) + '</div></div>';
      }
      var motd = $id('stMotd');
      if (motd) motd.textContent = (d && d.motd) ? (typeof d.motd === 'string' ? d.motd : JSON.stringify(d.motd)) : (ok ? 'MOTD 未返回' : '服务器离线或不可达');
      var pg = $id('stPlayers');
      if (pg) {
        if (!players.length) pg.innerHTML = emptyState('🕹️', ok ? '暂无在线玩家' : '服务器离线');
        else pg.innerHTML = players.map(function (n) {
          var name = (typeof n === 'string') ? n : (n.name || '');
          var id = (typeof n === 'string') ? n : (n.uuid || n.id || n.name || '');
          var face = 'https://minotar.net/helm/' + encodeURIComponent(id) + '/96.png';
          return '<a class="player-cell" href="#/players?q=' + encodeURIComponent(name) + '"><img src="' + face + '" alt="" loading="lazy" onerror="this.src=\'assets/icon.png\'"><span class="nm">' + esc(name) + '</span></a>';
        }).join('');
      }
    }).catch(function () {
      var pill = $id('stPill'); if (pill) { pill.textContent = '● 离线'; pill.className = 'status-pill off'; }
      var on = $id('stOnline'); if (on) on.textContent = '0';
      var motd = $id('stMotd'); if (motd) motd.textContent = '无法获取服务器状态（请检查网络）';
      var pg = $id('stPlayers'); if (pg) pg.innerHTML = emptyState('🕹️', '服务器离线或不可达');
    });
  }

  /* --- 玩家查询页（皮肤 + 在线状态，纯静态） --- */
  function renderPlayers(container) {
    container.innerHTML = pageHead('玩家', '玩家查询', '输入游戏 ID，查看皮肤与在线状态');
    var box = el('div', 'card'); container.appendChild(box);
    box.innerHTML = '<div style="display:flex;gap:10px;margin-bottom:18px">' +
      '<input id="plName" type="text" maxlength="16" placeholder="输入游戏 ID（如 Steve）" style="flex:1;min-width:0;padding:11px 14px;border:1px solid var(--border);border-radius:10px;background:var(--muted);color:var(--foreground);font-size:14px;font-family:inherit;outline:none">' +
      '<button class="btn btn-primary" id="plGo">查询</button></div>' +
      '<div id="plResult"></div>';
    var input = box.querySelector('#plName');
    function go() {
      var name = input.value.trim();
      if (!name) { toast('请输入游戏 ID'); return; }
      renderPlayerResult(box.querySelector('#plResult'), name);
    }
    box.querySelector('#plGo').addEventListener('click', go);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    // 支持 ?q= 参数（可从状态页在线列表点进来）
    var q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; go(); }
  }
  function renderPlayerResult(area, name) {
    var enc = encodeURIComponent(name);
    var helm = 'https://minotar.net/helm/' + enc + '/128.png';
    var body = 'https://mc-heads.net/body/' + enc + '/right';
    area.innerHTML =
      '<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">' +
      '<div style="text-align:center">' +
      '<img src="' + helm + '" alt="' + esc(name) + ' 头像" style="width:96px;height:96px;border-radius:12px;background:var(--muted);image-rendering:pixelated" onerror="this.src=\'assets/icon.png\'">' +
      '<div style="font-size:13px;color:var(--muted-foreground);margin-top:8px">头像</div></div>' +
      '<div style="text-align:center">' +
      '<img src="' + body + '" alt="' + esc(name) + ' 全身皮肤" style="height:240px;background:var(--muted);border-radius:8px;image-rendering:pixelated" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\'">' +
      '<div style="display:none;padding:60px 20px;color:var(--muted-foreground);font-size:13px">皮肤加载失败（离线服玩家可能无正版皮肤）</div>' +
      '<div style="font-size:13px;color:var(--muted-foreground);margin-top:8px">正装皮肤</div></div>' +
      '<div style="flex:1;min-width:200px">' +
      '<div style="font-size:20px;font-weight:800;margin-bottom:8px">' + esc(name) + '</div>' +
      '<div id="plOnline" style="font-size:13.5px;color:var(--muted-foreground)">在线状态：检测中…</div>' +
      '<div style="margin-top:14px;font-size:13px;color:var(--muted-foreground);line-height:1.8">皮肤由 Mojang 公开接口渲染；离线服玩家可能显示默认皮肤（Steve / Alex）。</div>' +
      '</div></div>';
    // 在线判断（从服务器状态玩家列表匹配）
    var url = STATUS_API.replace('{host}', JAVA_HOST).replace('{port}', JAVA_PORT);
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var list = (d && d.players && d.players.list) || [];
      var on = list.some(function (n) {
        var nm = (typeof n === 'string') ? n : (n.name || '');
        return nm && nm.toLowerCase() === name.toLowerCase();
      });
      var cell = $id('plOnline');
      if (cell) {
        cell.textContent = '在线状态：' + (on ? '● 在线' : '○ 离线（或当前不在线）');
        cell.style.color = on ? 'var(--primary)' : 'var(--muted-foreground)';
      }
    }).catch(function () {
      var cell = $id('plOnline');
      if (cell) cell.textContent = '在线状态：无法获取';
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
  var routes = {
    '/': renderHome,
    '/status': renderStatus,
    '/players': renderPlayers,
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
    var r = resolve(location.hash);
    var main = $id('main');
    if (!main) return;
    var path = (location.hash || '#/').replace(/^#/, '');
    if (!path) path = '/';
    renderNav(path);
    r.page(main, r.param);
    window.scrollTo(0, 0);
  }

  function init() {
    initTheme();
    $id('footerYear').textContent = new Date().getFullYear();
    window.addEventListener('hashchange', render);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
