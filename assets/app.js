/* ===========================================================
   MC 服务器宣传页 · 逻辑
   配置保存在 localStorage，可通过右上角齿轮自定义
   =========================================================== */
(function () {
  'use strict';

  var STORE_KEY = 'mc-site-config-v2';
  var THEME_KEY = 'mc-site-theme';

  /* ---------- 默认配置 ---------- */
  var DEFAULT_CONFIG = {
    serverName: 'Stone Logic',
    subtitle: '纯生存 · Paper 26.2 · 起床战争 · 地皮 · 公会',
    description: '主世界长期不删档，资源世界定期轮换；离线服带账号登录保护，100+ 插件打造的完整生存玩法。\n小游戏与生存互不干扰：想打就进竞技场，想种田就回自己的地皮。',
    javaIp: 'frp-top.com:44558',
    altIp: '',
    bedrockIp: '',
    statusApi: 'https://www.mclists.cn/api/server-status/?host={host}&port={port}',
    mclistUrl: 'https://www.mclists.cn/',
    icon: 'assets/icon.png',
    accent: '#52d468',
    features: [
      { icon: '⚔️', title: '起床战争', desc: 'BedWars 独立竞技场 + 自动大厅，开局即战，胜负不影响生存档。' },
      { icon: '🫥', title: '方块躲猫猫', desc: 'BlockHideAndSeek：伪装成方块藏起来，别被猎人一眼认出。' },
      { icon: '🏹', title: 'PVP 竞技场', desc: '多个 PVP 世界 + 决斗系统，随时约架、公平对战不爆装备。' },
      { icon: '🏡', title: '地皮与建筑', desc: 'PlotSquared 地皮世界 + WorldEdit + 建筑权杖，想怎么造就怎么造。' },
      { icon: '👥', title: '公会系统', desc: 'PlayerGuild 公会、好友、TPA、地标传送，和熟人一起长期发展。' },
      { icon: '💰', title: '自由经济', desc: 'QuickShop 摆摊开店、市场交易、点券、抽奖与红包，全靠自己赚。' },
      { icon: '⭐', title: '技能与职业', desc: 'mcMMO 技能 + Jobs 职业 + 每日任务 + 签到，边玩边变强。' },
      { icon: '🎁', title: '新手礼包', desc: '进服输入「同意」即领全套铁装 + 500 货币启动资金。' },
      { icon: '🛡️', title: '双重反作弊', desc: 'GrimAC + Vulcan 双重拦截，CoreProtect 一键回滚，建筑绝不被熊。' },
      { icon: '🌸', title: '季节与世界事件', desc: 'AeternumSeasons 四季变换、WorldEvents 世界大事、钓鱼与种田玩法。' }
    ],
    worlds: [
      { name: 'spawn / lobby', tag: '主城 · 大厅', desc: '传送枢纽与新手引导，回到这里永远安全。' },
      { name: 'overworld', tag: '主世界', desc: '长期不删档的生存主世界，你的家在这里。' },
      { name: 'the_nether / the_end', tag: '地狱 · 末地', desc: '原版维度，刷材料打末影龙。' },
      { name: 'world_resource', tag: '资源世界', desc: '随便挖、随便拆，定期轮换重置，主世界永不被挖空。' },
      { name: 'plot', tag: '地皮世界', desc: 'PlotSquared 地皮，一人一块，安心搞建筑。' },
      { name: 'community', tag: '社区共建', desc: '大家一起造的公共建筑区。' },
      { name: 'bwsp', tag: '起床战争', desc: 'BedWars 竞技场，自动排队开局。' },
      { name: 'blockhide / hide', tag: '方块躲猫猫', desc: '伪装成方块，躲过猎人。' },
      { name: 'pvp / pvp2', tag: 'PVP 竞技场', desc: '决斗与混战专用世界。' },
      { name: 'aeternum_frost / heat', tag: '季节世界', desc: '寒暑交替的四季世界，环境会变。' }
    ],
    screenshots: [],
    rules: [
      '禁止任何形式的外挂、脚本、宏与 bug 利用，一经发现永久封禁。',
      '禁止恶意破坏他人建筑、偷窃、骗取物品（CoreProtect 全程可追溯并回滚）。',
      '禁止在公共频道刷屏、人身攻击、发布违规或引战内容。',
      '禁止恶意 PVP：PVP 请移步竞技场世界，主世界偷袭他人将按恶意击杀处理。',
      '禁止利用漏洞刷物品、刷经验、刷货币，发现漏洞请主动上报。',
      '本服为离线服，请妥善保管自己的 AuthMe 账号密码，账号问题自行负责。',
      '地皮与领地内请互相尊重，长期不在线的建筑可能被回收。',
      '尊重管理员与其他玩家，有问题先在群内反馈，服从管理最终裁定。'
    ],
    faq: [
      { q: '服务器是什么版本？支持哪些客户端？', a: '服务端为 Purpur 26.2。装了 ViaVersion / ViaBackwards / ViaRewind，1.21.x 及更低版本客户端也能进，推荐用与你常用版本一致的客户端。' },
      { q: '是正版验证服吗？需要注册吗？', a: '本服为离线模式，无需正版账号即可进入。首次进服需要用 AuthMe 注册并设置密码（/register），之后每次进服 /login 登录。' },
      { q: '新手有什么福利？', a: '进服会收到一本《服务器游玩指南》，在聊天框输入「同意」即可领取全套铁装备 + 32 个牛排 + 500 货币。' },
      { q: '怎么去地皮 / 资源世界 / 小游戏？', a: '主城 spawn 有传送菜单与地标传送（/warp），也可直接输入 /warp plot、/warp end 等地标名。小游戏在世界 lobby 的菜单里进入。' },
      { q: '主世界会删档吗？', a: '主世界、地皮、公会建筑长期不删档；资源世界会定期轮换重置，便于大家持续获取资源。' },
      { q: '需要装模组或材质包吗？', a: '基础玩法不需要任何模组。想用语音聊天请安装 Simple Voice Chat 客户端模组；服务器已配置 ForcePack，进服会自动加载材质包。' },
      { q: '被熊了怎么办？', a: '服务器有 CoreProtect 全程记录，联系管理员即可精准回滚并封禁对方；请提前用木牌锁 / 领地保护好自己的箱子。' }
    ],
    links: [
      { label: '💬 QQ 交流群', url: 'https://qm.qq.com/q/UhSK4yuLGG' },
      { label: '📥 客户端下载', url: 'https://www.minecraft.net/zh-hans/download' },
      { label: '🎧 语音模组（Simple Voice Chat）', url: 'https://modrinth.com/plugin/simple-voice-chat' }
    ],
    footer: '© 2026 Stone Logic · 由玩家自建运营 · 与 Mojang / Microsoft 无关',
    layout: { order: ['hero', 'features', 'worlds', 'gallery', 'rules', 'faq', 'join'] }
  };

  /* ---------- 工具 ---------- */
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- 配置读写 ---------- */
  var cfg = (function () {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        var merged = clone(DEFAULT_CONFIG);
        Object.keys(DEFAULT_CONFIG).forEach(function (k) {
          if (saved[k] !== undefined) merged[k] = saved[k];
        });
        return merged;
      }
    } catch (e) { /* 忽略损坏的配置 */ }
    return clone(DEFAULT_CONFIG);
  })();

  function saveCfg() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cfg)); }
    catch (e) { toast('配置过大，无法保存到本地'); }
  }

  /* ---------- 主题 ---------- */
  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    $('#themeIcon').textContent = mode === 'dark' ? '🌙' : '☀️';
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!saved) {
      saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(saved);
  })();

  $('#themeBtn').addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  /* ---------- 渲染页面 ---------- */
  function renderAll() {
    document.title = cfg.serverName + ' · Minecraft 服务器';
    document.documentElement.style.setProperty('--accent', cfg.accent);

    $('#navName').textContent = cfg.serverName;
    $('#heroName').textContent = cfg.serverName;
    $('#heroSubtitle').textContent = cfg.subtitle;
    $('#heroDesc').textContent = cfg.description;
    $('#javaIp').textContent = cfg.javaIp;
    $('#statusAddr').textContent = cfg.javaIp;

    var navIcon = $('#navIcon'), heroIcon = $('#heroIcon');
    [navIcon, heroIcon].forEach(function (el) {
      el.src = cfg.icon || DEFAULT_CONFIG.icon;
      el.onerror = function () { el.src = DEFAULT_CONFIG.icon; };
    });
    $('#favicon').href = cfg.icon || DEFAULT_CONFIG.icon;

    var br = $('#bedrockRow');
    if (cfg.bedrockIp) { br.hidden = false; $('#bedrockIp').textContent = cfg.bedrockIp; }
    else { br.hidden = true; }

    var dl = (cfg.links || []).filter(function (l) { return /下载|客户端/.test(l.label); })[0];
    $('#downloadBtn').href = dl ? dl.url : 'https://www.minecraft.net/zh-hans/download';

    // 特色
    $('#featureGrid').innerHTML = (cfg.features || []).map(function (f) {
      return '<div class="card"><span class="feat-icon">' + esc(f.icon) + '</span><h3>' +
        esc(f.title) + '</h3><p>' + esc(f.desc) + '</p></div>';
    }).join('');

    // 世界
    var worlds = cfg.worlds || [];
    $('#worldCount').textContent = worlds.length;
    $('#worldGrid').innerHTML = worlds.map(function (w) {
      return '<div class="wcard"><div class="w-tag">' + esc(w.tag) + '</div>' +
        '<code class="w-name">' + esc(w.name) + '</code>' +
        '<p>' + esc(w.desc) + '</p></div>';
    }).join('');

    // 规则
    $('#ruleList').innerHTML = (cfg.rules || []).map(function (r, i) {
      return '<li><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + esc(r) + '</span></li>';
    }).join('');

    // FAQ
    $('#faqList').innerHTML = (cfg.faq || []).map(function (f) {
      return '<div class="faq-item"><div class="faq-q"><span>' + esc(f.q) +
        '</span><span>+</span></div><div class="faq-a">' + esc(f.a) + '</div></div>';
    }).join('');
    $$('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.parentElement;
        var open = item.classList.toggle('open');
        q.lastElementChild.textContent = open ? '−' : '+';
      });
    });

    // 链接
    var links = (cfg.links || []).slice();
    if (cfg.mclistUrl) links.push({ label: '📋 在 McLists 查看 / 投票', url: cfg.mclistUrl });
    $('#joinLinks').innerHTML = links.map(function (l) {
      return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
    }).join('');

    $('#footerText').textContent = cfg.footer;

    renderGallery();
  }

  /* ---------- 截图画廊 ---------- */
  var shots = [];
  function renderGallery() {
    shots = (cfg.screenshots || []).slice();
    var list = $('#galleryList');
    /* 没有截图就整个版块连同导航一起隐藏，避免留一个空白占位卡 */
    var sec = $('#gallery'), nav = $('#navGallery');
    if (sec) sec.hidden = !shots.length;
    if (nav) nav.hidden = !shots.length;
    if (!shots.length) {
      list.innerHTML = '';
      $('#galDots').innerHTML = '';
      return;
    }
    list.innerHTML = shots.map(function (s, i) {
      return '<figure class="shot" data-i="' + i + '" style="margin:0">' +
        '<img loading="lazy" src="' + esc(s.url) + '" alt="' + esc(s.cap) + '">' +
        '<figcaption class="cap">' + esc(s.cap) + '</figcaption></figure>';
    }).join('');
    $('#galDots').innerHTML = shots.map(function (_, i) {
      return '<i data-i="' + i + '" class="' + (i === 0 ? 'on' : '') + '"></i>';
    }).join('');
    $$('.shot').forEach(function (el) {
      el.addEventListener('click', function () { openLb(+el.dataset.i); });
    });
    $$('#galDots i').forEach(function (d) {
      d.addEventListener('click', function () { scrollToShot(+d.dataset.i); });
    });
    list.addEventListener('scroll', function () {
      var w = list.clientWidth, i = Math.round(list.scrollLeft / (w || 1));
      $$('#galDots i').forEach(function (d, idx) { d.classList.toggle('on', idx === i); });
    });
  }
  function scrollToShot(i) {
    var list = $('#galleryList');
    var el = list.children[i];
    if (el) list.scrollTo({ left: el.offsetLeft - list.offsetLeft, behavior: 'smooth' });
  }
  $('#galLeft').addEventListener('click', function () { $('#galleryList').scrollBy({ left: -360, behavior: 'smooth' }); });
  $('#galRight').addEventListener('click', function () { $('#galleryList').scrollBy({ left: 360, behavior: 'smooth' }); });

  /* ---------- 灯箱 ---------- */
  var lbIndex = 0;
  function openLb(i) {
    if (!shots.length) return;
    lbIndex = i;
    $('#lbImg').src = shots[i].url;
    $('#lbCap').textContent = shots[i].cap;
    $('#lightbox').hidden = false;
  }
  function lbStep(d) {
    if (!shots.length) return;
    lbIndex = (lbIndex + d + shots.length) % shots.length;
    $('#lbImg').src = shots[lbIndex].url;
    $('#lbCap').textContent = shots[lbIndex].cap;
  }
  $('#lbClose').addEventListener('click', function () { $('#lightbox').hidden = true; });
  $('#lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') $('#lightbox').hidden = true; });
  $('#lbPrev').addEventListener('click', function () { lbStep(-1); });
  $('#lbNext').addEventListener('click', function () { lbStep(1); });
  document.addEventListener('keydown', function (e) {
    if ($('#lightbox').hidden) return;
    if (e.key === 'Escape') $('#lightbox').hidden = true;
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });

  /* ---------- 复制地址 ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = document.getElementById(btn.dataset.copy).textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('已复制：' + text); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast('已复制：' + text); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- 服务器状态检测 ---------- */
  function normalizeJava(data) {
    var pl = data.players || {};
    return {
      online: !!data.online,
      players: {
        online: pl.online != null ? pl.online : 0,
        max: pl.max != null ? pl.max : 0,
        list: (pl.list || pl.sample || []).map(function (x) {
          return typeof x === 'string' ? x : (x && (x.name || x.name_clean || x.name_raw)) || '';
        }).filter(Boolean),
        uuid: pl.uuid || {}
      },
      version: typeof data.version === 'string' ? data.version : (data.version && (data.version.name_clean || data.version.name)) || '',
      motd: motdText(data.motd),
      icon: data.icon || data.favicon || ''
    };
  }
  /* MOTD 可能是字符串，也可能是 1.16+ 的 text component（对象/数组），统一压成纯文本 */
  function motdText(m) {
    if (!m) return '';
    if (typeof m === 'string') return m;
    if (Array.isArray(m)) return m.map(motdText).join('');
    if (typeof m === 'object') {
      if (typeof m.clean === 'string') return m.clean;
      if (typeof m.raw === 'string') return m.raw;
      if (typeof m.text === 'string' && (!m.extra || !m.extra.length)) return m.text;
      var s = '';
      if (typeof m.text === 'string') s += m.text;
      if (Array.isArray(m.extra)) s += m.extra.map(motdText).join('');
      if (Array.isArray(m.translate)) s += m.translate.map(motdText).join('');
      return s;
    }
    return '';
  }
  function splitAddr(addr) {
    var s = String(addr || '').trim().replace(/^\[/, '');
    var m = s.match(/^(.*?)(?::(\d{1,5}))?$/);
    return { host: (m && m[1]) || s, port: (m && m[2]) || '25565' };
  }
  async function queryCustomApi(api, addr) {
    var t0 = performance.now();
    var a = splitAddr(addr);
    var url;
    if (/\{host\}|\{port\}|\{addr\}/.test(api)) {
      url = api
        .replace('{host}', encodeURIComponent(a.host))
        .replace('{port}', encodeURIComponent(a.port))
        .replace('{addr}', encodeURIComponent(addr));
    } else {
      url = api + (api.indexOf('?') >= 0 ? '&' : '?') + 'addr=' + encodeURIComponent(addr);
    }
    var res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var d = await res.json();
    var elapsed = Math.round(performance.now() - t0);
    var out;
    if (d && d.data && d.data.online !== undefined) {
      var s = d.data; // mclists.cn 格式
      out = {
        online: !!s.online,
        players: {
          online: s.players ? (s.players.now != null ? s.players.now : s.players.online) : 0,
          max: s.players ? (s.players.max != null ? s.players.max : s.players.maximum) : 0,
          list: (s.players && (s.players.list || s.players.sample)) || [],
          uuid: {}
        },
        version: s.version || s.name || '',
        motd: motdText(s.description),
        icon: s.favicon || '',
        ping: s.latency > 0 ? s.latency : elapsed
      };
    } else if (d && d.data && d.data.status !== undefined) {
      d = d.data; d.online = !!d.status; // apihz 格式
      out = normalizeJava(d);
      out.ping = elapsed;
    } else {
      out = normalizeJava(d);
      out.ping = elapsed;
    }
    return out;
  }
  async function queryJava(addr) {
    var t0 = performance.now();
    var res = await fetch('https://api.mcsrvstat.us/3/' + encodeURIComponent(addr), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var d = normalizeJava(await res.json());
    d.ping = Math.round(performance.now() - t0);
    return d;
  }
  async function queryJavaFallback(addr) {
    var t0 = performance.now();
    var res = await fetch('https://api.mcstatus.io/v2/status/java/' + encodeURIComponent(addr), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var j = await res.json();
    var d = {
      online: !!j.online,
      players: {
        online: j.players ? j.players.online : 0,
        max: j.players ? j.players.max : 0,
        list: (j.players && j.players.list ? j.players.list.map(function (p) { return p.name_clean || p.name_raw; }) : []),
        uuid: {}
      },
      version: j.version ? j.version.name_clean : '',
      motd: j.motd ? j.motd.clean : '',
      icon: j.icon || ''
    };
    d.ping = Math.round(performance.now() - t0);
    return d;
  }

  var statusTimer = null;
  async function checkStatus() {
    var addr = (cfg.javaIp || '').trim();
    if (!addr) { setOffline('未配置服务器地址'); return; }
    if (/example\.com|127\.0\.0\.1|localhost/i.test(addr)) {
      setOffline('请在设置中填写真实地址');
      $('#apiNote').textContent = '当前地址仅为示例，无法检测';
      return;
    }

    $('#statusText').textContent = '检测中…';
    $('#statusPill').textContent = '检测中';
    $('#statusPill').className = 'status-pill';
    $('#apiNote').textContent = '';

    var data = null, src = '', viaAlt = false;
    var customApi = (cfg.statusApi || '').trim();

    /* 单一地址的检测流程：优先自定义接口，失败再走公共接口 */
    async function probe(a) {
      var r = { data: null, src: '' };
      try {
        if (customApi) { r.data = await queryCustomApi(customApi, a); r.src = '自定义接口'; }
        else { r.data = await queryJava(a); r.src = 'mcsrvstat.us'; }
      } catch (e1) {
        try { r.data = await queryJavaFallback(a); r.src = 'mcstatus.io'; }
        catch (e2) { /* 留给调用方处理 */ }
      }
      return r;
    }

    var res = await probe(addr);
    data = res.data; src = res.src;

    /* 主地址（自定义域名）查不到时，用备用地址再探一次。
       场景：域名 DNS 还没生效、或域名临时解析异常，服务器本身其实在线。 */
    var alt = (cfg.altIp || '').trim();
    if ((!data || !data.online) && alt && alt !== addr) {
      var r2 = await probe(alt);
      if (r2.data && r2.data.online) { data = r2.data; src = r2.src; viaAlt = true; }
    }

    if (!data) {
      setOffline('所有状态接口均不可用');
      $('#apiNote').textContent = customApi
        ? '自定义接口请求失败，请检查接口地址或稍后重试'
        : '接口请求失败。国内 frp 节点常被海外公共 API 检测不到，可在设置里配置自定义状态接口';
      return;
    }

    if (!data.online) { setOffline('服务器离线'); $('#apiNote').textContent = '数据来源：' + src; return; }

    $('#statusBadge').className = 'badge on';
    $('#statusText').textContent = '服务器在线';
    $('#statusPill').className = 'status-pill on';
    $('#statusPill').textContent = '在线';

    $('#playersOnline').textContent = data.players.online;
    $('#playersMax').textContent = data.players.max;
    var pct = data.players.max > 0 ? Math.min(100, data.players.online / data.players.max * 100) : 0;
    $('#playersBar').style.width = pct.toFixed(1) + '%';

    $('#metaVersion').textContent = data.version || '未知';
    $('#metaPing').textContent = data.ping != null ? data.ping + ' ms' : '—';
    $('#metaTime').textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    $('#motd').textContent = motdText(data.motd) || '（该服务器未设置 MOTD）';
    $('#apiNote').textContent = '数据来源：' + src +
      (viaAlt ? ' · 自定义域名暂未生效，已用备用地址 ' + alt + ' 检测' : '') + ' · 每 60 秒自动刷新';

    // 玩家头像
    var names = data.players.list.slice(0, 24);
    var box = $('#playerHeads');
    if (!names.length) { box.innerHTML = '<div class="ph" style="display:none"></div>'; }
    else {
      box.innerHTML = names.map(function (n) {
        return '<img loading="lazy" title="' + esc(n) + '" alt="' + esc(n) +
          '" src="https://mc-heads.net/avatar/' + encodeURIComponent(n) + '/32">';
      }).join('');
    }
  }
  function setOffline(msg) {
    $('#statusBadge').className = 'badge off';
    $('#statusText').textContent = msg;
    $('#statusPill').className = 'status-pill off';
    $('#statusPill').textContent = '离线';
    $('#playersOnline').textContent = '0';
    $('#playersMax').textContent = '0';
    $('#playersBar').style.width = '0%';
    $('#metaVersion').textContent = '—';
    $('#metaPing').textContent = '—';
    $('#metaTime').textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    $('#motd').textContent = '服务器当前不可达，可能正在维护或地址填写有误。';
    $('#playerHeads').innerHTML = '';
  }
  $('#refreshBtn').addEventListener('click', function () { checkStatus(); toast('正在重新检测…'); });
  function startPolling() {
    clearInterval(statusTimer);
    statusTimer = setInterval(checkStatus, 60000);
  }

  /* ---------- 设置抽屉 ---------- */
  var draft = null;
  function openDrawer() {
    draft = clone(cfg);
    buildForm();
    $('#drawer').classList.add('open');
    $('#drawerMask').hidden = false;
  }
  function closeDrawer() { $('#drawer').classList.remove('open'); $('#drawerMask').hidden = true; }
  $('#settingsBtn').addEventListener('click', openDrawer);
  $('#closeDrawer').addEventListener('click', closeDrawer);
  $('#drawerMask').addEventListener('click', closeDrawer);

  function pickImage(cb, prefix) {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.addEventListener('change', async function () {
      var f = inp.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = async function (ev) {
        var img = new Image();
        img.onload = async function () {
          var max = 1280;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * scale);
          cv.height = Math.round(img.height * scale);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          var dataUrl = cv.toDataURL('image/jpeg', 0.85);
          var path = '';
          try {
            if (cloudSession) path = await MCCloud.uploadImage(f, prefix || 'img');
          } catch (e) { /* 未登录或上传失败时仅用本地图 */ }
          cb(dataUrl, path);
        };
        img.onerror = function () { cb(ev.target.result, ''); };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(f);
    });
    inp.click();
  }

  /* ---------- 云同步 ---------- */
  var cloudSession = null, cloudRowId = null, cloudPending = null, cloudNote = '';

  function mergeConfig(p) {
    var m = clone(DEFAULT_CONFIG);
    Object.keys(DEFAULT_CONFIG).forEach(function (k) { if (p && p[k] !== undefined) m[k] = p[k]; });
    return m;
  }
  function setCloudNote(t) { var el = $('#cloudNote'); if (el) el.textContent = t; }

  async function refreshCloudUI() {
    if (!window.MCCloud || !MCCloud.available()) return;
    cloudSession = await MCCloud.getSession();
    var box = $('#cloudLoginBox'), out = $('#cloudLogout');
    if (cloudSession && cloudSession.user) {
      var who = cloudSession.user.email || cloudSession.user.phone || '已登录';
      setCloudNote('已登录：' + who + (cloudRowId ? ' · 云端已有你的配置' : ' · 云端还没有你的配置'));
      if (box) box.style.display = 'none';
      if (out) out.style.display = '';
    } else {
      setCloudNote(cloudNote || '未登录：访客只能浏览，登录后才能把配置和图片保存到云端');
      if (box) box.style.display = '';
      if (out) out.style.display = 'none';
    }
  }

  async function applyCloudImages() {
    if (!cloudSession || !window.MCCloud) return;
    var backup = JSON.parse(JSON.stringify(cfg));
    try {
      cfg = await MCCloud.resolveImages(cfg);
      renderAll();
    } catch (e) { /* 签名链接失败就用本地图 */ }
    cfg = backup;
  }

  async function bootCloud() {
    if (!window.MCCloud || !MCCloud.available()) {
      cloudNote = '云服务未就绪：请在已发布的域名下打开（本地预览不支持）';
      setCloudNote(cloudNote);
      return;
    }
    try {
      var remote = await MCCloud.loadConfig();
      if (remote && remote.payload) {
        cfg = mergeConfig(remote.payload);
        saveCfg();
        renderAll();
        checkStatus();
        cloudNote = '已加载云端配置（' + new Date(remote.updatedAt).toLocaleString('zh-CN') + '）';
      } else {
        cloudNote = '云端暂无配置，登录并保存后生效';
      }
      cloudSession = await MCCloud.getSession();
      cloudRowId = (cloudSession && remote && remote.ownerId === cloudSession.user.id) ? remote.id : null;
      await refreshCloudUI();
      await applyCloudImages();
    } catch (e) {
      cloudNote = '云端读取失败：' + MCCloud.errText(e, '请稍后重试');
      setCloudNote(cloudNote);
    }
  }

  function bindCloudEvents() {
    var send = $('#cloudSend'), verify = $('#cloudVerify'), push = $('#cloudPush'),
      pull = $('#cloudPull'), out = $('#cloudLogout');
    if (send) send.addEventListener('click', async function () {
      var email = $('#cloudEmail').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('请输入正确的邮箱'); return; }
      send.disabled = true; send.textContent = '发送中…';
      try {
        cloudPending = await MCCloud.sendEmailCode(email);
        toast('验证码已发送至邮箱');
      } catch (e) { toast(MCCloud.errText(e, '验证码发送失败')); }
      send.disabled = false; send.textContent = '获取验证码';
    });
    if (verify) verify.addEventListener('click', async function () {
      if (!cloudPending) { toast('请先获取验证码'); return; }
      var code = $('#cloudCode').value.trim();
      var pwd = $('#cloudPwd').value;
      if (!code) { toast('请输入验证码'); return; }
      if (!cloudPending.isExistingUser && !pwd) { toast('新账号需要设置密码'); return; }
      try {
        await MCCloud.verifyEmailCode(cloudPending, code, pwd);
        cloudPending = null;
        toast('登录成功');
        await refreshCloudUI();
        await applyCloudImages();
      } catch (e) { toast(MCCloud.errText(e, '登录失败')); }
    });
    if (push) push.addEventListener('click', async function () {
      if (!cloudSession) { toast('请先登录'); return; }
      push.disabled = true; push.textContent = '保存中…';
      try {
        var payload = clone(collectForm());
        payload.iconPath = draft.iconPath || '';
        var id = await MCCloud.saveConfig(payload, cloudRowId);
        cloudRowId = id;
        toast('已保存到云端');
        await refreshCloudUI();
      } catch (e) {
        toast(MCCloud.errText(e, '云端保存失败'));
        if (/不属于当前账号/.test(e.message || '')) cloudRowId = null;
      }
      push.disabled = false; push.textContent = '保存到云端';
    });
    if (pull) pull.addEventListener('click', async function () {
      try {
        var remote = await MCCloud.loadConfig();
        if (!remote || !remote.payload) { toast('云端暂无配置'); return; }
        cfg = mergeConfig(remote.payload);
        saveCfg();
        renderAll();
        checkStatus();
        cloudSession = await MCCloud.getSession();
        cloudRowId = (cloudSession && remote.ownerId === cloudSession.user.id) ? remote.id : null;
        await refreshCloudUI();
        await applyCloudImages();
        toast('已从云端拉取');
      } catch (e) { toast(MCCloud.errText(e, '拉取失败')); }
    });
    if (out) out.addEventListener('click', async function () {
      await MCCloud.signOut();
      cloudSession = null; cloudRowId = null; cloudPending = null;
      cloudNote = '';
      await refreshCloudUI();
      toast('已退出登录');
    });
  }

  function buildForm() {
    var d = draft;
    var html = '';

    html += '<div class="group"><div class="g-title">云同步（跨设备保存配置）</div>' +
      '<div class="hint" id="cloudNote">检测中…</div>' +
      '<div class="field" id="cloudLoginBox">' +
      '<div class="rowauto"><input type="text" id="cloudEmail" placeholder="管理员邮箱">' +
      '<button type="button" class="btn-outline small" id="cloudSend">获取验证码</button></div>' +
      '<div class="rowauto" style="margin-top:8px"><input type="text" id="cloudCode" placeholder="邮箱验证码">' +
      '<button type="button" class="btn-primary small" id="cloudVerify">登录 / 注册</button></div>' +
      '<input type="password" id="cloudPwd" placeholder="新账号需设置密码" style="margin-top:8px">' +
      '<div class="hint">游客只能浏览；登录后才能把站点配置与图片保存到云端</div></div>' +
      '<div class="rowauto" style="margin-top:10px">' +
      '<button type="button" class="btn-outline small" id="cloudPull">从云端拉取</button>' +
      '<button type="button" class="btn-primary small" id="cloudPush">保存到云端</button></div>' +
      '<button type="button" class="add-btn" id="cloudLogout" style="margin-top:8px">退出登录</button>' +
      '</div>';

    html += '<div class="group"><div class="g-title">基本信息</div>';
    html += '<div class="field"><label>服务器名称</label><input type="text" data-k="serverName" value="' + esc(d.serverName) + '"></div>';
    html += '<div class="field"><label>副标题 / 一句话简介</label><input type="text" data-k="subtitle" value="' + esc(d.subtitle) + '"></div>';
    html += '<div class="field"><label>详细介绍</label><textarea data-k="description">' + esc(d.description) + '</textarea></div>';
    html += '<div class="field"><label>Java 版地址（域名或 IP，端口用 :25565）</label><input type="text" data-k="javaIp" value="' + esc(d.javaIp) + '">' +
      '<div class="hint">状态检测使用此地址，例如 play.example.com 或 1.2.3.4:25565</div></div>';
    html += '<div class="field"><label>备用检测地址（可选）</label><input type="text" data-k="altIp" value="' + esc(d.altIp || '') + '">' +
      '<div class="hint">主地址（自定义域名）检测不到时，用它再试一次。适合填 frp 原始地址，避免域名解析未生效期间误报离线</div></div>';
    html += '<div class="field"><label>自定义状态检测接口（可选）</label><input type="text" data-k="statusApi" value="' + esc(d.statusApi || '') + '">' +
      '<div class="hint">支持 {host} / {port} / {addr} 占位符。留空用公共 API（海外源，frp 地址常被判离线）</div></div>';
    html += '<div class="field"><label>McLists 服务器页面链接（可选）</label><input type="text" data-k="mclistUrl" value="' + esc(d.mclistUrl || '') + '">' +
      '<div class="hint">填写后会在「如何加入」区显示查看/投票入口</div></div>';
    html += '<div class="field"><label>基岩版地址（留空则隐藏）</label><input type="text" data-k="bedrockIp" value="' + esc(d.bedrockIp) + '"></div>';
    html += '<div class="field"><label>页脚文字</label><input type="text" data-k="footer" value="' + esc(d.footer) + '"></div>';
    html += '<div class="row2"><div class="field"><label>主题色</label><input type="color" data-k="accent" value="' + esc(d.accent) + '"></div>';
    html += '<div class="field"><label>服务器图标</label><div class="rowauto">' +
      '<img class="thumb" id="iconThumb" src="' + esc(d.icon) + '" alt="">' +
      '<button type="button" class="btn-outline small" id="iconPick">上传</button></div>' +
      '<input type="text" id="iconUrl" data-k="icon" value="' + esc(d.icon) + '" style="margin-top:8px">' +
      '<div class="hint">建议使用 64×64 的 PNG，也可直接填图片链接</div></div></div>';
    html += '</div>';

    html += '<div class="group"><div class="g-title">玩法特色</div><div id="featWrap"></div>' +
      '<button type="button" class="add-btn" data-add="features">+ 添加一项</button></div>';

    html += '<div class="group"><div class="g-title">世界 / 分区</div><div id="worldWrap"></div>' +
      '<button type="button" class="add-btn" data-add="worlds">+ 添加世界</button></div>';

    html += '<div class="group"><div class="g-title">服务器截图</div><div id="shotWrap"></div>' +
      '<button type="button" class="add-btn" data-add="screenshots">+ 添加截图</button>' +
      '<div class="hint" style="margin-top:8px">上传的图片会压缩并保存在浏览器本地</div></div>';

    html += '<div class="group"><div class="g-title">服务器规则（一行一条）</div>' +
      '<textarea data-k="rules" style="min-height:120px">' + esc((d.rules || []).join('\n')) + '</textarea></div>';

    html += '<div class="group"><div class="g-title">常见问题</div><div id="faqWrap"></div>' +
      '<button type="button" class="add-btn" data-add="faq">+ 添加问答</button></div>';

    html += '<div class="group"><div class="g-title">社群 / 下载链接</div><div id="linkWrap"></div>' +
      '<button type="button" class="add-btn" data-add="links">+ 添加链接</button></div>';

    $('#drawerBody').innerHTML = html;
    renderLists();

    $('#iconPick').addEventListener('click', function () {
      pickImage(function (dataUrl, path) {
        $('#iconUrl').value = dataUrl;
        $('#iconThumb').src = dataUrl;
        if (path) draft.iconPath = path;
      }, 'icon');
    });
    $('#iconUrl').addEventListener('input', function () { $('#iconThumb').src = this.value; });

    $$('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.add;
        var item = key === 'features' ? { icon: '⭐', title: '新特色', desc: '描述' }
          : key === 'screenshots' ? { url: '', cap: '新截图' }
          : key === 'worlds' ? { name: 'world_name', tag: '分类', desc: '一句话说明' }
          : key === 'faq' ? { q: '问题？', a: '回答' }
          : { label: '🔗 链接名称', url: '#' };
        draft[key].push(item);
        renderLists();
      });
    });

    bindCloudEvents();
    refreshCloudUI();
  }

  function renderLists() {
    // 特色
    $('#featWrap').innerHTML = draft.features.map(function (f, i) {
      return '<div class="item-row" data-key="features" data-i="' + i + '">' +
        '<div class="row2"><input type="text" data-f="icon" value="' + esc(f.icon) + '" placeholder="emoji">' +
        '<input type="text" data-f="title" value="' + esc(f.title) + '" placeholder="标题"></div>' +
        '<input type="text" data-f="desc" value="' + esc(f.desc) + '" placeholder="描述">' +
        '<button type="button" class="mini-del">删除</button></div>';
    }).join('');

    // 世界
    $('#worldWrap').innerHTML = draft.worlds.map(function (w, i) {
      return '<div class="item-row" data-key="worlds" data-i="' + i + '">' +
        '<div class="row2"><input type="text" data-f="tag" value="' + esc(w.tag) + '" placeholder="分类">' +
        '<input type="text" data-f="name" value="' + esc(w.name) + '" placeholder="世界名"></div>' +
        '<input type="text" data-f="desc" value="' + esc(w.desc) + '" placeholder="说明">' +
        '<button type="button" class="mini-del">删除</button></div>';
    }).join('');

    // 截图
    $('#shotWrap').innerHTML = draft.screenshots.map(function (s, i) {
      return '<div class="item-row" data-key="screenshots" data-i="' + i + '">' +
        '<div class="rowauto"><input type="text" data-f="url" value="' + esc(s.url) + '" placeholder="图片链接">' +
        '<button type="button" class="btn-outline small shot-pick">上传</button></div>' +
        '<div class="rowauto"><input type="text" data-f="cap" value="' + esc(s.cap) + '" placeholder="说明">' +
        '<img class="thumb" src="' + esc(s.url) + '" alt=""></div>' +
        '<button type="button" class="mini-del">删除</button></div>';
    }).join('');

    // FAQ
    $('#faqWrap').innerHTML = draft.faq.map(function (f, i) {
      return '<div class="item-row" data-key="faq" data-i="' + i + '">' +
        '<input type="text" data-f="q" value="' + esc(f.q) + '" placeholder="问题">' +
        '<textarea data-f="a" placeholder="回答">' + esc(f.a) + '</textarea>' +
        '<button type="button" class="mini-del">删除</button></div>';
    }).join('');

    // 链接
    $('#linkWrap').innerHTML = draft.links.map(function (l, i) {
      return '<div class="item-row" data-key="links" data-i="' + i + '">' +
        '<div class="row2"><input type="text" data-f="label" value="' + esc(l.label) + '" placeholder="名称">' +
        '<input type="text" data-f="url" value="' + esc(l.url) + '" placeholder="链接"></div>' +
        '<button type="button" class="mini-del">删除</button></div>';
    }).join('');

    // 输入同步
    $$('.item-row input,.item-row textarea').forEach(function (el) {
      var ev = el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'color' ? 'input' : 'change';
      el.addEventListener(ev, function () {
        var row = el.closest('.item-row');
        draft[row.dataset.key][+row.dataset.i][el.dataset.f] = el.value;
        if (el.dataset.f === 'url') {
          var img = row.querySelector('img.thumb');
          if (img) img.src = el.value;
        }
      });
    });
    // 删除
    $$('.item-row .mini-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('.item-row');
        draft[row.dataset.key].splice(+row.dataset.i, 1);
        renderLists();
      });
    });
    // 截图上传
    $$('.shot-pick').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('.item-row');
        pickImage(function (dataUrl, path) {
          var i = +row.dataset.i;
          draft.screenshots[i].url = dataUrl;
          if (path) draft.screenshots[i].path = path;
          renderLists();
        }, 'shot');
      });
    });
  }

  function collectForm() {
    $$('#drawerBody [data-k]').forEach(function (el) {
      var k = el.dataset.k;
      if (k === 'rules') draft.rules = el.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      else if (k === 'accent') draft.accent = el.value;
      else draft[k] = el.value.trim();
    });
    return draft;
  }

  $('#saveBtn').addEventListener('click', function () {
    cfg = clone(collectForm());
    saveCfg();
    renderAll();
    checkStatus();
    startPolling();
    closeDrawer();
    toast('已保存并应用');
  });

  $('#exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mc-server-config.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('配置已导出');
  });

  $('#importInput').addEventListener('change', function (e) {
    var f = e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var obj = JSON.parse(r.result);
        var merged = clone(DEFAULT_CONFIG);
        Object.keys(DEFAULT_CONFIG).forEach(function (k) { if (obj[k] !== undefined) merged[k] = obj[k]; });
        cfg = merged;
        saveCfg();
        renderAll();
        checkStatus();
        toast('配置已导入');
      } catch (err) { toast('配置文件解析失败'); }
    };
    r.readAsText(f);
    e.target.value = '';
  });

  $('#resetBtn').addEventListener('click', function () {
    if (!confirm('确定恢复默认配置？当前自定义内容将被覆盖。')) return;
    cfg = clone(DEFAULT_CONFIG);
    saveCfg();
    renderAll();
    checkStatus();
    toast('已恢复默认');
  });

  /* ---------- 布局编辑（密码保护） ---------- */
  // 默认密码：mcstl-sjwj（改密码：把新密码做 SHA-256 后替换下面的哈希）
  var EDIT_HASH = '8f4771942294a2d7bea850b27b57f7dfe7a66b6dfb91ffb100ba180a0c48af96';

  function sha256(s) {
    return new Promise(function (res, rej) {
      if (!(window.crypto && crypto.subtle && window.TextEncoder)) { rej(new Error('no-crypto')); return; }
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (buf) {
        var a = Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
        res(a);
      }).catch(rej);
    });
  }

  function mainSections() {
    var main = document.getElementById('top');
    if (!main) return [];
    return Array.prototype.filter.call(main.children, function (el) {
      return el.tagName === 'SECTION' && el.id;
    });
  }

  function applyLayout() {
    var main = document.getElementById('top');
    if (!main) return;
    var order = (cfg.layout && Array.isArray(cfg.layout.order) && cfg.layout.order.length)
      ? cfg.layout.order : DEFAULT_CONFIG.layout.order;
    order.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode === main) main.appendChild(el);
    });
  }

  // 让 renderAll 之后自动套用布局顺序
  var __renderAll = renderAll;
  renderAll = function () { __renderAll.apply(this, arguments); applyLayout(); };

  function currentOrder() {
    return mainSections().map(function (s) { return s.id; });
  }
  function persistOrder() {
    cfg.layout = { order: currentOrder() };
    saveCfg();
  }

  function enableDrag(on) {
    Array.prototype.forEach.call(document.querySelectorAll('#top > section'), function (s) {
      if (on) s.setAttribute('draggable', 'true');
      else s.removeAttribute('draggable');
    });
  }

  function afterElement(container, y) {
    var els = Array.prototype.filter.call(container.children, function (c) {
      return c.tagName === 'SECTION' && !c.classList.contains('dragging');
    });
    var closest = { offset: Number.NEGATIVE_INFINITY, element: null };
    els.forEach(function (child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) closest = { offset: offset, element: child };
    });
    return closest.element;
  }

  var editing = false, dragEl = null;

  function buildEditBar() {
    if (document.getElementById('editBar')) return;
    var bar = document.createElement('div');
    bar.id = 'editBar';
    bar.innerHTML = '<span class="eb-title">布局编辑中 · 拖动区块排序</span>' +
      '<button type="button" class="eb-btn" id="ebExit">退出</button>' +
      '<button type="button" class="eb-btn primary" id="ebSaveCloud">保存到云端</button>';
    document.body.appendChild(bar);
    document.getElementById('ebExit').addEventListener('click', exitEdit);
    document.getElementById('ebSaveCloud').addEventListener('click', pushLayoutCloud);
  }

  async function pushLayoutCloud() {
    persistOrder();
    if (!cloudSession) { toast('未登录：请到 设置 → 云同步 登录后再保存到云端'); return; }
    try {
      var payload = clone(cfg);
      payload.iconPath = cfg.iconPath || '';
      var id = await MCCloud.saveConfig(payload, cloudRowId);
      cloudRowId = id;
      toast('布局已保存到云端');
    } catch (e) { toast(MCCloud.errText(e, '云端保存失败')); }
  }

  function enterEdit() {
    if (editing) return;
    editing = true;
    document.body.classList.add('layout-edit');
    applyLayout();
    enableDrag(true);
    buildEditBar();
    var main = document.getElementById('top');
    if (main && !main._dragBound) {
      main._dragBound = true;
      main.addEventListener('dragstart', function (e) {
        var s = e.target.closest ? e.target.closest('section') : null;
        if (!s || s.parentNode !== main) return;
        dragEl = s; s.classList.add('dragging');
        try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', s.id || ''); } catch (_) {}
      });
      main.addEventListener('dragend', function (e) {
        var s = e.target.closest ? e.target.closest('section') : null;
        if (s) s.classList.remove('dragging');
        if (dragEl) { dragEl.classList.remove('dragging'); dragEl = null; }
        persistOrder(); toast('布局已保存到本地');
      });
      main.addEventListener('dragover', function (e) {
        if (!dragEl) return;
        e.preventDefault();
        var after = afterElement(main, e.clientY);
        if (after == null) main.appendChild(dragEl);
        else main.insertBefore(dragEl, after);
      });
    }
    toast('已进入布局编辑：拖动各区块调整顺序');
  }

  function exitEdit() {
    editing = false;
    document.body.classList.remove('layout-edit');
    enableDrag(false);
    var bar = document.getElementById('editBar');
    if (bar) bar.remove();
    persistOrder();
    toast('已退出编辑');
  }

  function requestEdit() {
    if (editing) { exitEdit(); return; }
    var pw = prompt('请输入编辑密码：');
    if (pw === null) return;
    sha256(pw).then(function (h) {
      if (h === EDIT_HASH) enterEdit();
      else toast('密码错误');
    }).catch(function () { toast('当前环境不支持密码校验（需 https）'); });
  }

  var editBtn = document.getElementById('editLayoutBtn');
  if (editBtn) editBtn.addEventListener('click', function () { closeDrawer(); requestEdit(); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault(); requestEdit();
    }
  });

  /* ---------- 启动 ---------- */
  renderAll();
  checkStatus();
  startPolling();
  bootCloud();
})();
