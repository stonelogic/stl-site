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
      { name: 'xiaoran8083', roles: [{ t: '管理', c: 'red' }] }
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
  var TICK = 15000;   // 状态刷新间隔。数据源本身每分钟才更新一次，5 秒一问纯属浪费
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

  /* ===========================================================
     服务器状态数据源
     -----------------------------------------------------------
     主数据源是仓库里的 online.json（tools/export_online.py 每分钟经 RCON 导出）。
     它和页面同源、无跨域、无第三方依赖，是我们能控制的那一份。

     以前主数据源是第三方 mclists 接口，2026-11 起它开始稳定返回
     {"status":"error"}，导致首页徽标永远卡在「状态检测中…」——
     只有点进「状态」页（读的是 online.json）才看得到真实状态。

     所以现在把两者职责分开：
       · 在线与否 / 人数 —— 只信 online.json，绝不受第三方影响
       · 延迟 / 版本 / MOTD —— 第三方能给就给（pollExtras），给不了显示「—」
     =========================================================== */
  var SNAPSHOT_URL = 'online.json';   // 自有快照

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
    var p = d.players || {};
    if (isOn || LIVE.ok === false) {
      LIVE.now = Number(p.now) || 0;
    }
    // 人数上限来自 online.json（第三方接口给的是脏值）
    if (Number(p.max)) LIVE.max = Number(p.max);
    if (d.snapTs) LIVE.snapTs = d.snapTs;
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
    fetch(SNAPSHOT_URL + '?_=' + Date.now(), opts)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d || typeof d.online !== 'boolean') throw new Error('bad payload');
        /* 导出脚本在名单没变化时只按 20 分钟心跳刷时间戳，所以 30 分钟内的
           快照都算可信；超过就拿不准了 —— 宁可显示「检测中」，也别硬说在线。 */
        var up = Number(d.updated) || 0;
        if (up && (Date.now() / 1000 - up) > 1800) throw new Error('snapshot too old');
        // 换成 applyLive 认识的结构；TPS/内存等字段一并带过去，页面别处可以直接用
        applyLive({
          online: !!d.online,
          players: { now: Number(d.now) || 0, max: Number(d.max) || 0 },
          tps: d.tps15, tps1: d.tps1, mem: d.mem, uptime: d.uptime,
          restart: d.restart, snapTs: String(d.ts || '')
        });
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

  /* 第三方富信息（延迟 / 版本 / MOTD）：只做锦上添花，绝不参与在线判定。
     接口挂了或超时就静默放弃，徽标照常显示 online.json 的状态。 */
  var extrasBusy = false, extrasAt = 0;
  function pollExtras() {
    if (extrasBusy || Date.now() - extrasAt < 60000) return;   // 一分钟最多问一次
    extrasBusy = true; extrasAt = Date.now();
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    var opts = ctrl ? { signal: ctrl.signal, cache: 'no-store' } : { cache: 'no-store' };
    fetch(liveUrl() + '&_=' + Date.now(), opts)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (x) {
        var d = x && x.data;
        if (!d) return;
        var touched = false;
        if (typeof d.latency === 'number' && d.latency > 0) { LIVE.ping = d.latency; touched = true; }
        if (d.version || d.name) { LIVE.ver = d.version || d.name; touched = true; }
        var m = typeof d.description === 'string' ? d.description
          : (d.description && d.description.text ? d.description.text : '');
        if (m) { LIVE.motd = m; touched = true; }
        if (touched && typeof LIVE.onUpdate === 'function') LIVE.onUpdate();
      })
      .catch(function () {})
      .then(function () { clearTimeout(to); extrasBusy = false; });
  }

  /* 单一心跳；失败次数越多间隔越长（最多 60 秒），页面隐藏时停手 */
  function startLiveTicker() {
    if (LIVE.timer) clearTimeout(LIVE.timer);
    function step() {
      if (!document.hidden) { pollLive(); pollExtras(); }
      var delay = LIVE.fail >= 3 ? Math.min(60000, TICK * Math.pow(2, LIVE.fail - 2)) : TICK;
      LIVE.timer = setTimeout(step, delay);
    }
    step();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) pollLive();   // 切回前台立刻补一次，不用等下一个周期
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

  /* QQ 号 → QQ 头像 */
  function qqAvatar(qq, size) {
    return 'https://q1.qlogo.cn/g?b=qq&nk=' + encodeURIComponent(qq) + '&s=' + (size || 100);
  }

  /* 论坛署名是登录的 QQ（形如「QQ 1477211972」），头像就取 QQ 头像；
     其它老帖子还是按游戏 ID 找 MC 头像 */
  function forumAvatar(author, size) {
    var m = /^QQ\s*(\d{5,12})$/.exec(String(author || '').trim());
    if (m) return qqAvatar(m[1], size || 100);
    return avatarUrl(author, size);
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
    { label: '公告', href: '#/news' },
    { label: 'Wiki', href: '#/wiki' },
    { label: '申诉', href: '#/appeal' },
    { label: '我的', href: '#/me' }
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
    refreshHeroFlakes();        // 在线玩家 → 雪花
    LIVE.onUpdate = refreshHeroFlakes;   // 跟着心跳同步增减
  }

  /* ===========================================================
     在线玩家雪花
     -----------------------------------------------------------
     每个在线玩家 = 一朵雪花，在 Hero 里绕着不规则的缓慢轨迹飘。
     鼠标悬停看资料卡，点击进玩家主页（#/p/<name>）。

     轨迹用「角度由两个不同频率的正弦叠加」来生成：
       ang = base + sin(t*f1)*.9 + sin(t*f2+p)*.6
     比帧间随机抖动顺滑，又不会退化成直线（纯随机游走会）。
     撞到边界时把 base 做镜像翻转，雪花就在框内来回飘，不会瞬移。
     =========================================================== */
  var FLAKES = { wrap: null, items: [], raf: 0, last: 0, tip: null, hovered: null };

  /* 雪花图形：同一条路径画两遍 —— 先粗一圈深色当前景描边，再压一条白色。
     这样无论是在顶部深蓝处还是底部接近白色的天空里都看得清，
     比单纯 drop-shadow 稳。 */
  var SNOW_SVG = (function () {
    var p = '';
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      var x = 12 + Math.cos(a) * 10.1, y = 12 + Math.sin(a) * 10.1;
      p += '<line x1="12" y1="12" x2="' + x.toFixed(2) + '" y2="' + y.toFixed(2) + '"/>';
      // 每条主枝在中段分出两片小枝，像真雪花
      var bx = 12 + Math.cos(a) * 6.3, by = 12 + Math.sin(a) * 6.3;
      [a - 0.62, a + 0.62].forEach(function (na) {
        var ex = bx + Math.cos(na) * 3.0, ey = by + Math.sin(na) * 3.0;
        p += '<line x1="' + bx.toFixed(2) + '" y1="' + by.toFixed(2) + '" x2="' + ex.toFixed(2) + '" y2="' + ey.toFixed(2) + '"/>';
      });
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round">' +
      '<g stroke="rgba(8,42,70,.42)" stroke-width="3.7">' + p + '</g>' +
      '<g stroke="currentColor" stroke-width="1.45">' + p + '</g></svg>';
  })();

  function rand(a, b) { return a + Math.random() * (b - a); }

  function snowTipEl() {
    if (FLAKES.tip) return FLAKES.tip;
    var t = el('div', 'snow-tip');
    document.body.appendChild(t);
    FLAKES.tip = t;
    return t;
  }

  /* 在线时长 / 起床战绩只为了资料卡里那行小字，取到一次就缓存 */
  var PLAYER_SNIP = {};
  function loadPlayerSnip() {
    if (PLAYER_SNIP.ready) return;
    PLAYER_SNIP.ready = true;
    fetch('playtime.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        ((d && d.players) || []).forEach(function (p) {
          // 两个请求谁先回来不一定，这里必须合并而不是覆盖
          var k = String(p.name).toLowerCase();
          var e = PLAYER_SNIP[k] || (PLAYER_SNIP[k] = {});
          e.rank = p.rank; e.total = p.total;
        });
      })
      .catch(function () {});
    fetch('bedwars.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        ((d && d.players) || []).forEach(function (p) {
          var k = String(p.name).toLowerCase();
          var e = PLAYER_SNIP[k] || (PLAYER_SNIP[k] = {});
          e.bwScore = p.score;
          e.bwRank = p.rank;
        });
      })
      .catch(function () {});
  }

  function showSnowTip(fl) {
    var name = fl.name;
    var t = snowTipEl();
    var snip = PLAYER_SNIP[name.toLowerCase()] || {};
    var sub = [];
    if (snip.rank) sub.push('在线时长第 ' + snip.rank + ' 名 · ' + fmtDur(snip.total));
    if (snip.bwScore != null) sub.push('起床积分 ' + snip.bwScore);
    t.innerHTML =
      '<img src="' + avatarUrl(name, 38) + '" alt="" onerror="this.onerror=null;this.src=\'' + identicon(name) + '\'">' +
      '<div><div class="t-nm">' + esc(name) + '</div>' +
      '<div class="t-sub">' + esc(sub.length ? sub.join(' · ') : '此刻在线') + '</div>' +
      '<div class="t-go">点击查看玩家主页 →</div></div>';
    t.classList.add('show');
    positionSnowTip(fl);
  }

  function positionSnowTip(fl) {
    var t = FLAKES.tip;
    if (!t) return;
    var r = fl.el.getBoundingClientRect();
    var tw = t.offsetWidth, th = t.offsetHeight;
    var x = r.left + r.width / 2 - tw / 2;
    var y = r.top - th - 10;
    if (y < 8) y = r.bottom + 10;                       // 上方放不下就翻到下面
    x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
    t.style.left = Math.round(x) + 'px';
    t.style.top = Math.round(y) + 'px';
  }

  function hideSnowTip() {
    if (FLAKES.tip) FLAKES.tip.classList.remove('show');
  }

  function addFlake(name) {
    var wrap = FLAKES.wrap;
    if (!wrap) return;
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (w < 80 || h < 80) return;

    var size = Math.round(rand(16, 29));
    var el2 = document.createElement('a');
    el2.className = 'snow';
    el2.href = '#/p/' + encodeURIComponent(name);
    el2.setAttribute('aria-label', name + '（点击查看玩家主页）');
    el2.style.width = el2.style.height = size + 'px';
    el2.innerHTML = SNOW_SVG;

    var fl = {
      name: name, el: el2,
      x: rand(0, w - size), y: rand(0, h - size),
      base: rand(0, Math.PI * 2),
      f1: rand(0.22, 0.42), f2: rand(0.55, 0.95), p: rand(0, Math.PI * 2),
      sp: rand(7, 17),                 // px/s，慢
      spin: rand(-14, 14),             // deg/s
      t: rand(0, 40), size: size
    };
    // 出生点尽量别落在中间文字区里（重生 12 次都撞上就直接放行，由运行时推开）
    var zone = heroZone();
    if (zone) {
      for (var k = 0; k < 12; k++) {
        var mx = fl.x + size / 2, my = fl.y + size / 2;
        if (!(mx > zone.x0 && mx < zone.x1 && my > zone.y0 && my < zone.y1)) break;
        fl.x = rand(0, w - size); fl.y = rand(0, h - size);
      }
    }
    el2.addEventListener('mouseenter', function () { FLAKES.hovered = fl; showSnowTip(fl); });
    el2.addEventListener('focus', function () { FLAKES.hovered = fl; showSnowTip(fl); });
    el2.addEventListener('mouseleave', function () { if (FLAKES.hovered === fl) FLAKES.hovered = null; hideSnowTip(); });
    el2.addEventListener('blur', function () { if (FLAKES.hovered === fl) FLAKES.hovered = null; hideSnowTip(); });
    // 点击后立刻收起资料卡，否则会跟着旧页面留在屏幕上
    el2.addEventListener('click', function () { hideSnowTip(); });
    wrap.appendChild(el2);
    FLAKES.items.push(fl);
    fl.el.style.transform = 'translate3d(' + fl.x.toFixed(1) + 'px,' + fl.y.toFixed(1) + 'px,0) rotate(' + (fl.t * fl.spin / 10).toFixed(1) + 'deg)';
  }

  function syncFlakes(names) {
    if (!FLAKES.wrap) return;
    var want = {};
    (names || []).forEach(function (n) { want[String(n).toLowerCase()] = String(n); });
    // 下线的收走
    for (var i = FLAKES.items.length - 1; i >= 0; i--) {
      if (!want[FLAKES.items[i].name.toLowerCase()]) {
        FLAKES.items[i].el.remove();
        FLAKES.items.splice(i, 1);
      }
    }
    // 新来的补上（已在场的保持原位置，不要跳）
    var have = {};
    FLAKES.items.forEach(function (it) { have[it.name.toLowerCase()] = 1; });
    Object.keys(want).forEach(function (k) { if (!have[k]) addFlake(want[k]); });
    if (!FLAKES.items.length) hideSnowTip();
  }

  /* Hero 中间那块文字（标题/标语/地址/在线人数）在雪花层里的坐标。
     雪花绕开它走，别糊在大标题上像渲染错误。 */
  function heroZone() {
    var wrap = FLAKES.wrap;
    if (!wrap) return null;
    var sky = document.querySelector('.hero-sky');
    if (!sky) return null;
    var wr = wrap.getBoundingClientRect(), sr = sky.getBoundingClientRect();
    if (!wr.width || !wr.height || !sr.width) return null;
    return {
      x0: sr.left - wr.left - 6, y0: sr.top - wr.top - 6,
      x1: sr.right - wr.left + 6, y1: sr.bottom - wr.top + 6
    };
  }

  function stepFlakes(ts) {
    var wrap = FLAKES.wrap;
    if (!wrap || !document.body.contains(wrap)) { FLAKES.raf = 0; return; }
    var dt = Math.min(64, ts - (FLAKES.last || ts)) / 1000;
    FLAKES.last = ts;
    if (!document.hidden && dt > 0) {
      var w = wrap.clientWidth, h = wrap.clientHeight;
      var zone = heroZone();
      FLAKES.items.forEach(function (fl) {
        fl.t += dt;
        var ang = fl.base + Math.sin(fl.t * fl.f1) * 0.9 + Math.sin(fl.t * fl.f2 + fl.p) * 0.6;
        var nx = fl.x + Math.cos(ang) * fl.sp * dt;
        var ny = fl.y + Math.sin(ang) * fl.sp * dt;
        // 撞墙做镜像反弹，避免瞬移
        if (nx < 0) { nx = 0; fl.base = Math.PI - fl.base; }
        else if (nx > w - fl.size) { nx = w - fl.size; fl.base = Math.PI - fl.base; }
        if (ny < 0) { ny = 0; fl.base = -fl.base; }
        else if (ny > h - fl.size) { ny = h - fl.size; fl.base = -fl.base; }
        // 绕开中间文字区：从最近的一条边推出去，同时把方向镜像
        if (zone) {
          var cx = nx + fl.size / 2, cy = ny + fl.size / 2;
          if (cx > zone.x0 && cx < zone.x1 && cy > zone.y0 && cy < zone.y1) {
            var dl = cx - zone.x0, dr = zone.x1 - cx, du = cy - zone.y0, dd = zone.y1 - cy;
            var m = Math.min(dl, dr, du, dd);
            if (m === dl) { nx = zone.x0 - fl.size; fl.base = Math.PI - fl.base; }
            else if (m === dr) { nx = zone.x1; fl.base = Math.PI - fl.base; }
            else if (m === du) { ny = zone.y0 - fl.size; fl.base = -fl.base; }
            else { ny = zone.y1; fl.base = -fl.base; }
          }
        }
        fl.x = nx; fl.y = ny;
        fl.el.style.transform = 'translate3d(' + nx.toFixed(1) + 'px,' + ny.toFixed(1) + 'px,0) rotate(' + (fl.t * fl.spin).toFixed(1) + 'deg)';
      });
      if (FLAKES.hovered && FLAKES.tip && FLAKES.tip.classList.contains('show')) positionSnowTip(FLAKES.hovered);
    }
    FLAKES.raf = requestAnimationFrame(stepFlakes);
  }

  function startFlakes() {
    if (FLAKES.raf) return;
    FLAKES.last = 0;
    FLAKES.raf = requestAnimationFrame(stepFlakes);
  }

  function stopFlakes() {
    if (FLAKES.raf) { cancelAnimationFrame(FLAKES.raf); FLAKES.raf = 0; }
    hideSnowTip();
    FLAKES.hovered = null;
    FLAKES.items = [];
    FLAKES.wrap = null;
  }

  /* 拉一次 online.json，按玩家名单增减雪花 */
  function refreshHeroFlakes() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    loadPlayerSnip();     // 资料卡那行小字的数据，取一次缓存住
    if (!FLAKES.wrap || !document.body.contains(FLAKES.wrap)) {
      FLAKES.wrap = el('div', 'hero-flakes');
      hero.appendChild(FLAKES.wrap);
      FLAKES.items = [];
    }
    var wrap = FLAKES.wrap;

    function apply(names) {
      // 实时状态说离线或 0 人时，一个都不挂（名单文件会滞后，别自相矛盾）
      if (LIVE.known && (!LIVE.ok || LIVE.now === 0)) names = [];
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // 减少动效：摆成静态的一圈，不做轨迹动画
        syncFlakes(names);
        var z = heroZone();
        FLAKES.items.forEach(function (fl, i) {
          var w = wrap.clientWidth, h = wrap.clientHeight;
          var cols = Math.max(1, Math.floor(w / 110));
          var cx = (i % cols + 0.5) * (w / cols) - fl.size / 2;
          var cy = (Math.floor(i / cols) + 0.5) * 90 + 40;
          fl.x = Math.max(0, Math.min(w - fl.size, cx));
          fl.y = Math.max(0, Math.min(h - fl.size, cy));
          // 静态布局落进文字区就挪到文字区下面，别压字
          if (z && fl.x + fl.size / 2 > z.x0 && fl.x + fl.size / 2 < z.x1 &&
              fl.y + fl.size / 2 > z.y0 && fl.y + fl.size / 2 < z.y1) {
            fl.y = Math.max(0, Math.min(h - fl.size, z.y1 + 8));
          }
          fl.el.style.transform = 'translate3d(' + fl.x.toFixed(1) + 'px,' + fl.y.toFixed(1) + 'px,0)';
        });
        return;
      }
      syncFlakes(names);
      startFlakes();
    }

    fetch('online.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) { apply((d && Array.isArray(d.players)) ? d.players : []); })
      .catch(function () { apply([]); });    // 取不到就一朵都不挂
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    } catch (e) {}
  }
  function copyText(text, btn, label) {
    function done() {
      toast('已复制' + (label || '服务器地址') + '：' + text);
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
    container.innerHTML = pageHead('首页', '服务器状态', '自动刷新；TPS、内存与在线曲线来自服务器本机采集');
    var card = el('div', 'card');
    card.innerHTML = '<div class="status-hero">' +
      '<div><div class="online-count" id="stOnline">—</div><div style="font-size:13px;color:var(--muted-foreground);margin-top:4px">当前在线玩家</div></div>' +
      '<div><span class="status-pill" id="stPill">检测中…</span></div>' +
      '</div>' +
      '<div class="stat-row" id="stStats"></div>' +
      '<div class="motd" id="stMotd">正在获取服务器 MOTD…</div>' +
      '<div class="st-chart-wrap">' +
      '<div class="st-chart-head"><span>近 24 小时在线人数</span><span class="st-chart-note" id="stChartNote">加载中…</span></div>' +
      '<canvas class="st-chart" id="stChart"></canvas>' +
      '</div>' +
      '<div style="margin-top:20px"><div style="font-size:14px;font-weight:700;margin-bottom:12px">在线玩家</div><div class="player-grid" id="stPlayers"></div></div>';
    container.appendChild(card);
    renderLive();               // 先把已知状态铺上去，别等接口
    loadStatus();
    loadChart();
    LIVE.onUpdate = loadStatus;  // 跟着心跳刷（不再单独 setInterval）
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

  var ST_ONLINE_DATA = null;   // 最近一次读到的 online.json，供状态卡复用

  function loadStatus() {
    // 人数 / 在线判定已由 LIVE（实时接口）负责，这里只补几样东西：
    //   1) 人数上限（第三方接口给的上限是脏值，用 server.properties 真实值）
    //   2) 在线玩家名单（只能靠 RCON 导出的 online.json，天生滞后 1 分钟）
    //   3) TPS / 内存 / 运行时长 / 重启计划（导出脚本一并采集）
    fetchLocalOnline(function (d) {
      if (d) ST_ONLINE_DATA = d;
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

  /* 下次重启倒计时：restart.times 形如 ["04:00","16:00"] */
  function nextRestartText(plan) {
    if (!plan || !plan.times || !plan.times.length) return { text: '未设置', hint: '没有配置自动重启' };
    var now = new Date();
    var best = null;
    for (var i = 0; i < plan.times.length; i++) {
      var parts = String(plan.times[i]).split(':');
      var hh = parseInt(parts[0], 10), mm = parseInt(parts[1], 10);
      if (isNaN(hh) || isNaN(mm)) continue;
      var t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
      if (t <= now) t = new Date(t.getTime() + 86400000);
      if (!best || t < best) best = t;
    }
    if (!best) return { text: '未设置', hint: '计划格式不对' };
    var left = Math.max(0, Math.round((best - now) / 1000));
    return { text: fmtDur(left), hint: '每天 ' + plan.times.join(' / ') };
  }

  function tpsClass(tps) {
    if (tps == null) return '';
    if (tps < 15) return 'bad';
    if (tps < 19) return 'warn';
    return '';
  }

  /* 指标卡：优先用导出脚本采到的最新值，缺了就显示 — */
  function fillStatusStats(ok) {
    var d = ST_ONLINE_DATA || {};
    var ping = LIVE.ping;
    var online = (LIVE.known && LIVE.ok) ? LIVE.now : (d.now || 0);
    var tps = d.tps1 != null ? d.tps1 : (d.tps15 != null ? d.tps15 : null);
    var mem = d.mem || null;
    var restart = nextRestartText(d.restart);

    var stats = $id('stStats');
    if (stats) {
      /* 内容没变就别重写 DOM：每次心跳都 innerHTML= 会让入场动画反复重播，
         页面看起来一直在发灰闪动。 */
      var html =
        '<div class="stat-box"><div class="k">在线 / 最大</div><div class="v">' +
        online + ' / ' + (LIVE.max || '—') + '</div></div>' +
        '<div class="stat-box"><div class="k">TPS</div><div class="v ' + tpsClass(tps) + '">' +
        (tps == null ? '—' : tps.toFixed(1)) + '</div></div>' +
        '<div class="stat-box"><div class="k">内存占用</div><div class="v ' + (mem && mem.pct >= 85 ? 'bad' : '') + '">' +
        (mem ? mem.pct + '%' : '—') + '</div>' +
        (mem ? '<div class="ksub">' + mem.used + ' / ' + mem.max + ' MB</div>' : '') + '</div>' +
        '<div class="stat-box"><div class="k">延迟</div><div class="v">' +
        ((!LIVE.ok || ping == null || ping <= 0) ? '—' : ping + 'ms') + '</div></div>' +
        '<div class="stat-box"><div class="k">版本</div><div class="v" style="font-size:15px">' + esc(LIVE.ver || '—') + '</div></div>' +
        '<div class="stat-box"><div class="k">下次重启</div><div class="v" style="font-size:16px">' +
        esc(restart.text) + '</div><div class="ksub">' + esc(restart.hint) + '</div></div>' +
        '<div class="stat-box"><div class="k">服务器已运行</div><div class="v" style="font-size:15px">' +
        esc(d.uptime || '—') + '</div></div>' +
        '<div class="stat-box"><div class="k">地址</div><div class="v" style="font-size:14px">' + esc(SITE.javaIp) + '</div></div>';
      /* 值没变就别重写 DOM。用 innerHTML 比较不行——读回来会被浏览器规范化
         （class="v " 变 class="v"），永远不相等，等于每次心跳都重播入场动画。 */
      var sig = [online, LIVE.max, tps, mem && mem.pct, ping, LIVE.ver, restart.text, d.uptime].join('|');
      if (stats.getAttribute('data-sig') !== sig) {
        stats.innerHTML = html;
        stats.setAttribute('data-sig', sig);
      }
    }
    var motd = $id('stMotd');
    if (motd) motd.textContent = LIVE.motd || (ok ? 'MOTD 未返回' : '服务器离线或不可达');
  }

  /* ---------- 在线人数曲线 ---------- */
  function drawCurve(canvas, values, opts) {
    if (!canvas) return;
    opts = opts || {};
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || canvas.parentNode.clientWidth || 600;
    var h = canvas.clientHeight || 140;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var vals = (values || []).map(function (v) { return (typeof v === 'number' && isFinite(v)) ? v : null; });
    var real = vals.filter(function (v) { return v !== null; });
    if (real.length < 2) {
      ctx.fillStyle = 'rgba(128,128,128,.55)';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.empty || '数据还在积累，过一会儿再看', w / 2, h / 2);
      return;
    }

    var padL = 26, padR = 8, padT = 10, padB = 18;
    var maxV = Math.max.apply(null, real);
    var minV = Math.min.apply(null, real);
    if (maxV - minV < 3) { maxV = minV + 3; }   // 人数少时给点纵向余量，别把线拉平
    maxV = Math.ceil(maxV * 1.15);
    if (minV > 0) minV = 0;

    function X(i) { return padL + (w - padL - padR) * (i / (vals.length - 1)); }
    function Y(v) { return h - padB - (v - minV) / (maxV - minV) * (h - padT - padB); }

    // 网格 + 纵轴刻度
    ctx.strokeStyle = 'rgba(128,128,128,.16)';
    ctx.fillStyle = 'rgba(128,128,128,.75)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 2; g++) {
      var vv = minV + (maxV - minV) * g / 2;
      var yy = Y(vv);
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); ctx.stroke();
      ctx.fillText(String(Math.round(vv)), padL - 6, yy + 3);
    }

    // 面积 + 折线（遇到 null 断开）
    var pts = [];
    for (var i = 0; i < vals.length; i++) if (vals[i] !== null) pts.push([X(i), Y(vals[i])]);
    if (pts.length >= 2) {
      var grad = ctx.createLinearGradient(0, padT, 0, h - padB);
      grad.addColorStop(0, 'rgba(64,150,235,.26)');
      grad.addColorStop(1, 'rgba(64,150,235,.02)');
      ctx.beginPath();
      ctx.moveTo(pts[0][0], h - padB);
      for (var a = 0; a < pts.length; a++) ctx.lineTo(pts[a][0], pts[a][1]);
      ctx.lineTo(pts[pts.length - 1][0], h - padB);
      ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var b = 1; b < pts.length; b++) ctx.lineTo(pts[b][0], pts[b][1]);
      ctx.strokeStyle = 'rgba(64,150,235,.95)';
      ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.stroke();

      var lastP = pts[pts.length - 1];
      ctx.beginPath(); ctx.arc(lastP[0], lastP[1], 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(64,150,235,1)'; ctx.fill();
    }

    // 横轴时间标注
    ctx.fillStyle = 'rgba(128,128,128,.75)';
    ctx.textAlign = 'left';
    ctx.fillText(opts.xLabel0 || '', padL, h - 5);
    ctx.textAlign = 'right';
    ctx.fillText(opts.xLabel1 || '现在', w - padR, h - 5);
  }

  function hhmm(ts) {
    var d = new Date(ts);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function loadChart() {
    var cv = $id('stChart');
    var note = $id('stChartNote');
    if (!cv) return;
    var rid = randomHex(8);
    postBus({ type: 'statsQuery', rid: rid, range: 1440 });
    waitBus(rid, ['statsOk', 'statsErr'], function (m) {
      if (!m || m.type === 'statsErr') {
        // 兜底：如果页面本身就是本地服务托管的，直接读同源接口
        fetch('api/stats?range=1440', { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (d) {
            if (d && d.ok) return applyChart(cv, note, d);
            if (note) note.textContent = '曲线暂时取不到（采集服务未运行）';
            drawCurve(cv, [], {});
          })
          .catch(function () {
            if (note) note.textContent = '曲线暂时取不到（采集服务未运行）';
            drawCurve(cv, [], {});
          });
        return;
      }
      applyChart(cv, note, m);
    });
  }

  function applyChart(cv, note, d) {
    var t0 = Number(d.t0) || (Date.now() - 86400000);
    drawCurve(cv, d.v || [], {
      xLabel0: hhmm(t0),
      xLabel1: '现在',
      empty: d.count < 2 ? '曲线刚开始采集，几分钟后再来看' : '暂无数据'
    });
    if (note) {
      var parts = [];
      if (d.count != null) parts.push(d.count + ' 个采样点');
      if (d.step) parts.push('每 ' + d.step + ' 分钟一个点');
      var n = d.now || {};
      if (n.tps) parts.push('TPS ' + (n.tps.m1 != null ? n.tps.m1 : '—'));
      if (n.mem && n.mem.pct != null) parts.push('内存 ' + n.mem.pct + '%');
      note.textContent = parts.join(' · ') || '';
    }
    // 曲线自带的实时状态比 online.json 更新，顺手把卡片也刷新一下
    if (d.now) {
      var cur = ST_ONLINE_DATA || {};
      if (d.now.tps) { cur.tps1 = d.now.tps.m1; cur.tps15 = d.now.tps.m15; }
      if (d.now.mem && d.now.mem.pct != null) {
        cur.mem = { used: d.now.mem.used, max: d.now.mem.max, pct: d.now.mem.pct };
      }
      if (d.now.uptime) cur.uptime = d.now.uptime;
      if (d.now.restart) cur.restart = d.now.restart;
      ST_ONLINE_DATA = cur;
      fillStatusStats(!!(ST_ONLINE_DATA && ST_ONLINE_DATA.online));
    }
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

  /* --- 玩家主页（#/p/<name>）：雪花点进来就是这里 --- */
  function renderPlayer(container, name) {
    var nm = String(name || '').trim();
    container.innerHTML = pageHead('首页', nm || '玩家', '玩家资料 · 数据来自服务器定时导出，状态实时');

    var card = el('div', 'card');
    card.innerHTML =
      '<div class="pf-head">' +
      '<img class="pf-av" src="' + avatarUrl(nm, 96) + '" alt="" data-fb="' + identicon(nm) + '" ' +
      'onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">' +
      '<div class="pf-id"><div class="pf-name">' + esc(nm || '未知玩家') + '</div>' +
      '<div class="pf-tags" id="pfTags"><span class="badge badge-muted">读取中…</span></div></div>' +
      '<a class="btn btn-sm" href="#/rank" style="margin-left:auto;flex:none">排行榜</a>' +
      '</div>' +
      '<div id="pfBody"><div class="empty"><div class="ico">⏳</div><p>正在读取玩家数据…</p></div></div>';
    container.appendChild(card);

    var body = card.querySelector('#pfBody');
    var tags = card.querySelector('#pfTags');
    var low = nm.toLowerCase();

    function getJson(f) {
      return fetch(f + '?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
    /* 论坛走 fetchForum，才能带上「刚发布还没同步」的本机回声 */
    function forumData() {
      return new Promise(function (res) { fetchForum(function (d) { res(d); }); });
    }
    function findIn(d, key) {
      var arr = (d && Array.isArray(d.players)) ? d.players : [];
      for (var i = 0; i < arr.length; i++) {
        if (String(arr[i][key || 'name']).toLowerCase() === low) return arr[i];
      }
      return null;
    }
    function box(k, v, sub, cls) {
      return '<div class="stat-box"><div class="k">' + k + '</div><div class="v ' + (cls || '') + '">' + v + '</div>' +
        (sub ? '<div class="ksub">' + sub + '</div>' : '') + '</div>';
    }
    // 时长卡：0 要说成「未游玩」，不能显示成「0 秒」，也不能跟「缺数据」的 — 混为一谈
    function durBox(k, v, sub) {
      var n = Number(v);
      var has = (v !== null && v !== undefined && v !== '' && !isNaN(n));
      return box(k, has ? (n > 0 ? fmtDur(n) : '未游玩') : '—', sub || '');
    }

    Promise.all([getJson('playtime.json'), getJson('bedwars.json'),
                 getJson('online.json'), forumData()]).then(function (r) {
      var pt = findIn(r[0]), bw = findIn(r[1]), ol = r[2], fm = r[3];

      /* ---- 顶部标签：在线状态 / 服务器身份 ---- */
      var isOn = !!(ol && ol.online && (ol.players || []).some(function (p) {
        return String(p).toLowerCase() === low;
      }));
      var tagHtml = '<span class="status-pill ' + (isOn ? 'on' : 'off') + '">' + (isOn ? '● 在线' : '● 离线') + '</span>';
      SITE.staff.forEach(function (m) {
        if (String(m.name).toLowerCase() !== low) return;
        (m.roles || []).forEach(function (ro) {
          tagHtml += '<span class="badge badge-' + (ro.c === 'gold' ? 'gold' : ro.c === 'red' ? 'red' : 'blue') + '">' + esc(ro.t) + '</span>';
        });
      });
      if (pt && pt.rank) tagHtml += '<span class="badge badge-green">在线时长第 ' + pt.rank + ' 名</span>';
      if (tags) tags.innerHTML = tagHtml;

      /* ---- 指标卡 ---- */
      var html = '';
      if (pt) {
        html += '<div class="pf-sec">在线时长</div><div class="stat-row">' +
          durBox('总时长', pt.total, pt.rank ? ('全服第 ' + pt.rank + ' 名') : '') +
          durBox('本周', pt.week) +
          durBox('本月', pt.month) +
          durBox('累计年', pt.year) +
          '</div>';
      }
      if (bw) {
        var kd = (typeof bw.kd === 'number') ? (Number.isInteger(bw.kd) ? bw.kd : bw.kd.toFixed(2)) : (bw.kd || '—');
        html += '<div class="pf-sec">起床战争</div><div class="stat-row">' +
          box('积分', bw.score != null ? bw.score : '—', bw.rank ? ('第 ' + bw.rank + ' 名') : '') +
          box('胜率', (bw.winRate != null ? bw.winRate + '%' : '—'), (bw.wins || 0) + ' 胜 / ' + (bw.loses || 0) + ' 负') +
          box('K/D', kd, (bw.kills || 0) + ' 杀 / ' + (bw.deaths || 0) + ' 死') +
          box('破床', bw.destroyedBeds != null ? bw.destroyedBeds : '—', '') +
          '</div>';
      }
      if (!pt && !bw) {
        html += '<div class="empty"><div class="ico">🫥</div><p>还没有这位玩家的战绩记录</p></div>';
      }

      /* ---- 论坛发帖 ---- */
      var posts = ((fm && fm.posts) || []).filter(function (p) {
        // 新帖署名是 QQ，靠 author_names（绑定的游戏号）反查；老帖还是按作者名匹配
        if (String(p.author || '').toLowerCase() === low) return true;
        var ns = p.author_names || [];
        for (var i = 0; i < ns.length; i++) if (String(ns[i]).toLowerCase() === low) return true;
        return false;
      }).sort(function (a, b) { return Number(b.created || 0) - Number(a.created || 0); });
      html += '<div class="pf-sec">论坛发帖' +
        (posts.length ? ' <span class="pf-cnt">' + posts.length + '</span>' : '') + '</div>';
      if (posts.length) {
        html += '<div class="pf-posts">' + posts.slice(0, 5).map(function (p) {
          var meta = p._pending ? '同步中' : ((p.replies && p.replies.length) ? (p.replies.length + ' 回复') : '暂无回复');
          return '<a class="pf-post" href="#/forum/post/' + encodeURIComponent(p.id) + '">' +
            esc(p.title || '（无标题）') + '<span' + (p._pending ? ' class="pend"' : '') + '>' + meta + '</span></a>';
        }).join('');
        if (posts.length > 5) {
          html += '<a class="pf-post pf-more" href="#/forum">还有 ' + (posts.length - 5) + ' 条，去论坛看全部 →</a>';
        }
        html += '</div>';
      } else {
        html += '<div class="pf-none">还没有在论坛发过帖。</div>';
      }
      if (body) body.innerHTML = html ||
        '<div class="empty"><div class="ico">🫥</div><p>暂无这位玩家的数据</p></div>';
    }).catch(function () {
      if (body) body.innerHTML = emptyState('📡', '玩家数据加载失败，请稍后刷新');
    });
  }

  /* --- 在线状态页（在线玩家 ID + 头像） --- */
  function renderOnline(container) {
    container.innerHTML = pageHead('在线', '在线状态', '状态自动刷新；玩家名单由服务端每 1 分钟同步');
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

  /* --- 排行榜（时长 / 起床 / 论坛 / 建筑 / 成就） --- */
  function renderRank(container) {
    container.innerHTML = pageHead('首页', '排行榜',
      '在线时长、起床战绩由本地脚本定时导出；论坛活跃、建筑、成就实时来自服务器数据');
    var box = el('div', 'card'); container.appendChild(box);
    box.innerHTML = '<div class="rank-tabs" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">' +
      '<button class="btn btn-sm rank-tab btn-primary" data-tab="play" type="button">🕒 在线时长</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="bw" type="button">⚔️ 起床战绩</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="forum" type="button">💬 论坛活跃</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="build" type="button">🏛️ 建筑作品</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="ach" type="button">🏅 成就</button>' +
      '</div><div id="rankBody"></div>';
    var body = box.querySelector('#rankBody');

    /* 统一的条形行渲染（时长/论坛/建筑榜复用） */
    function rankRow(rank, name, value, sub, pct) {
      var medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
      var m = medals[rank] || ('#' + rank);
      return '<div style="display:flex;align-items:center;gap:14px;padding:12px 4px;border-bottom:1px solid var(--border)">' +
        '<div style="width:34px;text-align:center;font-size:18px;font-weight:800;flex:none">' + m + '</div>' +
        '<img src="' + avatarUrl(name, 40) + '" alt="" loading="lazy" data-fb="' + identicon(name) + '" style="width:36px;height:36px;border-radius:8px;background:var(--muted);flex:none" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">' +
        '<div style="flex:1;min-width:0">' +
        '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-weight:700;font-size:15px">' + esc(name) + '</span>' +
        (sub ? '<span style="color:var(--muted-foreground);font-weight:500">· ' + sub + '</span>' : '') + '</div>' +
        '<div style="margin-top:6px;height:8px;border-radius:6px;background:var(--muted);overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary),oklch(78% .10 238));border-radius:6px"></div></div>' +
        '</div>' +
        '<div style="flex:none;text-align:right;font-weight:800;font-size:15px;color:var(--primary);white-space:nowrap">' + value + '</div>' +
        '</div>';
    }

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
          list.innerHTML = d.players.map(function (p) {
            var sub = [];
            if (p.month) sub.push('本月 ' + fmtDur(p.month));
            if (p.week) sub.push('本周 ' + fmtDur(p.week));
            return rankRow(p.rank, p.name, fmtDur(p.total), sub.join(' · '),
              Math.max(4, Math.round(p.total / top * 100)));
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

    /* 论坛活跃：从 forum.json 直接统计，不依赖服务端 */
    function showForum() {
      body.innerHTML = '<div id="frMeta" style="font-size:13px;color:var(--muted-foreground);margin-bottom:14px">统计中…</div><div id="frList"></div>';
      var list = body.querySelector('#frList');
      list.innerHTML = '<div class="empty"><div class="ico">⏳</div><p>正在统计论坛活跃度…</p></div>';
      fetch('forum.json?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var posts = (d && Array.isArray(d.posts)) ? d.posts : [];
          if (!posts.length) {
            list.innerHTML = emptyState('💬', '论坛还没有帖子');
            body.querySelector('#frMeta').textContent = '';
            return;
          }
          var map = {};
          function bump(name, key, n) {
            if (!name || name === '匿名玩家') return;
            if (!map[name]) map[name] = { name: name, posts: 0, replies: 0, likes: 0 };
            map[name][key] += n;
          }
          posts.forEach(function (p) {
            var author = p.anonymous ? '匿名玩家' : (p.author || '');
            bump(author, 'posts', 1);
            bump(author, 'likes', Number(p.likes || 0));
            (p.replies || []).forEach(function (r) {
              bump(r.anonymous ? '匿名玩家' : (r.author || ''), 'replies', 1);
            });
          });
          var arr = Object.keys(map).map(function (k) {
            var v = map[k];
            // 活跃分：发帖 3 分、回复 1 分、获赞 2 分
            v.score = v.posts * 3 + v.replies + v.likes * 2;
            return v;
          }).sort(function (a, b) { return b.score - a.score; }).slice(0, 30);

          body.querySelector('#frMeta').textContent =
            '共 ' + arr.length + ' 位活跃用户 · 活跃分 = 发帖×3 + 回复×1 + 获赞×2（匿名不计入）';
          var top = arr[0].score || 1;
          list.innerHTML = arr.map(function (u, i) {
            var sub = '发帖 ' + u.posts + ' · 回复 ' + u.replies + ' · 获赞 ' + u.likes;
            return rankRow(i + 1, u.name, u.score + ' 分', sub, Math.max(4, Math.round(u.score / top * 100)));
          }).join('');
        })
        .catch(function () { list.innerHTML = emptyState('📡', '论坛数据加载失败'); });
    }

    /* 建筑 / 成就：数据在服务器 SQLite 里，走总线取 */
    function loadRanks(btnLabel, render) {
      body.innerHTML = '<div class="empty"><div class="ico">⏳</div><p>正在从服务器读取…</p></div>';
      var rid = randomHex(8);
      postBus({ type: 'rankQuery', rid: rid });
      waitBus(rid, ['rankOk', 'rankErr'], function (m) {
        if (!m || m.type === 'rankErr') {
          body.innerHTML = emptyState('📡', '读取失败：服务器采集服务可能未运行');
          return;
        }
        render(m);
      });
    }

    function showBuilds() {
      loadRanks('建筑', function (d) {
        var list = Array.isArray(d.builds) ? d.builds : [];
        if (!list.length) { body.innerHTML = emptyState('🏛️', '还没有登记的建筑作品'); return; }
        body.innerHTML = '<div style="font-size:13px;color:var(--muted-foreground);margin-bottom:14px">共 ' +
          list.length + ' 个作品 · 由腐竹在管理后台登记</div>' +
          '<div class="build-grid">' + list.map(function (b) {
            var img = b.image ? '<img class="build-thumb" src="' + esc(b.image) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '';
            return '<div class="build-card">' + img +
              '<div class="build-body"><div class="build-title">' + esc(b.title || '未命名') + '</div>' +
              '<div class="build-meta">' + esc(b.author || '—') + (b.world ? ' · ' + esc(b.world) : '') + '</div>' +
              (b.desc ? '<div class="build-desc">' + esc(b.desc) + '</div>' : '') +
              '</div></div>';
          }).join('') + '</div>';
      });
    }

    function showAch() {
      loadRanks('成就', function (d) {
        var achs = Array.isArray(d.achievements) ? d.achievements : [];
        var people = Array.isArray(d.achievers) ? d.achievers : [];
        if (!achs.length && !people.length) {
          body.innerHTML = emptyState('🏅', '还没有成就记录');
          return;
        }
        var html = '<div class="rank2">';
        html += '<div><h4 class="rank-h4">成就解锁排行</h4><div class="rank-list">' +
          (achs.length ? achs.map(function (a) {
            return '<div class="rank-line"><span class="rank-line-name">' + esc(a.icon || '🏅') + ' ' + esc(a.name) +
              (a.category ? '<span class="rank-line-tag">' + esc(a.category) + '</span>' : '') + '</span>' +
              '<span class="rank-line-val">' + a.unlocks + ' 人</span></div>';
          }).join('') : '<div class="rank-empty">暂无成就</div>') + '</div></div>';
        html += '<div><h4 class="rank-h4">成就达人</h4><div class="rank-list">' +
          (people.length ? people.map(function (p, i) {
            var medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
            return '<div class="rank-line"><span class="rank-line-name">' + (medals[i + 1] || '#' + (i + 1)) + ' ' +
              esc(p.name) + '</span><span class="rank-line-val">' + p.unlocks + ' 个</span></div>';
          }).join('') : '<div class="rank-empty">还没有人解锁成就</div>') + '</div></div>';
        html += '</div>';
        body.innerHTML = html;
      });
    }

    var TAB_FN = { play: showPlay, bw: showBw, forum: showForum, build: showBuilds, ach: showAch };
    box.querySelectorAll('.rank-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        box.querySelectorAll('.rank-tab').forEach(function (b) { b.classList.remove('btn-primary'); });
        btn.classList.add('btn-primary');
        var fn = TAB_FN[btn.getAttribute('data-tab')] || showPlay;
        fn();
      });
    });
    showPlay();
  }

  /* ================= Wiki / 攻略（读 wiki.json，便于直接改文案） ================= */
  function renderWiki(container) {
    container.innerHTML = pageHead('首页', 'Wiki 与攻略', '新手入门、玩法说明与常见问题；内容整理自服务器实际玩法');
    var wrap = el('div', 'wiki-wrap');
    container.appendChild(wrap);
    wrap.innerHTML = '<div class="card wiki-loading"><div class="empty"><div class="ico">⏳</div><p>正在加载…</p></div></div>';

    fetch('wiki.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('no wiki'); return r.json(); })
      .then(function (d) {
        var secs = (d && Array.isArray(d.sections)) ? d.sections : [];
        if (!secs.length) {
          wrap.innerHTML = emptyState('📖', 'Wiki 内容还没准备好');
          return;
        }
        var side = secs.map(function (s, i) {
          return '<a class="wiki-nav-link' + (i === 0 ? ' active' : '') + '" href="#/wiki" data-sec="' + esc(s.id) + '">' +
            (s.icon ? '<span class="wiki-ico">' + esc(s.icon) + '</span>' : '') + esc(s.title) + '</a>';
        }).join('');

        var body = secs.map(function (s, i) {
          var items = (s.items || []).map(function (it, j) {
            return '<details class="wiki-item"' + (i === 0 && j === 0 ? ' open' : '') + '>' +
              '<summary>' + esc(it.q) + '</summary>' +
              '<div class="wiki-answer">' + esc(it.a || '') + '</div>' +
              '</details>';
          }).join('');
          return '<section class="wiki-sec" id="wiki-' + esc(s.id) + '">' +
            '<h3>' + (s.icon ? esc(s.icon) + ' ' : '') + esc(s.title) + '</h3>' + items + '</section>';
        }).join('');

        wrap.innerHTML =
          '<aside class="card wiki-side"><h4>目录</h4><div class="wiki-nav">' + side + '</div></aside>' +
          '<div class="wiki-main">' +
          (d.notice ? '<div class="card wiki-notice">' + esc(d.notice) + '</div>' : '') +
          '<div class="card">' + body + '</div>' +
          '<div class="wiki-foot">内容更新于 ' + esc(d.updated || '—') + ' · 有补充或纠错欢迎到论坛发帖</div>' +
          '</div>';

        var links = wrap.querySelectorAll('.wiki-nav-link');
        for (var k = 0; k < links.length; k++) {
          links[k].addEventListener('click', function (ev) {
            ev.preventDefault();
            var id = this.getAttribute('data-sec');
            for (var m = 0; m < links.length; m++) links[m].classList.remove('active');
            this.classList.add('active');
            var target = $id('wiki-' + id);
            if (target) {
              var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
              window.scrollTo({ top: top, behavior: 'smooth' });
            }
          });
        }
      })
      .catch(function () {
        wrap.innerHTML = emptyState('📖', 'Wiki 加载失败，稍后再试');
      });
  }

  /* ================= 公告（读取 feed.xml，同时可用于 RSS 订阅） ================= */
  function renderNews(container) {
    container.innerHTML = pageHead('首页', '公告', '服务器公告、活动与更新通知；支持 RSS 订阅，有更新会自动出现在阅读器里');
    var card = el('div', 'card');
    card.innerHTML =
      '<div class="news-head">' +
      '<div class="news-sub">订阅地址：<code id="newsFeedUrl">feed.xml</code></div>' +
      '<button class="btn btn-sm btn-outline" id="newsCopy" type="button">复制订阅链接</button>' +
      '</div>' +
      '<div id="newsList"><div class="empty"><div class="ico">⏳</div><p>正在加载公告…</p></div></div>';
    container.appendChild(card);

    var feedUrl = (function () {
      try {
        var base = location.href.split('?')[0].split('#')[0];
        base = base.replace(/[^/]*$/, '');
        return base + 'feed.xml';
      } catch (e) { return 'feed.xml'; }
    })();
    var code = card.querySelector('#newsFeedUrl');
    if (code) code.textContent = feedUrl;
    var copyBtn = card.querySelector('#newsCopy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      copyText(feedUrl, copyBtn, '订阅链接');
    });

    var list = card.querySelector('#newsList');
    fetch('feed.xml?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('no feed'); return r.text(); })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        var items = doc.querySelectorAll('item');
        if (!items.length) {
          list.innerHTML = emptyState('📢', '还没有发布过公告');
          return;
        }
        var html = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          function t(tag) {
            var n = it.getElementsByTagName(tag)[0];
            return n ? (n.textContent || '') : '';
          }
          var title = t('title') || '无标题';
          var desc = t('description') || '';
          var pub = t('pubDate');
          var pinned = t('category') === '置顶';
          var d = pub ? new Date(pub) : null;
          var dateText = (d && !isNaN(d.getTime()))
            ? (d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2))
            : '';
          html.push('<div class="news-item">' +
            '<div class="news-dot"></div>' +
            '<div class="news-body">' +
            '<div class="news-title">' + (pinned ? '<span class="news-pin">置顶</span>' : '') + esc(title) + '</div>' +
            (dateText ? '<div class="news-date">' + esc(dateText) + '</div>' : '') +
            (desc ? '<div class="news-text">' + esc(desc) + '</div>' : '') +
            '</div></div>');
        }
        list.innerHTML = '<div class="news-list">' + html.join('') + '</div>';
      })
      .catch(function () {
        list.innerHTML = emptyState('📡', '公告加载失败，稍后再试');
      });
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
  /* ---------- 刚发布、还没同步到线上的帖子 ----------
     forum.json 是仓库里的静态文件：服务端写完会立刻 commit + push，
     但 GitHub Pages 要重新构建（几十秒到几分钟）才有这个文件。
     这中间详情页按 id 找不到，就会显示「帖子不存在或已被删除」。
     所以本机留一份回声：先照常展示，等线上同步到了再自动丢掉。 */
  var FORUM_ECHO_KEY = 'stl_forum_echo_v1';
  var FORUM_ECHO_TTL = 3 * 3600 * 1000;   // 超过 3 小时还没同步，说明出问题了，别再挂着

  function forumEchoLoad() {
    try {
      var a = JSON.parse(localStorage.getItem(FORUM_ECHO_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function forumEchoSave(a) {
    try { localStorage.setItem(FORUM_ECHO_KEY, JSON.stringify(a)); } catch (e) {}
  }
  function forumEchoPut(post) {
    if (!post || !post.id) return;
    forumEchoSave(forumEchoLoad().filter(function (p) { return p.id !== post.id; }).concat([post]));
  }
  function forumEchoDrop(id) {
    forumEchoSave(forumEchoLoad().filter(function (p) { return p.id !== id; }));
  }
  function forumEchoPatch(id, fields) {
    var a = forumEchoLoad(), hit = false;
    a.forEach(function (p) {
      if (p.id !== id) return;
      hit = true;
      for (var k in fields) if (Object.prototype.hasOwnProperty.call(fields, k)) p[k] = fields[k];
    });
    if (hit) forumEchoSave(a);
  }
  /* 把回声并进 forum.json 的数据；已经同步过来的那条自动丢弃 */
  function forumMergeEcho(data) {
    if (!data || !Array.isArray(data.posts)) return data;
    var echo = forumEchoLoad();
    if (!echo.length) return data;
    var have = {};
    data.posts.forEach(function (p) { have[p.id] = 1; });
    var keep = [];
    echo.forEach(function (p) {
      if (have[p.id]) return;                                    // 线上已经有了
      if (Date.now() - Number(p.created || 0) > FORUM_ECHO_TTL) return;
      p._pending = true;
      keep.push(p);
    });
    if (keep.length !== echo.length) forumEchoSave(keep);
    if (keep.length) data.posts = keep.concat(data.posts);
    return data;
  }

  function fetchForum(cb) {
    fetch('forum.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d) forumMergeEcho(d);
        cb(d, d ? null : 'http');
      })
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
  /* 读取当前官网登录态（与聊天页共用同一套 session） */
  function getSession() {
    try {
      var raw = JSON.parse(localStorage.getItem('stl_web_session_v1') || 'null');
      if (raw && raw.token && raw.qq && raw.exp > Date.now()) return raw;
    } catch (e) {}
    return null;
  }
  /* 未登录时的占位提示卡 */
  function loginGate(msg) {
    var d = el('div', 'card forum-gate');
    d.innerHTML = '<div class="forum-note">' + esc(msg) +
      ' <a href="confirm.html">去登录</a></div>';
    return d;
  }

  /* ---------- 个人中心（资料 / 时长 / 登录设备） ---------- */

  /* 往 ntfy 总线发一条请求 */
  function postBus(obj) {
    return fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify(obj)
    });
  }
  /* 等总线上与自己 rid 匹配的回执（论坛/个人中心共用同一套玩法） */
  function waitBus(rid, types, cb) {
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
              if (types.indexOf(m.type) >= 0) return cb(m);
            } catch (e) {}
          }
          if (Date.now() > deadline) return cb(null);
          setTimeout(tick, 1500);
        })
        .catch(function () { if (Date.now() > deadline) return cb(null); setTimeout(tick, 2000); });
    })();
  }
  function fmtTime(ms) {
    var n = Number(ms) || 0;
    if (!n) return '未知';
    var d = new Date(n);
    function p(x) { return (x < 10 ? '0' : '') + x; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function renderMe(container) {
    var sess = getSession();
    container.innerHTML = pageHead('我的', '个人中心', '查看游戏时长与论坛活跃度，管理已登录的设备。');
    if (!sess) { container.appendChild(loginGate('个人中心需要先登录官网账号。')); return; }

    var box = el('div', 'me-wrap');
    box.innerHTML = '<div class="card me-loading">正在读取你的资料…</div>';
    container.appendChild(box);

    function load(notice) {
      var rid = randomHex(8);
      postBus({ type: 'meQuery', rid: rid, token: sess.token });
      waitBus(rid, ['meOk', 'meErr'], function (m) {
        if (!m) {
          box.innerHTML = '<div class="card me-loading">读取超时，请检查网络后刷新重试。</div>';
          return;
        }
        if (m.type === 'meErr') {
          box.innerHTML = '<div class="card me-loading">' + esc(m.reason || '读取失败') + '</div>';
          return;
        }
        drawMe(box, m, sess, notice);
      });
    }

    function act(kind, id, done) {
      var rid = randomHex(8);
      var obj = { type: kind, rid: rid, token: sess.token };
      if (id) obj.id = id;
      postBus(obj);
      waitBus(rid, ['meOk', 'meErr'], function (m) {
        if (!m) { toast('操作超时，请重试'); done && done(null); return; }
        if (m.type === 'meErr') { toast(m.reason || '操作失败'); done && done(null); return; }
        toast(m.notice || '已更新');
        done && done(m);
      });
    }

    function drawMe(box, d, sess, notice) {
      var pt = d.playtime;
      var fm = d.forum || { posts: 0, replies: 0 };
      var name = (d.names && d.names[0]) || ('QQ' + d.qq);

      var html = '';
      if (notice) html += '<div class="me-notice">' + esc(notice) + '</div>';
      html +=
        '<div class="card me-hero">' +
        '<img class="me-avatar" src="' + esc(d.avatar) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<div class="me-id">' +
        '<div class="me-name">' + esc(name) + '</div>' +
        '<div class="me-sub">QQ ' + esc(d.qqMask) + ' · 身份标识 ' + esc(String(d.uid || '').slice(0, 8)) + '</div>' +
        '<div class="me-accs">' + ((d.names || []).map(function (n) { return '<span class="me-tag">' + esc(n) + '</span>'; }).join('') || '<span class="me-tag">未绑定游戏账号</span>') + '</div>' +
        '</div>' +
        '<div class="me-hero-act">' +
        '<a class="btn" href="profile.html">详细资料</a>' +
        '<button class="btn me-logout" type="button">退出登录</button>' +
        '</div>' +
        '</div>';

      html +=
        '<div class="me-stats">' +
        '<div class="card me-stat"><div class="k">游戏总时长</div><div class="v">' + (pt ? esc(fmtDur(pt.total)) : '暂无记录') + '</div>' +
        '<div class="s">' + (pt ? ('本月 ' + esc(fmtDur(pt.month)) + (pt.rank ? ' · 排名 #' + pt.rank : '')) : '未在时长榜中匹配到你的账号') + '</div></div>' +
        '<div class="card me-stat"><div class="k">论坛发帖</div><div class="v">' + fm.posts + ' 篇</div><div class="s">回复 ' + fm.replies + ' 条</div></div>' +
        '<div class="card me-stat"><div class="k">登录设备</div><div class="v">' + (d.sessionCount || 0) + ' 台</div><div class="s">含当前这台</div></div>' +
        '</div>';

      var devs = Array.isArray(d.sessions) ? d.sessions : [];
      html += '<div class="card me-devices"><div class="me-dev-head"><h3>登录设备</h3>' +
        (devs.length > 1 ? '<button class="btn btn-primary me-revoke-others" type="button">退出其他所有设备</button>' : '') +
        '</div>';
      if (!devs.length) {
        html += emptyState('🖥️', '没有可显示的登录记录');
      } else {
        html += '<div class="me-dev-list">';
        for (var i = 0; i < devs.length; i++) {
          var s = devs[i];
          html += '<div class="me-dev' + (s.current ? ' is-current' : '') + '">' +
            '<div class="me-dev-main">' +
            '<div class="me-dev-name">' + esc(s.device || '未知设备') +
            (s.current ? '<span class="me-badge">当前设备</span>' : '') + '</div>' +
            '<div class="me-dev-meta">' + esc(s.from || '登录') + ' · 最近活跃 ' + esc(fmtTime(s.last)) +
            ' · 还剩 ' + s.daysLeft + ' 天</div>' +
            '</div>' +
            (s.current ? '' : '<button class="btn me-dev-out" type="button" data-id="' + esc(s.id) + '">退出</button>') +
            '</div>';
        }
        html += '</div>';
      }
      html += '<p class="me-tip">发现不认识的设备？先改 QQ 密码，再点「退出其他所有设备」把它们踢下线。</p></div>';

      box.innerHTML = html;

      var lo = box.querySelector('.me-logout');
      if (lo) lo.addEventListener('click', function () {
        if (!confirm('退出登录后需要重新验证，确定继续？')) return;
        try { localStorage.removeItem('stl_web_session_v1'); } catch (e) {}
        toast('已退出登录');
        location.hash = '#/';
      });

      var others = box.querySelector('.me-revoke-others');
      if (others) others.addEventListener('click', function () {
        if (!confirm('将退出除当前设备外的所有登录，确定继续？')) return;
        others.disabled = true;
        act('meRevokeOthers', '', function (m) { if (m) load(m.notice); else others.disabled = false; });
      });

      var outs = box.querySelectorAll('.me-dev-out');
      for (var j = 0; j < outs.length; j++) {
        outs[j].addEventListener('click', function () {
          var id = this.getAttribute('data-id');
          if (!confirm('确定让这台设备退出登录？')) return;
          var btn = this;
          btn.disabled = true;
          act('meRevoke', id, function (m) { if (m) load(m.notice); else btn.disabled = false; });
        });
      }
    }

    load('');
  }

  /* --- 论坛列表页 --- */
  function renderForum(container) {
    container.innerHTML = pageHead('论坛', 'Stone Logic 论坛',
      '玩法讨论、技术求助、BUG 反馈、建筑晒图，这里都能聊。登录官网账号后即可发帖与回复。');
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
      var av = forumAvatar(p.author, 44);
      var excerpt = (p.content || '').replace(/\s+/g, ' ');
      if (excerpt.length > 80) excerpt = excerpt.slice(0, 80) + '…';
      return '<a class="post-card" href="#/forum/post/' + esc(p.id) + '">' +
        '<span class="cat-badge">' + esc(c) + '</span>' +
        (p._pending ? '<span class="pend-tag">同步中</span>' : '') +
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
          '<img src="' + forumAvatar(post.author, 56) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
          '<span class="pm-name">' + esc(post.author || '匿名玩家') + '</span>' +
          '<span>·</span><span>' + timeAgo(post.created) + '</span>' +
          '<span>·</span><span>💬 ' + ((post.replies || []).length) + ' 回复</span>' +
          (post.edited ? '<span>·</span><span>已编辑</span>' : '') +
        '</div>';
      box.appendChild(head);
      // 还没同步到线上的帖子：说清楚，别让人以为丢帖了
      if (post._pending) {
        var pend = el('div', 'fd-pending');
        pend.textContent = '刚发布，正在同步到全站（通常 1 分钟内），这期间别人可能还看不到。';
        box.appendChild(pend);
      }
      // 正文（textContent 防 XSS，pre-wrap 保留换行）
      var body = el('div', 'fd-body');
      body.textContent = post.content || '';
      box.appendChild(body);
      // 操作区：点赞 / 收藏 / 举报 / 作者编辑删除 / 返回
      var actions = el('div', 'fd-actions');
      var likeBtn = el('button', 'fd-like' + (liked ? ' on' : ''));
      likeBtn.textContent = (liked ? '👍 已赞 ' : '👍 点赞 ') + ((post.likes || 0) + (liked ? 1 : 0));
      var favBtn = el('button', 'fd-like' + (fav.has(post.id) ? ' on' : ''));
      favBtn.textContent = fav.has(post.id) ? '⭐ 已收藏' : '☆ 收藏';
      var back = el('a', 'btn btn-outline btn-sm');
      back.href = '#/forum';
      back.textContent = '← 返回列表';
      actions.appendChild(likeBtn); actions.appendChild(favBtn);
      var msess = getSession();
      var isMine = !!(msess && post.author_uid && msess.uid && post.author_uid === msess.uid);
      if (msess) {
        var reportBtn = el('button', 'fd-like');
        reportBtn.textContent = '🚩 举报';
        reportBtn.addEventListener('click', function () {
          var reason = window.prompt('举报原因（如：广告 / 辱骂 / 违规），提交后腐竹会处理：', '');
          if (reason === null) return;
          reportBtn.disabled = true; reportBtn.textContent = '提交中…';
          var rid = randomHex();
          fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
            method: 'POST', headers: { 'content-type': 'text/plain' },
            body: JSON.stringify({ type: 'forum_report', rid: rid, post_id: post.id, reason: reason, token: msess.token, ts: Date.now() })
          }).then(function () {
            waitForumAck(rid, function (m) {
              reportBtn.disabled = false; reportBtn.textContent = '🚩 举报';
              if (m && m.type === 'forumOk') toast('已提交举报，感谢反馈');
              else toast('举报提交失败：' + ((m && m.reason) || '无回执'));
            });
          }).catch(function () { reportBtn.disabled = false; reportBtn.textContent = '🚩 举报'; toast('网络错误'); });
        });
        actions.appendChild(reportBtn);
        if (isMine) {
          var editBtn = el('button', 'fd-like');
          editBtn.textContent = '✏️ 编辑';
          editBtn.addEventListener('click', function () { openForumEdit(box, post); });
          var delBtn = el('button', 'fd-like');
          delBtn.textContent = '🗑️ 删除';
          delBtn.addEventListener('click', function () {
            if (!window.confirm('确定删除这条帖子？删除后不可恢复。')) return;
            delBtn.disabled = true; delBtn.textContent = '删除中…';
            var rid = randomHex();
            fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
              method: 'POST', headers: { 'content-type': 'text/plain' },
              body: JSON.stringify({ type: 'forum_del', rid: rid, post_id: post.id, token: msess.token, ts: Date.now() })
            }).then(function () {
              waitForumAck(rid, function (m) {
                if (m && m.type === 'forumOk') {
                  forumEchoDrop(post.id);     // 本机回声也删掉，别留在列表里
                  toast('已删除');
                  setTimeout(function () { location.hash = '#/forum'; }, 500);
                }
                else { delBtn.disabled = false; delBtn.textContent = '🗑️ 删除'; toast('删除失败：' + ((m && m.reason) || '无回执')); }
              });
            }).catch(function () { delBtn.disabled = false; delBtn.textContent = '🗑️ 删除'; toast('网络错误'); });
          });
          actions.appendChild(editBtn); actions.appendChild(delBtn);
        }
      }
      actions.appendChild(back);
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
      // 回复表单（需登录官网账号）
      var sess = getSession();
      var rf = el('div', 'reply-form');
      rf.innerHTML =
        '<div class="forum-note">登录后即可回复，回复同样以你的 QQ 署名。</div>' +
        '<div class="field"><label>回复内容</label><textarea id="rfText" maxlength="1000" placeholder="说点什么…"></textarea></div>' +
        '<div class="rf-row">' +
          '<div class="fn-who fn-who-sm">' + (sess ? '<img src="' + qqAvatar(sess.qq, 100) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
          '<span>QQ ' + esc(String(sess.qq)) + '</span>' : '') + '</div>' +
          '<button class="btn btn-primary btn-sm" id="rfSend" type="button">发表回复</button>' +
        '</div>' +
        '<div id="rfMsg" style="font-size:13px;min-height:18px;margin-top:8px"></div>';
      box.appendChild(rf);
      // 未登录：直接换成「去登录」提示，不再渲染回复框
      if (!sess) {
        rf.innerHTML = '';
        rf.appendChild(loginGate('回复需要先登录官网账号。'));
        return;
      }
      var rfText = rf.querySelector('#rfText');
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
          body: JSON.stringify({ type: 'forum_reply', rid: rid, post_id: post.id, content: text, token: sess.token, ts: Date.now() })
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
  /* 内联编辑：作者本人改标题/正文 */
  function openForumEdit(box, post) {
    var msess = getSession();
    if (!msess) { toast('请先登录'); return; }
    var wrap = el('div', 'card forum-edit');
    wrap.innerHTML =
      '<div class="forum-note">编辑帖子（敏感词会被拦截）。</div>' +
      '<div class="field"><label>标题</label><input id="feTitle" type="text" maxlength="100" style="width:100%;background:var(--card);border:1px solid var(--input);border-radius:9px;padding:9px 11px;color:var(--foreground);outline:none"></div>' +
      '<div class="field"><label>正文</label><textarea id="feContent" maxlength="2000"></textarea></div>' +
      '<div id="feMsg" style="font-size:13px;min-height:18px;margin:6px 0"></div>' +
      '<div class="fb-actions"><button class="btn btn-primary" id="feSave" type="button">保存</button>' +
      '<button class="btn btn-outline" id="feCancel" type="button">取消</button></div>';
    var t = wrap.querySelector('#feTitle'), ct = wrap.querySelector('#feContent');
    t.value = post.title || ''; ct.value = post.content || '';
    var m = wrap.querySelector('#feMsg');
    function setM(x, err) { m.textContent = x; m.style.color = err ? 'var(--destructive)' : 'var(--muted-foreground)'; }
    box.insertBefore(wrap, box.firstChild);
    wrap.querySelector('#feCancel').addEventListener('click', function () { wrap.remove(); });
    wrap.querySelector('#feSave').addEventListener('click', function () {
      var nt = t.value.trim(), nc = ct.value.trim();
      if (nt.length < 2) { setM('标题至少 2 字', true); return; }
      if (nc.length < 2) { setM('正文至少 2 字', true); return; }
      var btn = wrap.querySelector('#feSave'); btn.disabled = true; setM('保存中…', false);
      var rid = randomHex();
      fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
        method: 'POST', headers: { 'content-type': 'text/plain' },
        body: JSON.stringify({ type: 'forum_edit', rid: rid, post_id: post.id, title: nt, content: nc, token: msess.token, ts: Date.now() })
      }).then(function () {
        waitForumAck(rid, function (mm) {
          btn.disabled = false;
          if (mm && mm.type === 'forumOk') {
            forumEchoPatch(post.id, { title: nt, content: nc, edited: true });
            toast('已保存');
            setTimeout(function () { location.reload(); }, 400);
          }
          else setM('保存失败：' + ((mm && mm.reason) || '无回执'), true);
        });
      }).catch(function () { btn.disabled = false; setM('网络错误', true); });
    });
  }

  function renderReplies(container, post) {
    var list = post.replies || [];
    if (!list.length) { container.innerHTML = '<div style="font-size:13.5px;color:var(--muted-foreground);padding:6px 2px">还没有回复，来抢沙发～</div>'; return; }
    container.innerHTML = list.slice().sort(function (a, b) { return a.created - b.created; }).map(function (r) {
      return '<div class="reply-item">' +
        '<img src="' + forumAvatar(r.author, 60) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
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
    container.innerHTML = pageHead('论坛', '发新贴', '提个想法、问个问题、晒个作品。帖子以你登录的 QQ 署名。');
    var sess = getSession();
    if (!sess) {
      container.appendChild(loginGate('发帖需要先登录官网账号。'));
      return;
    }
    var box = el('div', 'card forum-form');
    container.appendChild(box);
    box.innerHTML =
      '<div class="forum-note">发表内容会公开展示在论坛上，请不要填写密码、手机号等敏感信息。恶意刷屏或违规内容将被删除。</div>' +
      // 不再有昵称 / 匿名选项：署名固定用登录的 QQ
      '<div class="fn-who"><img src="' + qqAvatar(sess.qq, 100) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<div><div class="fn-who-n">以 QQ ' + esc(String(sess.qq)) + ' 的身份发布</div>' +
        '<div class="fn-who-s">帖子署名固定为你的 QQ，不可匿名或改昵称</div></div></div>' +
      '<div class="field"><label>选择分类</label><select id="fnCat"></select></div>' +
      '<div class="field"><label>标题<span id="fnCount" style="float:right;color:var(--muted-foreground)">0 / 100</span></label>' +
        '<input id="fnTitle" type="text" maxlength="100" placeholder="一句话说清你要聊什么"></div>' +
      '<div class="field"><label>正文<span id="fnCount2" style="float:right;color:var(--muted-foreground)">0 / 2000</span></label>' +
        '<textarea id="fnContent" maxlength="2000" placeholder="展开说说，第一行会作为标题的补充说明"></textarea></div>' +
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
          title: t, content: ct, token: sess.token, ts: Date.now()
        })
      }).then(function () {
        waitForumAck(rid, function (m) {
          submit.disabled = false;
          if (m && (m.type === 'forumOk')) {
            // 先在本机留一份，Pages 还没重建时详情页也能打开
            forumEchoPut({
              id: String(m.id || ''),
              category: Number(box.querySelector('#fnCat').value),
              title: t,
              content: ct,
              author: 'QQ ' + String(sess.qq),
              author_uid: String(sess.uid || ''),
              author_names: (sess.names || []).slice(0, 8),
              anonymous: false,
              created: Date.now(),
              likes: 0,
              replies: []
            });
            setMsg('发布成功！正在跳转…', 'ok');
            setTimeout(function () {
              location.hash = m.id ? ('#/forum/post/' + m.id) : '#/forum';
            }, 600);
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
    '/appeal': renderAppeal,
    '/news': renderNews,
    '/wiki': renderWiki,
    '/me': renderMe
  };

  function resolve(hash) {
    var path = (hash || '#/').replace(/^#/, '');
    if (!path || path === '/') return { page: renderHome, param: '' };
    // 论坛子路由：详情页 /forum/post/<id>
    if (path.indexOf('/forum/post/') === 0) return { page: renderForumPost, param: path.split('/')[3] || '' };
    // 玩家主页：/p/<名字>（雪花点进来的就是它）
    if (path.indexOf('/p/') === 0) {
      var who = path.slice(3);
      try { who = decodeURIComponent(who); } catch (e) {}
      return { page: renderPlayer, param: who };
    }
    if (path === '/forum/new') return { page: renderForumNew, param: '' };
    if (path === '/forum') return { page: renderForum, param: '' };
    if (routes[path]) return { page: routes[path], param: '' };
    return { page: renderHome, param: '' };
  }

  /* 首页天空渐变要一直铺到顶栏后面（.hero 已经钻到 topbar 底下）。
     顶栏这时必须让路变透明，否则会在最上面切出一条白带。
     滚过 Hero 之后自动恢复毛玻璃，保证后面阅读深色文字时的对比度。 */
  function syncTopbarOverHero() {
    var bar = document.querySelector('.topbar');
    if (!bar) return;
    var hero = document.querySelector('.hero');
    var over = false;
    if (hero) {
      // 用「两个矩形是否相交」判断，别写 top<=0：顶栏有 1px 下边框，
      // Hero 顶部会正好落在 y=1，用 0 比较永远判不上。
      var r = hero.getBoundingClientRect();
      var br = bar.getBoundingClientRect();
      over = r.top < br.bottom && r.bottom > br.top;
    }
    if (bar.classList.contains('over-hero') !== over) bar.classList.toggle('over-hero', over);
  }

  function render() {
    clearInterval(window.__stlHeroTimer);
    stopFlakes();           // 换页先停掉雪花循环，否则 Hero 没了还在空转
    LIVE.onUpdate = null;   // 换页了，别再把上一页的刷新函数带着跑
    var r = resolve(location.hash);
    var main = $id('main');
    if (!main) return;
    var path = (location.hash || '#/').replace(/^#/, '');
    if (!path) path = '/';
    renderNav(path);
    r.page(main, r.param);
    window.scrollTo(0, 0);
    syncTopbarOverHero();
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
    window.addEventListener('scroll', syncTopbarOverHero, { passive: true });
    window.addEventListener('resize', syncTopbarOverHero);
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
