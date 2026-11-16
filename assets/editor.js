/* Royal Shores editor — form → live preview (seeks to the scene you edit) → shareable #data link. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SAMPLE = JSON.parse(JSON.stringify(window.JFY_DATA || {}));
  var TEXT = ['host_line','groom_name','groom_parents','bride_name','bride_parents','venue','venue_map_url','regards_title','family','hashtag','rsvp_whatsapp'];
  var form = $('#ed'), timer = null, seekT = 7.6, n = 0, DRAFT = 'jfy-royalshores-draft';
  function load(d) {
    TEXT.forEach(function (k) { form[k].value = d[k] || ''; });
    form.music_enabled.checked = d.music_enabled !== false;
    $$('[data-e]').forEach(function (i) { var e = (d.events || [])[+i.dataset.e] || {}; i.value = e[i.dataset.k] || ''; });
  }
  function collect() {
    var d = {};
    TEXT.forEach(function (k) { var v = (form[k].value || '').trim(); if (v) d[k] = v; });
    if (d.rsvp_whatsapp) d.rsvp_whatsapp = d.rsvp_whatsapp.replace(/\D/g, '');
    if (!form.music_enabled.checked) d.music_enabled = false;
    d.events = [0, 1, 2, 3, 4].map(function (i) {
      var e = {}; $$('[data-e="' + i + '"]').forEach(function (inp) { var v = inp.value.trim(); if (v) e[inp.dataset.k] = v; }); return e;
    });
    return d;
  }
  function preview(play) {
    var d = collect();
    try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch (e) {}
    JFYCodec.encode(d).then(function (s) { $('#pv').src = 'index.html?preview=1&hold=1&t=' + seekT + '&r=' + (++n) + '#data=' + s; });
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(preview, 550); }
  form.addEventListener('input', schedule); form.addEventListener('change', schedule);
  /* jump the preview to the scene being edited */
  form.addEventListener('focusin', function (e) {
    var g = e.target.closest('[data-seek]'); if (!g) return;
    var t = +g.dataset.seek; if (t === seekT) return; seekT = t;
    try { $('#pv').contentWindow.postMessage({ type: 'jfy:seek', t: Math.max(0, t - 5.2) }, '*'); } catch (_) {}
  });
  $$('details[data-seek]').forEach(function (g) { g.addEventListener('toggle', function () { if (g.open) { seekT = +g.dataset.seek; try { $('#pv').contentWindow.postMessage({ type: 'jfy:seek', t: Math.max(0, seekT - 5.2) }, '*'); } catch (_) {} } }); });
  $('#pvPlay').onclick = function () { try { $('#pv').contentWindow.postMessage({ type: 'jfy:seek', t: 0 }, '*'); } catch (_) {} };
  $('#pvScene').onclick = function () { try { $('#pv').contentWindow.postMessage({ type: 'jfy:seek', t: Math.max(0, seekT - 5.2) }, '*'); } catch (_) {} };
  $('#resetBtn').onclick = function () { load(SAMPLE); preview(); };
  $('#clearBtn').onclick = function () { load({ events: [] }); preview(); };
  function showErr(t) { var e = $('#err'); e.textContent = t; e.hidden = !t; }
  $('#createBtn').onclick = function () {
    var d = collect(), miss = [];
    [['groom_name', "Groom's name"], ['bride_name', "Bride's name"], ['venue', 'Venue']].forEach(function (p) { if (!d[p[0]]) miss.push(p[1]); });
    if (miss.length) { showErr('Please fill: ' + miss.join(', ')); document.body.classList.remove('v-preview'); var f = form.querySelector(':invalid'); if (f) { f.closest('details').open = true; f.focus(); } return; }
    showErr('');
    JFYCodec.encode(d).then(function (s) {
      var u = new URL('index.html', location.href); u.search = ''; u.hash = 'data=' + s;
      var link = u.toString(), msg = 'You are invited to the wedding of ' + d.groom_name + ' & ' + d.bride_name + ' 💐\nOpen your invitation: ' + link;
      $('#shareUrl').value = link; $('#openLink').href = link; $('#waShare').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
      var ns = $('#nativeShare'); ns.hidden = !navigator.share; ns.onclick = function () { navigator.share({ title: 'Wedding invitation', text: msg.split('\n')[0], url: link }).catch(function () {}); };
      $('#sheet').hidden = false;
    });
  };
  $('#copyBtn').onclick = function () {
    var i = $('#shareUrl'), b = this; i.select();
    var ok = function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(i.value).then(ok, function () { document.execCommand('copy'); ok(); }); else { document.execCommand('copy'); ok(); }
  };
  $('#sheetX').onclick = function () { $('#sheet').hidden = true; };
  $$('.tab').forEach(function (t) { t.onclick = function () { $$('.tab').forEach(function (x) { x.classList.toggle('on', x === t); }); document.body.classList.toggle('v-preview', t.dataset.view === 'preview'); window.scrollTo(0, 0); }; });
  var m = /[#&]data=([^&]+)/.exec(location.hash), start = Promise.resolve(null);
  if (m) start = JFYCodec.decode(m[1]).catch(function () { return null; });
  start.then(function (d) { if (!d) { try { d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (_) { d = null; } } load(d || SAMPLE); preview(); });
})();
