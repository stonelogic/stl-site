/* ============================================================
 * Magnetic / jelly hero title
 * 让 .hero-title 里的每个字母朝鼠标方向"边缘拉伸吸附"，
 * 鼠标离开吸附范围后像果冻一样弹性回到原位。
 * 只做形变（skew + scale），不移动字母本身位置。
 * 无依赖，接入简单：页面加载后调用一次即可（见文件底部）。
 * ============================================================ */
(function () {
  'use strict';

  // ---- 可调参数 ----
  var RADIUS   = 190;   // 吸附半径（px，鼠标离字母中心多远开始生效）
  var STIFF    = 0.14;  // 弹簧刚度：越大回弹越快
  var DAMP     = 0.74;  // 阻尼：越小越快停下，越大越"果冻"（0.6~0.85）
  var MAX_SKEW = 15;    // 最大倾斜角（deg），控制拉伸幅度
  var MAX_SCALE= 0.14;  // 最大缩放比例，让边缘朝鼠标"鼓出"
  var IDLE_EPS = 0.0006;// 静止判定阈值

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // 尊重系统"减少动画"设置

  var titles = [];   // 每个 {root, letters:[{el, sx,sy,sc, vx,vy,vc}]}
  var pointer = { x: -9999, y: -9999, active: false };
  var rafId = null;

  // 把一行文本拆成单字母 span
  function splitLine(line) {
    var text = line.textContent;
    // 保留原有空格，用 \u00a0 防止折叠
    var chars = text.split('');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      var s = document.createElement('span');
      s.className = 'm-letter';
      s.textContent = c === ' ' ? '\u00a0' : c;
      frag.appendChild(s);
    }
    line.textContent = '';
    line.appendChild(frag);
  }

  function setupTitle(title) {
    if (title.getAttribute('data-magnetic') === '1') return;
    title.setAttribute('data-magnetic', '1');
    var lines = title.querySelectorAll(':scope > span');
    if (!lines.length) return;
    for (var i = 0; i < lines.length; i++) splitLine(lines[i]);

    var letters = [];
    var els = title.querySelectorAll('.m-letter');
    for (var j = 0; j < els.length; j++) {
      letters.push({ el: els[j], sx: 0, sy: 0, sc: 1, vx: 0, vy: 0, vc: 0 });
    }
    titles.push({ root: title, letters: letters });
  }

  // 标题是动态渲染的（SPA 路由），用轮询等待它出现后初始化
  function tryInit() {
    var nodes = document.querySelectorAll('.hero-title');
    for (var i = 0; i < nodes.length; i++) setupTitle(nodes[i]);
  }

  function onMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }
  function onLeave() {
    pointer.active = false;
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  // 弹簧积分：朝目标值逼近，带阻尼
  function spring(cur, vel, target) {
    vel += (target - cur) * STIFF;
    vel *= DAMP;
    cur += vel;
    return [cur, vel];
  }

  function tick() {
    var moving = false;

    for (var t = 0; t < titles.length; t++) {
      var item = titles[t];
      // 标题不在视口内就跳过计算
      var rootRect = item.root.getBoundingClientRect();
      var inView = rootRect.bottom > -200 && rootRect.top < window.innerHeight + 200;

      for (var i = 0; i < item.letters.length; i++) {
        var L = item.letters[i];
        var tx = 0, ty = 0, ts = 1;

        if (pointer.active && inView) {
          var r = L.el.getBoundingClientRect();
          var cx = r.left + r.width / 2;
          var cy = r.top + r.height / 2;
          var dx = pointer.x - cx;
          var dy = pointer.y - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < RADIUS && dist > 0.01) {
            // 越靠近越强，平滑衰减
            var f = 1 - dist / RADIUS;
            f = f * f * (3 - 2 * f); // smoothstep
            // 朝鼠标方向倾斜：水平距离 -> skewX，垂直距离 -> skewY
            tx = (dx / dist) * f * MAX_SKEW;
            ty = -(dy / dist) * f * MAX_SKEW * 0.6;
            ts = 1 + f * MAX_SCALE;
          }
        }

        var a = spring(L.sx, L.vx, tx); L.sx = a[0]; L.vx = a[1];
        var b = spring(L.sy, L.vy, ty); L.sy = b[0]; L.vy = b[1];
        var c = spring(L.sc, L.vc, ts); L.sc = c[0]; L.vc = c[1];

        L.el.style.transform =
          'skew(' + L.sx.toFixed(3) + 'deg,' + L.sy.toFixed(3) + 'deg) ' +
          'scale(' + L.sc.toFixed(4) + ')';

        if (Math.abs(L.vx) + Math.abs(L.vy) + Math.abs(L.vc) > IDLE_EPS ||
            Math.abs(tx - L.sx) + Math.abs(ty - L.sy) + Math.abs(ts - L.sc) > IDLE_EPS) {
          moving = true;
        }
      }
    }

    if (moving || pointer.active) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null; // 完全静止后停止循环，省性能
    }
  }

  // 绑定（用捕获阶段，覆盖动态插入的节点）
  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', onLeave);
  window.addEventListener('blur', onLeave);

  // 初始化：立即试一次 + 监听 DOM 变化（等 SPA 渲染出 hero）
  tryInit();
  var mo = new MutationObserver(function () { tryInit(); });
  mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  // 兜底轮询，防止 MutationObserver 漏掉
  var tries = 0;
  var poll = setInterval(function () {
    tryInit();
    if (++tries > 40) clearInterval(poll); // 最多轮询 20 秒
  }, 500);
})();
