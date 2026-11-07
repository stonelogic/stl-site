/* 站点自定义编辑器
 * 快捷键：Ctrl+Shift+E → 输入密码 → 编辑所有元素 → 保存到 GitHub 仓库
 * 密码：mcstl-sjwj（SHA-256 校验）
 * 数据：assets/config.json（app.js 启动时加载，localStorage 本机预览优先）
 */
(function () {
  'use strict';

  var HASH = '8f4771942294a2d7bea850b27b57f7dfe7a66b6dfb91ffb100ba180a0c48af96';
  var REPO = 'stonelogic/stl-site';
  var PATH = 'assets/config.json';
  var BRANCH = 'master';
  var LS_CFG = 'stl_config';
  var LS_PAT = 'stl_gh_pat';

  /* ---------- 样式 ---------- */
  var css = ''
    + '.qe-mask{position:fixed;inset:0;z-index:99990;background:rgba(10,14,22,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px}'
    + '.qe-modal{width:min(920px,100%);max-height:92vh;background:var(--card,#fff);color:var(--foreground,#111);border:1px solid var(--border,#e5e7eb);'
    + 'border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.4);display:flex;flex-direction:column;overflow:hidden}'
    + '.qe-head{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border,#e5e7eb);font-weight:800;font-size:16px}'
    + '.qe-head .qe-x{border:none;background:none;font-size:20px;cursor:pointer;color:var(--muted-foreground,#777);line-height:1}'
    + '.qe-body{flex:1;overflow-y:auto;padding:18px 20px}'
    + '.qe-body h3{margin:22px 0 10px;font-size:14px;font-weight:800;color:var(--primary,#0f9d6e)}'
    + '.qe-body h3:first-child{margin-top:0}'
    + '.qe-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
    + '.qe-grid label{display:grid;gap:5px;font-size:12px;color:var(--muted-foreground,#666)}'
    + '.qe-grid label.full{grid-column:1/-1}'
    + '.qe-body input,.qe-body textarea{width:100%;padding:9px 11px;border:1px solid var(--border,#ddd);border-radius:9px;background:var(--muted,#f8f8f8);'
    + 'color:var(--foreground,#111);font-size:13px;font-family:inherit;box-sizing:border-box;outline:none}'
    + '.qe-body input:focus,.qe-body textarea:focus{border-color:var(--ring,#0f9d6e);box-shadow:0 0 0 3px rgba(15,157,110,.15)}'
    + '.qe-body textarea{resize:vertical;min-height:60px}'
    + '.qe-item{display:grid;gap:8px;padding:12px;border:1px solid var(--border,#eee);border-radius:12px;margin-bottom:10px;background:var(--muted,#fafafa)}'
    + '.qe-item .qe-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.qe-item .qe-row .full{grid-column:1/-1}'
    + '.qe-item .qe-del{margin-left:auto;border:1px solid #f2b8b8;background:#fdeaea;color:#c0392b;border-radius:7px;cursor:pointer;font-size:12px;padding:4px 10px}'
    + '.qe-add{border:1px dashed var(--border,#ccc);background:none;color:var(--muted-foreground,#666);border-radius:9px;cursor:pointer;'
    + 'padding:9px 14px;font-size:13px;width:100%;margin-top:2px}'
    + '.qe-add:hover{border-color:var(--primary,#0f9d6e);color:var(--primary,#0f9d6e)}'
    + '.qe-foot{display:flex;gap:10px;flex-wrap:wrap;padding:14px 20px;border-top:1px solid var(--border,#e5e7eb)}'
    + '.qe-foot button{padding:10px 16px;border-radius:9px;border:1px solid var(--border,#ddd);background:var(--muted,#f4f4f4);color:var(--foreground,#111);'
    + 'cursor:pointer;font-size:13px;font-weight:600;font-family:inherit}'
    + '.qe-foot button.pri{background:var(--primary,#0f9d6e);border-color:var(--primary,#0f9d6e);color:#fff}'
    + '.qe-tip{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:99999;background:var(--primary,#0f9d6e);color:#fff;'
    + 'padding:9px 18px;border-radius:999px;font-size:13px;opacity:0;transition:opacity .25s;pointer-events:none;max-width:90vw;text-align:center;font-weight:600}'
    + '.qe-tip.show{opacity:1}'
    + '.qe-tip.err{background:#c0392b}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 提示 ---------- */
  var tip = document.createElement('div');
  tip.className = 'qe-tip';
  document.body.appendChild(tip);
  var tipTimer = null;
  function toast(msg, err) {
    tip.textContent = msg; tip.className = 'qe-tip' + (err ? ' err' : '');
    tip.classList.add('show');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(function () { tip.classList.remove('show'); }, 2600);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 列表字段定义 ---------- */
  var LISTS = {
    features: { label: '玩法特色', fields: [
      { k: 'icon', ph: '图标 emoji' },
      { k: 'title', ph: '标题' },
      { k: 'desc', ph: '描述', full: true, area: true }] },
    worlds: { label: '世界一览', fields: [
      { k: 'name', ph: '世界名（如 world）' },
      { k: 'tag', ph: '标签（如 主世界）' },
      { k: 'desc', ph: '描述', full: true, area: true }] },
    rules: { label: '服务器规则', string: true },
    guide: { label: '新手指南', fields: [
      { k: 't', ph: '标题' },
      { k: 'c', ph: '内容', full: true, area: true }] }
  };

  var editing = false;
  var draft = null;
  var mask = null;

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function currentCfg() {
    var s = window.__stlSite || {};
    var ip = s.javaIp || '';
    var sp = ip.split(':');
    return {
      name: s.name || '',
      tagline: s.tagline || '',
      slogan: s.slogan || '',
      javaHost: sp[0] || '',
      javaPort: sp[1] || '25565',
      groupUrl: s.groupUrl || '',
      features: deepClone(s.features || []),
      worlds: deepClone(s.worlds || []),
      rules: deepClone(s.rules || []),
      guide: deepClone(s.guide || [])
    };
  }

  /* ---------- 渲染表单 ---------- */
  function inputHtml(tag, k, val, ph, full) {
    var cls = full ? 'full' : '';
    if (tag === 'textarea') {
      return '<textarea class="' + cls + '" data-k="' + k + '" placeholder="' + ph + '">' + esc(val) + '</textarea>';
    }
    return '<input class="' + cls + '" data-k="' + k + '" placeholder="' + ph + '" value="' + esc(val) + '">';
  }

  function renderForm() {
    var c = draft;
    var h = '';
    h += '<h3>基础信息</h3><div class="qe-grid">';
    h += '<label>服务器名称' + inputHtml('input', 'name', c.name, '服务器名称') + '</label>';
    h += '<label>标语' + inputHtml('input', 'tagline', c.tagline, '一句话标语') + '</label>';
    h += '<label class="full">首页 slogan' + inputHtml('input', 'slogan', c.slogan, '首页大字标语') + '</label>';
    h += '<label>服务器地址 host' + inputHtml('input', 'javaHost', c.javaHost, 'frp-top.com') + '</label>';
    h += '<label>服务器端口' + inputHtml('input', 'javaPort', c.javaPort, '44558') + '</label>';
    h += '<label class="full">QQ 群链接' + inputHtml('input', 'groupUrl', c.groupUrl, 'https://qm.qq.com/...') + '</label>';
    h += '</div>';

    Object.keys(LISTS).forEach(function (key) {
      var def = LISTS[key];
      h += '<h3>' + def.label + '</h3>';
      if (def.string) {
        (c.rules || []).forEach(function (r, i) {
          h += '<div class="qe-item" data-list="rules">' +
            '<textarea data-k="_" data-idx="' + i + '" placeholder="规则内容">' + esc(r) + '</textarea>' +
            '<button class="qe-del" data-del="rules:' + i + '" type="button">删除</button></div>';
        });
      } else {
        (c[key] || []).forEach(function (it, i) {
          h += '<div class="qe-item" data-list="' + key + '"><div class="qe-row">' +
            def.fields.map(function (f) {
              return inputHtml(f.area ? 'textarea' : 'input', f.k, it[f.k], f.ph, f.full);
            }).join('') +
            '</div><button class="qe-del" data-del="' + key + ':' + i + '" type="button">删除</button></div>';
        });
      }
      h += '<button class="qe-add" data-add="' + key + '" type="button">+ 添加' + def.label + '</button>';
    });
    document.getElementById('qeBody').innerHTML = h;
  }

  /* ---------- 收集表单值 ---------- */
  function collect() {
    var b = document.getElementById('qeBody');
    ['name', 'tagline', 'slogan', 'javaHost', 'javaPort', 'groupUrl'].forEach(function (k) {
      var el = b.querySelector('[data-k="' + k + '"]');
      if (el) draft[k] = el.value.trim();
    });
    var rs = [];
    b.querySelectorAll('[data-list="rules"] [data-k="_"]').forEach(function (el) { rs.push(el.value); });
    draft.rules = rs;
    ['features', 'worlds', 'guide'].forEach(function (key) {
      var def = LISTS[key].fields;
      var out = [];
      b.querySelectorAll('[data-list="' + key + '"]').forEach(function (item) {
        var obj = {};
        def.forEach(function (f) {
          var el = item.querySelector('[data-k="' + f.k + '"]');
          obj[f.k] = el ? el.value.trim() : '';
        });
        out.push(obj);
      });
      draft[key] = out;
    });
  }

  function delRow(k) {
    var parts = k.split(':');
    var key = parts[0], idx = Number(parts[1]);
    if (key === 'rules') draft.rules.splice(idx, 1);
    else draft[key].splice(idx, 1);
    renderForm();
  }
  function addRow(key) {
    if (key === 'rules') draft.rules.push('');
    else if (key === 'features') draft.features.push({ icon: '✨', title: '', desc: '' });
    else if (key === 'worlds') draft.worlds.push({ name: '', tag: '', desc: '' });
    else if (key === 'guide') draft.guide.push({ t: '', c: '' });
    renderForm();
  }

  /* ---------- 保存 ---------- */
  function b64(str) { return btoa(unescape(encodeURIComponent(str))); }
  function getPat(force) {
    var p = localStorage.getItem(LS_PAT);
    if (p && !force) return p;
    p = window.prompt('请输入 GitHub PAT（需 stl-site 仓库的 Contents 读写权限，仅存本机浏览器）', p || '');
    if (!p) return null;
    localStorage.setItem(LS_PAT, p.trim());
    return p.trim();
  }
  function saveLocal() {
    collect();
    try { localStorage.setItem(LS_CFG, JSON.stringify(draft)); } catch (e) {}
    if (window.__stlApplyConfig) window.__stlApplyConfig(draft);
    if (window.__stlRender) window.__stlRender();
    toast('已保存到本机，立即预览');
  }
  function resetLocal() {
    localStorage.removeItem(LS_CFG);
    toast('本地配置已清除，刷新后恢复仓库配置');
  }
  async function saveToRepo() {
    collect();
    var pat = getPat(false);
    if (!pat) { toast('已取消', true); return; }
    var api = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
    var headers = { 'Authorization': 'Bearer ' + pat, 'Accept': 'application/vnd.github+json' };
    try {
      toast('读取仓库配置…');
      var cur = await fetch(api, { headers: headers, cache: 'no-store' });
      var sha = null;
      if (cur.ok) { var j = await cur.json(); sha = j.sha; }
      else if (cur.status !== 404) throw new Error('读取失败 HTTP ' + cur.status);
      var body2 = { message: '更新站点配置', content: b64(JSON.stringify(draft, null, 2)), branch: BRANCH };
      if (sha) body2.sha = sha;
      toast('提交中…');
      var r = await fetch(api, {
        method: 'PUT',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(body2)
      });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 120));
      toast('已保存到仓库，线上约 1 分钟后生效');
    } catch (e) {
      toast('保存失败：' + e.message, true);
    }
  }

  /* ---------- 编辑模式 ---------- */
  async function sha256(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  async function enter() {
    var pw = window.prompt('请输入自定义编辑密码：');
    if (pw === null) return;
    var ok = false;
    try { ok = (await sha256(pw)) === HASH; } catch (e) {}
    if (!ok) { toast('密码错误', true); return; }
    if (!mask) build();
    draft = currentCfg();
    renderForm();
    editing = true;
    mask.style.display = 'flex';
    toast('编辑模式：改完点「保存到仓库」');
  }
  function exit() {
    editing = false;
    draft = null;
    if (mask) mask.style.display = 'none';
    toast('已退出编辑');
  }

  function build() {
    mask = document.createElement('div');
    mask.className = 'qe-mask';
    mask.style.display = 'none';
    mask.innerHTML = '<div class="qe-modal">' +
      '<div class="qe-head"><span>站点自定义编辑器</span><button class="qe-x" type="button">✕</button></div>' +
      '<div class="qe-body" id="qeBody"></div>' +
      '<div class="qe-foot">' +
      '<button class="pri" data-act="repo" type="button">保存到仓库</button>' +
      '<button data-act="local" type="button">仅本地预览</button>' +
      '<button data-act="pat" type="button">设置 GitHub PAT</button>' +
      '<button data-act="reset" type="button">恢复默认</button>' +
      '<button data-act="exit" type="button">退出</button>' +
      '</div></div>';
    document.body.appendChild(mask);
    var body = mask.querySelector('#qeBody');

    mask.querySelector('.qe-x').addEventListener('click', exit);
    mask.addEventListener('click', function (e) { if (e.target === mask) exit(); });
    mask.querySelector('.qe-foot').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'repo') saveToRepo();
      else if (act === 'local') saveLocal();
      else if (act === 'pat') getPat(true);
      else if (act === 'reset') resetLocal();
      else if (act === 'exit') exit();
    });
    body.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (del) { delRow(del.getAttribute('data-del')); return; }
      var add = e.target.closest('[data-add]');
      if (add) addRow(add.getAttribute('data-add'));
    });
  }

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      editing ? exit() : enter();
    }
  }, true);
})();
