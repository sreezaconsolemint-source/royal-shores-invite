/* Royal Shores — video-style invitation player. A deterministic timeline (0–60 s) drives every layer,
   so the editor can seek to any scene and the playback matches the reference reel frame-for-frame. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var Q = new URLSearchParams(location.search), PV = Q.get('preview') === '1';
  var DUR = 60;

  /* ---------- data ---------- */
  function loadData() {
    var m = /[#&]data=([^&]+)/.exec(location.hash);
    var base = JSON.parse(JSON.stringify(window.JFY_DATA || {}));
    if (!m || !window.JFYCodec) return Promise.resolve(base);
    return JFYCodec.decode(m[1]).then(function (d) {
      d = d || {}; if (!d.music_url) d.music_url = base.music_url; if (!d.music_credit && d.music_url === base.music_url) d.music_credit = base.music_credit;
      return d;
    }).catch(function (e) { console.warn('Invitation data could not be read, showing the demo.', e); return base; });
  }
  function fmtDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ''); if (!m) return '';
    var mon = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'][+m[2] - 1];
    return (+m[3]) + '<s>|</s><i>' + mon + '</i><s>|</s>' + m[1];
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lines(el, txt) {
    el.innerHTML = ''; var any = false;
    String(txt || '').split(/\r?\n/).forEach(function (l, i, arr) {
      l = l.trim(); var n = document.createElement('div');
      if (!l) { if (i > 0 && i < arr.length - 1) { n.className = 'gap'; el.appendChild(n); } return; }
      n.className = 'ln'; n.textContent = l; el.appendChild(n); any = true;
    });
    el.classList.toggle('hide', !any);
  }
  function render(D) {
    $$('[data-t]').forEach(function (el) { var v = (D[el.dataset.t] || '').trim(); el.textContent = v; el.classList.toggle('hide', !v); });
    $$('[data-req]').forEach(function (el) { el.classList.toggle('hide', !(D[el.dataset.req] || '').trim()); });
    $$('[data-lines]').forEach(function (el) { lines(el, D[el.dataset.lines]); });
    var ev = D.events || [];
    $$('[data-ev]').forEach(function (bx) {
      var e = ev[+bx.dataset.ev] || {};
      var t = $('.t-title', bx), d = $('.t-date', bx), n = $('.t-ev', bx);
      t.textContent = e.title || ''; t.classList.toggle('hide', !e.title);
      d.innerHTML = fmtDate(e.date); d.classList.toggle('hide', !e.date);
      n.textContent = e.name || ''; n.classList.toggle('hide', !e.name);
      lines($('.t-det', bx), e.details);
    });
    var wa = (D.rsvp_whatsapp || '').replace(/\D/g, '');
    var rs = $('#rsvp'); rs.classList.toggle('hide', !wa);
    if (wa) rs.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hi! Thank you for the invitation to ' + (D.groom_name || '') + (D.bride_name ? ' & ' + D.bride_name : '') + "'s wedding. I'd love to attend 💐");
    var mapUrl = D.venue_map_url || (D.venue ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(D.venue) : '');
    var mp = $('#map'); mp.classList.toggle('hide', !mapUrl); if (mapUrl) mp.href = mapUrl;
    $('#credit').textContent = D.music_url && D.music_enabled !== false ? (D.music_credit ? 'Music: ' + D.music_credit : '') : '';
    if (D.groom_name || D.bride_name) document.title = (D.groom_name || '') + (D.bride_name ? ' & ' + D.bride_name : '') + ' — Wedding Invitation';
  }

  /* ---------- gate (gold wrought-iron, vector = razor sharp at any size) ---------- */
  function gateSVG(cls, flip) {
    var g = 'g' + cls;
    return '<svg class="' + cls + '" viewBox="0 0 192 872" aria-hidden="true"><defs><linearGradient id="' + g + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="192" y2="420" spreadMethod="reflect"><stop offset="0" stop-color="#fbedb5"/><stop offset=".3" stop-color="#c8963a"/><stop offset=".55" stop-color="#f6dc86"/><stop offset=".8" stop-color="#b07e2a"/><stop offset="1" stop-color="#e9c66e"/></linearGradient>' +
      '<clipPath id="c' + g + '"><path d="' + (flip ? 'M0 872V0A192 192 0 0 1 192 192V872Z' : 'M0 872V192A192 192 0 0 1 192 0V872Z') + '"/></clipPath></defs>' +
      '<g clip-path="url(#c' + g + ')"' + (flip ? ' transform="translate(192 0) scale(-1 1)"' : '') + ' fill="none" stroke="url(#' + g + ')" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 2px rgba(90,60,10,.45))">' +
      '<rect x="0" y="0" width="192" height="872" fill="rgba(255,244,214,.16)" stroke="none"/>' +
      '<path d="M5 872V192A187 187 0 0 1 187 5" stroke-width="15"/><path d="M187 0V872" stroke-width="12"/>' +
      '<path d="M50 140V872M96 92V872M142 58V872" stroke-width="6.5"/><path d="M50 150c-24 30-24 60 0 80M142 70c24 30 24 60 0 80M96 360c-30 20-30 50 0 70" stroke-width="5"/>' +
      '<path d="M5 340H187M5 612H187M5 830H187" stroke-width="11"/>' +
      '<path d="M96 455c-40-46-84-8-58 30 16 22 58 34 58 64 0-30 42-42 58-64 26-38-18-76-58-30Z" stroke-width="7"/>' +
      '<path d="M96 500c-14-14-30-2-20 10 6 8 20 12 20 22 0-10 14-14 20-22 10-12-6-24-20-10Z" fill="url(#' + g + ')" stroke="none"/>' +
      '<path d="M96 262c-30-40-76-12-52 22 12 16 36 14 36-4M96 262c30-40 76-12 52 22-12 16-36 14-36-4" stroke-width="6"/>' +
      '<path d="M18 690c30-40 72-40 78 0 6-40 48-40 78 0M18 752c30 40 72 40 78 0 6 40 48 40 78 0" stroke-width="6"/>' +
      '<circle cx="96" cy="721" r="13" fill="url(#' + g + ')" stroke="none"/><circle cx="172" cy="565" r="11" fill="url(#' + g + ')" stroke="none"/><circle cx="172" cy="565" r="18" stroke-width="4"/>' +
      '</g></svg>';
  }
  $('#gate').innerHTML = gateSVG('gl', false) + gateSVG('gr', true);

  /* ---------- tiny keyframe engine ---------- */
  var E = {
    io: function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    out: function (p) { return 1 - Math.pow(1 - p, 3); },
    in: function (p) { return p * p * p; },
    lin: function (p) { return p; }
  };
  var tracks = [];
  /* k: [[t,{o,x,y,s,r,ry,b}, ease?], ...] */
  function K(el, k) { if (typeof el === 'string') el = $(el); if (el) tracks.push({ el: el, k: k }); }
  var DEF = { o: 1, x: 0, y: 0, s: 1, r: 0, ry: 0, b: 0 };
  function val(k, t) {
    if (t <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) {
      if (t <= k[i][0]) {
        var a = k[i - 1], b = k[i], p = (t - a[0]) / (b[0] - a[0] || 1), e = (E[b[2] || 'io'])(p), r = {};
        for (var key in DEF) { var va = key in a[1] ? a[1][key] : DEF[key], vb = key in b[1] ? b[1][key] : va; r[key] = va + (vb - va) * e; }
        return r;
      }
    }
    return k[k.length - 1][1];
  }
  function apply(tr, t) {
    var v = val(tr.k, t), o = 'o' in v ? v.o : 1, st = tr.el.style;
    st.opacity = o.toFixed(3); st.visibility = o <= 0.001 ? 'hidden' : 'visible';
    st.transform = 'translate3d(' + (v.x || 0).toFixed(2) + 'px,' + (v.y || 0).toFixed(2) + 'px,0)' + (v.r ? ' rotate(' + v.r.toFixed(2) + 'deg)' : '') + (v.ry ? ' rotateY(' + v.ry.toFixed(2) + 'deg)' : '') + ' scale(' + (v.s == null ? 1 : v.s).toFixed(4) + ')';
    st.filter = v.b > 0.05 ? 'blur(' + v.b.toFixed(2) + 'px)' : '';
  }
  /* staggered line reveal like the reference: fade + rise + de-blur, one line after another */
  function textIn(box, t0, tOut, step) {
    var items = $$('.t-title, .t-date, .t-ev, .t-name, .t-par, .t-with, .t-at, .t-venue, .t-tag, .ln', box).filter(function (n) { return !n.classList.contains('hide') && !n.closest('.hide'); });
    items.forEach(function (n, i) {
      var a = t0 + i * (step || .42), k = [[a, { o: 0, y: 26, b: 8 }], [a + .9, { o: 1, y: 0, b: 0 }, 'out']];
      if (tOut) k.push([tOut, { o: 1, y: 0 }], [tOut + .45, { o: 0, y: -10 }, 'in']);
      K(n, k);
    });
  }

  function build() {
    tracks = [];
    /* S0 arch: gate swings open, camera flies through the arch */
    K('#s0', [[0, { o: 1 }], [2.25, { o: 1 }], [2.45, { o: 0 }, 'lin']]);
    K('#zoom', [[0, { s: 1 }], [.15, { s: 1.0 }], [1.45, { s: 1.12 }, 'io'], [2.4, { s: 6.2 }, 'in']]);
    K('#gate .gl', [[0, { ry: 0 }], [.55, { ry: 0 }], [1.65, { ry: -112 }, 'io']]);
    K('#gate .gr', [[0, { ry: 0 }], [.55, { ry: 0 }], [1.65, { ry: 112 }, 'io']]);
    /* S1 beach + couple */
    K('#s1', [[0, { o: 1 }], [9.25, { o: 1 }], [9.9, { o: 0 }, 'lin']]);
    K('#s1 .bg', [[0, { s: 1.3, x: -162, y: -330 }], [1.45, { s: 1.24, x: -130, y: -285 }], [2.45, { s: 1.0, x: 0, y: 0 }, 'out'], [9.9, { s: 1.06, x: -32, y: -58 }, 'lin']]);
    textIn($('#s1 .tx'), 3.0, 9.0, .22);
    /* S2 night beach, welcome dinner */
    K('#s2', [[9.2, { o: 0 }], [9.9, { o: 1 }, 'lin'], [19.6, { o: 1 }], [19.65, { o: 0 }]]);
    K('#s2 .bg', [[9.2, { s: 1.2, x: -108, y: -384 }], [11.2, { s: 1.2, x: -108, y: -150 }, 'out'], [16.9, { s: 1.22, x: -118, y: -120 }, 'lin'], [18.5, { s: 2.0, x: 0, y: 0 }, 'io']]);
    textIn($('#s2 .tx'), 11.0, 17.3, .42);
    K('#cork', [[17.25, { o: 0, x: 120, y: 0, r: 0 }], [17.3, { o: 1, x: 120, y: 0, r: 0 }], [18.6, { o: 1, x: -260, y: -2380, r: 560 }, 'out'], [18.65, { o: 0, x: -260, y: -2380, r: 560 }]]);
    /* S3 garden rises from below, carnival */
    K('#s3', [[18.15, { o: 0, y: 1920 }], [18.2, { o: 1, y: 1920 }], [19.6, { o: 1, y: 0 }, 'out'], [26.35, { o: 1, y: 0 }], [26.45, { o: 0 }]]);
    K('#s3 .bg', [[18.2, { s: 1.0 }], [26.6, { s: 1.06, x: -32, y: -40 }, 'lin']]);
    textIn($('#s3 .tx'), 20.3, 25.9, .42);
    /* hand fan sweeps across and reveals the ballroom */
    K('#fan', [[24.55, { o: 0, x: 650, y: 1750, r: 32, s: .85 }], [24.6, { o: 1, x: 650, y: 1750, r: 32, s: .85 }], [25.6, { o: 1, x: 120, y: 900, r: 8, s: 1.1 }, 'out'], [26.3, { o: 1, x: -150, y: 340, r: 0, s: 1.95 }, 'io'], [27.3, { o: 1, x: -1800, y: 160, r: -26, s: 1.95 }, 'in'], [27.35, { o: 0, x: -1800, y: 160, r: -26, s: 1.95 }]]);
    /* S4 ballroom, sangeet */
    K('#s4', [[26.25, { o: 0 }], [26.35, { o: 1 }], [34.7, { o: 1 }], [34.75, { o: 0 }]]);
    K('#s4 .bg', [[26.55, { s: 1.0 }], [34.7, { s: 1.15, x: -81, y: -190 }, 'lin']]);
    textIn($('#s4 .tx'), 28.3, 33.6, .42);
    /* S5 bazaar: carved doors swing open, mayra; text zooms toward camera */
    K('#s5', [[34.0, { o: 0 }], [34.7, { o: 1 }, 'lin'], [43.4, { o: 1 }], [43.45, { o: 0 }]]);
    K('#s5 .bg', [[34.0, { s: 1.15, x: -81, y: -144 }], [36.6, { s: 1.0, x: 0, y: 0 }, 'out'], [40.3, { s: 1.04, x: -22, y: -36 }, 'lin'], [42.9, { s: 1.6, x: -324, y: -540 }, 'in']]);
    K('#doors .l', [[34.8, { ry: 0 }], [36.3, { ry: -108 }, 'io'], [36.35, { o: 0, ry: -108 }]]);
    K('#doors .r', [[34.8, { ry: 0 }], [36.3, { ry: 108 }, 'io'], [36.35, { o: 0, ry: 108 }]]);
    textIn($('#s5 .tx'), 36.6, 0, .42);
    K('#s5 .tx', [[40.3, { s: 1, o: 1 }], [42.6, { s: 2.7, o: 0 }, 'in']]);
    /* S6 wedding night */
    K('#s6', [[42.3, { o: 0 }], [43.4, { o: 1 }, 'lin'], [51.2, { o: 1 }], [51.25, { o: 0 }]]);
    K('#s6 .bg', [[42.3, { s: 1.08, x: -43, y: -77 }], [51.2, { s: 1.0, x: 0, y: 0 }, 'lin']]);
    textIn($('#s6 .tx'), 44.4, 50.0, .3);
    /* S7 regards */
    K('#s7', [[50.2, { o: 0 }], [51.2, { o: 1 }, 'lin']]);
    K('#s7 .bg', [[50.2, { s: 1.0 }], [60, { s: 1.06, x: -32, y: -58 }, 'lin']]);
    textIn($('#s7 .tx'), 52.0, 0, .42);
  }

  /* ---------- player ---------- */
  var stage = $('#stage'), audio = $('#music'), D = {}, t = 0, playing = false, last = 0, ended = false, raf = 0;
  var BG = [[0, 'wall'], [2.4, 'beach'], [9.6, 'night'], [19, 'garden'], [26.5, 'ballroom'], [34.4, 'bazaar'], [43, 'mandap'], [50.8, 'pool']], curBg = '';
  function fit() {
    var s = Math.min(innerWidth / 1080, innerHeight / 1920);
    stage.style.transform = 'scale(' + s + ') translate(-50%,-50%)';
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    stage.style.transformOrigin = '50% 50%';
  }
  function draw() {
    for (var i = 0; i < tracks.length; i++) apply(tracks[i], t);
    var b = BG[0][1]; BG.forEach(function (x) { if (t >= x[0]) b = x[1]; });
    if (b !== curBg) { curBg = b; $('#backdrop').style.backgroundImage = 'url(assets/img/' + b + '.webp)'; }
  }
  function frame(now) {
    if (!playing) return;
    var dt = Math.min(.1, (now - last) / 1000); last = now; t += dt;
    if (!audio.paused && audio.readyState >= 3 && !audio.seeking && Math.abs(audio.currentTime - t) > .3) { try { audio.currentTime = t; } catch (e) {} } // keep music locked to picture
    if (t >= DUR) { t = DUR; playing = false; draw(); finish(); return; }
    draw(); raf = requestAnimationFrame(frame);
  }
  function play(from) {
    cancelAnimationFrame(raf); t = from || 0; ended = false; $('#end').hidden = true;
    playing = true; last = performance.now(); draw();
    if (audio.src && D.music_enabled !== false && !PV) { try { audio.currentTime = t; } catch (e) {} audio.play().catch(function () {}); $('#mute').hidden = false; }
    raf = requestAnimationFrame(frame);
  }
  function finish() { ended = true; $('#end').hidden = false; var v = .6, f = setInterval(function () { v -= .05; audio.volume = Math.max(0, Math.min(1, v)); if (v <= 0) { clearInterval(f); audio.pause(); audio.volume = 1; } }, 120); }
  window.JFYPlayer = { seek: function (s, run) { cancelAnimationFrame(raf); t = Math.max(0, Math.min(DUR, s)); playing = false; draw(); if (run) play(t); }, get t() { return t; } };

  addEventListener('resize', fit); fit();
  addEventListener('message', function (e) { var m = e.data || {}; if (m.type === 'jfy:seek') JFYPlayer.seek(+m.t || 0, m.play !== false); });
  $('#replay').onclick = function () { play(0); };
  $('#mute').onclick = function () { audio.muted = !audio.muted; this.classList.toggle('off', audio.muted); };
  document.addEventListener('visibilitychange', function () { if (document.hidden) { audio.pause(); } else if (playing && audio.src && D.music_enabled !== false && !PV) audio.play().catch(function () {}); });

  function ready() {
    var imgs = $$('img').map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); });
    return Promise.all([document.fonts ? document.fonts.ready : 0].concat(imgs));
  }
  loadData().then(function (d) {
    D = d; render(D);
    if (D.music_url && D.music_enabled !== false) audio.src = D.music_url;
    if (PV) document.body.classList.add('pv');
    return ready();
  }).then(function () {
    build();
    var t0 = parseFloat(Q.get('t') || '0') || 0;
    if (PV) { $('#start').classList.add('out'); if (Q.get('hold') === '1') JFYPlayer.seek(t0, false); else play(t0); return; }
    t = 0; draw();
    $('#startBtn').onclick = function () { $('#start').classList.add('out'); play(0); };
  });
})();
