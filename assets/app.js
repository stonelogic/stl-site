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

  /* 玩家名片：canvas 画一张 840×440 的图，可以直接发群里。
     头像优先用仓库里的本地皮肤图（同源，不会把 canvas 污染成安全错误） */
  function makePlayerCardBlob(name, o) {
    o = o || {};
    return new Promise(function (resolve, reject) {
      var W = 840, H = 440, dpr = 2;
      var cv = document.createElement('canvas');
      cv.width = W * dpr; cv.height = H * dpr;
      var ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);

      function rr(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }
      function text(t, x, y, size, weight, color, align) {
        ctx.font = weight + ' ' + size + 'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = align || 'left';
        ctx.fillText(String(t), x, y);
      }

      function paint() {
        var g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#0c1e30');
        g.addColorStop(0.55, '#123a5e');
        g.addColorStop(1, '#0a2740');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // 雪花点缀
        for (var i = 0; i < 70; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8 + 0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,' + (0.04 + Math.random() * 0.12).toFixed(2) + ')';
          ctx.fill();
        }

        // 头像
        ctx.save();
        rr(48, 66, 120, 120, 18);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,.08)';
        ctx.fillRect(48, 66, 120, 120);
        if (img && img.width) ctx.drawImage(img, 48, 66, 120, 120);
        else text(String(name).slice(0, 1).toUpperCase(), 108, 142, 48, '700', 'rgba(255,255,255,.8)', 'center');
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,.22)';
        ctx.lineWidth = 2;
        rr(48, 66, 120, 120, 18);
        ctx.stroke();

        text(name, 196, 118, 34, '800', '#ffffff');
        var sub = [];
        if (o.online) sub.push('● 在线');
        if (o.rank) sub.push('在线时长第 ' + o.rank + ' 名');
        sub.push('stone logic');
        text(sub.join('   ·   '), 196, 150, 15, '500', 'rgba(255,255,255,.72)');

        // 分隔线
        ctx.strokeStyle = 'rgba(255,255,255,.14)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(48, 218); ctx.lineTo(W - 48, 218); ctx.stroke();

        // 四格指标
        var items = o.items || [];
        var colW = (W - 96) / 4;
        for (var k = 0; k < 4 && k < items.length; k++) {
          var x = 48 + colW * k;
          text(items[k][0], x, 264, 13, '600', 'rgba(255,255,255,.6)');
          text(items[k][1], x, 300, 26, '800', '#eaf4ff');
          if (items[k][2]) text(items[k][2], x, 324, 12, '500', 'rgba(255,255,255,.5)');
        }

        // 底栏
        ctx.strokeStyle = 'rgba(255,255,255,.14)';
        ctx.beginPath(); ctx.moveTo(48, 366); ctx.lineTo(W - 48, 366); ctx.stroke();
        text(SITE.name || 'Stone Logic', 48, 402, 15, '700', 'rgba(255,255,255,.86)');
        text((location.origin + location.pathname).replace(/index\.html$/, '') + '#/p/' + encodeURIComponent(name),
          840 - 48, 402, 12, '500', 'rgba(255,255,255,.5)', 'right');

        cv.toBlob(function (b) { b ? resolve(b) : reject(new Error('toBlob failed')); }, 'image/png');
      }

      var src = avatarLocal(name) ||
        ('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(identicon(name)));
      var img = new Image();
      img.onload = paint;
      img.onerror = paint;
      img.src = src;
    });
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
    { label: '召集', href: '#/rally' },
    { label: '赛事', href: '#/tourney' },
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

  /* ================= 全站搜索（Ctrl/⌘ + K） =================
     一次拉齐 playtime / forum / wiki / feed 四份数据建索引，之后在内存里搜。
     页面导航、玩家、帖子、Wiki 条目、公告都能搜到，回车直达。 */
  var SIDX = null;              // 建好的索引（只建一次）
  var SIdxLoading = null;       // 建索引中的 promise，避免重复请求
  var SPendingScroll = null;    // 搜索跳 Wiki 后要滚到的锚点 id

  function buildSearchIndex() {
    if (SIDX) return Promise.resolve(SIDX);
    if (SIdxLoading) return SIdxLoading;
    var idx = [];
    NAV.forEach(function (n) {
      idx.push({ k: 'page', t: n.label, s: '页面', u: n.href, w: 1 });
    });
    idx.push({ k: 'page', t: '首页', s: '服务器介绍与入口', u: '#/', w: 1 });
    idx.push({ k: 'page', t: '我的账号', s: 'QQ 登录 / 绑定 / 我的主页', u: '#/me', w: 1 });
    idx.push({ k: 'page', t: '本周战报', s: '本周上线、发帖与战绩汇总', u: '#/weekly', w: 1 });
    idx.push({ k: 'page', t: '活动日历', s: '赛事安排 / 导出 .ics', u: '#/events', w: 1 });
    idx.push({ k: 'page', t: '服务器体检', s: '端口探活 / 内存 / 告警', u: '#/health', w: 1 });
    idx.push({ k: 'page', t: '玩家对比', s: '两个人的数据并排看', u: '#/vs', w: 1 });

    SIdxLoading = Promise.all([
      getJsonFile('playtime.json'),
      new Promise(function (res) { fetchForum(function (d) { res(d); }); }),
      getJsonFile('wiki.json'),
      fetch('feed.xml?_=' + Date.now(), { cache: 'no-store' }).then(function (r) {
        return r.ok ? r.text() : '';
      }).catch(function () { return ''; })
    ]).then(function (r) {
      /* 玩家 */
      ((r[0] && r[0].players) || []).forEach(function (p) {
        idx.push({
          k: 'player', t: p.name,
          s: '总时长 ' + fmtDur(p.total) + (p.rank ? ' · 总榜第 ' + p.rank + ' 名' : ''),
          u: '#/p/' + encodeURIComponent(p.name), w: 5
        });
      });
      /* 论坛帖（含正文，正文命中排后面） */
      ((r[1] && r[1].posts) || []).forEach(function (p) {
        idx.push({
          k: 'post', t: p.title || '(无标题)',
          s: '论坛 · ' + (p.author || '') + ' · ' + fmtTime(p.created),
          x: String(p.content || '').slice(0, 1200) + ' ' + (p.author_names || []).join(' '),
          u: '#/forum/post/' + encodeURIComponent(p.id), w: 4
        });
      });
      /* Wiki 条目：q 是标题，a 是答案 */
      ((r[2] && r[2].sections) || []).forEach(function (s) {
        (s.items || []).forEach(function (it) {
          idx.push({
            k: 'wiki', t: it.q, s: 'Wiki · ' + (s.title || ''),
            x: String(it.a || '').slice(0, 1200),
            u: '#/wiki', anchor: 'wiki-' + s.id, w: 3
          });
        });
      });
      /* 公告：直接从 RSS 里拆 */
      if (r[3]) {
        try {
          var doc = new DOMParser().parseFromString(r[3], 'text/xml');
          Array.prototype.forEach.call(doc.querySelectorAll('item'), function (it) {
            var g = function (tag) {
              var n = it.querySelector(tag);
              return n ? (n.textContent || '').trim() : '';
            };
            idx.push({
              k: 'news', t: g('title') || '(无标题公告)',
              s: '公告 · ' + (g('pubDate') || '').slice(0, 16),
              x: g('description'), u: '#/news', w: 2
            });
          });
        } catch (e) {}
      }
      SIDX = idx;
      return idx;
    }).catch(function () { SIDX = idx; return idx; });

    return SIdxLoading;
  }

  /* 相关度：标题全等 > 标题前缀 > 标题包含 > 副标题 > 正文命中；同级按类型权重 */
  function searchScore(it, q) {
    var t = String(it.t || '').toLowerCase();
    var base = 0;
    if (t === q) base = 1000;
    else if (t.indexOf(q) === 0) base = 800;
    else if (t.indexOf(q) > 0) base = 600;
    else if (String(it.s || '').toLowerCase().indexOf(q) >= 0) base = 400;
    else if (String(it.x || '').toLowerCase().indexOf(q) >= 0) base = 200;
    return base ? base + (it.w || 0) : 0;
  }

  function initSearch() {
    var box = $id('sbox');
    if (!box) return;
    var input = $id('sboxInput'), list = $id('sboxBody'), hint = $id('sboxHint');
    var flat = [], cur = -1, shown = false;

    function rows() { return list ? list.querySelectorAll('.sitem') : []; }
    function setCur(i) {
      var r = rows();
      if (!r.length) { cur = -1; return; }
      cur = (i + r.length) % r.length;
      for (var n = 0; n < r.length; n++) r[n].classList.toggle('on', n === cur);
      var act = r[cur];
      if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    }

    function goto(it) {
      if (!it) return;
      close();
      if (it.anchor) SPendingScroll = it.anchor;
      location.hash = it.u;
      /* 已经在目标页时 hash 不变、不会触发路由，这里补一次 */
      if (it.anchor) setTimeout(function () { applyPendingScroll(); }, 120);
    }

    function drawEmptyState() {
      if (list && !list.querySelector('.sitem')) {
        list.innerHTML = '<div class="sgroup">快捷入口</div><div class="sitem"><span class="sico">⏳</span>' +
          '<span class="stxt"><b>正在准备搜索索引…</b><i>第一次打开要把玩家、帖子、Wiki 都拉一遍</i></span></div>';
      }
      buildSearchIndex().then(function (idx) {
        var pages = idx.filter(function (x) { return x.k === 'page'; }).slice(0, 6);
        var posts = idx.filter(function (x) { return x.k === 'post'; }).slice(0, 4);
        var h = '<div class="sgroup">快捷入口</div>';
        h += pages.map(function (p) {
          return '<div class="sitem" data-u="' + esc(p.u) + '" data-t="' + esc(p.t) + '">' +
            '<span class="sico">' + (S_ICON[p.k] || '') + '</span>' +
            '<span class="stxt"><b>' + esc(p.t) + '</b><i>' + esc(p.s) + '</i></span></div>';
        }).join('');
        if (posts.length) {
          h += '<div class="sgroup">最新帖子</div>';
          h += posts.map(function (p) {
            return '<div class="sitem" data-u="' + esc(p.u) + '" data-t="' + esc(p.t) + '">' +
              '<span class="sico">💬</span>' +
              '<span class="stxt"><b>' + esc(p.t) + '</b><i>' + esc(p.s) + '</i></span></div>';
          }).join('');
        }
        list.innerHTML = h;
        if (hint) hint.textContent = '试试搜玩家名、帖子标题、Wiki 问题';
        bindRows();
        cur = -1;
      });
    }

    function bindRows() {
      Array.prototype.forEach.call(rows(), function (r) {
        r.addEventListener('click', function () {
          var u = r.getAttribute('data-u');
          var anchor = r.getAttribute('data-anchor') || null;
          close();
          if (anchor) SPendingScroll = anchor;
          if (u) location.hash = u;
          if (anchor) setTimeout(applyPendingScroll, 150);
        });
      });
    }

    var S_ICON = { page: '📄', player: '🧊', post: '💬', wiki: '📖', news: '📢' };
    var S_NAME = { page: '页面', player: '玩家', post: '论坛', wiki: 'Wiki', news: '公告' };

    function search(q) {
      q = String(q || '').trim().toLowerCase();
      if (!q) { drawEmptyState(); return; }
      buildSearchIndex().then(function (idx) {
        var hits = [];
        for (var i = 0; i < idx.length; i++) {
          var sc = searchScore(idx[i], q);
          if (sc) hits.push({ it: idx[i], sc: sc });
        }
        hits.sort(function (a, b) { return b.sc - a.sc; });
        hits = hits.slice(0, 40);

        if (!hits.length) {
          list.innerHTML = '<div class="sempty">没找到「' + esc(q) + '」<br>' +
            '<span>换个关键词，或者去<a href="#/forum" data-close="1">论坛</a>发帖问问</span></div>';
          if (hint) hint.textContent = '0 条结果';
          var a = list.querySelector('a[data-close]');
          if (a) a.addEventListener('click', function () { close(); });
          cur = -1;
          return;
        }

        /* 按类型分组，组内保持相关度顺序 */
        var order = ['player', 'page', 'post', 'wiki', 'news'];
        var buckets = {};
        hits.forEach(function (h) { (buckets[h.it.k] = buckets[h.it.k] || []).push(h.it); });
        var html = '';
        order.forEach(function (k) {
          var arr = buckets[k];
          if (!arr || !arr.length) return;
          html += '<div class="sgroup">' + S_NAME[k] + ' · ' + arr.length + '</div>';
          html += arr.slice(0, 8).map(function (it) {
            return '<div class="sitem" data-u="' + esc(it.u) + '"' +
              (it.anchor ? ' data-anchor="' + esc(it.anchor) + '"' : '') + '>' +
              '<span class="sico">' + (S_ICON[k] || '') + '</span>' +
              '<span class="stxt"><b>' + esc(it.t) + '</b><i>' + esc(it.s || '') + '</i></span>' +
              '<span class="sgok">↵</span></div>';
          }).join('');
        });
        list.innerHTML = html;
        if (hint) hint.textContent = hits.length + ' 条结果 · ↑↓ 选择 · Enter 打开';
        bindRows();
        flat = [];
        cur = -1;
        setCur(0);
      });
    }

    function open() {
      if (shown) return;
      shown = true;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      if (input) { input.value = ''; input.focus(); }
      drawEmptyState();
    }
    function close() {
      if (!shown) return;
      shown = false;
      box.hidden = true;
      document.body.style.overflow = '';
      if (input) input.blur();
    }

    var deb;
    if (input) {
      input.addEventListener('input', function () {
        clearTimeout(deb);
        var v = input.value;
        deb = setTimeout(function () { search(v); }, 110);
      });
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown') { ev.preventDefault(); setCur(cur + 1); }
        else if (ev.key === 'ArrowUp') { ev.preventDefault(); setCur(cur - 1); }
        else if (ev.key === 'Enter') {
          ev.preventDefault();
          var r = rows()[cur];
          if (r) r.click();
        } else if (ev.key === 'Escape') { ev.preventDefault(); close(); }
      });
    }
    $id('sboxMask').addEventListener('click', close);
    var sb = $id('searchBtn');
    if (sb) sb.addEventListener('click', function () { shown ? close() : open(); });

    document.addEventListener('keydown', function (ev) {
      var k = ev.key || '';
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test((ev.target && ev.target.tagName) || '') ||
        (ev.target && ev.target.isContentEditable);
      if ((ev.metaKey || ev.ctrlKey) && (k === 'k' || k === 'K')) {
        ev.preventDefault();
        shown ? close() : open();
        return;
      }
      if (k === 'Escape' && shown) { close(); return; }
      if (k === '/' && !shown && !inField) { ev.preventDefault(); open(); }
    });
  }

  /* Wiki 深链：搜索跳到某个条目后，把那一节滚到眼前并展开对应问答 */
  function applyPendingScroll() {
    var id = SPendingScroll;
    if (!id) return;
    var t = $id(id);
    if (!t) return;
    SPendingScroll = null;
    t.querySelectorAll('details').forEach(function (d, i) { d.open = i === 0; });
    var top = t.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
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

  /* ================= 首页动态：群聊跑马灯 + 你不在的这段时间 ================= */

  /* 群聊跑马灯：服务端把最近 40 条闲聊导出成 chat-recent.json（Pages 读不到本机端口） */
  function buildMarquee() {
    var wrap = el('div', 'marquee');
    wrap.id = 'chatMarquee';
    wrap.hidden = true;
    wrap.innerHTML = '<span class="mq-tag">💬 群里在聊</span>' +
      '<div class="mq-track"><div class="mq-run" id="mqRun"></div></div>' +
      '<a class="mq-more" href="#/chat">去聊天 →</a>';
    fetch('chat-recent.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var items = (d && d.items) || [];
        if (!items.length) return;
        var SRC = { qq: '群', mc: '游戏', web: '网页' };
        var line = items.map(function (m) {
          return '<span class="mq-i"><i class="mq-src s-' + esc(m.src || 'web') + '">' +
            (SRC[m.src] || '网页') + '</i><b>' + esc(m.name || '匿名') + '</b> ' +
            esc(m.text || '') + '</span>';
        }).join('<span class="mq-dot">·</span>');
        var run = wrap.querySelector('#mqRun');
        run.innerHTML = line + '<span class="mq-dot">·</span>' + line;  // 复制一份，无缝循环
        run.style.animationDuration = Math.max(26, items.length * 4.2) + 's';
        wrap.hidden = false;
      })
      .catch(function () {});
    return wrap;
  }

  /* 「你不在的这段时间」：拿上次访问存在本地的快照做差，算出这段时间谁最肝、多了几帖 */
  var SNAP_KEY = 'stl_snap_v1';

  function loadSnap() {
    try { return JSON.parse(localStorage.getItem(SNAP_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveSnap(o) {
    try { localStorage.setItem(SNAP_KEY, JSON.stringify(o)); } catch (e) {}
  }
  function snapNow() {
    return Promise.all([
      getJsonFile('playtime.json'), getJsonFile('bedwars.json'),
      getJsonFile('forum.json'), getJsonFile('online.json')
    ]).then(function (r) {
      var o = { t: Date.now(), pt: {}, bw: {}, posts: 0, online: 0 };
      ((r[0] && r[0].players) || []).forEach(function (p) { o.pt[p.name] = Number(p.total) || 0; });
      ((r[1] && r[1].players) || []).forEach(function (p) { o.bw[p.name] = Number(p.score) || 0; });
      o.posts = ((r[2] && r[2].posts) || []).length;
      o.online = Number((r[3] && r[3].now) || 0);
      return o;
    }).catch(function () { return null; });
  }
  /* 时长差转人话（比 fmtDur 更口语，只说到小时/分钟） */
  function durGap(sec) {
    sec = Math.max(0, Math.round(sec));
    if (sec < 60) return sec + ' 秒';
    if (sec < 3600) return Math.round(sec / 60) + ' 分钟';
    var h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    return h + ' 小时' + (m ? ' ' + m + ' 分' : '');
  }
  function agoText(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    if (s < 90) return '刚刚';
    if (s < 5400) return Math.round(s / 60) + ' 分钟';
    if (s < 86400 * 2) return Math.round(s / 3600) + ' 小时';
    return Math.round(s / 86400) + ' 天';
  }

  function renderDigest(box) {
    box.innerHTML = '<h2 class="section-title"><span class="sec-ico">🕒</span>你不在的这段时间</h2>' +
      '<div class="digest" id="digestBody"><div class="digest-load">正在算…</div></div>';
    var body = box.querySelector('#digestBody');
    snapNow().then(function (now) {
      if (!now) { body.innerHTML = '<div class="digest-load">数据加载失败</div>'; return; }
      var old = loadSnap();
      saveSnap(now);
      if (!old || !old.t) {
        body.innerHTML = '<div class="digest-first">' +
          '<p>第一次来？之后每次回来，这里会告诉你——这段时间谁肝得最猛、多了几篇帖子、积分榜有没有换人。</p>' +
          '<a class="btn btn-sm btn-outline" href="#/rank">先去看看排行榜</a></div>';
        return;
      }
      var gapMs = now.t - old.t;
      if (gapMs < 60 * 1000) {
        body.innerHTML = '<div class="digest-first"><p>你刚刚才来过，服务器还没什么新动静。</p></div>';
        return;
      }

      /* 玩得最久的增量 top3 */
      var gain = [];
      Object.keys(now.pt).forEach(function (n) {
        var d = (now.pt[n] || 0) - (old.pt[n] || 0);
        if (d > 0) gain.push({ n: n, d: d });
      });
      gain.sort(function (a, b) { return b.d - a.d; });

      /* 起床积分增量 top3 */
      var bwg = [];
      Object.keys(now.bw).forEach(function (n) {
        var d = (now.bw[n] || 0) - (old.bw[n] || 0);
        if (d > 0) bwg.push({ n: n, d: d });
      });
      bwg.sort(function (a, b) { return b.d - a.d; });

      var newPosts = Math.max(0, now.posts - (old.posts || 0));
      var dOn = (now.online || 0) - (old.online || 0);

      var html = '<div class="digest-top">' +
        '<div class="digest-big"><b>' + esc(agoText(gapMs)) + '</b><span>没来了</span></div>' +
        '<div class="digest-big"><b>' + (newPosts ? '+' + newPosts : '0') + '</b><span>篇新帖</span></div>' +
        '<div class="digest-big"><b>' + (dOn > 0 ? '+' + dOn : String(dOn)) + '</b><span>在线人数变化</span></div>' +
        '</div>';

      if (gain.length) {
        html += '<div class="digest-block"><h4>这段时间肝得最猛</h4>' +
          gain.slice(0, 3).map(function (g, i) {
            return '<div class="digest-row"><span class="digest-rk">' + (i + 1) + '</span>' +
              '<a class="digest-nm" href="#/p/' + encodeURIComponent(g.n) + '">' + esc(g.n) + '</a>' +
              '<span class="digest-val">+' + durGap(g.d) + '</span></div>';
          }).join('') + '</div>';
      }
      if (bwg.length) {
        html += '<div class="digest-block"><h4>起床积分涨得最快</h4>' +
          bwg.slice(0, 3).map(function (g, i) {
            return '<div class="digest-row"><span class="digest-rk">' + (i + 1) + '</span>' +
              '<a class="digest-nm" href="#/p/' + encodeURIComponent(g.n) + '">' + esc(g.n) + '</a>' +
              '<span class="digest-val">+' + g.d + ' 分</span></div>';
          }).join('') + '</div>';
      }
      if (!gain.length && !bwg.length && !newPosts) {
        html += '<div class="digest-load">服务器这段时间挺安静的，可能大家都在忙别的。</div>';
      }
      body.innerHTML = html;
    });
  }

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
      '<p class="hero-online-hint">飘动的小雪花是来自各个地方的玩家，点击看看他们是谁吧！</p>' +
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
    /* 首页挂一条召集横幅：有人约的时候，进站第一屏就能看见 */
    var rallyBar = el('div', 'home-rally');
    hero.parentNode.insertBefore(rallyBar, hero.nextSibling);
    loadHomeRally(rallyBar);

    // 群聊跑马灯（服务端每分钟导出一份最近闲聊）
    container.appendChild(buildMarquee());

    // 玩法特色（4 张概览卡）
    var feat = el('section', 'home-section'); feat.id = 'features';
    feat.innerHTML = '<h2 class="section-title">玩法特色</h2><div class="feat4">' +
      SITE.feat4.map(function (f) {
        return '<div class="feat4-card"><span class="feat4-ico tint-' + f.tint + '">' + SVG[f.icon] + '</span>' +
          '<h3>' + esc(f.title) + '</h3><p>' + esc(f.desc) + '</p></div>';
      }).join('') + '</div>';
    container.appendChild(feat);

    // 「你不在的这段时间」：跟上次访问的快照做差
    var dig = el('section', 'home-section'); dig.id = 'digest';
    container.appendChild(dig);
    renderDigest(dig);

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
      '<div class="st-verdict" id="stVerdict" hidden></div>' +
      '<div class="motd" id="stMotd">正在获取服务器 MOTD…</div>' +
      '<div class="st-chart-wrap">' +
      '<div class="st-chart-head"><span>近 24 小时在线人数</span><span class="st-chart-note" id="stChartNote">加载中…</span></div>' +
      '<canvas class="st-chart" id="stChart"></canvas>' +
      '</div>' +
      '<div class="st-heat-wrap">' +
      '<div class="st-chart-head"><span>在线热力图 · 周几 × 几点</span><span class="st-chart-note" id="stHeatNote">加载中…</span></div>' +
      '<div class="heat-grid" id="stHeat"></div>' +
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
    renderVerdict(d);
    renderHeat(d.heat);
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

  /* 把 24 小时采样点翻成一句人话，放在状态卡下面。
     目的不是好看，是让人不用会看曲线也能知道「最近稳不稳」。 */
  function renderVerdict(d) {
    var box = $id('stVerdict');
    if (!box) return;
    var v = (d.v || []).filter(function (x) { return typeof x === 'number' && isFinite(x); });
    if (v.length < 6) { box.hidden = true; return; }

    var step = Number(d.step) || 10;
    var t0 = Number(d.t0) || (Date.now() - 86400000);
    var sum = 0, peak = -1, peakIdx = 0, busy = 0;
    for (var i = 0; i < v.length; i++) {
      sum += v[i];
      if (v[i] > peak) { peak = v[i]; peakIdx = i; }
      if (v[i] > 0) busy++;
    }

    var items = [], level = 'good';
    if (peak <= 0) {
      items.push('过去 24 小时基本没人上线');
      level = 'warn';
    } else {
      items.push('过去 24 小时平均在线 ' + (Math.round(sum / v.length * 10) / 10) +
        ' 人，峰值 ' + peak + ' 人（约 ' + hhmm(t0 + peakIdx * step * 60000) + '）');
      if (busy < v.length * 0.3) items.push('有人在线的时间只占 ' + Math.round(busy / v.length * 100) + '%');
    }

    /* 内存趋势：拿头 3 个点和尾 3 个点比，比单点更稳 */
    var m = (d.m || []).filter(function (x) { return typeof x === 'number' && x > 0; });
    if (m.length >= 6) {
      var first = (m[0] + m[1] + m[2]) / 3, last = (m[m.length - 1] + m[m.length - 2] + m[m.length - 3]) / 3;
      var pct = first ? Math.round((last - first) / first * 100) : 0;
      if (pct >= 25) { items.push('服务内存涨了 ' + pct + '%，留意是不是泄漏'); level = 'warn'; }
      else if (pct <= -25) items.push('服务内存降了 ' + Math.abs(pct) + '%（多半重启过）');
    }

    var n = d.now || {};
    if (n.liveAge != null && n.liveAge >= 0 && n.liveAge > 300) {
      items.push('在线数据已 ' + Math.round(n.liveAge / 60) + ' 分钟没更新');
      level = 'warn';
    }
    if (d.count != null && d.range) {
      var expect = Math.floor(Number(d.range) / step);
      if (expect && d.count < expect * 0.5) {
        items.push('采样点只有预期的 ' + Math.round(d.count / expect * 100) + '%，采集可能断过');
        level = 'warn';
      }
    }

    box.hidden = false;
    box.className = 'st-verdict is-' + level;
    box.textContent = items.join('；') + '。';
  }

  /* 7×24 在线热力图：颜色深浅 = 那个时段的平均在线人数 */
  function renderHeat(h) {
    var wrap = $id('stHeat'), note = $id('stHeatNote');
    if (!wrap) return;
    var cells = h && h.cells, counts = (h && h.counts) || [];
    if (!Array.isArray(cells) || cells.length !== 168) {
      wrap.innerHTML = '<div class="heat-empty">热力图在后台慢慢累积，跑上几天就能看出「周几几点最热闹」。</div>';
      if (note) note.textContent = '';
      return;
    }
    var max = 0, filled = 0, i;
    for (i = 0; i < 168; i++) {
      if (cells[i] != null && cells[i] > max) max = cells[i];
      if (counts[i] > 0) filled++;
    }
    if (!filled) {
      wrap.innerHTML = '<div class="heat-empty">刚开始采集，让它挂着跑一晚吧。</div>';
      if (note) note.textContent = '';
      return;
    }
    if (note) note.textContent = filled + '/168 格有样本 · 颜色越深人越多';

    var days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var out = ['<div class="heat-row heat-head"><span class="heat-lb"></span>'];
    for (var hh = 0; hh < 24; hh++) out.push('<span class="heat-h">' + (hh % 3 === 0 ? hh : '') + '</span>');
    out.push('</div>');
    for (var dw = 0; dw < 7; dw++) {
      out.push('<div class="heat-row"><span class="heat-lb">' + days[dw] + '</span>');
      for (var hr = 0; hr < 24; hr++) {
        var val = cells[dw * 24 + hr];
        var alpha = (val == null || !max) ? 0 : (0.14 + 0.86 * Math.min(1, val / max));
        /* 没样本的格子留成静音灰（交给 CSS），有样本才上色 */
        var style = (val == null || !alpha) ? '' : ' style="background:rgba(64,150,235,' + alpha.toFixed(2) + ')"';
        out.push('<span class="heat-c"' + style + ' title="' +
          days[dw] + ' ' + (hr < 10 ? '0' : '') + hr + ':00 · ' +
          (val == null ? '无数据' : val + ' 人') + '"></span>');
      }
      out.push('</div>');
    }
    wrap.innerHTML = out.join('');
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
      /* 格子本身就是进玩家主页的入口（和首页雪花一个去处）；
         右上角那个 👋 是「戳一下」——点了会在游戏里提示对方，不能触发跳转 */
      return '<a class="player-cell" href="#/p/' + encodeURIComponent(name) + '" data-name="' + esc(name) + '">' +
        '<span class="poke" role="button" tabindex="0" data-poke="' + esc(name) + '" title="在游戏里戳 ' + esc(name) + ' 一下" aria-label="戳一下">👋</span>' +
        '<img src="' + face + '" alt="" loading="lazy" data-fb="' + identicon(name) + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">' +
        '<span class="nm">' + esc(name) + '</span></a>';
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
      '<div class="pf-act">' +
      '<button class="btn btn-sm" id="pfCard" type="button">🖼️ 名片</button>' +
      '<button class="btn btn-sm" id="pfPoke" type="button" hidden>👋 戳一下</button>' +
      '<a class="btn btn-sm" href="#/vs/' + encodeURIComponent(nm) + '">⚖️ 对比</a>' +
      '<a class="btn btn-sm" href="#/rank">排行榜</a>' +
      '</div>' +
      '</div>' +
      '<div id="pfBody"><div class="empty"><div class="ico">⏳</div><p>正在读取玩家数据…</p></div></div>';
    container.appendChild(card);

    var body = card.querySelector('#pfBody');
    var tags = card.querySelector('#pfTags');
    var low = nm.toLowerCase();

    /* 只有人在线才给「戳一下」——离线戳了对方也看不见 */
    var pokeBtn = card.querySelector('#pfPoke');
    if (pokeBtn) {
      pokeBtn.addEventListener('click', function () { pokePlayer(nm, this); });
      fetchLocalOnline(function (d) {
        var list = (d && Array.isArray(d.players)) ? d.players : [];
        for (var i = 0; i < list.length; i++) {
          if (String(list[i]).toLowerCase() === low) { pokeBtn.hidden = false; return; }
        }
      });
    }

    /* 实时状态（血量/等级/手持）+ 留言：单独两张卡挂在下面，
       不掺进上面那套异步绘制里，出问题也不影响资料本身 */
    var liveCard = el('div', 'card pf-live');
    container.appendChild(liveCard);
    loadLiveStatus(liveCard, nm);
    var msgCard = el('div', 'card pf-msg');
    container.appendChild(msgCard);
    buildMsgCard(msgCard, nm);

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

      /* ---- 名片按钮（数据到位后才绑，卡片要用 pt/bw） ---- */
      var cardBtn = card.querySelector('#pfCard');
      if (cardBtn) cardBtn.addEventListener('click', function () {
        var label = cardBtn.textContent;
        cardBtn.disabled = true; cardBtn.textContent = '生成中…';
        var items = [];
        if (pt) items.push(['在线时长', fmtDur(pt.total), pt.rank ? '第 ' + pt.rank + ' 名' : '']);
        if (bw) items.push(['起床积分', String(bw.score != null ? bw.score : '—'), bw.rank ? '第 ' + bw.rank + ' 名' : '']);
        if (bw) items.push(['胜率', (bw.winRate != null ? bw.winRate + '%' : '—'), (bw.wins || 0) + ' 胜 / ' + (bw.loses || 0) + ' 负']);
        if (bw) items.push(['破床', String(bw.destroyedBeds != null ? bw.destroyedBeds : '—'), 'K/D ' + (bw.kd != null ? bw.kd : '—')]);
        makePlayerCardBlob(nm, { online: isOn, rank: pt && pt.rank, items: items }).then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = nm + '-名片.png';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 6000);
          cardBtn.disabled = false; cardBtn.textContent = label;
        }).catch(function () {
          cardBtn.disabled = false; cardBtn.textContent = label;
          toast('名片生成失败，换个浏览器试试');
        });
      });

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

  /* --- 玩家对比：#/vs/a/b --- */
  function renderVs(container, _p, params) {
    var arr = params || [];
    var n1 = String(arr[0] || '').trim(), n2 = String(arr[1] || '').trim();
    container.innerHTML = pageHead('首页', '玩家对比', '两个人的在线时长与起床战绩并排看，谁更肝一目了然');
    var box = el('div', 'card');
    container.appendChild(box);
    if (!n1) {
      box.innerHTML = '<div class="empty"><div class="ico">⚖️</div><p>用法：<code>#/vs/玩家A/玩家B</code></p>' +
        '<p style="font-size:13px">在玩家主页点「⚖️ 对比」就会打开这里。</p></div>';
      return;
    }
    if (!n2) {
      /* 只给了一个人：让他挑对手 */
      box.innerHTML = '<div class="vs-pick"><img class="vs-av" src="' + avatarUrl(n1, 80) + '" alt="" ' +
        'data-fb="' + identicon(n1) + '" onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">' +
        '<div class="vs-pick-main"><div class="vs-pick-t">' + esc(n1) + ' 要和谁比？</div>' +
        '<div class="rf-row" style="margin-top:10px">' +
        '<select id="vsPick" class="vs-select"></select>' +
        '<button class="btn btn-primary btn-sm" id="vsGo" type="button">开始对比</button></div></div></div>';
      getJsonFile('playtime.json').then(function (d) {
        var sel = box.querySelector('#vsPick');
        if (!sel) return;
        var list = ((d && d.players) || []).filter(function (p) {
          return String(p.name).toLowerCase() !== n1.toLowerCase();
        });
        sel.innerHTML = list.length
          ? list.map(function (p) { return '<option value="' + esc(p.name) + '">' + esc(p.name) + '（' + fmtDur(p.total) + '）</option>'; }).join('')
          : '<option value="">还没有别的玩家</option>';
      });
      box.querySelector('#vsGo').addEventListener('click', function () {
        var v = box.querySelector('#vsPick').value;
        if (!v) return;
        location.hash = '#/vs/' + encodeURIComponent(n1) + '/' + encodeURIComponent(v);
      });
      return;
    }
    box.innerHTML = '<div class="empty"><div class="ico">⏳</div><p>正在对比…</p></div>';

    Promise.all([getJsonFile('playtime.json'), getJsonFile('bedwars.json'),
                 getJsonFile('online.json'), getJsonFile('forum.json')]).then(function (r) {
      function find(list, n) {
        var k = String(n).toLowerCase();
        for (var i = 0; i < list.length; i++) if (String(list[i].name || list[i].author || '').toLowerCase() === k) return list[i];
        return null;
      }
      var ptA = find((r[0] && r[0].players) || [], n1), ptB = find((r[0] && r[0].players) || [], n2);
      var bwA = find((r[1] && r[1].players) || [], n1), bwB = find((r[1] && r[1].players) || [], n2);
      var onA = ((r[2] && r[2].players) || []).some(function (x) { return String(x).toLowerCase() === n1.toLowerCase(); });
      var onB = ((r[2] && r[2].players) || []).some(function (x) { return String(x).toLowerCase() === n2.toLowerCase(); });
      var posts = (r[3] && r[3].posts) || [];
      function postCount(n) {
        return posts.filter(function (p) {
          if (String(p.author || '').toLowerCase() === n.toLowerCase()) return true;
          return (p.author_names || []).some(function (x) { return String(x).toLowerCase() === n.toLowerCase(); });
        }).length;
      }

      function head(nm, on) {
        return '<div class="vs-side">' +
          '<img class="vs-av" src="' + avatarUrl(nm, 80) + '" alt="" data-fb="' + identicon(nm) + '" ' +
          'onerror="this.onerror=null;this.src=this.getAttribute(\'data-fb\')">' +
          '<a class="vs-name" href="#/p/' + encodeURIComponent(nm) + '">' + esc(nm) + '</a>' +
          '<span class="status-pill ' + (on ? 'on' : 'off') + '">' + (on ? '● 在线' : '● 离线') + '</span>' +
          '</div>';
      }

      var rows = [
        ['总时长', ptA && ptA.total, ptB && ptB.total, 'dur'],
        ['本周', ptA && ptA.week, ptB && ptB.week, 'dur'],
        ['本月', ptA && ptA.month, ptB && ptB.month, 'dur'],
        ['起床积分', bwA && bwA.score, bwB && bwB.score, 'num'],
        ['胜率', bwA && bwA.winRate, bwB && bwB.winRate, 'pct'],
        ['K/D', bwA && bwA.kd, bwB && bwB.kd, 'dec'],
        ['破床', bwA && bwA.destroyedBeds, bwB && bwB.destroyedBeds, 'num'],
        ['论坛发帖', postCount(n1), postCount(n2), 'num']
      ];

      function cell(v, kind, win) {
        if (v == null) return '<td class="vs-v">—</td>';
        var txt = kind === 'dur' ? fmtDur(v) : (kind === 'pct' ? v + '%' : (kind === 'dec' ? (Math.round(Number(v) * 100) / 100) : v));
        return '<td class="vs-v' + (win ? ' is-win' : '') + '">' + txt + '</td>';
      }

      var html = '<div class="vs-head">' + head(n1, onA) +
        '<div class="vs-mid">VS</div>' + head(n2, onB) + '</div><table class="vs-table"><tbody>';
      rows.forEach(function (row) {
        var va = row[1], vb = row[2];
        var winner = (typeof va === 'number' && typeof vb === 'number') ? (va > vb ? 1 : (vb > va ? 2 : 0)) : 0;
        html += '<tr><th>' + row[0] + '</th>' + cell(va, row[3], winner === 1) +
          cell(vb, row[3], winner === 2) + '</tr>';
      });
      html += '</tbody></table><p class="vs-tip">高亮的是数值更高的一方；数据来自服务器定时导出。</p>';
      box.innerHTML = html;
    }).catch(function () {
      box.innerHTML = emptyState('📡', '对比数据加载失败，请稍后刷新');
    });
  }

  /* 简单的 JSON 读取（多处复用） */
  function getJsonFile(f) {
    return fetch(f + '?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  /* --- 在线状态页（在线玩家 ID + 头像） --- */
  function renderOnline(container) {
    container.innerHTML = pageHead('在线', '在线状态', '状态自动刷新；玩家名单每分钟同步，坐标按 100 格取整，只做大方向参考；点玩家头像看资料，点 👋 在游戏里提醒他');
    var card = el('div', 'card'); container.appendChild(card);
    card.innerHTML = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap">' +
      '<span class="status-pill" id="olPill">检测中…</span>' +
      '<span style="font-size:15px;font-weight:700" id="olCount">—</span>' +
      '</div>' +
      '<div class="player-grid" id="olPlayers"></div>';
    /* 名单每次心跳都会重画，但 #olPlayers 这个容器一直在，事件挂它身上不会丢 */
    var grid = $id('olPlayers');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.poke') : null;
        if (!b) return;
        e.preventDefault();          // 别顺着 <a> 跳到玩家主页
        e.stopPropagation();
        pokePlayer(b.getAttribute('data-poke'), b);
      });
    }
    renderLive();
    loadOnline();
    LIVE.onUpdate = loadOnline;   // 人数/胶囊由 renderLive 写，这里只负责名单
  }

  /* 「戳一下」：网站上点一下 → 服务端 RCON 给游戏里的他发一条 tellraw */
  function pokePlayer(name, btn) {
    if (!name) return;
    var sess = getSession();
    if (!sess) { toast('先登录才能戳人（右上角「登录」）'); return; }
    if (btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    btn.classList.add('busy');
    var rid = randomHex(8);
    postBus({ type: 'poke', rid: rid, token: sess.token, target: name });
    waitBus(rid, ['pokeOk', 'pokeErr'], function (m) {
      delete btn.dataset.busy;
      btn.classList.remove('busy');
      if (!m) { toast('戳了个空，等会儿再试'); return; }
      if (m.type === 'pokeErr' || m.ok === false) { toast(m.reason || '没戳动'); return; }
      toast('已戳 ' + name + '，他游戏里会收到提示' +
        (typeof m.left === 'number' ? '（今天还剩 ' + m.left + ' 次）' : ''));
    });
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
      loadWhere();          // 位置信息异步补上，晚到也不会挡住名单
      renderLive();
    });
  }

  /* --- 玩家「现在在哪」：走总线问服务端，服务端用 RCON 查坐标并按 100 格取整 --- */
  var WHERE = { at: 0, map: null, busy: false };

  function applyWhere() {
    if (!WHERE.map) return;
    var cells = document.querySelectorAll('#olPlayers .player-cell');
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var n = String(cell.getAttribute('data-name') || '').toLowerCase();
      var it = WHERE.map[n];
      if (!it || cell.querySelector('.where')) continue;
      var s = document.createElement('span');
      s.className = 'where';
      s.title = it.dim + ' · 约 ' + it.x + ', ' + it.y + ', ' + it.z + '（按 100 格取整，只做大方向参考）';
      /* 出生点 / 主城附近取整后全是 0，直接写坐标等于没说，换成「原点附近」 */
      s.textContent = it.dim + ((it.x === 0 && it.z === 0) ? ' · 原点附近' : (' · 约 ' + it.x + ', ' + it.y + ', ' + it.z));
      cell.appendChild(s);
    }
  }

  function loadWhere() {
    if (!document.getElementById('olPlayers')) return;
    if (WHERE.map && Date.now() - WHERE.at < 60000) { applyWhere(); return; }
    if (WHERE.busy) return;
    WHERE.busy = true;
    var rid = randomHex(8);
    postBus({ type: 'whereQuery', rid: rid });
    waitBus(rid, ['whereOk', 'whereErr'], function (m) {
      WHERE.busy = false;
      if (!m || m.type === 'whereErr' || !Array.isArray(m.items)) return;
      var map = {};
      m.items.forEach(function (it) { map[String(it.name || '').toLowerCase()] = it; });
      WHERE.map = map;
      WHERE.at = Date.now();
      applyWhere();
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
      '<button class="btn btn-sm rank-tab" data-tab="prog" type="button">📈 进步榜</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="bw" type="button">⚔️ 起床战绩</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="lab" type="button">🧪 战力实验室</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="forum" type="button">💬 论坛活跃</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="build" type="button">🏛️ 建筑作品</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="ach" type="button">🏅 成就</button>' +
      '<button class="btn btn-sm rank-tab" data-tab="score" type="button">🎯 计分板</button>' +
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

    /* 进步榜：总时长榜被老人永久占据，这里按「本周 / 本月增量」排，新人才有奔头 */
    function showProg() {
      body.innerHTML =
        '<div class="seg" id="progSeg">' +
        '<button class="seg-btn on" data-r="week" type="button">本周</button>' +
        '<button class="seg-btn" data-r="month" type="button">本月</button>' +
        '</div>' +
        '<div id="progMeta" style="font-size:13px;color:var(--muted-foreground);margin-bottom:14px">加载中…</div>' +
        '<div id="progList"></div>';
      var list = body.querySelector('#progList');
      var meta = body.querySelector('#progMeta');
      var range = 'week', data = null;

      function draw() {
        if (!data) return;
        var arr = (data.players || []).filter(function (p) { return Number(p[range] || 0) > 0; })
          .sort(function (a, b) { return Number(b[range]) - Number(a[range]); });
        if (!arr.length) {
          list.innerHTML = emptyState('📈', (range === 'week' ? '本周' : '本月') + '还没有人上线过');
          return;
        }
        var top = Number(arr[0][range]) || 1;
        meta.textContent = '共 ' + arr.length + ' 人' + (range === 'week' ? '本周' : '本月') +
          '上线过 · 按增量排，和总时长榜无关';
        list.innerHTML = arr.slice(0, 30).map(function (p, i) {
          var sub = '累计 ' + fmtDur(p.total) + (p.rank ? ' · 总榜第 ' + p.rank + ' 名' : '');
          return rankRow(i + 1, p.name, '+' + fmtDur(p[range]), sub,
            Math.max(4, Math.round(Number(p[range]) / top * 100)));
        }).join('');
      }

      body.querySelectorAll('#progSeg .seg-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          body.querySelectorAll('#progSeg .seg-btn').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          range = b.getAttribute('data-r');
          draw();
        });
      });

      fetch('playtime.json?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !Array.isArray(d.players)) { list.innerHTML = emptyState('📡', '数据加载失败'); meta.textContent = ''; return; }
          data = d;
          draw();
        })
        .catch(function () { list.innerHTML = emptyState('📡', '数据加载失败'); });
    }

    /* 战力实验室：胜率 × K/D 散点图，一眼看出自己站在哪个象限 */
    function showLab() {
      body.innerHTML = '<div id="labMeta" style="font-size:13px;color:var(--muted-foreground);margin-bottom:14px">加载中…</div>' +
        '<div class="lab-wrap" id="labWrap"></div>';
      var wrap = body.querySelector('#labWrap');
      var meta = body.querySelector('#labMeta');

      fetch('bedwars.json?_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var arr = ((d && d.players) || []).filter(function (p) {
            return (Number(p.wins || 0) + Number(p.loses || 0)) >= 1 && p.winRate != null;
          });
          if (arr.length < 3) {
            wrap.innerHTML = emptyState('🧪', '参与起床战争的玩家还不够多，多打几局再看');
            meta.textContent = '';
            return;
          }
          meta.textContent = '共 ' + arr.length + ' 人 · 横轴胜率，纵轴 K/D；点越大积分越高，鼠标悬停看名字';

          var W = 720, H = 420, padL = 52, padR = 18, padT = 18, padB = 46;
          var maxKd = Math.max(2, Math.min(8, Math.ceil(Math.max.apply(null, arr.map(function (p) {
            return Math.min(8, Number(p.kd) || 0);
          })) * 1.1)));
          var maxScore = Math.max(1, Math.max.apply(null, arr.map(function (p) { return Number(p.score) || 0; })));

          function X(rate) { return padL + (W - padL - padR) * (Math.max(0, Math.min(100, rate)) / 100); }
          function Y(kd) { return H - padB - (H - padT - padB) * (Math.max(0, Math.min(maxKd, kd)) / maxKd); }

          var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" class="lab-svg" preserveAspectRatio="xMidYMid meet">'];
          // 网格
          for (var gx = 0; gx <= 4; gx++) {
            var xv = gx * 25;
            s.push('<line x1="' + X(xv) + '" y1="' + padT + '" x2="' + X(xv) + '" y2="' + (H - padB) + '" stroke="currentColor" stroke-opacity=".12"/>');
            s.push('<text x="' + X(xv) + '" y="' + (H - padB + 16) + '" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity=".6">' + xv + '%</text>');
          }
          for (var gy = 0; gy <= 4; gy++) {
            var yv = maxKd * gy / 4;
            s.push('<line x1="' + padL + '" y1="' + Y(yv) + '" x2="' + (W - padR) + '" y2="' + Y(yv) + '" stroke="currentColor" stroke-opacity=".12"/>');
            s.push('<text x="' + (padL - 8) + '" y="' + (Y(yv) + 4) + '" text-anchor="end" font-size="11" fill="currentColor" fill-opacity=".6">' + (Math.round(yv * 10) / 10) + '</text>');
          }
          // 分界虚线：胜率 50% / K/D 1.5
          s.push('<line x1="' + X(50) + '" y1="' + padT + '" x2="' + X(50) + '" y2="' + (H - padB) + '" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="4 4"/>');
          s.push('<line x1="' + padL + '" y1="' + Y(1.5) + '" x2="' + (W - padR) + '" y2="' + Y(1.5) + '" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="4 4"/>');
          // 象限标签
          var qs = [
            ['孤狼型 · 能打但常输', X(25), Y(maxKd * 0.92)],
            ['全能王', X(75), Y(maxKd * 0.92)],
            ['萌新保护区', X(25), Y(maxKd * 0.06)],
            ['守家型 · 稳但少打架', X(75), Y(maxKd * 0.06)]
          ];
          qs.forEach(function (q) {
            s.push('<text x="' + q[1] + '" y="' + q[2] + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="currentColor" fill-opacity=".32">' + q[0] + '</text>');
          });
          // 散点
          arr.forEach(function (p) {
            var kd = Math.min(maxKd, Number(p.kd) || 0);
            var r = 4 + 6 * Math.sqrt((Number(p.score) || 0) / maxScore);
            s.push('<circle cx="' + X(Number(p.winRate)) + '" cy="' + Y(kd) + '" r="' + r.toFixed(1) + '" ' +
              'fill="var(--primary)" fill-opacity=".55" stroke="var(--primary)" stroke-opacity=".9" stroke-width="1">' +
              '<title>' + esc(p.name) + ' · 胜率 ' + p.winRate + '% · K/D ' + kd + ' · 积分 ' + (p.score || 0) + '</title></circle>');
          });
          // 标注积分前 3
          arr.slice().sort(function (a, b) { return (b.score || 0) - (a.score || 0); }).slice(0, 3).forEach(function (p) {
            var kd = Math.min(maxKd, Number(p.kd) || 0);
            s.push('<text x="' + X(Number(p.winRate)) + '" y="' + (Y(kd) - 12) + '" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" fill-opacity=".75">' + esc(p.name) + '</text>');
          });
          s.push('<text x="' + (W / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11.5" fill="currentColor" fill-opacity=".55">胜率 →</text>');
          s.push('<text x="14" y="' + (H / 2) + '" text-anchor="middle" font-size="11.5" fill="currentColor" fill-opacity=".55" transform="rotate(-90 14 ' + (H / 2) + ')">K/D →</text>');
          s.push('</svg>');
          wrap.innerHTML = s.join('');
        })
        .catch(function () { wrap.innerHTML = emptyState('📡', '战绩加载失败'); });
    }

    function showScore() { renderScoreInto(body); }
    var TAB_FN = { play: showPlay, prog: showProg, bw: showBw, lab: showLab, forum: showForum, build: showBuilds, ach: showAch, score: showScore };
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
        applyPendingScroll();   // 从搜索跳过来的，滚到对应条目
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
  var BUS_DOWN = false, BUS_WARNED = false, BUS_MUTE_UNTIL = 0;
  /* 从本机服务打开站点时走同源 /api/bus，一次请求换一次回执，
     完全不依赖 ntfy —— 公共通道限流时，服主在本机照样能创建赛事、记分、签到。 */
  var LOCAL_BUS = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  var LOCAL_REPLY = {};
  function postBus(obj) {
    if (LOCAL_BUS) {
      return fetch('/api/bus', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(obj)
      }).then(function (r) { return r.json(); })
        .then(function (m) { LOCAL_REPLY[obj.rid] = m; return true; })
        .catch(function () { return false; });
    }
    /* 配额打满后先静默 30 分钟，别再发注定失败的请求 */
    if (BUS_DOWN && Date.now() < BUS_MUTE_UNTIL) return Promise.resolve(false);
    return fetch(NTFY_BASE + '/' + NTFY_TOPIC, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify(obj)
    }).then(function (r) {
      if (r.status === 429) {
        BUS_DOWN = true;
        BUS_MUTE_UNTIL = Date.now() + 30 * 60000;
        if (!BUS_WARNED) {
          BUS_WARNED = true;
          toast('消息通道今日已达上限，正在显示最近一次快照；写操作暂时不可用');
          setTimeout(function () { BUS_WARNED = false; }, 60000);
        }
        return false;
      }
      BUS_DOWN = false;
      return true;
    }).catch(function () { return false; });
  }
  /* 站点数据快照：不占消息配额，页面先渲染出来，总线只负责写和实时刷新 */
  var SNAP = { data: null, at: 0 };
  function snapshot(cb) {
    /* ntfy 限流时，这是公网页面的唯一实时来源。缓存压到 4 秒，
       让 20 秒轮询每次都能拿到游戏服刚 force 推送的新快照。 */
    if (SNAP.data && Date.now() - SNAP.at < 4000) { cb(SNAP.data); return; }
    fetch('bus-snapshot.json?_=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) { SNAP.data = d; SNAP.at = Date.now(); } cb(d || null); })
      .catch(function () { cb(null); });
  }
  function snapAdmins(s, sess) {
    return !!(s && sess && Array.isArray(s.admins) &&
      s.admins.map(String).indexOf(String(sess.qq)) >= 0);
  }
  function busFailHtml() {
    return '<div class="empty"><div class="ico">📡</div><p>' +
      (BUS_DOWN ? '消息通道今日已达上限，暂时读不到最新数据' : '读取失败，稍后刷新再试') +
      '</p><p style="font-size:12px;color:var(--muted-foreground)">' +
      (BUS_DOWN ? '上面是最近一次的快照；创建、记分等操作需等通道恢复' : '') + '</p></div>';
  }
  /* 等总线上与自己 rid 匹配的回执（论坛/个人中心共用同一套玩法） */
  function waitBus(rid, types, cb) {
    if (LOCAL_BUS) {
      var tries = 0;
      (function poll() {
        var m = LOCAL_REPLY[rid];
        if (m) { delete LOCAL_REPLY[rid]; return cb(m); }
        if (++tries > 60) return cb(null);
        setTimeout(poll, 100);
      })();
      return;
    }
    /* 通道不可用时立刻收尾，页面保留快照数据，不空等 15 秒 */
    if (BUS_DOWN) return cb(null);
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

  /* 里程碑徽章：不依赖服务端发放，纯按在线时长 / 论坛活跃度算，人人都有得追 */
  function localBadges(pt, fm) {
    var h = pt ? Number(pt.total || 0) / 3600 : 0;
    var wk = pt ? Number(pt.week || 0) / 3600 : 0;
    var mo = pt ? Number(pt.month || 0) / 3600 : 0;
    var posts = Number((fm && fm.posts) || 0);
    var replies = Number((fm && fm.replies) || 0);
    var rank = pt ? Number(pt.rank || 0) : 0;
    return [
      { icon: '🌱', name: '初来乍到', got: !!pt && h > 0, need: '玩过一次' },
      { icon: '🕐', name: '十小时', got: h >= 10, need: '在线满 10 小时' },
      { icon: '⛏️', name: '百小时矿工', got: h >= 100, need: '在线满 100 小时' },
      { icon: '👑', name: '千小时传奇', got: h >= 1000, need: '在线满 1000 小时' },
      { icon: '📅', name: '本周活跃', got: wk >= 5, need: '本周满 5 小时' },
      { icon: '🔥', name: '本月劳模', got: mo >= 20, need: '本月满 20 小时' },
      { icon: '🏆', name: '榜单前十', got: rank > 0 && rank <= 10, need: '总榜前十' },
      { icon: '✍️', name: '论坛常客', got: posts >= 5, need: '发满 5 帖' },
      { icon: '💬', name: '热心回复', got: replies >= 20, need: '回复满 20 条' }
    ];
  }

  /* 每日签到：状态先问一次，签到时再走一遍总线（奖励由服务端 RCON 发到游戏里） */
  function loadCheckin(box, sess) {
    var sub = box.querySelector('#meChkSub');
    var act = box.querySelector('#meChkAct');
    if (!sub || !act) return;

    function paint(d) {
      var st = d.stats || { total: 0, streak: 0, todayDone: false };
      var parts = [];
      if (d.name) parts.push('主号 ' + d.name);
      else if (d.names && d.names.length) parts.push('主号 ' + d.names[0]);
      parts.push('连续 ' + st.streak + ' 天');
      parts.push('累计 ' + st.total + ' 天');
      sub.textContent = parts.join(' · ') + '　' + (d.reward ? ('奖励：' + d.reward) : '（暂未配置奖励）');
      if (d.enabled === false) { act.innerHTML = '<span class="me-chk-off">签到暂未开放</span>'; return; }
      if (st.todayDone) { act.innerHTML = '<span class="me-chk-done">✓ 今天已签</span>'; return; }
      act.innerHTML = '<button class="btn btn-primary me-chk-btn" type="button">签到</button>';
      act.querySelector('.me-chk-btn').addEventListener('click', function () { doIt(this); });
    }

    function doIt(btn) {
      btn.disabled = true;
      btn.textContent = '签到中…';
      var rid = randomHex(8);
      postBus({ type: 'checkin', rid: rid, token: sess.token });
      waitBus(rid, ['checkinOk', 'checkinErr'], function (m) {
        btn.disabled = false;
        if (!m || m.type === 'checkinErr' || m.ok === false) {
          toast((m && m.reason) || '签到失败，请稍后重试');
          btn.textContent = '签到';
          if (m && m.stats) paint(m);
          return;
        }
        var msg = '签到成功！连续 ' + ((m.stats && m.stats.streak) || 1) + ' 天';
        if (m.delivery === 'now') msg += '，奖励已发到游戏里';
        else if (m.delivery === 'queued') msg += '，上线后自动补发奖励';
        else if (m.delivery === 'failed') msg += '，奖励没发出去，请联系腐竹';
        else if (m.delivery === 'none') msg += '（当前没有配置奖励）';
        toast(msg);
        paint(m);
      });
    }

    var rid = randomHex(8);
    postBus({ type: 'checkinQuery', rid: rid, token: sess.token });
    waitBus(rid, ['checkinOk', 'checkinErr'], function (m) {
      if (!m || m.type === 'checkinErr') {
        sub.textContent = (m && m.reason) || '签到状态读取失败，稍后再试';
        return;
      }
      paint(m);
    });
  }

  /* 新手任务：进度由服务端按站里已有数据算，前端只负责画和领奖 */
  function loadQuests(box, sess) {
    var list = box.querySelector('#qList');
    var sub = box.querySelector('#qSub');
    if (!list) return;

    function paint(m) {
      var items = m.items || [];
      var got = items.filter(function (x) { return x.claimed; }).length;
      var ready = items.filter(function (x) { return x.done && !x.claimed; }).length;
      sub.textContent = '已领 ' + got + ' / ' + items.length +
        (ready ? ' · 有 ' + ready + ' 个可以领了' : '') + '　奖励会发到游戏里';
      list.innerHTML = items.map(function (q) {
        var act = q.claimed
          ? '<span class="q-got">✓ 已领取</span>'
          : (q.done
            ? '<button class="btn btn-sm btn-primary q-claim" data-key="' + esc(q.key) + '">领 ' + q.reward + ' 绿宝石</button>'
            : '<span class="q-todo">未达成</span>');
        return '<div class="q-row' + (q.claimed ? ' claimed' : (q.done ? ' ready' : '')) + '">' +
          '<span class="q-ico">' + q.icon + '</span>' +
          '<div class="q-main"><div class="q-t">' + esc(q.title) +
          '<span class="q-label">' + esc(q.label) + '</span></div>' +
          '<div class="q-desc">' + esc(q.desc) + '</div>' +
          '<div class="q-bar"><i style="width:' + q.pct + '%"></i></div></div>' +
          '<div class="q-act">' + act + '</div></div>';
      }).join('');
    }

    list.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.q-claim') : null;
      if (!b) return;
      b.disabled = true;
      var rid = randomHex(8);
      postBus({ type: 'questClaim', rid: rid, token: sess.token, key: b.getAttribute('data-key') });
      waitBus(rid, ['questOk', 'questErr'], function (m) {
        b.disabled = false;
        if (!m) { toast('领取超时，稍后再试'); return; }
        if (m.type === 'questErr') { toast(m.reason || '领取失败'); return; }
        toast(m.delivery === 'now' ? ('奖励已发到游戏里，+' + m.reward + ' 绿宝石')
          : ('领好了，上线后自动补发 +' + m.reward + ' 绿宝石'));
        paint(m);
      });
    });

    var rid = randomHex(8);
    postBus({ type: 'questQuery', rid: rid, token: sess.token });
    waitBus(rid, ['questOk', 'questErr'], function (m) {
      if (!m || m.type === 'questErr') { list.innerHTML = '<div class="q-empty">任务读取失败，刷新再试</div>'; return; }
      paint(m);
    });
  }

  /* 「我上次死在哪」：服务端读死亡记录 + 当前位置，算出距离和方向；
     跨维度时按 1:8 换算成「这个维度该去的坐标」，比只给一个死坐标有用 */
  function loadDeath(box, sess) {
    var body = box.querySelector('#meDeathBody');
    var btn = box.querySelector('#meDeathBtn');
    if (!body) return;

    function paint(m) {
      if (!m) { body.innerHTML = '<span class="me-death-none">查询超时了，点「重新查询」再试一次。</span>'; return; }
      if (m.type === 'deathErr') { body.innerHTML = '<span class="me-death-none">' + esc(m.reason || '查询失败') + '</span>'; return; }
      if (m.none) {
        body.innerHTML = '<span class="me-death-none">还没有死亡记录 —— 要么没死过，要么记录已被服务器清理。保持住。</span>';
        return;
      }
      var d = m.death || {};
      var html = '<div class="me-death-row">' +
        '<span class="me-death-dim">' + esc(d.dim || '未知') + '</span>' +
        '<code class="me-death-pos">' + d.x + ', ' + d.y + ', ' + d.z + '</code>' +
        '<button class="me-death-copy" type="button" data-copy="' + d.x + ' ' + d.y + ' ' + d.z + '">复制</button>' +
        '</div>';
      if (m.hint) html += '<div class="me-death-hint">' + esc(m.hint) + '</div>';
      body.innerHTML = html;
      var cp = body.querySelector('.me-death-copy');
      if (cp) cp.addEventListener('click', function () { copyText(cp.getAttribute('data-copy'), cp, '坐标'); });
    }

    function go() {
      var rid = randomHex(8);
      if (btn) { btn.disabled = true; btn.textContent = '查询中…'; }
      postBus({ type: 'deathQuery', rid: rid, token: sess.token });
      waitBus(rid, ['deathOk', 'deathErr'], function (m) {
        if (btn) { btn.disabled = false; btn.textContent = '重新查询'; }
        paint(m);
      });
    }

    if (btn) btn.addEventListener('click', go);
    go();
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

      /* 每日签到：一天一次，奖励由服务端通过 RCON 发到游戏里 */
      html += '<div class="card me-checkin" id="meCheckin">' +
        '<div class="me-chk-main"><div class="me-chk-t">每日签到</div>' +
        '<div class="me-chk-s" id="meChkSub">正在读取签到状态…</div></div>' +
        '<div class="me-chk-act" id="meChkAct"></div></div>';

      /* 新手任务：用站里已有数据算进度，不用玩家额外打卡 */
      html += '<div class="card me-quest" id="meQuest">' +
        '<div class="q-head"><div class="me-chk-t">🎁 新手任务</div>' +
        '<div class="q-sub" id="qSub">完成下面的小目标，领点绿宝石当启动资金</div></div>' +
        '<div class="q-list" id="qList">正在读取任务…</div></div>';

      /* 死亡点找回：死了找不到掉落物是最难受的时刻，这里直接告诉他坐标和方向 */
      html += '<div class="card me-death" id="meDeath">' +
        '<div class="me-death-head">' +
        '<div class="me-chk-t">💀 我上次死在哪</div>' +
        '<button class="btn btn-sm btn-outline" id="meDeathBtn" type="button">重新查询</button>' +
        '</div>' +
        '<div class="me-death-body" id="meDeathBody">正在向服务器查询死亡记录…</div></div>';

      /* 成就徽章墙：服务器发放的徽章 + 按现有数据算出来的里程碑徽章，
         解锁的点亮，没解锁的显示成灰格并写明条件 */
      var bd = d.badges || { items: [] };
      var wall = (bd.items || []).map(function (b) {
        return {
          icon: b.icon, name: b.name,
          got: b.at > 0,
          need: b.at > 0 ? (fmtTime(b.at) + ' 解锁') : (b.desc || '服务器发放'),
          srv: true
        };
      }).concat(localBadges(pt, fm));
      if (wall.length) {
        var got = wall.filter(function (b) { return b.got; });
        html += '<div class="card me-badges">' +
          '<div class="me-badges-head"><h3>成就徽章</h3>' +
          '<span class="me-badges-cnt">' + got.length + ' / ' + wall.length + ' 已解锁</span></div>' +
          '<div class="badge-wall">' +
          wall.map(function (b) {
            return '<div class="badge-cell' + (b.got ? ' is-got' : '') + '" title="' + esc(b.need) + '">' +
              '<span class="badge-ico">' + esc(b.got ? b.icon : '🔒') + '</span>' +
              '<b>' + esc(b.name) + '</b>' +
              '<i>' + esc(b.got ? '已解锁' : b.need) + '</i></div>';
          }).join('') +
          '</div>' +
          '<p class="me-tip">里程碑徽章按你的在线时长与论坛活跃度自动点亮；服务器徽章由游戏内发放。</p></div>';
      }

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
      loadCheckin(box, sess);
      loadDeath(box, sess);
      loadQuests(box, sess);

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

  /* ================= 每周战报 ================= */
  function weekStartMs(now) {
    var d = new Date(now || Date.now());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));   // 周一为一周开始
    return d.getTime();
  }
  function mdText(ms) {
    var d = new Date(ms);
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }

  function renderWeekly(container) {
    var ws = weekStartMs();
    container.innerHTML = pageHead('首页', '本周战报',
      mdText(ws) + ' 起这一周，服务器上发生的事都在这；可以一键复制成文字发群里');
    var card = el('div', 'card');
    card.innerHTML = '<div class="empty"><div class="ico">📊</div><p>正在统计…</p></div>';
    container.appendChild(card);

    Promise.all([getJsonFile('playtime.json'), getJsonFile('bedwars.json'), getJsonFile('forum.json')])
      .then(function (r) {
        var pt = (r[0] && r[0].players) || [];
        var bw = (r[1] && r[1].players) || [];
        var posts = ((r[2] && r[2].posts) || []).filter(function (p) { return Number(p.created) >= ws; });

        var active = pt.filter(function (p) { return Number(p.week || 0) > 0; });
        var totalWeek = active.reduce(function (s, p) { return s + Number(p.week || 0); }, 0);

        function top(arr, key, n) {
          return arr.slice().filter(function (x) { return Number(x[key] || 0) > 0; })
            .sort(function (a, b) { return Number(b[key]) - Number(a[key]); }).slice(0, n || 5);
        }

        /* 起床战争本周：没有时间维度，只能给累计榜（说明清楚，不冒充周数据） */
        var bwTop = top(bw, 'score', 5);
        var bedTop = top(bw, 'destroyedBeds', 5);

        var postAuthors = {};
        posts.forEach(function (p) {
          var k = p.author || '未知';
          postAuthors[k] = (postAuthors[k] || 0) + 1;
        });
        var postTop = Object.keys(postAuthors).map(function (k) { return { name: k, n: postAuthors[k] }; })
          .sort(function (a, b) { return b.n - a.n; }).slice(0, 5);

        var weekTop = top(active, 'week', 5);

        var html = '<div class="wk-hero">' +
          '<div class="wk-big"><b>' + esc(mdText(ws)) + ' 起</b><span>统计区间</span></div>' +
          '<div class="wk-big"><b>' + active.length + '</b><span>本周上线人数</span></div>' +
          '<div class="wk-big"><b>' + fmtDur(totalWeek) + '</b><span>本周总在线</span></div>' +
          '<div class="wk-big"><b>' + posts.length + '</b><span>本周新帖</span></div>' +
          '</div>';

        html += '<div class="wk-cols">';

        html += '<div class="wk-col"><h4>⏱️ 本周在线时长 Top 5</h4>' +
          (weekTop.length ? weekTop.map(function (p, i) {
            return '<div class="wk-row"><span class="wk-rk">' + (i + 1) + '</span>' +
              '<a class="wk-nm" href="#/p/' + encodeURIComponent(p.name) + '">' + esc(p.name) + '</a>' +
              '<span class="wk-v">' + fmtDur(p.week) + '</span></div>';
          }).join('') : '<div class="wk-none">本周还没人上线</div>') + '</div>';

        html += '<div class="wk-col"><h4>💬 本周发帖最多</h4>' +
          (postTop.length ? postTop.map(function (p, i) {
            return '<div class="wk-row"><span class="wk-rk">' + (i + 1) + '</span>' +
              '<span class="wk-nm">' + esc(p.name) + '</span>' +
              '<span class="wk-v">' + p.n + ' 帖</span></div>';
          }).join('') : '<div class="wk-none">本周还没有新帖</div>') + '</div>';

        html += '<div class="wk-col"><h4>🧮 起床积分榜（累计）</h4>' +
          (bwTop.length ? bwTop.map(function (p, i) {
            return '<div class="wk-row"><span class="wk-rk">' + (i + 1) + '</span>' +
              '<a class="wk-nm" href="#/p/' + encodeURIComponent(p.name) + '">' + esc(p.name) + '</a>' +
              '<span class="wk-v">' + p.score + ' 分</span></div>';
          }).join('') : '<div class="wk-none">暂无数据</div>') + '</div>';

        html += '<div class="wk-col"><h4>🛏️ 破床榜（累计）</h4>' +
          (bedTop.length ? bedTop.map(function (p, i) {
            return '<div class="wk-row"><span class="wk-rk">' + (i + 1) + '</span>' +
              '<a class="wk-nm" href="#/p/' + encodeURIComponent(p.name) + '">' + esc(p.name) + '</a>' +
              '<span class="wk-v">' + p.destroyedBeds + ' 张</span></div>';
          }).join('') : '<div class="wk-none">暂无数据</div>') + '</div>';

        html += '</div>';

        /* 一键复制成纯文本，方便发群里 */
        var lines = ['【' + SITE.name + ' 本周战报】' + mdText(ws) + ' 起',
          '上线 ' + active.length + ' 人，累计在线 ' + fmtDur(totalWeek) + '，新帖 ' + posts.length + ' 篇'];
        if (weekTop.length) lines.push('肝得最猛：' + weekTop.map(function (p) { return p.name + ' ' + fmtDur(p.week); }).join('、'));
        if (postTop.length) lines.push('发帖最多：' + postTop.map(function (p) { return p.name + ' ' + p.n + ' 帖'; }).join('、'));
        html += '<div class="wk-foot"><button class="btn btn-sm btn-outline" id="wkCopy" type="button">复制战报文字</button>' +
          '<span class="wk-tip">起床积分/破床没有时间维度，展示的是累计榜</span></div>';

        card.innerHTML = html;
        var btn = card.querySelector('#wkCopy');
        if (btn) btn.addEventListener('click', function () { copyText(lines.join('\n'), btn, '战报'); });
      })
      .catch(function () { card.innerHTML = emptyState('📡', '战报数据加载失败，请稍后刷新'); });
  }

  /* ================= 活动日历（读服务端导出的 events.json，可导出 .ics） ================= */
  function icsEsc(s) {
    return String(s == null ? '' : s)
      .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }
  function icsStamp(ms) {
    var d = new Date(Number(ms) || Date.now());
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' +
      p(d.getHours()) + p(d.getMinutes()) + '00';
  }
  /* iCalendar 规定每行不超过 75 字节，超了要折行（续行以空格开头） */
  function icsFold(line) {
    var out = '', buf = '';
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (buf.length + ch.length > 72) { out += buf + '\r\n '; buf = ''; }
      buf += ch;
    }
    return out + buf;
  }
  function buildIcs(events) {
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stone Logic//Events//CN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:' + icsEsc(SITE.name + ' 活动日历'),
      'X-WR-TIMEZONE:Asia/Shanghai'];
    events.forEach(function (e) {
      var end = e.end && e.end > e.start ? e.end : (e.start + 3600000);
      L.push('BEGIN:VEVENT');
      L.push('UID:stl-ev-' + (e.id || e.start) + '@stonelogic');
      L.push('DTSTAMP:' + icsStamp(Date.now()));
      L.push('DTSTART:' + icsStamp(e.start));
      L.push('DTEND:' + icsStamp(end));
      L.push('SUMMARY:' + icsEsc(e.title || '活动'));
      if (e.desc) L.push('DESCRIPTION:' + icsEsc(e.desc));
      if (e.reward) L.push('DESCRIPTION:' + icsEsc('奖励：' + e.reward));
      L.push('STATUS:CONFIRMED');
      L.push('END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.map(icsFold).join('\r\n') + '\r\n';
  }

  function renderEvents(container) {
    container.innerHTML = pageHead('首页', '活动日历',
      '服务器赛事与活动安排；可以导出成日历文件，一次性导入手机日历');
    var card = el('div', 'card');
    card.innerHTML = '<div class="empty"><div class="ico">📅</div><p>正在加载活动…</p></div>';
    container.appendChild(card);

    getJsonFile('events.json').then(function (d) {
      var list = (d && Array.isArray(d.events)) ? d.events : [];
      if (!list.length) {
        card.innerHTML = emptyState('📅', '还没有安排活动。腐竹在后台加赛事后，这里会自动出现');
        return;
      }
      var IC = { ongoing: '进行中', upcoming: '即将开始', ended: '已结束' };
      var CLS = { ongoing: 'is-on', upcoming: 'is-up', ended: 'is-end' };
      var groups = { ongoing: [], upcoming: [], ended: [] };
      list.forEach(function (e) { (groups[e.status] || groups.upcoming).push(e); });

      function fmtRange(e) {
        var s = new Date(e.start), en = new Date(e.end || e.start);
        function hm(x) { var h = x.getHours(), m = x.getMinutes(); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
        if (!e.end || e.end === e.start) return mdText(e.start) + ' ' + hm(s);
        if (s.toDateString() === en.toDateString()) return mdText(e.start) + ' ' + hm(s) + ' – ' + hm(en);
        return mdText(e.start) + ' ' + hm(s) + ' – ' + mdText(e.end) + ' ' + hm(en);
      }

      var html = '<div class="ev-bar">' +
        '<button class="btn btn-sm btn-primary" id="evIcs" type="button">下载日历 (.ics)</button>' +
        '<button class="btn btn-sm btn-outline" id="evCopy" type="button">复制为文本</button>' +
        '<span class="ev-note">共 ' + list.length + ' 项 · ' +
        (groups.ongoing.length + groups.upcoming.length) + ' 项待参与</span></div>';

      ['ongoing', 'upcoming', 'ended'].forEach(function (k) {
        if (!groups[k].length) return;
        html += '<h4 class="ev-h4">' + IC[k] + '</h4>';
        html += groups[k].map(function (e) {
          return '<div class="ev-card ' + (CLS[k] || '') + '">' +
            '<div class="ev-when">' + esc(fmtRange(e)) + '</div>' +
            '<div class="ev-title">' + esc(e.title || '活动') + '</div>' +
            (e.desc ? '<div class="ev-desc">' + esc(e.desc) + '</div>' : '') +
            (e.reward ? '<div class="ev-reward">🎁 ' + esc(e.reward) + '</div>' : '') +
            '</div>';
        }).join('');
      });
      card.innerHTML = html;

      var icsBtn = card.querySelector('#evIcs');
      if (icsBtn) icsBtn.addEventListener('click', function () {
        var ics = buildIcs(list);
        var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'stone-logic-events.ics';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast('日历文件已下载，双击导入即可');
      });

      var cpBtn = card.querySelector('#evCopy');
      if (cpBtn) cpBtn.addEventListener('click', function () {
        var txt = list.map(function (e) {
          return '· ' + e.title + ' · ' + fmtRange(e) + (e.desc ? '（' + e.desc + '）' : '');
        }).join('\n');
        copyText('【' + SITE.name + ' 活动安排】\n' + txt, cpBtn, '活动列表');
      });
    }).catch(function () {
      card.innerHTML = emptyState('📡', '活动数据加载失败，请稍后刷新');
    });
  }

  /* ================= 公开健康页（读服务端每分钟导出的 health.json） ================= */
  function renderHealth(container) {
    container.innerHTML = pageHead('首页', '服务器体检',
      '每 1 分钟自检一次：端口探活、在线数据新鲜度、进程内存、历史告警');
    var card = el('div', 'card');
    card.innerHTML = '<div class="empty"><div class="ico">🩺</div><p>正在读取体检结果…</p></div>';
    container.appendChild(card);

    var timer = 0;
    function draw() {
      var rid = randomHex(8);
      postBus({ type: 'healthQuery', rid: rid });
      waitBus(rid, ['healthOk', 'healthErr'], function (h) {
        if (!h || h.type === 'healthErr') {
          /* 本地直连服务托管时，退回同源接口 */
          fetch('healthz', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) { if (d && (d.updated || d.problems)) paint(d); else fail(); })
            .catch(fail);
          return;
        }
        paint(h);
      });
    }
    function fail() {
      card.innerHTML = emptyState('📡', '体检服务没响应，可能采集进程未运行');
    }
    function paint(h) {
      if (!h || !h.updated) { fail(); return; }
      {
        var ok = !!h.ok;
        var self = h.self || {}, sv = h.server || {};
        var age = Math.round((Date.now() - Number(h.updated)) / 1000);

        var html = '<div class="hl-top ' + (ok ? 'is-ok' : 'is-bad') + '">' +
          '<span class="hl-dot"></span>' +
          '<div><div class="hl-tt">' + (ok ? '一切正常' : '有情况需要关注') + '</div>' +
          '<div class="hl-sub">' + (ok ? '端口、在线数据、内存都在正常范围' :
            esc((h.problems || []).join(' · ') || '未知问题')) + '</div></div>' +
          '<span class="hl-age">' + (age < 90 ? '刚刚更新' : Math.round(age / 60) + ' 分钟前更新') + '</span>' +
          '</div>';

        html += '<div class="hl-grid">' +
          '<div class="hl-cell"><b>' + (sv.online ? sv.players + ' / ' + sv.max : '离线') + '</b><span>在线人数</span></div>' +
          '<div class="hl-cell"><b>' + (self.rssMb != null ? self.rssMb + ' MB' : '—') + '</b><span>进程内存</span></div>' +
          '<div class="hl-cell"><b>' + (self.uptimeText || '—') + '</b><span>运行时长</span></div>' +
          '<div class="hl-cell"><b>' + (sv.dataAgeSec != null ? (sv.dataAgeSec < 60 ? Math.round(sv.dataAgeSec) + ' 秒' : Math.round(sv.dataAgeSec / 60) + ' 分钟') : '—') + '</b><span>在线数据新鲜度</span></div>' +
          '</div>';

        if ((h.ports || []).length) {
          html += '<h4 class="hl-h4">端口探活</h4><div class="hl-ports">' +
            h.ports.map(function (p) {
              return '<div class="hl-port ' + (p.up ? 'up' : 'down') + '">' +
                '<span class="hl-pdot"></span>' + esc(p.name) +
                '<i>:' + p.port + '</i><b>' + (p.up ? '正常' : '无响应 ' + (p.fails || 0) + ' 次') + '</b></div>';
            }).join('') + '</div>';
        }

        if (h.heat && h.heat.total) {
          html += '<div class="hl-line">在线热力图已累积 <b>' + h.heat.filled + ' / ' + h.heat.total +
            '</b> 格样本 · <a href="#/status">去状态页看</a></div>';
        }

        if ((h.alarms || []).length) {
          html += '<h4 class="hl-h4">最近告警</h4><div class="hl-alarms">' +
            h.alarms.map(function (a) {
              return '<div class="hl-alarm"><span>' + fmtTime(a.t) + '</span>' + esc(a.text || '') + '</div>';
            }).join('') + '</div>';
        } else {
          html += '<div class="hl-line">最近没有告警记录。</div>';
        }

        html += '<p class="hl-foot">这是服务器自检结果，每分钟刷新；同一份数据也提供 <code>/healthz</code> 接口，方便接监控。</p>';
        card.innerHTML = html;
      }
    }
    draw();
    clearInterval(timer);
    timer = setInterval(draw, 60000);
  }

  /* ================= 开黑召集 ================= */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtClock(ms) {
    var d = new Date(Number(ms) || 0);
    return pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function untilText(ms) {
    var diff = Number(ms) - Date.now();
    if (diff <= 0) return '已开打';
    var mins = Math.round(diff / 60000);
    if (mins < 60) return '还有 ' + mins + ' 分钟';
    var h = Math.floor(mins / 60), m = mins % 60;
    if (h < 24) return '还有 ' + h + ' 小时' + (m ? ' ' + m + ' 分' : '');
    return '还有 ' + Math.round(h / 24) + ' 天';
  }
  /* 默认时间：今晚 20:30，已经过了就明天 */
  function defaultRallyTime() {
    var d = new Date();
    d.setHours(20, 30, 0, 0);
    if (d.getTime() < Date.now() + 10 * 60000) d.setDate(d.getDate() + 1);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function loadHomeRally(host) {
    if (!host) return;
    function banner(items) {
      if (!items || !items.length) { host.hidden = true; return; }
      var r = items[0];
      host.hidden = false;
      host.innerHTML = '<span class="hr-tag">📣 召集</span>' +
        '<span class="hr-main">' + esc(r.title) + '</span>' +
        '<span class="hr-when">' + fmtClock(r.startAt) + ' · ' + untilText(r.startAt) +
        (r.need > 0 ? ' · ' + (r.left > 0 ? '还缺 ' + r.left + ' 人' : '人已够') : '') + '</span>' +
        '<a class="hr-go" href="#/rally">报名 →</a>';
    }
    snapshot(function (s) { if (s && s.rally) banner(s.rally.items); });
    var rid = randomHex(8);
    postBus({ type: 'rallyQuery', rid: rid });
    waitBus(rid, ['rallyOk', 'rallyErr'], function (m) {
      if (!m || m.type === 'rallyErr') return;   // 横幅已有快照兜底，不弹错误
      banner(m.items);
    });
  }

  function renderRally(container) {
    var sess = getSession();
    container.innerHTML = pageHead('召集', '开黑召集',
      '约个时间一起打：发起后立刻推到群里，开打前 10 分钟再喊一次，人齐了就到点开打');
    var box = el('div', 'rally-wrap');
    container.appendChild(box);

    box.innerHTML =
      (sess
        ? '<div class="card rally-new">' +
        '<div class="rly-t">发起一条召集</div>' +
        '<div class="rly-form">' +
        '<input id="rlyTitle" class="rly-in" maxlength="40" placeholder="打什么？例如：起床战争 2v2">' +
        '<input id="rlyWhen" class="rly-in rly-time" type="datetime-local" value="' + defaultRallyTime() + '">' +
        '<label class="rly-need"><span>缺</span><input id="rlyNeed" type="number" min="0" max="20" value="0"><span>人</span></label>' +
        '<button class="btn btn-primary" id="rlyGo" type="button">发到群里</button>' +
        '</div>' +
        '<div class="rly-hint">「缺几人」填 0 表示不限人数；最多约两周以内的。</div>' +
        '</div>'
        : '<div class="card rally-gate">登录后才能发起召集。 <a href="confirm.html">去登录</a></div>') +
      '<div class="card"><div class="rly-list" id="rlyList">' +
      '<div class="empty"><div class="ico">⏳</div><p>正在读取召集…</p></div></div></div>';

    var listEl = box.querySelector('#rlyList');

    function paint(items) {
      if (!items || !items.length) {
        listEl.innerHTML = emptyState('📣', '现在没有召集。想打什么就发一条，群里会收到。');
        return;
      }
      listEl.innerHTML = items.map(function (r) {
        var mine = r.mine;
        var joined = r.joinedByMe;
        var btn = !sess ? '' :
          (joined
            ? '<button class="btn btn-sm rly-btn" data-act="leave" data-id="' + r.id + '">取消报名</button>'
            : '<button class="btn btn-sm btn-primary rly-btn" data-act="join" data-id="' + r.id + '">我要来</button>');
        if (mine) btn += '<button class="btn btn-sm rly-btn rly-cancel" data-act="cancel" data-id="' + r.id + '">撤掉</button>';
        return '<div class="rly-item' + (joined ? ' on' : '') + '">' +
          '<div class="rly-when"><b>' + fmtClock(r.startAt) + '</b><span>' + untilText(r.startAt) + '</span></div>' +
          '<div class="rly-main"><div class="rly-name">' + esc(r.title) + '</div>' +
          '<div class="rly-sub">' + esc(r.by || '有人') + ' 发起 · 已报 ' + r.joined + ' 人' +
          (r.need > 0 ? ' · ' + (r.left > 0 ? '还缺 ' + r.left + ' 人' : '人已够，还能来') : ' · 不限人数') +
          '</div></div>' +
          '<div class="rly-act">' + btn + '</div></div>';
      }).join('');
    }

    function load() {
      var shown = false;
      snapshot(function (s) {
        if (s && s.rally) { shown = true; paint(s.rally.items || []); }
      });
      var rid = randomHex(8);
      postBus({ type: 'rallyQuery', rid: rid });
      waitBus(rid, ['rallyOk', 'rallyErr'], function (m) {
        if (!m || m.type === 'rallyErr') {
          if (!shown) listEl.innerHTML = busFailHtml();
          return;
        }
        paint(m.items || []);
      });
    }

    listEl.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.rly-btn') : null;
      if (!b) return;
      if (!sess) { toast('先登录'); return; }
      var act = b.getAttribute('data-act');
      var type = act === 'join' ? 'rallyJoin' : (act === 'leave' ? 'rallyLeave' : 'rallyCancel');
      if (act === 'cancel' && !confirm('撤掉这条召集？群里已经看到的人不会收到通知。')) return;
      b.disabled = true;
      var rid = randomHex(8);
      postBus({ type: type, rid: rid, token: sess.token, id: Number(b.getAttribute('data-id')) });
      waitBus(rid, ['rallyOk', 'rallyErr'], function (m) {
        b.disabled = false;
        if (!m || m.type === 'rallyErr') { toast((m && m.reason) || '操作失败'); return; }
        if (act === 'join') toast('算你一个，到点见');
        paint(m.items || []);
      });
    });

    if (sess) {
      box.querySelector('#rlyGo').addEventListener('click', function () {
        var btn = this;
        var title = box.querySelector('#rlyTitle').value.trim();
        var when = box.querySelector('#rlyWhen').value;
        var need = Number(box.querySelector('#rlyNeed').value) || 0;
        var startAt = when ? new Date(when).getTime() : 0;
        if (title.length < 2) { toast('写一句要打什么'); return; }
        if (!startAt) { toast('选个时间'); return; }
        btn.disabled = true;
        var rid = randomHex(8);
        postBus({ type: 'rallyNew', rid: rid, token: sess.token, title: title, startAt: startAt, need: need });
        waitBus(rid, ['rallyOk', 'rallyErr'], function (m) {
          btn.disabled = false;
          if (!m || m.type === 'rallyErr') { toast((m && m.reason) || '发起失败'); return; }
          toast('已发到群里');
          box.querySelector('#rlyTitle').value = '';
          paint(m.items || []);
        });
      });
    }

    load();
  }

  /* ================= 危险区 ================= */

  function renderHeat(container) {
    container.innerHTML = pageHead('状态', '危险区',
      '按死亡点聚合出来的「老有人死」的区域。同一片至少 2 人死过才会显示，100 格一格，只看大方向');
    var box = el('div', 'card');
    container.appendChild(box);
    box.innerHTML = '<div class="heat-meta" id="heatMeta">正在读取死亡记录…</div>' +
      '<div class="heat-body" id="heatBody"></div>';
    var meta = box.querySelector('#heatMeta');
    var body = box.querySelector('#heatBody');
    var days = 30;

    box.insertAdjacentHTML('afterbegin',
      '<div class="seg" id="heatSeg">' +
      [7, 30, 90].map(function (d) {
        return '<button class="seg-btn' + (d === days ? ' on' : '') + '" data-d="' + d + '">' +
          (d === 7 ? '近 7 天' : d === 30 ? '近 30 天' : '近 90 天') + '</button>';
      }).join('') + '</div>');

    function paintHeat(m) {
        var spots = m.spots || [];
        var total = m.total || { n: 0, who: 0 };
        if (!total.n) {
          meta.textContent = '';
          body.innerHTML = emptyState('🩸', '还没有攒到死亡点。等服务里有人死几次，这里就会长出红色。');
          return;
        }
        meta.textContent = '近 ' + m.days + ' 天记录了 ' + total.n + ' 个死亡点、' + total.who +
          ' 个人；下面只显示死过 ≥' + m.minHits + ' 次的区域（' + m.step + ' 格一格）。';
        if (!spots.length) {
          body.innerHTML = emptyState('🕯️', '暂时没有「同一片死过 2 次以上」的区域 —— 要么大家都很稳，要么样本还不够。');
          return;
        }
        var maxN = Math.max.apply(null, spots.map(function (s) { return s.n; }));
        body.innerHTML = '<div class="heat-grid">' + spots.map(function (s) {
          var pct = Math.round(s.n / maxN * 100);
          return '<div class="heat-row">' +
            '<span class="heat-dim">' + esc(s.dim || '?') + '</span>' +
            '<span class="heat-pos">' + s.x + ', ' + s.z + '</span>' +
            '<span class="heat-bar"><i style="width:' + Math.max(8, pct) + '%"></i></span>' +
            '<span class="heat-n">' + s.n + ' 次 / ' + s.who + ' 人</span>' +
            '</div>';
        }).join('') + '</div>' +
          '<p class="heat-foot">坐标是 100 格取整后的大致位置，用来提醒「那片别空手过去」，不是精确死亡点。</p>';
    }

    function draw() {
      var shown = false;
      /* 先读快照，总线挂了也能看到危险区；7/30/90 三档都备了 */
      snapshot(function (s) {
        var h = s && s.heat ? s.heat[days] : null;
        if (h) { shown = true; paintHeat(h); }
      });
      if (!shown) meta.textContent = '正在读取死亡记录…';
      var rid = randomHex(8);
      postBus({ type: 'heatQuery', rid: rid, days: days });
      waitBus(rid, ['heatOk', 'heatErr'], function (m) {
        if (!m || m.type === 'heatErr') {
          if (!shown) { body.innerHTML = busFailHtml(); meta.textContent = ''; }
          return;
        }
        paintHeat(m);
      });
    }

    box.querySelector('#heatSeg').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.seg-btn') : null;
      if (!b) return;
      box.querySelectorAll('#heatSeg .seg-btn').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      days = Number(b.getAttribute('data-d')) || 30;
      draw();
    });

    draw();
  }

  /* ================= 游戏内计分板榜单 ================= */
  /* 挂到排行榜页面尾部：服务器本来就在记 §7死亡 / §7胜场，不用插件就能出榜 */
  function renderScoreInto(host) {
    host.innerHTML = '<div class="score-head"><div class="me-chk-t">🎯 游戏内计分板</div>' +
      '<div class="score-sub">直接读服务器的 scoreboard，和游戏里 <code>/scoreboard</code> 看到的一致</div></div>' +
      '<div id="scoreBody"><div class="empty"><div class="ico">⏳</div><p>正在读计分板…</p></div></div>';
    var body = host.querySelector('#scoreBody');

    function paintScore(m) {
      var objs = m.objectives || [];
      var rows = m.rows || [];
      if (!objs.length || !rows.length) {
        body.innerHTML = emptyState('🎯', '服务器里还没有可读的计分板项目');
        return;
      }

      function draw(obj) {
        var arr = rows.filter(function (r) { return obj in r.s; })
          .sort(function (a, b) { return b.s[obj] - a.s[obj]; }).slice(0, 20);
        if (!arr.length) { body.querySelector('#scoreList').innerHTML = emptyState('📊', '这个项目还没有数据'); return; }
        var top = arr[0].s[obj] || 1;
        body.querySelector('#scoreList').innerHTML = arr.map(function (r, i) {
          var v = r.s[obj];
          return '<div class="score-row">' +
            '<span class="score-rank' + (i < 3 ? ' top' : '') + '">' + (i + 1) + '</span>' +
            '<span class="score-name">' + esc(r.name) + '</span>' +
            '<span class="score-bar"><i style="width:' + Math.max(6, Math.round(v / top * 100)) + '%"></i></span>' +
            '<span class="score-v">' + v + '</span></div>';
        }).join('');
      }

      body.innerHTML = '<div class="seg" id="scoreSeg">' + objs.map(function (o, i) {
        return '<button class="seg-btn' + (i === 0 ? ' on' : '') + '" data-o="' + esc(o) + '">' + esc(o) + '</button>';
      }).join('') + '</div><div id="scoreList"></div>';

      body.querySelector('#scoreSeg').addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.seg-btn') : null;
        if (!b) return;
        body.querySelectorAll('#scoreSeg .seg-btn').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        draw(b.getAttribute('data-o'));
      });
      draw(objs[0]);
    }

    var scoreShown = false;
    snapshot(function (s) {
      if (s && s.score && s.score.rows && s.score.rows.length) {
        scoreShown = true; paintScore(s.score);
      }
    });
    var rid = randomHex(8);
    postBus({ type: 'scoreQuery', rid: rid });
    waitBus(rid, ['scoreOk', 'scoreErr'], function (m) {
      if (!m || m.type === 'scoreErr') {
        if (!scoreShown) body.innerHTML = busFailHtml();
        return;
      }
      paintScore(m);
    });
  }

  /* ================= 玩家实时状态 + 留言 ================= */

  function loadLiveStatus(host, name) {
    host.innerHTML = '<div class="pf-live-t">🎮 实时状态</div>' +
      '<div class="pf-live-body" id="pfLiveBody">正在查…</div>';
    var body = host.querySelector('#pfLiveBody');
    var rid = randomHex(8);
    postBus({ type: 'statusQuery', rid: rid, name: name });
    waitBus(rid, ['statusOk', 'statusErr'], function (m) {
      if (!m || m.type === 'statusErr') { body.innerHTML = '<span class="pf-live-off">查不到</span>'; return; }
      if (!m.online) {
        body.innerHTML = '<span class="pf-live-off">现在不在线，等他上线再看</span>';
        return;
      }
      var hp = m.health == null ? '—' : m.health;
      var hearts = m.health == null ? '' : ('❤'.repeat(Math.max(1, Math.round(m.health / 2))));
      var item = m.item ? (m.item.count > 1 ? m.item.count + ' × ' : '') + m.item.id.replace(/_/g, ' ')
        : '空手';
      body.innerHTML = '<div class="pf-live-row">' +
        '<span class="pf-live-k">血量</span><span class="pf-live-v">' + hp + ' / 20 <b class="pf-hearts">' + hearts + '</b></span>' +
        '</div><div class="pf-live-row">' +
        '<span class="pf-live-k">等级</span><span class="pf-live-v">' + (m.level == null ? '—' : m.level) + ' 级</span>' +
        '</div><div class="pf-live-row">' +
        '<span class="pf-live-k">手持</span><span class="pf-live-v">' + esc(item) + '</span>' +
        '</div><div class="pf-live-row">' +
        '<span class="pf-live-k">所在</span><span class="pf-live-v">' + esc(m.dim || '未知') + '</span>' +
        '</div>';
    });
  }

  function buildMsgCard(host, name) {
    var sess = getSession();
    if (!sess) return;          // 没登录就别摆一个发不出去的输入框
    host.innerHTML = '<div class="pf-msg-t">✉️ 给他留句话</div>' +
      '<div class="pf-msg-row">' +
      '<input class="pf-msg-in" id="pfMsgIn" maxlength="60" placeholder="60 字以内，他一上线就会在游戏里看到">' +
      '<button class="btn btn-sm btn-primary" id="pfMsgGo" type="button">发送</button>' +
      '</div>' +
      '<div class="pf-msg-hint">在线直接送达；不在线就存着，等他上线再弹。每小时最多 3 条。</div>';

    host.querySelector('#pfMsgGo').addEventListener('click', function () {
      var input = host.querySelector('#pfMsgIn');
      var text = input.value.trim();
      if (!text) { toast('写点什么'); return; }
      var btn = this;
      btn.disabled = true;
      var rid = randomHex(8);
      postBus({ type: 'msgSend', rid: rid, token: sess.token, target: name, body: text });
      waitBus(rid, ['msgOk', 'msgErr'], function (m) {
        btn.disabled = false;
        if (!m || m.type === 'msgErr') { toast((m && m.reason) || '没发出去'); return; }
        input.value = '';
        toast(m.delivered ? ('已送到 ' + name + ' 的游戏里') : ('存好了，' + name + ' 上线后会看到'));
      });
    });
  }


  /* ================= 赛事沙盘（起床战争 13 分制） ================= */
  var MT_TIMER = null;

  function fmtHm(ms) {
    var d = new Date(Number(ms) || 0);
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function matchStatusText(s) {
    return s === 'overtime' ? '⚡ 加时赛' : s === 'finished' ? '🏁 已结束' :
      s === 'live' ? '🔴 进行中' : s === 'cancelled' ? '🚫 已取消' : '⏳ 未开赛';
  }

  /* 比分走势：横轴回合，纵轴累计分；加时那一段单独画一条竖虚线 */
  function trendSvg(d) {
    var W = 720, H = 190, padL = 30, padR = 14, padT = 16, padB = 26;
    var pts = [{ a: 0, b: 0 }].concat((d.rounds || []).map(function (r) { return { a: r.a, b: r.b }; }));
    var maxV = Math.max(d.target || 13, d.a || 0, d.b || 0, 1);
    var otAt = -1;
    (d.rounds || []).forEach(function (r, i) { if (r.overtime && otAt < 0) otAt = i + 1; });
    function X(i) { return padL + (W - padL - padR) * (i / Math.max(1, pts.length - 1)); }
    function Y(v) { return H - padB - (H - padT - padB) * (v / maxV); }
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" class="mt-svg" preserveAspectRatio="xMidYMid meet">'];
    for (var g = 0; g <= 4; g++) {
      var v = Math.round(maxV * g / 4);
      s.push('<line x1="' + padL + '" y1="' + Y(v) + '" x2="' + (W - padR) + '" y2="' + Y(v) +
        '" style="stroke:var(--foreground);opacity:.10"/>');
      s.push('<text x="' + (padL - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" font-size="10" ' +
        'style="fill:var(--muted-foreground)">' + v + '</text>');
    }
    if (otAt > 0) {
      s.push('<line x1="' + X(otAt) + '" y1="' + padT + '" x2="' + X(otAt) + '" y2="' + (H - padB) +
        '" style="stroke:var(--destructive);opacity:.6" stroke-dasharray="4 4"/>');
      /* 加时线贴到最右边时标签朝左写，否则会被 viewBox 裁掉半个字 */
      var rightEdge = X(otAt) > W - padR - 40;
      s.push('<text x="' + (X(otAt) + (rightEdge ? -4 : 4)) + '" y="' + (padT + 10) +
        '" font-size="10" text-anchor="' + (rightEdge ? 'end' : 'start') +
        '" style="fill:var(--destructive)">加时</text>');
    }
    function path(key) {
      return pts.map(function (p, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(p[key]).toFixed(1); }).join(' ');
    }
    s.push('<path d="' + path('a') + '" fill="none" style="stroke:var(--primary)" stroke-width="2.5" stroke-linejoin="round"/>');
    s.push('<path d="' + path('b') + '" fill="none" stroke="#e8913a" stroke-width="2.5" stroke-linejoin="round"/>');
    pts.forEach(function (p, i) {
      if (!i) return;
      s.push('<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(p.a).toFixed(1) + '" r="2.4" style="fill:var(--primary)"/>');
      s.push('<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(p.b).toFixed(1) + '" r="2.4" fill="#e8913a"/>');
    });
    s.push('<text x="' + padL + '" y="' + (H - 6) + '" font-size="10" style="fill:var(--muted-foreground)">第 1 回合</text>');
    s.push('<text x="' + (W - padR) + '" y="' + (H - 6) + '" text-anchor="end" font-size="10" ' +
      'style="fill:var(--muted-foreground)">第 ' + (pts.length - 1) + ' 回合</text>');
    s.push('</svg>');
    return s.join('');
  }

  function renderTourney(container, param) {
    container.innerHTML = pageHead('赛事', '起床战争赛事',
      '13 分制（先到 13 分）· 12:12 自动进入加时 · 加时需净胜 2 分；每回合、加时与结果都会同步到 QQ 群');
    var wrap = el('div', 'mt-wrap');
    container.appendChild(wrap);

    var sess = getSession();
    var focusId = Number(param) || 0;
    if (MT_TIMER) { clearInterval(MT_TIMER); MT_TIMER = null; }

    wrap.innerHTML =
      '<div class="card mt-board" id="mtBoard"><div class="empty"><div class="ico">⏳</div><p>正在读取赛事沙盘…</p></div></div>' +
      '<div class="card mt-admin" id="mtAdmin" hidden></div>' +
      '<div class="card mt-signup" id="mtSignup">' +
        '<div class="mt-sec-t">报名参赛 <span id="mtSuCount"></span></div>' +
        '<div class="mt-su-wall" id="mtSuWall"></div>' +
        '<div class="mt-su-ops" id="mtSuOps"></div>' +
      '</div>' +
      '<div class="card mt-hist" id="mtHist"><div class="mt-sec-t">历史赛事</div><div id="mtHistList">正在读取…</div></div>';

    var board = wrap.querySelector('#mtBoard');
    var admin = wrap.querySelector('#mtAdmin');
    var hist = wrap.querySelector('#mtHistList');

    function drawBoard(d) {
      if (!d) {
        board.innerHTML = '<div class="empty"><div class="ico">🏆</div><p>还没有赛事</p>' +
          '<p style="font-size:12.5px;color:var(--muted-foreground)">管理员可以在下面创建一场起床战争赛事</p></div>';
        return;
      }
      var st = d.status;
      var title = '<div class="mt-top"><div><div class="mt-title">' + esc(d.title) + '</div>' +
        '<div class="mt-rule">' + d.target + ' 分制 · ' + d.overtimeAt + ':' + d.overtimeAt +
        ' 进加时 · 净胜 ' + d.winBy + ' 分 · ' + fmtClock(d.startAt) + ' 开打</div></div>' +
        '<span class="mt-status mt-' + st + '">' + matchStatusText(st) + '</span></div>';

      var score = '<div class="mt-score">' +
        '<div class="mt-side a"><div class="mt-team">' + esc(d.teamA) + '</div>' +
        '<div class="mt-num">' + d.a + '</div></div>' +
        '<div class="mt-mid"><div class="mt-colon">:</div>' +
        (d.status === 'finished'
          ? '<div class="mt-win">🏆 ' + esc(d.winner === 'a' ? d.teamA : d.teamB) + ' 获胜</div>'
          : '<div class="mt-round">第 ' + (d.stats.total + 1) + ' 回合</div>') +
        '</div>' +
        '<div class="mt-side b"><div class="mt-team">' + esc(d.teamB) + '</div>' +
        '<div class="mt-num">' + d.b + '</div></div></div>';

      /* 回合时间轴：一格一回合，颜色 = 得分方，加时格加描边 */
      var cells = (d.rounds || []).map(function (r) {
        var tip = '第 ' + r.seq + ' 回合 · ' + (r.side === 'a' ? d.teamA : d.teamB) + ' 得分' +
          ' · ' + r.a + ':' + r.b + ' · ' + fmtHm(r.at) + (r.note ? ' · ' + r.note : '') +
          (r.by ? ' · 录入 ' + r.by : '');
        return '<span class="mt-cell ' + r.side + (r.overtime ? ' ot' : '') + '" title="' + esc(tip) + '">' +
          r.seq + '</span>';
      }).join('');
      var timeline = '<div class="mt-sec-t">回合沙盘 <span>鼠标悬停看每回合明细</span></div>' +
        (cells ? '<div class="mt-cells">' + cells + '</div>' :
          '<div class="mt-noround">还没录入回合</div>') +
        '<div class="mt-legend"><i class="a"></i>' + esc(d.teamA) +
        '<i class="b"></i>' + esc(d.teamB) + '<i class="ot"></i>加时回合</div>';

      var st2 = d.stats || {};
      var data = '<div class="mt-sec-t">赛事数据</div><div class="mt-stats">' +
        '<div><span>已打回合</span><b>' + (st2.total || 0) + '</b></div>' +
        '<div><span>' + esc(d.teamA) + ' 得分</span><b>' + (st2.aWins || 0) + '</b></div>' +
        '<div><span>' + esc(d.teamB) + ' 得分</span><b>' + (st2.bWins || 0) + '</b></div>' +
        '<div><span>最长连胜</span><b>' + (st2.longest ? st2.longest.n : 0) + ' 回合</b></div>' +
        '<div><span>加时回合</span><b>' + (st2.otRounds || 0) + '</b></div>' +
        '<div><span>已耗时</span><b>' + (st2.durationMin || 0) + ' 分钟</b></div>' +
        '</div>';

      var trend = '<div class="mt-sec-t">比分走势</div>' + trendSvg(d);
      board.innerHTML = title + score + timeline + trend + data +
        (d.note ? '<div class="mt-note">备注：' + esc(d.note) + '</div>' : '');
    }

    function drawHist(items, curId) {
      if (!items || !items.length) { hist.innerHTML = '<div class="mt-noround">暂无赛事记录</div>'; return; }
      hist.innerHTML = items.map(function (m) {
        return '<a class="mt-hist-row' + (m.id === curId ? ' on' : '') + '" href="#/tourney/' + m.id + '" data-id="' + m.id + '">' +
          '<span class="mt-hist-t">' + esc(m.title) + '</span>' +
          '<span class="mt-hist-s">' + matchStatusText(m.status) + '</span>' +
          '<span class="mt-hist-v">' + esc(m.teamA) + ' ' + m.a + ' : ' + m.b + ' ' + esc(m.teamB) + '</span>' +
          '<span class="mt-hist-d">' + fmtClock(m.startAt) + '</span></a>';
      }).join('');
    }

    function drawAdmin(d, canManage, items) {
      admin.hidden = !canManage;
      if (!canManage) return;
      admin.innerHTML = '<div class="mt-sec-t">赛事管理 <span>只有管理员可见</span></div>' +
        '<div class="mt-adm-new">' +
        '<input class="mt-in" id="mtTitle" maxlength="40" placeholder="赛事名，如：起床战争秋季赛">' +
        '<input class="mt-in mt-in-team" id="mtA" maxlength="12" value="红队" placeholder="A 队">' +
        '<input class="mt-in mt-in-team" id="mtB" maxlength="12" value="蓝队" placeholder="B 队">' +
        '<input class="mt-in mt-in-time" id="mtWhen" type="datetime-local" value="' + defaultRallyTime() + '">' +
        '<button class="btn btn-primary btn-sm" id="mtCreate" type="button">创建赛事</button>' +
        '</div>' +
        (d ? '<div class="mt-adm-ops">' +
          (d.status === 'upcoming' ? '<button class="btn btn-sm btn-primary" data-op="start">开赛</button>' : '') +
          (d.status === 'live' || d.status === 'overtime'
            ? '<button class="btn btn-sm btn-primary" data-op="a">' + esc(d.teamA) + ' +1</button>' +
              '<button class="btn btn-sm" data-op="b">' + esc(d.teamB) + ' +1</button>' +
              '<input class="mt-in mt-note-in" id="mtNote" maxlength="40" placeholder="本回合备注（可选）">' +
              '<button class="btn btn-sm" data-op="undo">撤销上一回合</button>' +
              '<button class="btn btn-sm" data-op="cancel">取消赛事</button>'
            : '') +
          '</div>' : '') +
        '<div class="mt-adm-hint">每次记分都会立刻推到群里；12:12 时系统自动进加时，无需手动操作。</div>';

      admin.querySelector('#mtCreate').addEventListener('click', function () {
        var t = admin.querySelector('#mtTitle').value.trim();
        if (t.length < 2) { toast('写个赛事名'); return; }
        var when = admin.querySelector('#mtWhen').value;
        send('matchNew', {
          title: t, teamA: admin.querySelector('#mtA').value.trim() || '红队',
          teamB: admin.querySelector('#mtB').value.trim() || '蓝队',
          startAt: when ? new Date(when).getTime() : Date.now()
        });
      });

      admin.onclick = function (e) {
        var b = e.target.closest ? e.target.closest('[data-op]') : null;
        if (!b || !d) return;
        var op = b.getAttribute('data-op');
        if (op === 'cancel' && !confirm('取消这场赛事？已打的回合会保留。')) return;
        var extra = { id: d.id };
        if (op === 'start' || op === 'cancel') { extra.type = 'matchStatus'; extra.status = op === 'start' ? 'live' : 'cancelled'; }
        else if (op === 'undo') extra.type = 'matchUndo';
        else {
          extra.type = 'matchRound'; extra.side = op;
          var n = admin.querySelector('#mtNote');
          if (n) extra.note = n.value.trim();
        }
        b.disabled = true;
        send(extra.type, extra, function () { b.disabled = false; });
      };
    }

    /* ---------- 报名区 ---------- */
    function signupsOf(d) { return (d && d.signups) || []; }
    function mySignup(d) {
      if (!sess || !sess.qq) return null;
      var su = signupsOf(d);
      for (var i = 0; i < su.length; i++) if (String(su[i].qq) === String(sess.qq)) return su[i];
      return null;
    }
    function drawSignup(d) {
      var wall = wrap.querySelector('#mtSuWall');
      var ops = wrap.querySelector('#mtSuOps');
      var cnt = wrap.querySelector('#mtSuCount');
      if (!wall || !ops) return;
      if (!d) {
        cnt.textContent = '';
        wall.innerHTML = '<div class="mt-su-empty">还没有赛事，创建后开放报名。</div>';
        ops.innerHTML = '';
        return;
      }
      var su = signupsOf(d);
      var n = su.length;
      cnt.textContent = '（' + n + ' 人' + (n < 2 ? ' · 还差 ' + (2 - n) + ' 人成赛' : '') + '）';
      if (!n) {
        wall.innerHTML = '<div class="mt-su-empty">还没有人报名，快来成为第一个！</div>';
      } else {
        wall.innerHTML = su.map(function (s) {
          var me = sess && String(s.qq) === String(sess.qq);
          return '<div class="mt-su-card' + (me ? ' me' : '') + '">' +
            '<img class="mt-su-ava" src="' + avatarUrl(s.name, 48) + '" alt="" loading="lazy" ' +
            'onerror="this.onerror=null;this.src=\'assets/avatars/_fallback.svg\'">' +
            '<div class="mt-su-name">' + esc(s.name) + '</div>' +
            '<div class="mt-su-qq"><img src="' + qqAvatar(s.qq, 40) + '" alt="" onerror="this.style.visibility=\'hidden\'"> ' +
            esc(String(s.qq)) + '</div>' +
            (me ? '<button class="btn btn-sm btn-ghost mt-su-cancel" type="button" data-cancel="1">取消报名</button>' : '') +
            '</div>';
        }).join('');
        if (n < 2) wall.innerHTML += '<div class="mt-su-need">还差 ' + (2 - n) + ' 人就能开赛 🏆</div>';
      }

      /* 操作按钮：未登录 / 已报名 / 未报名 / 已关闭 */
      if (!sess) {
        ops.innerHTML = '<a class="btn btn-sm btn-primary" href="confirm.html">登录后报名</a>' +
          '<span class="mt-su-hint">需要先用 QQ 登录</span>';
      } else if (d.status === 'finished' || d.status === 'cancelled') {
        ops.innerHTML = '<span class="mt-su-hint">赛事已结束或取消，报名通道已关闭</span>';
      } else if (mySignup(d)) {
        ops.innerHTML = '<button class="btn btn-sm btn-ghost" type="button" data-cancel="1">我已报名（点击取消）</button>';
      } else {
        ops.innerHTML = '<button class="btn btn-sm btn-primary" type="button" id="mtSuBtn">报名参赛</button>';
      }
      ops.querySelectorAll('[data-cancel]').forEach(function (b) {
        b.addEventListener('click', function () { cancelSignup(d); });
      });
      var btn = ops.querySelector('#mtSuBtn');
      if (btn) btn.addEventListener('click', function () { startSignup(d); });
    }

    /* 点报名 → 先拉该 QQ 绑定的账号，多个则选，然后二次确认 */
    function startSignup(d) {
      var rid = randomHex(8);
      postBus({ type: 'matchSignupOptions', rid: rid, id: d.id, token: sess.token });
      waitBus(rid, ['matchOk', 'matchErr'], function (m) {
        if (!m) { toast('网络超时，稍后再试'); return; }
        if (m.type === 'matchErr') { toast(m.reason || '读取报名信息失败'); return; }
        var names = (m.signupOptions && m.signupOptions.names) || [];
        if (!names.length) { toast('该 QQ 还没绑定游戏账号，请先在游戏内绑定后再报名'); return; }
        if (names.length > 1) {
          pickAccount(names, function (name) { if (name) confirmSignup(d, name); });
        } else {
          confirmSignup(d, names[0]);
        }
      });
    }

    /* 多账号：先选一个 */
    function pickAccount(names, done) {
      var ov = el('div', 'mt-modal-overlay');
      var opts = names.map(function (nm, i) {
        return '<label class="mt-pick' + (i === 0 ? ' on' : '') + '">' +
          '<input type="radio" name="mtPick" value="' + esc(nm) + '"' + (i === 0 ? ' checked' : '') + '>' +
          '<img src="' + avatarUrl(nm, 40) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
          '<span>' + esc(nm) + '</span></label>';
      }).join('');
      ov.innerHTML = '<div class="mt-modal">' +
        '<div class="mt-modal-t">选择报名账号</div>' +
        '<div class="mt-modal-b"><p class="mt-modal-p">你的 QQ 绑定了多个游戏账号，选一个报名：</p>' +
        '<div class="mt-picks">' + opts + '</div></div>' +
        '<div class="mt-modal-ops">' +
        '<button class="btn btn-ghost btn-sm" data-act="cancel" type="button">返回</button>' +
        '<button class="btn btn-primary btn-sm" data-act="ok" type="button">下一步</button>' +
        '</div></div>';
      document.body.appendChild(ov);
      ov.querySelectorAll('input[name="mtPick"]').forEach(function (r) {
        r.addEventListener('change', function () {
          ov.querySelectorAll('.mt-pick').forEach(function (l) { l.classList.remove('on'); });
          r.closest('.mt-pick').classList.add('on');
        });
      });
      ov.querySelector('[data-act="cancel"]').onclick = function () { document.body.removeChild(ov); };
      ov.querySelector('[data-act="ok"]').onclick = function () {
        var sel = ov.querySelector('input[name="mtPick"]:checked');
        var name = sel ? sel.value : names[0];
        document.body.removeChild(ov);
        done(name);
      };
    }

    /* 二次确认：防止误触 */
    function confirmSignup(d, name) {
      var ov = el('div', 'mt-modal-overlay');
      ov.innerHTML = '<div class="mt-modal">' +
        '<div class="mt-modal-t">确认报名</div>' +
        '<div class="mt-modal-b">' +
        '<p class="mt-modal-p">确认用这个账号报名这场赛事吗？</p>' +
        '<div class="mt-confirm-id"><img src="' + avatarUrl(name, 56) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<div><div class="mt-confirm-name">' + esc(name) + '</div>' +
        '<div class="mt-confirm-sub">QQ ' + esc(String(sess.qq)) + '</div></div></div>' +
        '<p class="mt-modal-p mt-modal-warn">报名后会在赛事页公开展示你的头像和游戏ID；一个 QQ 只能报一个账号。</p>' +
        '</div>' +
        '<div class="mt-modal-ops">' +
        '<button class="btn btn-ghost btn-sm" data-act="cancel" type="button">再想想</button>' +
        '<button class="btn btn-primary btn-sm" data-act="ok" type="button">确认报名</button>' +
        '</div></div>';
      document.body.appendChild(ov);
      var okBtn = ov.querySelector('[data-act="ok"]');
      okBtn.onclick = function () {
        okBtn.disabled = true;
        var rid = randomHex(8);
        postBus({ type: 'matchSignup', rid: rid, id: d.id, name: name, token: sess.token });
        waitBus(rid, ['matchOk', 'matchErr'], function (m) {
          if (ov.parentNode) document.body.removeChild(ov);
          if (!m) { toast('网络超时，稍后再试'); return; }
          if (m.type === 'matchErr') { toast(m.reason || '报名失败'); return; }
          toast('报名成功！');
          paint(m);
        });
      };
      ov.querySelector('[data-act="cancel"]').onclick = function () { document.body.removeChild(ov); };
    }

    function cancelSignup(d) {
      if (!confirm('确定取消这场赛事的报名吗？')) return;
      var rid = randomHex(8);
      postBus({ type: 'matchCancelSignup', rid: rid, id: d.id, token: sess.token });
      waitBus(rid, ['matchOk', 'matchErr'], function (m) {
        if (!m) { toast('网络超时，稍后再试'); return; }
        if (m.type === 'matchErr') { toast(m.reason || '取消失败'); return; }
        toast('已取消报名');
        paint(m);
      });
    }

    /* 统一的发消息：带 token，回执刷新整块页面 */
    function send(type, extra, done) {
      var rid = randomHex(8);
      var p = Object.assign({ type: type, rid: rid, token: sess ? sess.token : '' }, extra || {});
      postBus(p);
      waitBus(rid, ['matchOk', 'matchErr'], function (m) {
        if (done) done();
        if (!m) { toast('操作超时，稍后再试'); return; }
        if (m.type === 'matchErr') { toast(m.reason || '操作失败'); return; }
        paint(m);
        if (type === 'matchNew') toast('赛事已创建，群里已公告');
        else if (type === 'matchRound') toast('比分已更新');
        else if (type === 'matchUndo') toast('已撤销上一回合');
      });
    }

    function paint(m) {
      if (!m) return;
      focusId = m.detail ? m.detail.id : 0;
      drawBoard(m.detail);
      drawHist(m.items, focusId);
      drawAdmin(m.detail, m.canManage, m.items);
      drawSignup(m.detail);
    }

    function load() {
      var shown = false;
      snapshot(function (s) {
        if (!s || !s.match) return;
        var d = s.match.detail;
        /* 指定 id 的历史赛事快照里没有，交给总线；当前赛事可以直接画 */
        if (focusId && (!d || d.id !== focusId)) return;
        shown = true;
        paint({ items: s.match.items || [], detail: d || null, canManage: snapAdmins(s, sess) });
      });
      var rid = randomHex(8);
      var p = focusId ? { type: 'matchDetail', rid: rid, id: focusId } : { type: 'matchQuery', rid: rid };
      if (sess) p.token = sess.token;
      postBus(p);
      waitBus(rid, ['matchOk', 'matchErr'], function (m) {
        if (m && m.type === 'matchOk') { paint(m); return; }
        /* ntfy 限流 / 超时：快照已兜底渲染，保留快照数据，不弹错误覆盖；
           只有连快照都没有时才显示读取失败（避免白屏）。 */
        if (!shown && !SNAP.data) board.innerHTML = busFailHtml();
      });
    }

    load();
    /* 赛事进行中每 8 秒自动同步一次沙盘；ntfy 限流时靠快照兜底，
       游戏服自动计分后网页也能在数秒内自动刷新。 */
    MT_TIMER = setInterval(function () {
      if (document.visibilityState === 'visible') load();
    }, 8000);
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
    '/weekly': renderWeekly,
    '/events': renderEvents,
    '/health': renderHealth,
    '/rally': renderRally,
    '/tourney': renderTourney,
    '/heat': renderHeat,
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
    // 玩家对比：/vs/<A>/<B>
    if (path.indexOf('/vs/') === 0) {
      var seg = path.split('/');
      var p1 = seg[2] || '', p2 = seg[3] || '';
      try { p1 = decodeURIComponent(p1); p2 = decodeURIComponent(p2); } catch (e) {}
      return { page: renderVs, params: [p1, p2] };
    }
    if (path.indexOf('/tourney/') === 0) {
      var mid = path.slice(9);
      return { page: renderTourney, param: mid };
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
    r.page(main, r.param, r.params);
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
    initSearch();
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
