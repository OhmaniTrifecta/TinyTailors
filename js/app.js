/* Tiny Tailors — the studio app. */
(function (TT) {
  const $ = s => document.querySelector(s);
  const Sound = TT.Sound;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  /* ---------------- state ---------------- */
  const DEFAULT = {
    animal: { id: 'cat', color: 'natural' }, eyes: { id: 'sparkle' }, mouth: { id: 'cat' }, blush: { id: 'rosy' },
    hair: { id: null, color: 'cocoa' },
    top: { id: 'sailor', color: 'cloud', pattern: 'solid' }, bottom: { id: 'pleated', color: 'bubblegum', pattern: 'gingham' },
    shoes: { id: 'maryjanes', color: 'strawberry' }, hat: { id: 'beret', color: 'strawberry', pattern: 'solid' },
    face: { id: null, color: 'lavender' }, neck: { id: null, color: 'butter', pattern: 'solid' }, back: { id: null, color: 'lavender', pattern: 'solid' },
    hold: { id: 'balloon', color: 'mint' }, pet: { id: 'chick', color: 'bubblegum' }, scene: { id: 'tailor' }, fx: { id: 'sparkles' },
    name: 'Mochi'
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  function sanitize(s) {
    const out = clone(DEFAULT);
    if (!s || typeof s !== 'object') return out;
    for (const slot of Object.keys(TT.SLOTS)) {
      const e = s[slot]; if (!e || typeof e !== 'object') continue;
      const S = TT.SLOTS[slot];
      if (e.id === null && S.none) out[slot].id = null;
      else if (S.items.some(i => i.id === e.id)) out[slot].id = e.id;
      const pal = S.palette;
      if (pal && pal.some(p => p.id === e.color)) out[slot].color = e.color;
      if (S.patterns && TT.PATTERNS.some(p => p.id === e.pattern)) out[slot].pattern = e.pattern;
    }
    if (typeof s.name === 'string') out.name = s.name.slice(0, 24);
    return out;
  }
  let state = sanitize(store.get('tinytailors.current', null));
  const history = [JSON.stringify(state)];
  let hIndex = 0;
  let locks = new Set(store.get('tinytailors.locks', []));

  /* ---------------- tabs ---------------- */
  const TABS = [
    { id: 'critter', label: 'Critter', slots: ['animal'], icon: 'animal:cat' },
    { id: 'face', label: 'Face', slots: ['eyes', 'mouth', 'blush'], icon: 'face' },
    { id: 'hair', label: 'Hair', slots: ['hair'], icon: 'hair:buns' },
    { id: 'top', label: 'Tops', slots: ['top'], icon: 'top:tee' },
    { id: 'bottom', label: 'Bottoms', slots: ['bottom'], icon: 'bottom:skirt' },
    { id: 'shoes', label: 'Shoes', slots: ['shoes'], icon: 'shoes:sneakers' },
    { id: 'hat', label: 'Hats', slots: ['hat'], icon: 'hat:crown' },
    { id: 'specs', label: 'Specs', slots: ['face'], icon: 'face:hearts' },
    { id: 'neck', label: 'Neck', slots: ['neck'], icon: 'neck:bowtie' },
    { id: 'back', label: 'Wings', slots: ['back'], icon: 'back:butterfly' },
    { id: 'hold', label: 'Hold', slots: ['hold'], icon: 'hold:icecream' },
    { id: 'pet', label: 'Pets', slots: ['pet'], icon: 'pet:chick' },
    { id: 'scene', label: 'Scenes', slots: ['scene'], icon: 'scene:meadow' },
    { id: 'fx', label: 'Magic', slots: ['fx'], icon: 'fx' }
  ];
  let activeTab = store.get('tinytailors.tab', 'critter');
  if (!TABS.some(t => t.id === activeTab)) activeTab = 'critter';

  const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="3" fill="#fff"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const UNLOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="3" fill="#fff"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>';

  function tabIcon(t) {
    const pink = clone(state);
    ['top', 'bottom', 'shoes', 'hat', 'hair', 'face', 'neck', 'back', 'hold', 'pet'].forEach(s => { pink[s].color = 'bubblegum'; });
    pink.animal = { id: 'cat', color: 'natural' };
    if (t.icon === 'face') return TT.thumb('eyes', TT.itemOf('eyes', 'sparkle'), pink);
    if (t.icon === 'fx') return TT.svg(TT.star(50, 50, 30, '#ffe17a', 5) + TT.star(80, 20, 10, '#ff9ec0', 3) + TT.star(20, 80, 8, '#9ee6c0', 3), '0 0 100 100');
    const [slot, id] = t.icon.split(':');
    if (slot === 'shoes') return TT.svg(TT.itemOf(slot, id).draw(TT.pack('#ff9ec0'), {}), '140 380 120 54');
    return TT.thumb(slot, TT.itemOf(slot, id), pink);
  }
  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(t => {
      const locked = t.slots.every(s => locks.has(s));
      return `<button class="tab" role="tab" id="tab-${t.id}" aria-selected="${t.id === activeTab}" aria-controls="drawer" data-tab="${t.id}">
        ${tabIcon(t)}<span>${t.label}</span>${locked ? `<span class="lock-badge" title="Locked">${LOCK_SVG}</span>` : ''}</button>`;
    }).join('');
  }

  /* ---------------- drawer ---------------- */
  function swatchFor(slot, p, e) {
    const pressed = e.color === p.id;
    if (slot === 'animal' && !p.hex) return `<button class="swatch natural" data-act="color" data-slot="${slot}" data-val="${p.id}" aria-pressed="${pressed}" aria-label="${p.name}" title="${p.name}"></button>`;
    return `<button class="swatch" style="background:${p.hex}" data-act="color" data-slot="${slot}" data-val="${p.id}" aria-pressed="${pressed}" aria-label="${p.name}" title="${p.name}"></button>`;
  }
  function patternSwatch(slot, p, e) {
    const base = TT.colorHex(slot, e.color);
    const id = `sw-${p.id}`;
    const def = TT.patternDef(id, p.id, base);
    const inner = `<defs>${def}</defs><rect width="40" height="40" fill="${def ? `url(#${id})` : base}"/>`;
    return `<button class="swatch" data-act="pattern" data-slot="${slot}" data-val="${p.id}" aria-pressed="${(e.pattern || 'solid') === p.id}" aria-label="${p.name}" title="${p.name}">${TT.svg(inner, '0 0 40 40')}</button>`;
  }
  function renderDrawer() {
    const tab = TABS.find(t => t.id === activeTab);
    const html = tab.slots.map(slot => {
      const S = TT.SLOTS[slot], e = state[slot];
      const cur = e.id ? TT.itemOf(slot, e.id) : null;
      const extra = slot === 'scene' ? ' scene-item' : slot === 'fx' ? ' fx-item' : '';
      let items = '';
      if (S.none) items += `<button class="item" data-act="item" data-slot="${slot}" data-val="" aria-pressed="${!e.id}">${TT.thumb(slot, null, state)}<span>None</span></button>`;
      items += S.items.map(it => `<button class="item${extra}" data-act="item" data-slot="${slot}" data-val="${it.id}" aria-pressed="${e.id === it.id}">${TT.thumb(slot, it, state)}<span>${it.name}</span></button>`).join('');
      let colors = '';
      if (S.palette) {
        const fixed = cur && cur.fixed;
        const label = S.paletteLabel || 'Color';
        colors = `<div class="row-label">${label}${fixed ? '<em>· this one comes in its own colors</em>' : ''}</div>
          <div class="swatches${fixed ? ' dim' : ''}">${S.palette.map(p => swatchFor(slot, p, e)).join('')}</div>`;
      }
      let pats = '';
      if (S.patterns) {
        const fixed = cur && cur.fixed;
        pats = `<div class="row-label">Fabric</div><div class="swatches${fixed ? ' dim' : ''}">${TT.PATTERNS.map(p => patternSwatch(slot, p, e)).join('')}</div>`;
      }
      const locked = locks.has(slot);
      const count = S.items.length;
      return `<div class="section">
        <div class="section-head"><h2>${S.label}<span class="count">${count} to pick</span></h2>
          <button class="lock" data-act="lock" data-slot="${slot}" aria-pressed="${locked}" title="Keep this when you tap Surprise me">${locked ? LOCK_SVG : UNLOCK_SVG}${locked ? 'Locked' : 'Lock'}</button></div>
        <div class="items">${items}</div>${colors}${pats}</div>`;
    }).join('');
    $('#drawer').innerHTML = html;
    $('#drawer').setAttribute('aria-labelledby', 'tab-' + activeTab);
  }

  /* ---------------- stage ---------------- */
  function renderStage(pop) {
    $('#stage').innerHTML = TT.compose(state, { pfx: 'st-' });
    if (pop) {
      const g = $('#st-critter');
      if (g) { g.classList.add('pop'); setTimeout(() => g.classList.remove('pop'), 520); }
    }
    $('#name').value = state.name || '';
    $('#undo').disabled = hIndex <= 0;
    $('#redo').disabled = hIndex >= history.length - 1;
    store.set('tinytailors.current', state);
  }
  function commit(opts = {}) {
    const snap = JSON.stringify(state);
    if (snap === history[hIndex]) return;
    history.splice(hIndex + 1);
    history.push(snap);
    if (history.length > 80) history.shift();
    hIndex = history.length - 1;
    renderStage(opts.pop !== false);
    if (opts.drawer !== false) renderDrawer();
    if (opts.tabs) renderTabs();
  }

  /* ---------------- random looks ---------------- */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const chance = p => Math.random() < p;
  const ODDS = { hair: 0.45, top: 0.95, bottom: 0.9, shoes: 0.85, hat: 0.6, face: 0.3, neck: 0.4, back: 0.3, hold: 0.55, pet: 0.6, fx: 0.6, blush: 0.85 };
  function randomLook(base, respectLocks = true) {
    const s = clone(base);
    const story = [pick(TT.COLORS), pick(TT.COLORS), pick(TT.COLORS)].map(c => c.id); // a little colour story
    for (const [slot, S] of Object.entries(TT.SLOTS)) {
      if (respectLocks && locks.has(slot)) continue;
      const e = s[slot];
      e.id = (S.none && !chance(ODDS[slot] ?? 0.7)) ? null : pick(S.items).id;
      if (slot === 'animal') e.color = chance(0.65) ? 'natural' : pick(TT.FUR).id;
      else if (S.palette) e.color = chance(0.7) ? pick(story) : pick(S.palette).id;
      if (S.patterns) e.pattern = chance(0.4) ? pick(TT.PATTERNS.slice(1)).id : 'solid';
    }
    // keep dresses & gowns from clashing with big skirts most of the time
    const longTop = ['gown', 'sundress', 'wizard'].includes(s.top.id);
    if (longTop && !(respectLocks && locks.has('bottom')) && chance(0.7)) s.bottom.id = chance(0.5) ? null : 'leggings';
    if (s.bottom.id === 'mermaid' && !(respectLocks && locks.has('shoes'))) s.shoes.id = null;
    return s;
  }

  /* ---------------- names & challenges ---------------- */
  const NAME_A = ['Sir', 'Lady', 'Captain', 'Princess', 'Professor', 'Little', 'Duke', 'Miss', 'Mister', 'Dr.', 'Baby', 'Count', 'Queen', 'King', ''];
  const NAME_B = ['Muffin', 'Pickles', 'Waffles', 'Noodle', 'Bean', 'Sprinkles', 'Biscuit', 'Mochi', 'Pudding', 'Clover', 'Pumpkin', 'Button', 'Nugget', 'Marshmallow', 'Taco', 'Cupcake', 'Bubbles', 'Peaches', 'Toffee', 'Dumpling', 'Pebble', 'Maple', 'Jellybean', 'Bao', 'Poppy', 'Fig', 'Gizmo', 'Tofu'];
  const NAME_C = ['', '', '', 'the Brave', 'McFluff', 'von Snuggles', 'the Great', 'Sparklepaws', 'the Third', 'Fuzzbottom'];
  const randomName = () => [pick(NAME_A), pick(NAME_B), pick(NAME_C)].filter(Boolean).join(' ').slice(0, 24);
  const CHALLENGES = [
    'Get ready for a royal tea party', 'Pack for a sunny beach day', 'Blast off as a space explorer', 'Throw the coziest pajama party',
    'Spooky... but make it cute', 'Rainbow everything!', 'Wear one color from head to toe', 'Mix three different patterns',
    'Superhero to the rescue', 'Dress up for a fancy dinner', 'Become a garden fairy', 'Sail the seas as a pirate captain',
    'Snow day adventure', 'Rock star on the big stage', 'Head chef in a busy kitchen', 'Ballet recital tonight',
    'First day at wizard school', 'Under the sea explorer', 'Birthday party guest of honor', 'Sleepy bedtime story',
    'Big game day!', 'Picnic under the cherry blossoms', 'Knight guarding the castle', 'Autumn walk in the park',
    'Match your pet pal', 'Dress the opposite of your critter', 'Only pastel pinks and purples', 'Ready for a camping trip',
    'Fashion week runway look', 'Busy bee in the meadow'
  ];
  const CHEERS = ['Fabulous!', 'Runway ready!', 'So stylish!', 'Total icon!', 'Picture perfect!', 'Stitch-tastic!', 'Ten out of ten!', 'Cutest look ever!'];

  /* ---------------- toast & confetti ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
  }
  function celebrate(fxId = 'confetti') {
    const keep = state.fx.id;
    state.fx.id = fxId; renderStage(true); state.fx.id = keep;
    setTimeout(() => renderStage(false), 3200);
  }

  /* ---------------- closet ---------------- */
  const closetKey = 'tinytailors.closet';
  let closet = store.get(closetKey, []).map(sanitize).slice(0, 24);
  function renderCloset() {
    $('#closetCount').textContent = closet.length;
    const g = $('#closetGrid');
    if (!closet.length) { g.innerHTML = '<div class="empty">No saved looks yet. Tap “Save look” to hang one up here.</div>'; return; }
    g.innerHTML = closet.map((s, i) => `<div class="look"><button class="look-open" data-i="${i}" style="all:unset;cursor:pointer;display:grid;gap:4px">${TT.svg(TT.compose(s, { pfx: `cl${i}-`, animated: false }), '0 0 400 460')}<span>${escapeHtml(s.name || 'No name yet')}</span></button>
      <button class="del" data-del="${i}" aria-label="Remove ${escapeHtml(s.name || 'this look')}">✕</button></div>`).join('');
  }
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- photo ---------------- */
  async function snapPhoto() {
    Sound.shutter();
    const flash = $('#stageCard'); flash.animate([{ filter: 'brightness(1.8)' }, { filter: 'none' }], { duration: 350 });
    const W = 880, H = 1120;
    const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H;
    const g = cvs.getContext('2d');
    const svg = TT.svg(TT.compose(state, { pfx: 'ph-', animated: false }), '0 0 400 460', 'width="800" height="920"');
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    try { await img.decode(); } catch (e) { await new Promise(r => { img.onload = r; img.onerror = r; }); }
    try { await document.fonts.load('800 48px Sniglet'); await document.fonts.load('700 24px "Baloo 2"'); } catch (e) { }
    // photo card
    g.fillStyle = '#fffdf9'; roundRect(g, 0, 0, W, H, 48); g.fill();
    g.lineWidth = 6; g.strokeStyle = '#5b3f58'; roundRect(g, 3, 3, W - 6, H - 6, 46); g.stroke();
    g.save(); roundRect(g, 40, 40, 800, 920, 30); g.clip(); g.drawImage(img, 40, 40, 800, 920); g.restore();
    g.lineWidth = 5; roundRect(g, 40, 40, 800, 920, 30); g.stroke();
    g.setLineDash([12, 10]); g.strokeStyle = '#f4b3c8'; g.lineWidth = 4; roundRect(g, 18, 18, W - 36, H - 36, 36); g.stroke(); g.setLineDash([]);
    g.textAlign = 'center';
    g.fillStyle = '#e64f7c'; g.font = '800 54px Sniglet, "Baloo 2", sans-serif';
    g.fillText(state.name || 'My critter', W / 2, 1036);
    g.fillStyle = '#8a6f88'; g.font = '700 26px "Baloo 2", sans-serif';
    g.fillText('Tailored at Tiny Tailors', W / 2, 1080);
    let url;
    try { url = cvs.toDataURL('image/png'); } catch (e) { url = img.src; }
    $('#photoImg').src = url;
    const a = $('#photoDownload');
    if (a) { a.href = url; a.download = `${(state.name || 'tiny-tailors').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`; }
    openModal('#photoModal');
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* ---------------- modals ---------------- */
  let lastFocus = null;
  function openModal(sel) { lastFocus = document.activeElement; const m = $(sel); m.hidden = false; const b = m.querySelector('[data-close]'); b && b.focus(); }
  function closeModal(m) { m.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus(); }

  /* ---------------- title screen ---------------- */
  function renderParade() {
    const looks = [0, 1, 2].map(() => {
      const s = randomLook(DEFAULT, false);
      s.fx.id = null; s.scene.id = 'tailor'; s.pet.id = null;
      return s;
    });
    $('#parade').innerHTML = looks.map((s, i) => TT.svg(TT.compose(s, { pfx: `pa${i}-`, scene: false }), '40 0 320 440')).join('');
  }
  function startStudio() {
    Sound.wake(); Sound.whoosh();
    $('#title').hidden = true; $('#app').hidden = false;
    renderTabs(); renderDrawer(); renderStage(true); renderCloset();
    store.set('tinytailors.started', true);
  }

  /* ---------------- events ---------------- */
  function bind() {
    $('#play').addEventListener('click', startStudio);
    $('#home').addEventListener('click', () => { $('#app').hidden = true; $('#title').hidden = false; renderParade(); });

    $('#tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      activeTab = b.dataset.tab; store.set('tinytailors.tab', activeTab); Sound.tap();
      $('#tabs').querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === activeTab));
      renderDrawer(); $('#drawer').scrollTop = 0;
    });
    $('#tabs').addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = TABS.findIndex(t => t.id === activeTab), n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
      $('#tab-' + TABS[n].id).click(); $('#tab-' + TABS[n].id).focus();
    });

    $('#drawer').addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const { act, slot, val } = b.dataset;
      if (act === 'item') {
        state[slot].id = val || null;
        if (slot === 'bottom' && val === 'mermaid') { /* mermaids skip shoes */ }
        Sound.pop(); commit({ tabs: slot === 'animal' });
      } else if (act === 'color') {
        state[slot].color = val; Sound.swatch(); commit({ tabs: false });
      } else if (act === 'pattern') {
        state[slot].pattern = val; Sound.swatch(); commit();
      } else if (act === 'lock') {
        locks.has(slot) ? locks.delete(slot) : locks.add(slot);
        store.set('tinytailors.locks', [...locks]); Sound.tap();
        renderDrawer(); renderTabs();
        toast(locks.has(slot) ? `${TT.SLOTS[slot].label} locked` : `${TT.SLOTS[slot].label} unlocked`);
      }
    });

    $('#surprise').addEventListener('click', () => {
      state = randomLook(state); Sound.sparkle();
      const btn = $('#surprise'); btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
      commit({ tabs: true });
    });
    $('#undo').addEventListener('click', () => { if (hIndex > 0) { hIndex--; state = JSON.parse(history[hIndex]); Sound.undo(); renderStage(true); renderDrawer(); renderTabs(); } });
    $('#redo').addEventListener('click', () => { if (hIndex < history.length - 1) { hIndex++; state = JSON.parse(history[hIndex]); Sound.pop(); renderStage(true); renderDrawer(); renderTabs(); } });

    $('#name').addEventListener('input', e => { state.name = e.target.value; store.set('tinytailors.current', state); });
    $('#name').addEventListener('change', () => commit({ pop: false, drawer: false }));
    $('#nameDice').addEventListener('click', () => { state.name = randomName(); Sound.pop(); commit({ drawer: false }); });

    $('#soundBtn').addEventListener('click', e => {
      Sound.on = !Sound.on; store.set('tinytailors.sound', Sound.on);
      e.currentTarget.setAttribute('aria-pressed', Sound.on); e.currentTarget.setAttribute('aria-label', Sound.on ? 'Sound on' : 'Sound off');
      if (Sound.on) { Sound.wake(); Sound.tap(); }
    });

    $('#photo').addEventListener('click', snapPhoto);
    $('#save').addEventListener('click', () => {
      closet.unshift(clone(state)); closet = closet.slice(0, 24);
      const ok = store.set(closetKey, closet);
      renderCloset(); Sound.sparkle(); toast(ok ? 'Hung up in your closet!' : 'Saved until you close this page');
    });
    $('#closetBtn').addEventListener('click', () => { renderCloset(); openModal('#closet'); });
    $('#closetGrid').addEventListener('click', e => {
      const del = e.target.closest('[data-del]');
      if (del) { closet.splice(+del.dataset.del, 1); store.set(closetKey, closet); renderCloset(); Sound.undo(); return; }
      const open = e.target.closest('.look-open');
      if (open) { state = clone(closet[+open.dataset.i]); closeModal($('#closet')); Sound.whoosh(); commit({ tabs: true }); }
    });
    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.modal:not([hidden])').forEach(closeModal);
      if (e.target.matches('input')) return;
      if ($('#app').hidden) return;
      if (e.key === 'r' || e.key === 'R') $('#surprise').click();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); (e.shiftKey ? $('#redo') : $('#undo')).click(); }
    });

    // style challenge
    const newChallenge = () => { $('#challengeText').textContent = pick(CHALLENGES); };
    $('#challengeBtn').addEventListener('click', () => { newChallenge(); $('#challenge').hidden = false; Sound.tap(); });
    $('#challengeNew').addEventListener('click', () => { newChallenge(); Sound.tap(); });
    $('#challengeClose').addEventListener('click', () => { $('#challenge').hidden = true; });
    $('#challengeDone').addEventListener('click', () => { Sound.cheer(); toast(pick(CHEERS) + ' ★★★★★'); celebrate('confetti'); setTimeout(newChallenge, 1600); });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    Sound.on = store.get('tinytailors.sound', true);
    $('#soundBtn').setAttribute('aria-pressed', Sound.on);
    $('#looksCount').textContent = TT.bigWords(TT.countLooks());
    renderParade();
    bind();
    if (location.hash === '#studio') startStudio();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  TT.app = { get state() { return state; }, randomLook, sanitize };
})(window.TT);
