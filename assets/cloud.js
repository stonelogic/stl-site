/* ===========================================================
   云服务接入（Auth + Database + Storage）
   下面 PUBLIC_CONFIG 的三个值来自 workbuddy_cloud_service 返回的
   publicConfig，勿自行改写；应用发布域名即 endpoint。
   =========================================================== */
var MCCloud = (function () {
  'use strict';

  var PUBLIC_CONFIG = {
    endpoint: 'https://stone-logic-mc.app.workbuddy.host',
    oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
    publishableKey: 'wbpk_DfcTJrNaxY9JfDnABofoNM_vAEndsEEvpRhg2kjcU0aXfGQ21MHLbQM'
  };

  var TABLE = 'site_config';
  var cloud = null;

  function client() {
    if (cloud) return cloud;
    if (!window.WorkBuddyCloud || !window.WorkBuddyCloud.createWorkBuddyCloud) return null;
    try {
      cloud = window.WorkBuddyCloud.createWorkBuddyCloud({
        endpoint: PUBLIC_CONFIG.endpoint,
        oauthRelayBaseUrl: PUBLIC_CONFIG.oauthRelayBaseUrl,
        publishableKey: PUBLIC_CONFIG.publishableKey
      });
    } catch (e) { cloud = null; }
    return cloud;
  }

  function available() { return !!client(); }

  function errText(e, fallback) {
    if (!e) return fallback || '未知错误';
    return e.message || e.error_description || (typeof e === 'string' ? e : (fallback || '未知错误'));
  }

  /* ---------------- 登录 ---------------- */
  async function getSession() {
    var c = client();
    if (!c) return null;
    try {
      var r = await c.auth.getSession();
      return (r && r.data) || null;
    } catch (e) { return null; }
  }

  async function sendEmailCode(email) {
    var c = client();
    if (!c) throw new Error('云服务未初始化');
    var sent = await c.auth.sendOtp({ email: email });
    if (sent.error) throw new Error(errText(sent.error, '验证码发送失败'));
    return {
      email: email,
      verificationId: sent.data.verificationId,
      isExistingUser: !!sent.data.isExistingUser
    };
  }

  async function verifyEmailCode(pending, code, password) {
    var c = client();
    if (!c) throw new Error('云服务未初始化');
    var done = await c.auth.verifyOtp({
      email: pending.email,
      verificationId: pending.verificationId,
      isExistingUser: pending.isExistingUser,
      token: code,
      password: pending.isExistingUser ? undefined : password
    });
    if (done.error) throw new Error(errText(done.error, '验证码校验失败'));
    return done.data;
  }

  async function signOut() {
    var c = client();
    if (!c) return;
    try { await c.auth.signOut(); } catch (e) {}
  }

  /* ---------------- 配置读写 ---------------- */
  async function loadConfig() {
    var c = client();
    if (!c) throw new Error('云服务未初始化');
    var r = await c.database
      .from(TABLE)
      .select('id, owner_id, payload, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);
    if (r.error) throw new Error(errText(r.error, '云端配置读取失败'));
    var row = (r.data && r.data[0]) || null;
    return row ? { id: row.id, ownerId: row.owner_id, payload: row.payload, updatedAt: row.updated_at } : null;
  }

  async function saveConfig(payload, id) {
    var c = client();
    if (!c) throw new Error('云服务未初始化');
    var r;
    if (id) {
      r = await c.database.from(TABLE).update({ payload: payload, updated_at: new Date().toISOString() }).eq('id', id).select();
      if (r.error) throw new Error(errText(r.error, '云端保存失败'));
      var affected = Array.isArray(r.data) ? r.data : [];
      if (affected.length === 0) throw new Error('这条云端配置不属于当前账号，无法覆盖；将为你新建一份');
      return affected[0].id;
    }
    r = await c.database.from(TABLE).insert({ payload: payload }).select();
    if (r.error) throw new Error(errText(r.error, '云端保存失败'));
    return r.data && r.data[0] ? r.data[0].id : null;
  }

  /* ---------------- 文件存储 ---------------- */
  async function uploadImage(file, prefix) {
    var c = client();
    if (!c) throw new Error('云服务未初始化');
    var s = await getSession();
    if (!s || !s.user) throw new Error('请先登录再上传');
    var ext = (file.name && file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    var name = (prefix || 'img') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    var path = c.storage.sharedPath(s.user.id, 'site/' + name);
    var up = await c.storage.upload(path, file, { contentType: file.type || 'image/png', upsert: false });
    if (up.error) throw new Error(errText(up.error, '上传失败'));
    return path;
  }

  async function signedUrl(path, ttl) {
    var c = client();
    if (!c || !path) return null;
    try {
      var r = await c.storage.createSignedUrl(path, ttl || 3600);
      if (r.error) return null;
      var d = r.data || {};
      return d.signedUrl || d.url || d.signedURL || null;
    } catch (e) { return null; }
  }

  /* 已登录时把对象路径换成可访问的签名链接 */
  async function resolveImages(cfg) {
    if (!available()) return cfg;
    var s = await getSession();
    if (!s) return cfg;
    var out = JSON.parse(JSON.stringify(cfg));
    var jobs = [];
    if (out.iconPath) jobs.push(['icon', out.iconPath]);
    (out.screenshots || []).forEach(function (shot, i) {
      if (shot.path) jobs.push(['shot' + i, shot.path]);
    });
    var results = await Promise.all(jobs.map(function (j) { return signedUrl(j[1]); }));
    jobs.forEach(function (j, i) {
      var url = results[i];
      if (!url) return;
      if (j[0] === 'icon') out.icon = url;
      else out.screenshots[+j[0].replace('shot', '')].url = url;
    });
    return out;
  }

  return {
    available: available,
    getSession: getSession,
    sendEmailCode: sendEmailCode,
    verifyEmailCode: verifyEmailCode,
    signOut: signOut,
    loadConfig: loadConfig,
    saveConfig: saveConfig,
    uploadImage: uploadImage,
    signedUrl: signedUrl,
    resolveImages: resolveImages,
    errText: errText
  };
})();
