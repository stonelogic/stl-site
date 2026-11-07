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
      '<p class="hero-tagline">' + esc(SITE.tagline) + '</p>' +
      '<p class="hero-slogan">' + esc(SITE.slogan) + '</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="' + SITE.groupUrl + '" target="_blank" rel="noopener">加入 QQ 群</a>' +
      '<a class="btn btn-outline" href="#/online">查看在线玩家</a>' +
      '</div>' +
      '<div><span class="hero-ip">' + esc(SITE.javaIp) + '</span></div>' +
      '</div><div class="hero-glow"></div>';
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

  /* 从 ntfy 读取本地同步脚本发布的在线玩家名单（SSE 流，since=all 取历史） */
  function loadOnlineInto(pg, ok, now) {
    if (!pg) return;
    pg.innerHTML = '<div class="empty"><div class="ico">⏳</div><p>正在获取在线玩家…</p></div>';
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
      if (m && Array.isArray(m.players)) {
        got = true;
        renderPlayerGrid(pg, m.players, ok);
      }
    };
    es.onerror = function () { es.close(); if (!got) renderEmpty(pg, ok, now); };
    setTimeout(function () { es.close(); if (!got) renderEmpty(pg, ok, now); }, 2500);
  }
  function renderPlayerGrid(pg, players, ok) {
    if (!players || !players.length) {
      pg.innerHTML = emptyState('🕹️', ok ? '暂无在线玩家' : '服务器离线');
      return;
    }
    pg.innerHTML = players.map(function (name) {
      var face = 'https://minotar.net/helm/' + encodeURIComponent(name) + '/96.png';
      return '<div class="player-cell"><img src="' + face + '" alt="" loading="lazy" onerror="this.src=\'assets/icon.png\'"><span class="nm">' + esc(name) + '</span></div>';
    }).join('');
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
              '<img src="https://minotar.net/helm/' + encodeURIComponent(p.name) + '/40.png" alt="" loading="lazy" style="width:36px;height:36px;border-radius:8px;background:var(--muted);flex:none" onerror="this.src=\'assets/icon.png\'">' +
              '<div style="flex:1;min-width:0">' +
              '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-weight:700;font-size:15px">' + esc(p.name) + '</span>' + subHtml + '</div>' +
              '<div style="margin-top:6px;height:8px;border-radius:6px;background:var(--muted);overflow:hidden">' +
              '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary),oklch(62% .14 160));border-radius:6px"></div></div>' +
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
              '<td><div style="display:flex;align-items:center;gap:8px"><img src="https://minotar.net/helm/' + encodeURIComponent(p.name) + '/32.png" alt="" loading="lazy" style="width:26px;height:26px;border-radius:6px;background:var(--muted)" onerror="this.src=\'assets/icon.png\'"><span style="font-weight:700">' + esc(p.name) + '</span></div></td>' +
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

  function init() {
    initTheme();
    $id('footerYear').textContent = new Date().getFullYear();
    window.addEventListener('hashchange', render);
    loadConfig(render);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
