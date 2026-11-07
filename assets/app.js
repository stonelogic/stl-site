/* ===========================================================
   Stone Logic 官网 · 页面逻辑（mcnova 风格 SPA）
   hash 路由 + 各功能页渲染 + 深浅色主题 + 后端 API 对接
   =========================================================== */
(function () {
  'use strict';

  /* ---------- 可配置项 ---------- */
  // 后端内容 API 基地址（樱花 frp 隧道，指向 quicklogin-service 28080）
  // 留空则论坛/商店/经济等需要后端的页面显示「未连接」空态
  var API_BASE = (function () {
    try { return localStorage.getItem('stl_api_base') || ''; } catch (e) { return ''; }
  })();

  var STATUS_API = 'https://www.mclists.cn/api/server-status/?host={host}&port={port}';
  var JAVA_HOST = 'frp-top.com';
  var JAVA_PORT = '44558';

  /* ---------- 站点配置（静态文案，可后续接后端） ---------- */
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
  function $(sel) { return document.querySelector(sel); }
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
  function fmtTime(ts) {
    if (!ts) return '—';
    var d = new Date(Number(ts));
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function fmtDur(sec) {
    sec = Number(sec) || 0;
    if (sec < 60) return sec + ' 秒';
    if (sec < 3600) return Math.floor(sec / 60) + ' 分钟';
    if (sec < 86400) return Math.floor(sec / 3600) + ' 小时 ' + Math.floor((sec % 3600) / 60) + ' 分';
    return Math.floor(sec / 86400) + ' 天 ' + Math.floor((sec % 86400) / 3600) + ' 小时';
  }
  function api(path) {
    return fetch(API_BASE + path, { headers: { 'accept': 'application/json' } }).then(function (r) { return r.json(); });
  }
  function apiPost(path, obj) {
    return fetch(API_BASE + path, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj)
    }).then(function (r) { return r.json(); });
  }
  function hasBackend() { return !!API_BASE; }
  function session() {
    try { return window.__stlSession ? window.__stlSession() : null; } catch (e) { return null; }
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
    { label: '论坛', href: '#/forum' },
    { label: '商店', href: '#/store' },
    { label: '赛事', href: '#/tournaments' },
    { label: '经济', href: '#/economy' },
    { label: '成就', href: '#/achievements' },
    { label: '建筑', href: '#/builds' },
    { label: '指南', href: '#/guide' },
    { label: '规则', href: '#/rules' },
    { label: '申诉', href: '#/appeal' }
  ];
  function renderNav(activePath) {
    var nav = $id('navMain');
    if (!nav) return;
    nav.innerHTML = NAV.map(function (n) {
      var path = n.href.replace('#', '') || '/status';
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
  function backendRequired() {
    return emptyState('🔌', '该功能需要连接服务器后端。当前未配置 API 地址，管理员可在控制台设置。');
  }

  /* ================= 各页面 ================= */

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
          return '<div class="player-cell"><img src="' + face + '" alt="" loading="lazy" onerror="this.src=\'assets/icon.png\'"><span class="nm">' + esc(name) + '</span></div>';
        }).join('');
      }
    }).catch(function () {
      var pill = $id('stPill'); if (pill) { pill.textContent = '● 离线'; pill.className = 'status-pill off'; }
      var on = $id('stOnline'); if (on) on.textContent = '0';
      var motd = $id('stMotd'); if (motd) motd.textContent = '无法获取服务器状态（请检查网络）';
      var pg = $id('stPlayers'); if (pg) pg.innerHTML = emptyState('🕹️', '服务器离线或不可达');
    });
  }

  /* --- 论坛页 --- */
  var forumCat = null;
  function renderForum(container, param) {
    if (param && param.startsWith('post/')) { renderForumPost(container, param.slice(5)); return; }
    container.innerHTML = pageHead('社区', '论坛', '发帖讨论、求助、交易，畅所欲言');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var lay = el('div', 'forum-layout');
    lay.innerHTML = '<div class="cat-list" id="catList"></div><div><div id="postArea"></div></div>';
    container.appendChild(lay);
    loadForum();
  }
  function loadForum() {
    api('/api/forum/categories').then(function (cats) {
      var cl = $id('catList');
      if (!cl) return;
      cl.innerHTML = '<div class="cat-item' + (forumCat == null ? ' active' : '') + '" data-cat=""><span class="dot" style="background:var(--primary)"></span>全部</div>' +
        (cats || []).map(function (c) {
          return '<div class="cat-item' + (forumCat === c.id ? ' active' : '') + '" data-cat="' + c.id + '"><span class="dot" style="background:' + esc(c.color) + '"></span>' + esc(c.name) + '</div>';
        }).join('');
      cl.querySelectorAll('.cat-item').forEach(function (it) {
        it.addEventListener('click', function () {
          forumCat = it.getAttribute('data-cat') ? Number(it.getAttribute('data-cat')) : null;
          cl.querySelectorAll('.cat-item').forEach(function (x) { x.classList.remove('active'); });
          it.classList.add('active');
          loadPosts();
        });
      });
      loadPosts();
    }).catch(function () { var cl = $id('catList'); if (cl) cl.innerHTML = emptyState('⚠️', '无法连接后端'); });
  }
  function loadPosts() {
    var area = $id('postArea');
    if (!area) return;
    var url = '/api/forum/posts' + (forumCat ? '?category=' + forumCat : '');
    area.innerHTML = '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><a class="btn btn-primary btn-sm" href="#/forum/new">+ 发帖</a></div><div class="post-list" id="postList"></div>';
    api(url).then(function (posts) {
      var pl = $id('postList');
      if (!pl) return;
      if (!posts || !posts.length) { pl.innerHTML = emptyState('📝', '还没有帖子，来发第一帖吧'); return; }
      pl.innerHTML = posts.map(function (p) {
        var avatar = p.author_name ? String(p.author_name).slice(0, 1).toUpperCase() : '?';
        return '<a class="post-card" href="#/forum/post/' + p.id + '">' +
          '<div class="avatar">' + esc(avatar) + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<div class="meta"><span class="badge badge-muted">' + esc(p.category_name) + '</span><span>' + esc(p.author_name || '匿名') + '</span><span>' + fmtTime(p.created_at) + '</span><span>💬 ' + (p.reply_count || 0) + '</span><span>👁 ' + (p.views || 0) + '</span></div>' +
          '</div></a>';
      }).join('');
    }).catch(function () { var pl = $id('postList'); if (pl) pl.innerHTML = emptyState('⚠️', '无法连接后端'); });
  }
  function renderForumPost(container, id) {
    container.innerHTML = pageHead('<a href="#/forum">论坛</a>', '帖子', '');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var box = el('div', 'card'); container.appendChild(box);
    api('/api/forum/post/' + id).then(function (p) {
      if (!p || p.error) { box.innerHTML = emptyState('📭', '帖子不存在或已删除'); return; }
      var avatar = p.author_name ? String(p.author_name).slice(0, 1).toUpperCase() : '?';
      box.innerHTML = '<div class="meta" style="font-size:12.5px;color:var(--muted-foreground);display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">' +
        '<span class="badge badge-muted">' + esc(p.category_name) + '</span><span>' + esc(p.author_name || '匿名') + '</span><span>' + fmtTime(p.created_at) + '</span><span>👁 ' + (p.views || 0) + '</span></div>' +
        '<h2 style="margin:0 0 14px;font-size:22px">' + esc(p.title) + '</h2>' +
        '<div class="post-body">' + esc(p.content) + '</div>' +
        '<hr style="border:0;border-top:1px solid var(--border);margin:20px 0">' +
        '<div style="font-size:15px;font-weight:700;margin-bottom:12px">回复（' + (p.replies ? p.replies.length : 0) + '）</div>' +
        '<div id="replyList">' + ((p.replies || []).map(function (r) {
          return '<div style="padding:12px;border:1px solid var(--border);border-radius:10px;margin-bottom:10px"><div style="font-size:12.5px;color:var(--muted-foreground);margin-bottom:6px">' + esc(r.author_name || '匿名') + ' · ' + fmtTime(r.created_at) + '</div><div style="font-size:14px">' + esc(r.content) + '</div></div>';
        }).join('') || emptyState('💬', '还没有回复')) + '</div>' +
        '<div class="field" style="margin-top:16px"><textarea id="replyInput" placeholder="写下你的回复…"></textarea></div>' +
        '<button class="btn btn-primary" id="replyBtn">发表回复</button>';
      box.querySelector('#replyBtn').addEventListener('click', function () {
        var s = session();
        if (!s) { toast('请先登录再回复'); return; }
        var content = box.querySelector('#replyInput').value.trim();
        if (!content) { toast('回复内容不能为空'); return; }
        apiPost('/api/forum/reply', { token: s.token, post_id: Number(id), content: content, author_name: s.qq }).then(function (r) {
          if (r.error) { toast('回复失败：' + r.error); return; }
          toast('回复成功'); box.querySelector('#replyInput').value = '';
          renderForumPost(container, id);
        }).catch(function () { toast('回复失败：网络错误'); });
      });
    }).catch(function () { box.innerHTML = emptyState('⚠️', '无法连接后端'); });
  }
  function renderForumNew(container) {
    container.innerHTML = pageHead('<a href="#/forum">论坛</a>', '发新帖', '');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var box = el('div', 'card'); box.innerHTML = '<div id="newCatWrap"></div>' +
      '<div class="field"><label>标题</label><input id="postTitle" type="text" maxlength="80" placeholder="一句话说清主题"></div>' +
      '<div class="field"><label>内容</label><textarea id="postContent" style="min-height:160px" placeholder="详细描述…"></textarea></div>' +
      '<button class="btn btn-primary" id="postSubmit">发布</button>';
    container.appendChild(box);
    api('/api/forum/categories').then(function (cats) {
      var w = $id('newCatWrap');
      if (w) w.innerHTML = '<div class="field"><label>分类</label><select id="postCat">' + (cats || []).map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select></div>';
    });
    box.querySelector('#postSubmit').addEventListener('click', function () {
      var s = session();
      if (!s) { toast('请先登录再发帖'); return; }
      var title = box.querySelector('#postTitle').value.trim();
      var content = box.querySelector('#postContent').value.trim();
      if (!title) { toast('标题不能为空'); return; }
      if (!content) { toast('内容不能为空'); return; }
      var cat = box.querySelector('#postCat') ? Number(box.querySelector('#postCat').value) : 1;
      apiPost('/api/forum/post', { token: s.token, category_id: cat, title: title, content: content, author_name: s.qq }).then(function (r) {
        if (r.error) { toast('发布失败：' + r.error); return; }
        toast('发布成功'); location.hash = '#/forum/post/' + r.id;
      }).catch(function () { toast('发布失败：网络错误'); });
    });
  }

  /* --- 商店页 --- */
  function renderStore(container) {
    container.innerHTML = pageHead('商店', '商店', '点券、道具与特权，支持在线购买');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var grid = el('div', 'grid grid-3'); grid.id = 'storeGrid'; container.appendChild(grid);
    api('/api/store/items').then(function (items) {
      if (!items || !items.length) { grid.innerHTML = emptyState('🛒', '商店暂时没有上架商品'); return; }
      grid.innerHTML = items.map(function (it) {
        return '<div class="store-item">' +
          '<div class="ico">' + esc(it.icon || '🎁') + '</div>' +
          '<div class="nm">' + esc(it.name) + '</div>' +
          '<div class="desc">' + esc(it.description || '') + '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between">' +
          '<div class="price">' + (it.price > 0 ? '¥' + it.price : '免费') + '</div>' +
          '<button class="btn btn-primary btn-sm" data-item="' + it.id + '">购买</button></div></div>';
      }).join('');
      grid.querySelectorAll('[data-item]').forEach(function (b) {
        b.addEventListener('click', function () {
          var s = session();
          if (!s) { toast('请先登录再购买'); return; }
          apiPost('/api/store/order', { token: s.token, item_id: Number(b.getAttribute('data-item')), amount: 1, buyer_name: s.qq }).then(function (r) {
            if (r.error) { toast('下单失败：' + r.error); return; }
            toast('已下单：' + r.item + '（待管理员处理）');
          }).catch(function () { toast('下单失败：网络错误'); });
        });
      });
    }).catch(function () { grid.innerHTML = emptyState('⚠️', '无法连接后端'); });
  }

  /* --- 赛事页 --- */
  function renderTournaments(container) {
    container.innerHTML = pageHead('活动', '赛事与活动', '服务器常驻与季节活动');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var grid = el('div', 'grid grid-2'); container.appendChild(grid);
    api('/api/tournaments').then(function (list) {
      if (!list || !list.length) { grid.innerHTML = emptyState('🏆', '暂无进行中的赛事'); return; }
      grid.innerHTML = list.map(function (t) {
        var st = t.status === 'ongoing' ? '进行中' : t.status === 'upcoming' ? '即将开始' : '已结束';
        var badge = t.status === 'ongoing' ? 'badge-green' : t.status === 'upcoming' ? 'badge-gold' : 'badge-muted';
        return '<div class="card card-hover"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h3 style="margin:0;font-size:17px">' + esc(t.title) + '</h3><span class="badge ' + badge + '">' + st + '</span></div>' +
          '<p style="color:var(--muted-foreground);font-size:13.5px;margin:0 0 10px">' + esc(t.description || '') + '</p>' +
          '<div style="font-size:12.5px;color:var(--muted-foreground)">' + fmtTime(t.start_at) + ' ~ ' + fmtTime(t.end_at) + '</div>' +
          (t.reward ? '<div style="margin-top:8px;font-size:13px;color:var(--gold)">奖励：' + esc(t.reward) + '</div>' : '') +
          '</div>';
      }).join('');
    }).catch(function () { grid.innerHTML = emptyState('⚠️', '无法连接后端'); });
  }

  /* --- 经济页 --- */
  function renderEconomy(container) {
    container.innerHTML = pageHead('经济', '经济系统', '查询你的点券余额与交易记录');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var box = el('div', 'card'); container.appendChild(box);
    var s = session();
    if (!s) { box.innerHTML = emptyState('🔑', '请先登录后查看你的余额'); return; }
    box.innerHTML = '<div style="font-size:14px;color:var(--muted-foreground)">当前登录 QQ：' + esc(s.qq) + '</div>' +
      '<div style="font-size:40px;font-weight:800;color:var(--primary);margin:10px 0" id="balVal">—</div>' +
      '<div style="font-size:13px;color:var(--muted-foreground)">点券余额</div>';
    api('/api/economy/balance/' + encodeURIComponent(s.qq)).then(function (r) {
      var v = $id('balVal'); if (v) v.textContent = (r && r.balance != null) ? r.balance : '0';
    });
  }

  /* --- 成就页 --- */
  function renderAchievements(container) {
    container.innerHTML = pageHead('成就', '成就', '达成条件即可解锁成就');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var grid = el('div', 'grid grid-3'); container.appendChild(grid);
    api('/api/achievements').then(function (list) {
      if (!list || !list.length) { grid.innerHTML = emptyState('🏅', '暂无成就'); return; }
      grid.innerHTML = list.map(function (a) {
        return '<div class="card" style="text-align:center"><div style="font-size:34px">' + esc(a.icon || '🏅') + '</div><div style="font-weight:700;margin-top:8px">' + esc(a.name) + '</div><div style="font-size:13px;color:var(--muted-foreground);margin-top:6px">' + esc(a.description || '') + '</div></div>';
      }).join('');
    }).catch(function () { grid.innerHTML = emptyState('⚠️', '无法连接后端'); });
  }

  /* --- 建筑页 --- */
  function renderBuilds(container) {
    container.innerHTML = pageHead('建筑', '建筑欣赏', '玩家们的优秀建筑作品');
    if (!hasBackend()) { container.innerHTML += backendRequired(); return; }
    var grid = el('div', 'grid grid-3'); container.appendChild(grid);
    api('/api/builds').then(function (list) {
      if (!list || !list.length) { grid.innerHTML = emptyState('🏛️', '暂无建筑作品'); return; }
      grid.innerHTML = list.map(function (b) {
        return '<div class="card card-hover"><div style="font-weight:700;font-size:16px">' + esc(b.title) + '</div>' +
          '<div style="font-size:13px;color:var(--muted-foreground);margin:8px 0">' + esc(b.description || '') + '</div>' +
          '<div style="font-size:12.5px;color:var(--muted-foreground)">作者：' + esc(b.author || '匿名') + (b.world ? ' · ' + esc(b.world) : '') + '</div></div>';
      }).join('');
    }).catch(function () { grid.innerHTML = emptyState('⚠️', '无法连接后端'); });
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

  /* --- 申诉页 --- */
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

  /* --- 关于/首页介绍 --- */
  function renderAbout(container) {
    container.innerHTML = pageHead('', SITE.name, SITE.tagline);
    var hero = el('div', 'card'); container.appendChild(hero);
    hero.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:8px">' +
      '<span class="badge badge-green">Java 版</span>' +
      '<code style="font-size:15px;font-weight:700">' + esc(SITE.javaIp) + '</code>' +
      '<a class="btn btn-outline btn-sm" href="' + SITE.groupUrl + '" target="_blank" rel="noopener">加入 QQ 群</a>' +
      '</div>' +
      '<p style="color:var(--muted-foreground);font-size:14px;line-height:1.8;margin:12px 0 0">' +
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

  /* ================= 路由 ================= */
  var routes = {
    '/status': renderStatus,
    '/forum': renderForum,
    '/forum/new': renderForumNew,
    '/store': renderStore,
    '/tournaments': renderTournaments,
    '/economy': renderEconomy,
    '/achievements': renderAchievements,
    '/builds': renderBuilds,
    '/guide': renderGuide,
    '/rules': renderRules,
    '/appeal': renderAppeal
  };

  function resolve(hash) {
    var path = (hash || '#/status').replace(/^#/, '');
    if (!path) path = '/status';
    // 论坛帖子 /forum/post/:id
    if (path.startsWith('/forum/post/')) return { page: renderForum, param: 'post/' + path.slice('/forum/post/'.length) };
    if (path === '/forum/new') return { page: renderForumNew, param: '' };
    if (routes[path]) return { page: routes[path], param: '' };
    return { page: renderStatus, param: '' };
  }

  function render() {
    var r = resolve(location.hash);
    var main = $id('main');
    if (!main) return;
    // 同步导航高亮
    var path = (location.hash || '#/status').replace(/^#/, '');
    if (path === '/forum/new' || path.startsWith('/forum/post/')) path = '/forum';
    renderNav(path || '/status');
    if (r.param) r.page(main, r.param); else r.page(main);
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
