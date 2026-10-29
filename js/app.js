/* Tiny Tailors — the studio app. */
(function (TT) {
  const $ = s => document.querySelector(s);
  const Sound = TT.Sound;
  const PR = TT.progress;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- state ---------------- */
  const DEFAULT = {
    animal: { id: 'cat', color: 'natural' }, eyes: { id: 'sparkle' }, mouth: { id: 'cat' }, blush: { id: 'rosy' },
    hair: { id: null, color: 'cocoa' },
    top: { id: 'sailor', color: 'cloud', color2: null, pattern: 'solid' }, bottom: { id: 'pleated', color: 'bubblegum', color2: null, pattern: 'gingham' },
    shoes: { id: 'maryjanes', color: 'strawberry', color2: null }, hat: { id: 'beret', color: 'strawberry', color2: null, pattern: 'solid' },
    face: { id: null, color: 'lavender', color2: null }, neck: { id: null, color: 'butter', color2: null, pattern: 'solid' },
    back: { id: null, color: 'lavender', color2: null, pattern: 'solid' }, hold: { id: 'balloon', color: 'mint', color2: null },
    pet: { id: 'chick', color: 'bubblegum' }, scene: { id: 'tailor' }, fx: { id: 'sparkles' }, pose: { id: 'wave' },
    petPos: null, name: 'Mochi'
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  function sanitize(s) {
    const out = clone(DEFAULT);
    if (!s || typeof s !== 'object') return out;
    for (const slot of Object.keys(TT.SLOTS)) {
      const e = s[slot]; if (!e || typeof e !== 'object') continue;
      const S = TT.SLOTS[slot];
      if (!out[slot]) out[slot] = { id: null };
      if (e.id === null && S.none) out[slot].id = null;
      else if (S.items.some(i => i.id === e.id)) out[slot].id = e.id;
      const pal = S.palette;
      if (pal && (pal.some(p => p.id === e.color) || TT.isHex(e.color))) out[slot].color = e.color;
      if (S.trim) out[slot].color2 = (pal.some(p => p.id === e.color2) || TT.isHex(e.color2)) ? e.color2 : null;
      if (S.patterns && TT.patternExists(e.pattern)) out[slot].pattern = e.pattern || 'solid';
    }
    if (typeof s.name === 'string') out.name = s.name.slice(0, 24);
    if (s.petPos && isFinite(s.petPos.x) && isFinite(s.petPos.y)) out.petPos = { x: +s.petPos.x, y: +s.petPos.y };
    return out;
  }
  let state = sanitize(store.get('tinytailors.current', null));
  let history = [JSON.stringify(state)];
  let hIndex = 0;
  let locks = new Set(store.get('tinytailors.locks', []));
  let dancePose = null, danceTimer = null;
  let challenge = null; // {ch, daily}
  let query = '';

  /* ---------------- tabs ---------------- */
  const TABS = [
    { id: 'critter', label: 'Critter', slots: ['animal'], icon: 'animal:cat' },
    { id: 'face', label: 'Face', slots: ['mood', 'eyes', 'mouth', 'blush'], icon: 'face' },
    { id: 'pose', label: 'Pose', slots: ['pose'], icon: 'pose' },
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
    { id: 'fx', label: 'Magic', slots: ['fx'], icon: 'fx' },
    { id: 'faves', label: 'Faves', slots: [], icon: 'faves' }
  ];
  let activeTab = store.get('tinytailors.tab', 'critter');
  if (!TABS.some(t => t.id === activeTab)) activeTab = 'critter';

  const LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="3" fill="#fff"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const UNLOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="3" fill="#fff"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>';
  const SPOOL = '<svg viewBox="0 0 24 24" aria-hidden="true" class="spool"><rect x="5" y="3" width="14" height="4" rx="1.5" fill="#c99a6e" stroke="#5b3f58" stroke-width="1.6"/><rect x="5" y="17" width="14" height="4" rx="1.5" fill="#c99a6e" stroke="#5b3f58" stroke-width="1.6"/><rect x="7" y="7" width="10" height="10" fill="#ff6f96" stroke="#5b3f58" stroke-width="1.6"/><path d="M7 10h10M7 13h10" stroke="#ffb3c8" stroke-width="1.4"/></svg>';
  TT.SPOOL = SPOOL;

  function tabIcon(t) {
    const pink = clone(state);
    ['top', 'bottom', 'shoes', 'hat', 'hair', 'face', 'neck', 'back', 'hold', 'pet'].forEach(s => { pink[s].color = 'bubblegum'; pink[s].color2 = null; });
    pink.animal = { id: 'cat', color: 'natural' };
    if (t.icon === 'face') return TT.thumb('eyes', TT.itemOf('eyes', 'sparkle'), pink);
    if (t.icon === 'fx') return TT.svg(TT.star(50, 50, 30, '#ffe17a', 5) + TT.star(80, 20, 10, '#ff9ec0', 3) + TT.star(20, 80, 8, '#9ee6c0', 3), '0 0 100 100');
    if (t.icon === 'faves') return TT.svg(TT.heart(50, 54, 30, '#ff6f96', 5) + TT.star(80, 22, 9, '#ffe17a', 3), '0 0 100 100');
    if (t.icon === 'pose') return TT.svg(TT.TUBE('M50,92 L50,48', 18, '#ffc98f') + TT.TUBE('M50,58 L22,24', 12, '#ffc98f') + TT.TUBE('M50,58 L80,26', 12, '#ffc98f') + TT.C(50, 34, 16, '#ffc98f', 5) + TT.star(86, 14, 8, '#ffe17a', 3), '0 0 100 100');
    const [slot, id] = t.icon.split(':');
    if (slot === 'shoes') return TT.svg(TT.itemOf(slot, id).draw(TT.pack('#ff9ec0'), {}), '140 380 120 54');
    return TT.thumb(slot, TT.itemOf(slot, id), pink);
  }
  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(t => {
      const locked = t.slots.length && t.slots.filter(s => TT.SLOTS[s]).every(s => locks.has(s));
      return `<button class="tab" role="tab" id="tab-${t.id}" aria-selected="${t.id === activeTab}" aria-controls="drawer" data-tab="${t.id}">
        ${tabIcon(t)}<span>${t.label}</span>${locked ? `<span class="lock-badge" title="Locked">${LOCK_SVG}</span>` : ''}</button>`;
    }).join('');
  }

  /* ---------------- drawer pieces ---------------- */
  const kindOf = slot => slot === 'animal' ? 'animal' : slot;
  const lockedItem = (slot, it) => it && TT.isLocked(kindOf(slot), it);
  const priceTag = n => `<span class="price r-${TT.rarity(n).id}" title="${TT.rarity(n).name}">${SPOOL}${n}</span>`;

  function itemButton(slot, it, extra = '') {
    const e = state[slot] || {};
    const locked = lockedItem(slot, it);
    const pressed = it ? e.id === it.id : !e.id;
    const fav = it && TT.isFav(slot, it.id);
    const label = it ? it.name : 'None';
    return `<button class="item${extra}${locked ? ' is-locked' : ''}" data-act="item" data-slot="${slot}" data-val="${it ? it.id : ''}" aria-pressed="${pressed}"
      aria-label="${esc(label)}${locked ? `, locked, ${it.locked} stitches` : ''}">${TT.thumb(slot, it, state)}<span>${esc(label)}</span>
      ${locked ? priceTag(it.locked) : ''}${fav ? '<i class="fav-badge" aria-hidden="true">★</i>' : ''}</button>`;
  }
  function swatch(slot, which, p) {
    const e = state[slot];
    const cur = which === 'color2' ? e.color2 : e.color;
    const kind = slot === 'animal' ? 'fur' : 'color';
    const locked = p.locked && TT.isLocked(kind, p);
    const style = p.hex ? `background:${p.hex}` : '';
    return `<button class="swatch${p.hex ? '' : (slot === 'animal' ? ' natural' : '')}${locked ? ' is-locked' : ''}" style="${style}" data-act="${which}" data-slot="${slot}" data-val="${p.id}"
      aria-pressed="${cur === p.id}" aria-label="${p.name}${locked ? `, locked, ${p.locked} stitches` : ''}" title="${p.name}${locked ? ` · ${p.locked} stitches` : ''}">${locked ? '<i class="sw-lock">🔒</i>' : ''}</button>`;
  }
  function mixer(slot, which) {
    const e = state[slot]; const cur = which === 'color2' ? e.color2 : e.color;
    const isCustom = TT.isHex(cur);
    return `<label class="swatch mixer${isCustom ? ' has-color' : ''}" style="${isCustom ? `background:${cur}` : ''}" title="Mix your own color" aria-pressed="${isCustom}">
      <input type="color" data-act="mix" data-which="${which}" data-slot="${slot}" value="${isCustom ? cur : (TT.colorHex(slot, cur) || '#ff9ec0')}" aria-label="Mix your own color">${isCustom ? '' : '<span aria-hidden="true">+</span>'}</label>`;
  }
  function patternSwatch(slot, p) {
    const e = state[slot];
    const base = TT.colorHex(slot, e.color);
    const id = `sw-${slot}-${p.id}`;
    const def = TT.patternDef(id, p.id, base, TT.trimHex(slot, e));
    const locked = p.locked && TT.isLocked('pattern', p);
    const inner = `<defs>${def}</defs><rect width="40" height="40" fill="${def ? `url(#${id})` : base}"/>`;
    return `<button class="swatch${locked ? ' is-locked' : ''}" data-act="pattern" data-slot="${slot}" data-val="${p.id}" aria-pressed="${(e.pattern || 'solid') === p.id}"
      aria-label="${esc(p.name)}${locked ? `, locked, ${p.locked} stitches` : ''}" title="${esc(p.name)}${locked ? ` · ${p.locked} stitches` : ''}">${TT.svg(inner, '0 0 40 40')}${locked ? '<i class="sw-lock">🔒</i>' : ''}</button>`;
  }
  function section(slot) {
    if (slot === 'mood') {
      return `<div class="section"><div class="section-head"><h2>Moods<span class="count">tap for a whole face</span></h2></div>
        <div class="moods">${TT.MOODS.map(m => {
          const s2 = clone(state); s2.eyes.id = m.eyes; s2.mouth.id = m.mouth; s2.blush.id = m.blush;
          return `<button class="item mood" data-act="mood" data-val="${m.id}">${TT.thumb('blush', m.blush ? TT.itemOf('blush', m.blush) : TT.BLUSH[0], s2).replace('106 128 188 106', '106 126 188 110')}<span>${m.name}</span></button>`;
        }).join('')}</div></div>`;
    }
    const S = TT.SLOTS[slot], e = state[slot];
    const cur = e.id ? TT.itemOf(slot, e.id) : null;
    const extra = slot === 'scene' ? ' scene-item' : slot === 'fx' ? ' fx-item' : slot === 'pose' ? ' pose-item' : '';
    let items = S.none ? itemButton(slot, null) : '';
    items += S.items.map(it => itemButton(slot, it, extra)).join('');
    const fixed = cur && cur.fixed;
    let rows = '';
    if (S.palette) {
      rows += `<div class="row-label">${S.paletteLabel || 'Main color'}${fixed ? '<em>· this one comes in its own colors</em>' : ''}</div>
        <div class="swatches${fixed ? ' dim' : ''}">${S.palette.map(p => swatch(slot, 'color', p)).join('')}${mixer(slot, 'color')}</div>`;
    }
    if (S.trim) {
      rows += `<div class="row-label">Trim color<em>· collars, cuffs, bows and fabric accents</em></div>
        <div class="swatches${fixed ? ' dim' : ''}"><button class="swatch auto" data-act="color2" data-slot="${slot}" data-val="" aria-pressed="${!e.color2}" aria-label="Automatic trim" title="Automatic">Auto</button>${S.palette.map(p => swatch(slot, 'color2', p)).join('')}${mixer(slot, 'color2')}</div>`;
    }
    if (S.patterns) {
      const fabs = TT.allFabrics();
      rows += `<div class="row-label">Fabric</div><div class="swatches${fixed ? ' dim' : ''}">${TT.PATTERNS.map(p => patternSwatch(slot, p)).join('')}
        ${fabs.map(f => patternSwatch(slot, f)).join('')}
        <button class="swatch design" data-act="designfabric" data-slot="${slot}" title="Design your own fabric" aria-label="Design your own fabric">✎</button></div>`;
    }
    const locked = locks.has(slot);
    const favOn = cur && TT.isFav(slot, cur.id);
    return `<div class="section">
      <div class="section-head"><h2>${S.label}<span class="count">${S.items.length} to pick</span></h2>
        <div class="head-btns">${cur ? `<button class="lock" data-act="fav" data-slot="${slot}" aria-pressed="${!!favOn}" title="Add ${esc(cur.name)} to Faves">${favOn ? '★' : '☆'} Fave</button>` : ''}
        ${slot !== 'pose' ? `<button class="lock" data-act="lock" data-slot="${slot}" aria-pressed="${locked}" title="Keep this when you tap Surprise me">${locked ? LOCK_SVG : UNLOCK_SVG}${locked ? 'Locked' : 'Lock'}</button>` : ''}</div></div>
      <div class="items">${items}</div>${rows}</div>`;
  }
  function searchResults() {
    const q = query.trim().toLowerCase();
    const groups = [];
    for (const [slot, S] of Object.entries(TT.SLOTS)) {
      const hits = S.items.filter(it => it.name.toLowerCase().includes(q) || (((TT.TAGS[slot] || {})[it.id] || '').includes(q)));
      if (hits.length) groups.push(`<div class="section"><div class="section-head"><h2>${S.label}</h2></div><div class="items">${hits.map(it => itemButton(slot, it, slot === 'scene' ? ' scene-item' : '')).join('')}</div></div>`);
    }
    return groups.join('') || `<div class="empty">Nothing called “${esc(query)}” yet. Try “crown”, “beach” or “cozy”.</div>`;
  }
  function favesSection() {
    const bySlot = {};
    PR.favs.forEach(k => { const [slot, id] = k.split(':'); const it = TT.SLOTS[slot] && TT.itemOf(slot, id); if (it) (bySlot[slot] = bySlot[slot] || []).push(it); });
    const keys = Object.keys(bySlot);
    if (!keys.length) return `<div class="empty">No faves yet. Pick something you love, then tap <b>☆ Fave</b> next to the drawer's title.</div>`;
    return keys.map(slot => `<div class="section"><div class="section-head"><h2>${TT.SLOTS[slot].label}</h2></div><div class="items">${bySlot[slot].map(it => itemButton(slot, it)).join('')}</div></div>`).join('');
  }
  function renderDrawer() {
    const tab = TABS.find(t => t.id === activeTab);
    let html = '';
    if (query.trim()) html = searchResults();
    else if (tab.id === 'faves') html = favesSection();
    else html = tab.slots.map(section).join('');
    $('#drawerBody').innerHTML = html;
    $('#drawer').setAttribute('aria-labelledby', 'tab-' + activeTab);
  }

  /* ---------------- stage ---------------- */
  function renderStage(pop) {
    const look = Object.assign({}, state);
    $('#stage').innerHTML = TT.compose(look, { pfx: 'st-', pose: dancePose || undefined });
    renderViewer();
    if (pop) {
      const g = $('#st-critter');
      if (g) { g.classList.add('pop'); setTimeout(() => g.classList.remove('pop'), 520); }
    }
    if (document.activeElement !== $('#name')) $('#name').value = state.name || '';
    fitName();
    $('#undo').disabled = hIndex <= 0;
    $('#redo').disabled = hIndex >= history.length - 1;
    store.set('tinytailors.current', state);
  }
  function commit(opts = {}) {
    const snap = JSON.stringify(state);
    if (snap === history[hIndex]) { if (opts.force) { renderStage(opts.pop !== false); renderDrawer(); } return; }
    history.splice(hIndex + 1);
    history.push(snap);
    if (history.length > 80) history.shift();
    hIndex = history.length - 1;
    renderStage(opts.pop !== false);
    if (opts.drawer !== false) renderDrawer();
    if (opts.tabs) renderTabs();
  }
  function renderWallet(bump) {
    $('#stitchCount').textContent = PR.stitches;
    if (bump) { const w = $('#wallet'); w.classList.remove('bump'); void w.offsetWidth; w.classList.add('bump'); Sound.coin(); }
  }

  /* ---------------- random looks (only things you own) ---------------- */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const chance = p => Math.random() < p;
  const ODDS = { hair: 0.45, top: 0.95, bottom: 0.9, shoes: 0.85, hat: 0.6, face: 0.3, neck: 0.4, back: 0.3, hold: 0.55, pet: 0.6, fx: 0.6, blush: 0.85 };
  const owned = (slot, list) => list.filter(it => !lockedItem(slot, it));
  function randomLook(base, respectLocks = true) {
    const s = clone(base);
    const colors = TT.COLORS.filter(c => !TT.isLocked('color', c));
    const story = [pick(colors), pick(colors), pick(colors)].map(c => c.id);
    const pats = TT.PATTERNS.slice(1).filter(p => !TT.isLocked('pattern', p));
    for (const [slot, S] of Object.entries(TT.SLOTS)) {
      if (slot === 'pose') continue;
      if (respectLocks && locks.has(slot)) continue;
      const e = s[slot] || (s[slot] = {});
      e.id = (S.none && !chance(ODDS[slot] ?? 0.7)) ? null : pick(owned(slot, S.items)).id;
      if (slot === 'animal') e.color = chance(0.65) ? 'natural' : pick(TT.FUR.filter(f => !TT.isLocked('fur', f))).id;
      else if (S.palette) e.color = chance(0.7) ? pick(story) : pick(colors).id;
      if (S.trim) e.color2 = chance(0.3) ? pick(story) : null;
      if (S.patterns) e.pattern = chance(0.4) ? pick(pats).id : 'solid';
    }
    const longTop = ['gown', 'sundress', 'wizard', 'starlight', 'royalrobe'].includes(s.top.id);
    if (longTop && !(respectLocks && locks.has('bottom')) && chance(0.7)) s.bottom.id = chance(0.5) ? null : 'leggings';
    if (s.bottom.id === 'mermaid' && !(respectLocks && locks.has('shoes'))) s.shoes.id = null;
    s.pose = { id: pick(owned('pose', TT.POSES)).id };
    s.petPos = null;
    return s;
  }

  /* ---------------- names ---------------- */
  const NAME_A = ['Sir', 'Lady', 'Captain', 'Princess', 'Professor', 'Little', 'Duke', 'Miss', 'Mister', 'Dr.', 'Baby', 'Count', 'Queen', 'King', ''];
  const NAME_B = ['Muffin', 'Pickles', 'Waffles', 'Noodle', 'Bean', 'Sprinkles', 'Biscuit', 'Mochi', 'Pudding', 'Clover', 'Pumpkin', 'Button', 'Nugget', 'Marshmallow', 'Taco', 'Cupcake', 'Bubbles', 'Peaches', 'Toffee', 'Dumpling', 'Pebble', 'Maple', 'Jellybean', 'Bao', 'Poppy', 'Fig', 'Gizmo', 'Tofu'];
  const NAME_C = ['', '', '', 'the Brave', 'McFluff', 'von Snuggles', 'the Great', 'Sparklepaws', 'the Third', 'Fuzzbottom'];
  const randomName = () => [pick(NAME_A), pick(NAME_B), pick(NAME_C)].filter(Boolean).join(' ').slice(0, 24);

  /* the name tag grows with the name, and long names get a smaller font so the whole name shows */
  function fitName() {
    const el = $('#name'); const n = (el.value || el.placeholder || '').length;
    el.style.width = Math.max(8, Math.min(26, n + 1)) + 'ch';
    el.classList.toggle('long', n > 13 && n <= 18);
    el.classList.toggle('longer', n > 18);
  }

  /* ---------------- toast & celebrations ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
  }
  function celebrate(fxId = 'confetti') {
    const keep = state.fx.id;
    state.fx.id = fxId; renderStage(true); state.fx.id = keep;
    setTimeout(() => renderStage(false), 3200);
  }
  function reward(n, why) { if (n > 0) { renderWallet(true); toast(`+${n} stitches · ${why}`); } }

  /* ---------------- modals ---------------- */
  let lastFocus = null;
  function openModal(sel) { lastFocus = document.activeElement; const m = $(sel); m.hidden = false; m.scrollTop = 0; const b = m.querySelector('[data-close]'); b && b.focus({ preventScroll: true }); }
  function closeModal(m) { m.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus(); }
  function sheet(title, html, cls = '') {
    $('#sheetTitle').textContent = title;
    $('#sheetBody').innerHTML = html;
    $('#sheet').querySelector('.modal-card').className = 'modal-card ' + cls;
    openModal('#sheet');
  }

  /* ---------------- unlocking ---------------- */
  let pendingUnlock = null;
  function askUnlock(kind, obj, apply, preview) {
    pendingUnlock = { kind, obj, apply, preview };
    const can = PR.stitches >= obj.locked;
    sheet('Unlock it?', `<div class="unlock">
      <div class="unlock-art">${preview || ''}</div>
      <div><span class="rarity r-${TT.rarity(obj.locked).id}">${TT.rarity(obj.locked).name}</span><p class="unlock-name">${esc(obj.name)}</p>
      <p class="unlock-price">${priceTag(obj.locked)} <span>You have ${PR.stitches}</span></p>
      ${can ? `<button class="btn-big" type="button" data-unlock>Unlock for ${obj.locked} stitches</button>`
        : `<p class="modal-sub">You need ${obj.locked - PR.stitches} more stitches. Save up by doing style challenges (the daily one pays double!), games, fashion shows and photos. ${obj.locked - PR.stitches > 90 ? 'Special things take a few days to save for!' : ''}</p><button class="btn-soft" type="button" data-gochallenge>Do a challenge</button>`}
      </div></div>
      ${TT.canWheel(obj) ? `<div class="spin-offer">${WHEEL_ICON}<div><b>Feeling lucky?</b> Spin the wheel for ${TT.spinCost(obj)} stitches. If it lands on ${esc(obj.name)}, it's yours! <span>(1 in 10 chance)</span></div>
        <button class="btn-soft" type="button" data-wheel>Spin the wheel</button></div>` : ''}`, 'unlock-card');
  }
  function doUnlock() {
    if (!pendingUnlock) return;
    const { kind, obj, apply } = pendingUnlock;
    if (TT.unlock(kind, obj)) {
      closeModal($('#sheet'));
      renderWallet(); Sound.sparkle(); toast(`Unlocked ${obj.name}!`);
      apply(); celebrate('glitter');
    }
    pendingUnlock = null;
  }

  /* ---------------- lucky wheel ---------------- */
  const WHEEL_ICON = TT.svg([0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M0,0 L${(30 * Math.sin(i * Math.PI / 4)).toFixed(1)},${(-30 * Math.cos(i * Math.PI / 4)).toFixed(1)} A30,30 0 0 1 ${(30 * Math.sin((i + 1) * Math.PI / 4)).toFixed(1)},${(-30 * Math.cos((i + 1) * Math.PI / 4)).toFixed(1)}Z" fill="${['#ff9ec0', '#ffe17a', '#9ee6c0', '#cfa8ff'][i % 4]}" stroke="#5b3f58" stroke-width="2.5"/>`).join('') + TT.C(0, 0, 7, '#fffdf9', 3) + '<path d="M-6,-38 L6,-38 L0,-26Z" fill="#e64f7c" stroke="#5b3f58" stroke-width="2.5" stroke-linejoin="round"/>', '-36 -42 72 78', 'class="wheel-ic" aria-hidden="true"');
  const WHEEL_MISS = ['Oops!', 'So close!', 'Aww!', 'Next time', 'Almost!', 'Oh no!', 'Hmm…', 'Nope!', 'Try again'];
  const WHEEL_COLS = ['#ff9ec0', '#9cd3ff', '#9ee6c0', '#cfa8ff', '#ffb38a', '#9cd3ff', '#9ee6c0', '#ff9ec0', '#cfa8ff'];
  let wheelAngle = 0, wheelBusy = false;
  const pt = (deg, r) => { const a = deg * Math.PI / 180; return `${(r * Math.sin(a)).toFixed(2)},${(-r * Math.cos(a)).toFixed(2)}`; };
  function wheelPrizeArt(kind, obj, preview) {
    if (preview && /^<svg/.test(preview)) return preview.replace(/^<svg /, '<svg x="-24" y="-24" width="48" height="48" ');
    const hex = obj.hex || '#ffe17a';
    return TT.C(0, 0, 20, hex, 3);
  }
  function wheelSVG(kind, obj, preview) {
    let segs = '';
    for (let i = 0; i < 10; i++) {
      const a = i * 36, win = i === 0;
      segs += `<path d="M0,0 L${pt(a - 18, 100)} A100,100 0 0 1 ${pt(a + 18, 100)}Z" fill="${win ? '#ffe17a' : WHEEL_COLS[i - 1]}" stroke="#5b3f58" stroke-width="3"/>`;
      if (win) segs += `<g transform="rotate(${a})">${TT.star(0, -86, 7, '#fff', 0)}<g transform="translate(0 -60)">${TT.C(0, 0, 27, '#fffdf9', 3)}${wheelPrizeArt(kind, obj, preview)}</g></g>`;
      else segs += `<text transform="rotate(${a}) translate(0 -58) rotate(-90)" text-anchor="middle" dominant-baseline="middle" font-family="Sniglet, 'Baloo 2', sans-serif" font-weight="800" font-size="11.5" fill="#5b3f58">${WHEEL_MISS[i - 1]}</text>`;
    }
    for (let i = 0; i < 10; i++) segs += TT.C(+pt(i * 36 + 18, 93).split(',')[0], +pt(i * 36 + 18, 93).split(',')[1], 3.6, '#fffdf9', 2);
    return `<svg class="wheel" viewBox="-112 -118 224 230" role="img" aria-label="Prize wheel">
      <circle r="106" fill="#e64f7c" stroke="#5b3f58" stroke-width="4"/>
      <g id="wheelSpin" transform="rotate(${wheelAngle})">${segs}</g>
      <circle r="16" fill="#fffdf9" stroke="#5b3f58" stroke-width="4"/>${TT.heart(0, 2, 9, '#ff6f96', 2)}
      <g id="wheelPointer"><path d="M-12,-116 L12,-116 L0,-90Z" fill="#ff6f96" stroke="#5b3f58" stroke-width="3.5" stroke-linejoin="round"/></g></svg>`;
  }
  function openWheel() {
    if (!pendingUnlock) return;
    const { kind, obj } = pendingUnlock;
    wheelAngle = 0; wheelBusy = false;
    sheet('Lucky wheel', `<div class="wheel-wrap">
      <div class="wheel-box">${wheelSVG(kind, obj, pendingUnlock.preview)}</div>
      <div class="wheel-side">
        <p class="wheel-for">Spin to win</p><p class="unlock-name">${esc(obj.name)}</p>
        <p class="modal-sub">${TT.spinCost(obj)} stitches a spin. Land on the gold space and it's yours (1 in 10 chance).</p>
        <p class="wheel-msg" id="wheelMsg" role="status" aria-live="polite"></p>
        <div class="wheel-actions" id="wheelActions"></div>
      </div></div>`, 'wide-card wheel-card');
    wheelButtons();
  }
  function wheelButtons(won) {
    const box = $('#wheelActions'); if (!box || !pendingUnlock) return;
    const { obj } = pendingUnlock;
    if (won) { box.innerHTML = `<button class="btn-big" type="button" data-wear>Wear it!</button>`; return; }
    const cost = TT.spinCost(obj), canSpin = PR.stitches >= cost;
    box.innerHTML = `<button class="btn-big" type="button" data-spinnow ${canSpin ? '' : 'disabled'}>${wheelAngle ? 'Spin again' : 'Spin!'} <span class="price r-common">${SPOOL}${cost}</span></button>
      <p class="wheel-bal">You have <b>${PR.stitches}</b> stitches${canSpin ? '' : ` · you need ${cost - PR.stitches} more to spin`}</p>
      ${PR.stitches >= obj.locked ? `<button class="btn-soft" type="button" data-unlock>Or just unlock it for ${obj.locked}</button>` : ''}`;
  }
  function spinWheel() {
    if (wheelBusy || !pendingUnlock) return;
    const { kind, obj, apply } = pendingUnlock;
    const res = TT.spinFor(kind, obj);
    if (!res) return wheelButtons();
    wheelBusy = true; renderWallet();
    $('#wheelMsg').textContent = 'Spinning…';
    $('#wheelActions').querySelectorAll('button').forEach(b => { b.disabled = true; });
    // pick where it stops: the gold space if you won, any other space if not (never exactly on a line)
    const seg = res.win ? 0 : 1 + Math.floor(Math.random() * 9);
    const from = wheelAngle;
    const base = Math.ceil(from / 360) * 360 + 360 * (5 + Math.floor(Math.random() * 2));
    const to = base + (360 - seg * 36) % 360 + (Math.random() * 24 - 12);
    const dur = 5200 + Math.random() * 900;
    const t0 = performance.now();
    const ease = k => 1 - Math.pow(1 - k, 4);
    let lastPeg = Math.floor((from + 18) / 36);
    Sound.whoosh();
    const g = $('#wheelSpin'), ptr = $('#wheelPointer');
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      wheelAngle = from + (to - from) * ease(k);
      if (g && g.isConnected) g.setAttribute('transform', `rotate(${wheelAngle.toFixed(2)})`);
      const peg = Math.floor((wheelAngle + 18) / 36);
      if (peg !== lastPeg) {
        lastPeg = peg; Sound.tone(1250 + Math.random() * 120, 0.025, 'square', 0.04);
        if (ptr && ptr.isConnected) { ptr.classList.remove('flick'); void ptr.getBoundingClientRect(); ptr.classList.add('flick'); }
      }
      if (k < 1) return requestAnimationFrame(step);
      wheelBusy = false; wheelAngle = to % 360;
      renderDrawer(); renderTabs();
      const msg = $('#wheelMsg');
      if (res.win) {
        if (msg) msg.innerHTML = `<b>You won ${esc(obj.name)}!</b> It's yours to keep.`;
        Sound.cheer(); toast(`You won ${obj.name}!`);
        if (!$('#sheet').hidden) { celebrate('glitter'); wheelButtons(true); } else apply();
      } else {
        if (msg) msg.textContent = `${WHEEL_MISS[seg - 1].replace('…', '')} Not this time.`;
        Sound.undo(); wheelButtons();
      }
    };
    requestAnimationFrame(step);
  }

  /* ---------------- challenges ---------------- */
  function setChallenge(ch, daily) {
    challenge = { ch, daily };
    $('#challengeText').textContent = ch.text;
    $('#challengeLabel').innerHTML = daily ? `Daily challenge${PR.streak ? ` · <span class="streak">🔥 ${PR.streak}-day streak</span>` : ''}${TT.dailyDone() ? ' · done today ✓' : ''}` : 'Style challenge';
    $('#challenge').hidden = false;
    $('#challenge').classList.toggle('daily', !!daily);
  }
  function openChallengePicker() {
    const d = TT.dailyChallenge();
    sheet('Style challenges', `<button class="daily-card" type="button" data-pickdaily>
        <span class="daily-tag">Today's daily challenge · pays double</span>
        <strong>${esc(d.text)}</strong>
        <span>${TT.dailyDone() ? 'Done today ✓ (you can still improve your score)' : `Keep your streak going${PR.streak ? `: 🔥 ${PR.streak} days` : '!'}`}</span></button>
      <div class="row-label">Or pick any challenge</div>
      <div class="ch-list">${TT.CHALLENGES.map(c => `<button class="mini ch-pick" type="button" data-pick="${c.id}">${esc(c.text)}</button>`).join('')}</div>
      <button class="btn-soft" type="button" data-pickrandom>Surprise challenge</button>`, 'wide-card');
  }
  function judgeNow() {
    if (!challenge) return;
    const res = TT.judge(state, challenge.ch);
    const rw = TT.rewardChallenge(challenge.ch.id, res.stars, challenge.daily);
    const words = ['', 'Good start!', 'Getting there!', 'Stylish!', 'Fabulous!', 'Perfect match!'][res.stars];
    sheet('The judge says…', `<div class="score">
      <div class="stars" aria-label="${res.stars} out of 5 stars">${'★'.repeat(res.stars)}<span>${'★'.repeat(5 - res.stars)}</span></div>
      <p class="score-word">${words} <b>${res.score}</b>/100</p>
      <p class="score-ch">${esc(challenge.ch.text)}</p>
      <ul class="score-lines">${res.lines.map(l => `<li class="${l.good ? 'ok' : 'tip'}"><span>${l.good ? '✓' : '✎'}</span><div>${esc(l.msg)}</div><b>${l.pts}/${l.w}</b></li>`).join('')}</ul>
      <p class="score-earn">${rw.earned ? `${SPOOL} +${rw.earned} stitches` : ''}${rw.streakUp ? ` · 🔥 ${rw.streak}-day streak!` : ''}</p>
      ${earnNote(rw, challenge.daily)}
      <div class="score-actions"><button class="btn-soft" type="button" data-close>Keep styling</button><button class="btn-big" type="button" data-newch>New challenge</button></div></div>`, 'score-card');
    if (res.stars >= 4) { Sound.cheer(); celebrate('confetti'); } else Sound.sparkle();
    if (rw.earned) renderWallet(true);
    if (challenge.daily) setChallenge(challenge.ch, true);
  }

  function earnNote(rw, daily) {
    const msg = {
      low: `Score ${TT.MIN_SCORE} or more (${TT.MIN_STARS} stars) to earn stitches. Follow the tips above and try again!`,
      nobetter: 'You already earned stitches for this score today. Get more stars to earn more.',
      cap: `You've earned today's ${TT.DAILY_CAP} challenge stitches. Come back tomorrow, or try the daily challenge!`,
      capped: `That's the last of today's ${TT.DAILY_CAP} challenge stitches. The daily challenge still pays!`
    }[rw.reason];
    const left = !daily && !rw.reason ? `<p class="score-note">${rw.capLeft} challenge stitches left to earn today.</p>` : '';
    return msg ? `<p class="score-note">${msg}</p>` : left;
  }

  /* ---------------- closet, shows & group photos ---------------- */
  const closetKey = 'tinytailors.closet';
  let closet = store.get(closetKey, []).map(sanitize).slice(0, 30);
  let closetMode = null; // null | 'show' | 'group'
  let picked = [];
  function renderCloset() {
    $('#closetCount').textContent = closet.length;
    const g = $('#closetGrid');
    const bar = $('#closetBar');
    if (closetMode) {
      const [min, max] = closetMode === 'show' ? [2, 5] : [2, 4];
      bar.innerHTML = `<span>${closetMode === 'show' ? 'Pick 2 to 5 models for the runway' : 'Pick 2 to 4 friends for the photo'} · ${picked.length} picked</span>
        <button class="btn-big" type="button" data-start ${picked.length < min || picked.length > max ? 'disabled' : ''}>${closetMode === 'show' ? 'Start the show!' : 'Take the photo'}</button>
        <button class="mini ghost" type="button" data-cancel>Cancel</button>`;
    } else {
      bar.innerHTML = `<button class="btn-soft" type="button" data-mode="show">${TT.svg(TT.star(12, 12, 10, '#ffe17a', 1.6), '0 0 24 24')}Fashion show</button>
        <button class="btn-soft" type="button" data-mode="group">${TT.svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="#5b3f58" stroke-width="2"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="#5b3f58" stroke-width="2"/>', '0 0 24 24')}Group photo</button>`;
    }
    if (!closet.length) { g.innerHTML = '<div class="empty">No saved looks yet. Tap “Save look” to hang one up here.</div>'; return; }
    g.innerHTML = closet.map((s, i) => {
      const n = picked.indexOf(i);
      return `<div class="look${n >= 0 ? ' picked' : ''}"><button class="look-open" data-i="${i}" type="button" aria-label="${closetMode ? 'Pick' : 'Wear'} ${esc(s.name || 'this look')}">${TT.svg(TT.compose(s, { pfx: `cl${i}-`, animated: false }), '0 0 400 460')}<span>${esc(s.name || 'No name yet')}</span></button>
      ${closetMode ? (n >= 0 ? `<i class="pick-num">${n + 1}</i>` : '') : `<button class="del" data-del="${i}" type="button" aria-label="Remove ${esc(s.name || 'this look')}">✕</button>`}</div>`;
    }).join('');
  }
  function startCloset() {
    const looks = picked.map(i => closet[i]);
    const mode = closetMode;
    closetMode = null; picked = [];
    closeModal($('#closet'));
    if (mode === 'show') {
      TT.runFashionShow(looks, { onEnd: n => { if (n) renderWallet(true); } });
    } else {
      const inner = TT.groupPhotoSVG(looks, looks[0].scene.id);
      photoFrom(inner, 600, 460, looks.map(l => l.name || 'Pal').join(' & ').slice(0, 40), 'group');
    }
  }

  /* ---------------- photos ---------------- */
  async function photoFrom(inner, vw, vh, caption, kind) {
    Sound.shutter();
    $('#stageCard').animate([{ filter: 'brightness(1.8)' }, { filter: 'none' }], { duration: 350 });
    const scale = 2, pad = 40, W = vw * scale + pad * 2, H = vh * scale + pad * 2 + 160;
    const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H;
    const g = cvs.getContext('2d');
    const svg = TT.svg(inner, `0 0 ${vw} ${vh}`, `width="${vw * scale}" height="${vh * scale}"`);
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    try { await img.decode(); } catch (e) { await new Promise(r => { img.onload = r; img.onerror = r; }); }
    try { await document.fonts.load('800 48px Sniglet'); await document.fonts.load('700 24px "Baloo 2"'); } catch (e) { }
    g.fillStyle = '#fffdf9'; roundRect(g, 0, 0, W, H, 48); g.fill();
    g.lineWidth = 6; g.strokeStyle = '#5b3f58'; roundRect(g, 3, 3, W - 6, H - 6, 46); g.stroke();
    g.save(); roundRect(g, pad, pad, vw * scale, vh * scale, 30); g.clip(); g.drawImage(img, pad, pad, vw * scale, vh * scale); g.restore();
    g.lineWidth = 5; roundRect(g, pad, pad, vw * scale, vh * scale, 30); g.stroke();
    g.setLineDash([12, 10]); g.strokeStyle = '#f4b3c8'; g.lineWidth = 4; roundRect(g, 18, 18, W - 36, H - 36, 36); g.stroke(); g.setLineDash([]);
    g.textAlign = 'center';
    g.fillStyle = '#e64f7c'; g.font = '800 52px Sniglet, "Baloo 2", sans-serif';
    g.fillText(caption || 'My critter', W / 2, H - 92);
    g.fillStyle = '#8a6f88'; g.font = '700 26px "Baloo 2", sans-serif';
    g.fillText('Tailored at Tiny Tailors', W / 2, H - 50);
    let url;
    try { url = cvs.toDataURL('image/png'); } catch (e) { url = img.src; }
    $('#photoImg').src = url;
    const a = $('#photoDownload');
    if (a) { a.href = url; a.download = `${(caption || 'tiny-tailors').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`; }
    openModal('#photoModal');
    reward(TT.dailyBonus(kind === 'group' ? 'group' : 'photo', 3), kind === 'group' ? 'first group photo today' : 'first photo today');
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* ---------------- dance ---------------- */
  function dance() {
    if (danceTimer) return stopDance();
    Sound.startMusic();
    $('#dance').classList.add('on'); $('#dance').querySelector('.txt').textContent = 'Stop';
    let i = 0, beats = 0;
    const step = () => {
      dancePose = TT.itemOf('pose', TT.DANCE[i % TT.DANCE.length]);
      renderStage(true); i++; beats++;
      if (beats > 16) stopDance();
    };
    step();
    danceTimer = setInterval(step, 520);
  }
  function stopDance() {
    clearInterval(danceTimer); danceTimer = null; dancePose = null; Sound.stopMusic();
    $('#dance').classList.remove('on'); $('#dance').querySelector('.txt').textContent = 'Dance!';
    renderStage(false);
  }

  /* ---------------- pet dragging ---------------- */
  function bindPetDrag() {
    const svg = $('#stage');
    let drag = null;
    const toSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
    svg.addEventListener('pointerdown', e => {
      const petG = e.target.closest && e.target.closest('#st-pet');
      if (!petG) return;
      e.preventDefault();
      const p = toSvg(e);
      const start = state.petPos || { x: 0, y: 0 };
      drag = { p, start, g: petG, moved: false };
      svg.setPointerCapture(e.pointerId);
      petG.classList.add('dragging');
    });
    svg.addEventListener('pointermove', e => {
      if (!drag) return;
      const p = toSvg(e);
      const x = Math.max(-50, Math.min(300, drag.start.x + p.x - drag.p.x));
      const y = Math.max(-380, Math.min(20, drag.start.y + p.y - drag.p.y));
      drag.cur = { x: Math.round(x), y: Math.round(y) }; drag.moved = true;
      drag.g.setAttribute('transform', `translate(${drag.cur.x} ${drag.cur.y})`);
    });
    const end = () => {
      if (!drag) return;
      if (drag.moved && drag.cur) { state.petPos = drag.cur; Sound.pop(); commit({ drawer: false, pop: false }); }
      drag = null;
    };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  }

  /* ---------------- share ---------------- */
  function shareLink(code) { return location.origin && location.origin !== 'null' ? `${location.origin}${location.pathname}#look=${code}` : ''; }
  function openShare() {
    const code = TT.encodeLook(state);
    const link = shareLink(code);
    sheet('Share your look', `<p class="modal-sub">Send this code to a friend. They tap <b>Menu → Share &amp; codes</b> in Tiny Tailors and paste it in.</p>
      <div class="code-box"><code id="shareCode">${esc(code)}</code><button class="mini" type="button" data-copy="${esc(code)}">Copy code</button></div>
      ${link && /^https?:/.test(link) ? `<div class="code-box"><code class="link">${esc(link)}</code><button class="mini" type="button" data-copy="${esc(link)}">Copy link</button></div>` : ''}
      <div class="row-label">Got a code from a friend?</div>
      <form class="code-in" id="codeForm"><input id="codeInput" class="text-in" placeholder="Paste a TT1- code" autocomplete="off" aria-label="Look code"><button class="btn-big" type="submit">Try it on</button></form>
      <p class="code-err" id="codeErr" role="alert"></p>`, 'wide-card');
    reward(TT.dailyBonus('share', 2), 'sharing a look');
  }
  function loadCode(text) {
    const st = TT.decodeLook(text);
    // keep any fabric that came with the code
    Object.values(TT.sharedFabrics).forEach(f => { if (f.id !== 'fab-preview' && !TT.allFabrics().some(x => x.id === f.id)) { PR.fabrics.push({ id: f.id, name: f.name, px: f.px }); } });
    TT.saveProgress();
    state = sanitize(Object.assign(clone(DEFAULT), st));
    commit({ tabs: true, force: true });
    toast(`Wearing ${state.name || 'a shared look'}!`);
  }

  /* ---------------- full-screen critter ---------------- */
  // only use the address-bar trick when the app is its own page (not inside a preview frame)
  const canHash = (() => { try { return window.top === window; } catch (e) { return false; } })();
  let viewHash = false; // true once the browser really moved to #view (so the phone's back gesture can close it)
  function renderViewer() {
    if ($('#viewer').hidden) return;
    $('#viewerSvg').innerHTML = TT.compose(state, { pfx: 'fs-', pose: dancePose || undefined });
    $('#viewerName').textContent = state.name || '';
  }
  function openViewer() {
    viewHash = false;
    try { if (canHash && location.hash !== '#view') location.hash = 'view'; } catch (e) { }
    $('#viewer').hidden = false;
    document.body.classList.add('viewing');
    renderViewer(); Sound.whoosh();
    // real full screen where the browser allows it (computers, Android); iPhone uses the in-app view
    const el = document.documentElement;
    try { if (el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().catch(() => { }); } catch (e) { }
    $('#viewer').querySelector('[data-viewback]').focus({ preventScroll: true });
  }
  function closeViewer() {
    if ($('#viewer').hidden) return;
    $('#viewer').hidden = true;
    document.body.classList.remove('viewing');
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { }); } catch (e) { }
    $('#sizeBtn').focus({ preventScroll: true });
  }
  function leaveViewer() { const useBack = viewHash && location.hash === '#view'; closeViewer(); if (useBack) { viewHash = false; try { window.history.back(); } catch (e) { } } }

  /* ---------------- paper doll & coloring page ---------------- */
  let dollPNG = null, dollColoring = false, dollJob = 0, dollHash = false;
  async function openDoll(coloring) {
    dollColoring = coloring;
    if ($('#dollModal').hidden) { dollHash = false; try { if (canHash && location.hash !== '#doll') location.hash = 'doll'; } catch (e) { } }
    openModal('#dollModal');
    window.scrollTo(0, 0);
    $('#dollModal').querySelectorAll('[data-dollmode]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.dollmode === 'coloring') === coloring));
    $('#dollTitle').textContent = coloring ? 'Coloring page' : 'Paper doll';
    $('#dollImg').hidden = true; $('#dollWait').hidden = false; dollPNG = null;
    const job = ++dollJob;
    try { await document.fonts.load('800 32px Sniglet'); await document.fonts.load('600 14px "Baloo 2"'); } catch (e) { }
    const { svg } = TT.paperDollSVG(state, coloring);
    const png = await TT.pageToPNG(svg, 2);
    if (job !== dollJob) return;
    dollPNG = png;
    $('#dollImg').src = png; $('#dollImg').hidden = false; $('#dollWait').hidden = true;
    $('#printImg').src = png;
  }
  const dollFile = ext => `${(state.name || 'tiny-tailors').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${dollColoring ? 'coloring-page' : 'paper-doll'}.${ext}`;
  function saveFile(url, name) {
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  async function dollAction(kind) {
    if (!dollPNG) return;
    if (kind === 'print') {
      $('#printImg').src = dollPNG;
      document.body.classList.add('printing');
      setTimeout(() => { try { window.print(); } catch (e) { } }, 60);
      const done = () => { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      setTimeout(done, 4000);
      $('#dollTip').textContent = 'If the print window didn’t open, use Save PDF and print that file.';
    } else if (kind === 'png') {
      saveFile(dollPNG, dollFile('png'));
      $('#dollTip').textContent = 'Saved a picture. If nothing downloaded, press and hold the picture to save it.';
    } else if (kind === 'pdf') {
      $('#dollTip').textContent = 'Making your PDF…';
      try { await TT.pngToPDF(dollPNG, dollFile('pdf')); $('#dollTip').textContent = 'Saved a PDF. Open it and print!'; }
      catch (e) { saveFile(dollPNG, dollFile('png')); $('#dollTip').textContent = 'Couldn’t make a PDF right now, so we saved a picture instead. You can print that too.'; }
    }
    Sound.pop();
  }

  /* ---------------- games ---------------- */
  function openGames() {
    stopDanceIf();
    TT.openGames({ look: () => clone(state), wallet: () => renderWallet(true), onClose: () => { renderWallet(); renderDrawer(); $('#gamesBtn').focus({ preventScroll: true }); } });
  }

  /* ---------------- suggest an idea ---------------- */
  const IDEA_KINDS = [['critter', 'A critter'], ['clothes', 'Clothes'], ['accessory', 'Hat or accessory'], ['pet', 'A pet pal'], ['scene', 'A scene'], ['challenge', 'A challenge'], ['other', 'Something else']];
  function openSuggest() {
    sheet('Suggest an idea', `<form id="ideaForm" class="idea-form" novalidate>
      <p class="modal-sub">Is there a critter, outfit or anything else you wish Tiny Tailors had? Tell us! Ask a grown-up before you send it.</p>
      <fieldset class="idea-kinds"><legend class="row-label">What kind of idea?</legend>
        ${IDEA_KINDS.map(([v, l], i) => `<label class="idea-kind"><input type="radio" name="ideaKind" value="${v}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</fieldset>
      <label class="row-label" for="ideaText">Your idea</label>
      <textarea id="ideaText" class="text-area" maxlength="400" rows="3" placeholder="A sloth in a cozy rainbow sweater!" required></textarea>
      <label class="row-label" for="ideaMore">Anything else? <em>(optional)</em></label>
      <textarea id="ideaMore" class="text-area" maxlength="600" rows="2" placeholder="Colors, what it should hold, where it lives…"></textarea>
      <label class="set-row idea-look"><input type="checkbox" id="ideaLook" checked><span><b>Send my critter's look too</b><em>So we can see what you're imagining</em></span></label>
      <input type="text" name="website" id="ideaHp" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
      <p class="idea-safe">Please don't write your name, address, school or any other personal info.</p>
      <div class="idea-actions"><button class="btn-big" type="submit" id="ideaSend">Send my idea</button></div>
      <p class="code-err" id="ideaMsg" role="status"></p></form>`, 'wide-card');
  }
  async function sendIdea(form) {
    const kind = (form.querySelector('input[name=ideaKind]:checked') || {}).value || 'other';
    const idea = $('#ideaText').value.trim(), details = $('#ideaMore').value.trim();
    const msg = $('#ideaMsg'), btn = $('#ideaSend');
    if (idea.length < 3) { msg.textContent = 'Please tell us your idea first.'; $('#ideaText').focus(); return; }
    btn.disabled = true; btn.textContent = 'Sending…'; msg.textContent = '';
    const payload = { kind, idea, details, website: $('#ideaHp').value, look: $('#ideaLook').checked ? TT.encodeLook(state) : '', site: location.origin && /^https:/.test(location.origin) ? location.origin + location.pathname.replace(/index\.html$/, '') : '' };
    try {
      const r = await fetch('api/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.error || 'Couldn’t send right now. Please try again later.');
      $('#sheetBody').innerHTML = `<div class="idea-thanks">${TT.svg(TT.heart(50, 52, 34, '#ff6f96', 5) + TT.star(84, 18, 10, '#ffe17a', 3) + TT.star(16, 24, 7, '#9ee6c0', 3), '0 0 100 100')}
        <p class="unlock-name">Thank you!</p><p class="modal-sub">Your idea was sent to the Tiny Tailors team. Keep an eye out, it might show up in the app one day!</p>
        <button class="btn-big" type="button" data-close>Back to dressing up</button></div>`;
      Sound.cheer();
    } catch (e) {
      const offline = /Failed to fetch|NetworkError|Load failed|Unexpected/.test(e.message) || location.protocol === 'file:';
      msg.textContent = offline ? 'Ideas can only be sent from the Tiny Tailors website. Please try again there!' : e.message;
      btn.disabled = false; btn.textContent = 'Send my idea'; Sound.undo();
    }
  }

  /* ---------------- settings ---------------- */
  function applySettings() {
    const s = PR.settings;
    Sound.on = s.sound;
    document.body.classList.toggle('calm', !!s.calm);
    document.body.classList.toggle('big', !!s.big);
    $('#soundBtn').setAttribute('aria-pressed', s.sound);
  }
  function openSettings() {
    const s = PR.settings;
    const row = (k, label, sub) => `<label class="set-row"><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''}><span><b>${label}</b><em>${sub}</em></span></label>`;
    const u = TT.countUnlockables();
    sheet('Settings', row('sound', 'Sound effects', 'Pops, sparkles and music') + row('speak', 'Read names out loud', 'Says each item’s name when you tap it') +
      row('calm', 'Calm mode', 'Turns off bouncing and falling effects') + row('big', 'Bigger buttons', 'Easier tapping for little fingers') +
      `<p class="modal-sub">You've unlocked ${u.got} of ${u.total} special items.</p>`);
  }

  /* ---------------- title screen ---------------- */
  function renderParade() {
    const looks = [0, 1, 2].map(() => { const s = randomLook(DEFAULT, false); s.fx.id = null; s.pet.id = null; return s; });
    $('#parade').innerHTML = looks.map((s, i) => TT.svg(TT.compose(s, { pfx: `pa${i}-`, scene: false }), '40 0 320 440')).join('');
  }
  function startStudio() {
    Sound.wake(); Sound.whoosh();
    $('#title').hidden = true; $('#app').hidden = false;
    renderTabs(); renderDrawer(); renderStage(true); renderCloset(); renderWallet(); measurePins();
    if (!store.get('tinytailors.welcomed', false)) {
      store.set('tinytailors.welcomed', true);
      setTimeout(() => toast(`You have ${PR.stitches} stitches to start. Save up for 🔒 goodies!`), 900);
    }
  }

  /* ---------------- events ---------------- */
  function applyItem(slot, val) {
    if (slot === 'pose') { state.pose = { id: val }; }
    else state[slot].id = val || null;
    const it = val ? TT.itemOf(slot, val) : null;
    if (PR.settings.speak) Sound.say(it ? it.name : 'none');
    Sound.pop(); commit({ tabs: slot === 'animal' });
  }
  function bind() {
    $('#play').addEventListener('click', startStudio);
    $('#home').addEventListener('click', () => { stopDance(); $('#app').hidden = true; $('#title').hidden = false; renderParade(); });

    $('#tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      activeTab = b.dataset.tab; store.set('tinytailors.tab', activeTab); Sound.tap();
      query = ''; $('#search').value = '';
      $('#tabs').querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === activeTab));
      renderDrawer(); $('#drawer').scrollTop = 0;
      if (window.innerWidth <= 900) { const w = document.querySelector('.wardrobe'); const pin = parseFloat(getComputedStyle(document.querySelector('.tabs')).top) || 0; const y = w.getBoundingClientRect().top + window.scrollY - pin; window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); }
    });
    $('#tabs').addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = TABS.findIndex(t => t.id === activeTab), n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
      $('#tab-' + TABS[n].id).click(); $('#tab-' + TABS[n].id).focus();
    });
    $('#search').addEventListener('input', e => { query = e.target.value; renderDrawer(); });

    $('#drawerBody').addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'INPUT') return;
      const { act, slot, val } = b.dataset;
      if (act === 'item') {
        const it = val ? TT.itemOf(slot, val) : null;
        if (it && lockedItem(slot, it)) return askUnlock(kindOf(slot), it, () => applyItem(slot, val), TT.thumb(slot, it, state));
        applyItem(slot, val);
      } else if (act === 'mood') {
        const m = TT.MOODS.find(x => x.id === val);
        state.eyes.id = m.eyes; state.mouth.id = m.mouth; state.blush.id = m.blush;
        if (PR.settings.speak) Sound.say(m.name);
        Sound.pop(); commit();
      } else if (act === 'color' || act === 'color2') {
        const pal = TT.SLOTS[slot].palette;
        const p = pal.find(x => x.id === val);
        const kind = slot === 'animal' ? 'fur' : 'color';
        const apply = () => { state[slot][act] = val || null; Sound.swatch(); commit({ tabs: false }); };
        if (p && p.locked && TT.isLocked(kind, p)) return askUnlock(kind, p, apply, `<div class="big-swatch" style="background:${p.hex}"></div>`);
        apply();
      } else if (act === 'pattern') {
        const p = TT.PATTERNS.find(x => x.id === val);
        const apply = () => { state[slot].pattern = val; Sound.swatch(); commit(); };
        if (p && p.locked && TT.isLocked('pattern', p)) {
          const id = 'unl-pat'; const base = TT.colorHex(slot, state[slot].color);
          return askUnlock('pattern', p, apply, TT.svg(`<defs>${TT.patternDef(id, p.id, base)}</defs><rect width="80" height="80" rx="16" fill="url(#${id})"/>`, '0 0 80 80'));
        }
        apply();
      } else if (act === 'designfabric') {
        TT.openFabricStudio({ onSave: id => { state[slot].pattern = id; }, onDone: () => { commit({ force: true }); } });
      } else if (act === 'lock') {
        locks.has(slot) ? locks.delete(slot) : locks.add(slot);
        store.set('tinytailors.locks', [...locks]); Sound.tap();
        renderDrawer(); renderTabs();
        toast(locks.has(slot) ? `${TT.SLOTS[slot].label} locked` : `${TT.SLOTS[slot].label} unlocked`);
      } else if (act === 'fav') {
        const on = TT.toggleFav(slot, state[slot].id); Sound.tap(); renderDrawer(); toast(on ? 'Added to Faves ★' : 'Removed from Faves');
      }
    });
    // colour mixer (native colour picker)
    $('#drawerBody').addEventListener('input', e => {
      const t = e.target; if (!t.matches('input[type=color]')) return;
      state[t.dataset.slot][t.dataset.which] = t.value.toLowerCase();
      renderStage(false);
    });
    $('#drawerBody').addEventListener('change', e => {
      const t = e.target; if (!t.matches('input[type=color]')) return;
      state[t.dataset.slot][t.dataset.which] = t.value.toLowerCase(); Sound.swatch(); commit();
    });

    $('#surprise').addEventListener('click', () => {
      stopDanceIf(); state = randomLook(state); Sound.sparkle();
      const btn = $('#surprise'); btn.classList.remove('spin'); void btn.offsetWidth; btn.classList.add('spin');
      commit({ tabs: true });
    });
    $('#dance').addEventListener('click', dance);
    $('#undo').addEventListener('click', () => { if (hIndex > 0) { hIndex--; state = JSON.parse(history[hIndex]); Sound.undo(); renderStage(true); renderDrawer(); renderTabs(); } });
    $('#redo').addEventListener('click', () => { if (hIndex < history.length - 1) { hIndex++; state = JSON.parse(history[hIndex]); Sound.pop(); renderStage(true); renderDrawer(); renderTabs(); } });

    $('#name').addEventListener('input', e => { state.name = e.target.value; fitName(); store.set('tinytailors.current', state); });
    $('#name').addEventListener('change', () => commit({ pop: false, drawer: false }));
    $('#nameDice').addEventListener('click', () => { state.name = randomName(); Sound.pop(); commit({ drawer: false }); });

    $('#soundBtn').addEventListener('click', () => {
      PR.settings.sound = !PR.settings.sound; TT.saveProgress(); applySettings();
      if (PR.settings.sound) { Sound.wake(); Sound.tap(); } else Sound.stopMusic();
    });
    $('#wallet').addEventListener('click', () => {
      const u = TT.countUnlockables();
      sheet('Your stitches', `<div class="wallet-big">${SPOOL}<b>${PR.stitches}</b></div>
        <p class="modal-sub">Spend stitches on anything with a 🔒. You've unlocked ${u.got} of ${u.total}.</p>
        <div class="tiers"><span class="rarity r-common">Common · under 80</span><span class="rarity r-rare">Rare · 80+</span><span class="rarity r-super">Super rare · 150+</span><span class="rarity r-legend">Legendary · 220+</span></div>
        <ul class="earn-list"><li><b>Daily challenge</b> 6 stitches a star when you get 3 stars or more, plus a streak bonus</li><li><b>Any challenge</b> 3 stitches a star when you get 3 stars or more, up to ${TT.DAILY_CAP} a day (${TT.challengeCapLeft()} left today)</li>
        <li><b>Fashion show</b> 8 stitches, twice a day</li><li><b>Photos</b> 3 for your first photo and 3 for your first group photo each day</li><li><b>Games</b> up to ${TT.GAME_EACH} per game when you get 3 stars or more, up to ${TT.GAME_CAP} a day (${TT.gamesLeftToday()} left today)</li><li><b>Sharing a look</b> 2 a day</li></ul>
        <button class="btn-big" type="button" data-gochallenge>Earn stitches now</button>`);
    });

    $('#photo').addEventListener('click', () => photoFrom(TT.compose(state, { pfx: 'ph-', animated: false }), 400, 460, state.name || 'My critter', 'photo'));
    $('#save').addEventListener('click', () => {
      closet.unshift(clone(state)); closet = closet.slice(0, 30);
      const ok = store.set(closetKey, closet);
      renderCloset(); Sound.sparkle(); toast(ok ? 'Hung up in your closet!' : 'Saved until you close this page');
      reward(TT.dailyBonus('save', 2), 'first saved look today');
    });
    $('#closetBtn').addEventListener('click', () => { closetMode = null; picked = []; renderCloset(); openModal('#closet'); });
    $('#closet').addEventListener('click', e => {
      const t = e.target;
      const del = t.closest('[data-del]');
      if (del) { closet.splice(+del.dataset.del, 1); store.set(closetKey, closet); renderCloset(); Sound.undo(); return; }
      const mode = t.closest('[data-mode]'); if (mode) { closetMode = mode.dataset.mode; picked = []; renderCloset(); Sound.tap(); return; }
      if (t.closest('[data-cancel]')) { closetMode = null; picked = []; renderCloset(); return; }
      if (t.closest('[data-start]')) { startCloset(); return; }
      const open = t.closest('.look-open');
      if (open) {
        const i = +open.dataset.i;
        if (closetMode) { const k = picked.indexOf(i); k >= 0 ? picked.splice(k, 1) : picked.push(i); Sound.tap(); renderCloset(); return; }
        state = clone(closet[i]); closeModal($('#closet')); Sound.whoosh(); commit({ tabs: true, force: true });
      }
    });

    // menu
    $('#menuBtn').addEventListener('click', e => { e.stopPropagation(); const m = $('#menu'); m.hidden = !m.hidden; $('#menuBtn').setAttribute('aria-expanded', !m.hidden); });
    document.addEventListener('click', e => { if (!e.target.closest('#menu') && !e.target.closest('#menuBtn')) { $('#menu').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); } });
    $('#menu').addEventListener('click', e => {
      const b = e.target.closest('[data-menu]'); if (!b) return;
      $('#menu').hidden = true;
      const k = b.dataset.menu;
      if (k === 'games') openGames();
      if (k === 'suggest') openSuggest();
      if (k === 'share') openShare();
      if (k === 'fabric') TT.openFabricStudio({ onDone: () => renderDrawer() });
      if (k === 'doll' || k === 'coloring') openDoll(k === 'coloring');
      if (k === 'settings') openSettings();
      if (k === 'home') $('#home').click();
    });

    // shared sheet (unlock, challenges, share, settings)
    $('#sheet').addEventListener('click', e => {
      const t = e.target;
      if (t === $('#sheet') || t.closest('[data-close]')) return closeModal($('#sheet'));
      if (t.closest('[data-unlock]')) return doUnlock();
      if (t.closest('[data-wheel]')) { Sound.tap(); return openWheel(); }
      if (t.closest('[data-spinnow]')) return spinWheel();
      if (t.closest('[data-wear]')) { const p = pendingUnlock; closeModal($('#sheet')); pendingUnlock = null; if (p) p.apply(); return; }
      if (t.closest('[data-gochallenge]')) { closeModal($('#sheet')); return openChallengePicker(); }
      if (t.closest('[data-pickdaily]')) { setChallenge(TT.dailyChallenge(), true); closeModal($('#sheet')); Sound.tap(); return; }
      const pk = t.closest('[data-pick]'); if (pk) { setChallenge(TT.CHALLENGES.find(c => c.id === pk.dataset.pick), false); closeModal($('#sheet')); Sound.tap(); return; }
      if (t.closest('[data-pickrandom]')) { setChallenge(pick(TT.CHALLENGES), false); closeModal($('#sheet')); Sound.tap(); return; }
      if (t.closest('[data-newch]')) { closeModal($('#sheet')); return openChallengePicker(); }
      const cp = t.closest('[data-copy]');
      if (cp) {
        const text = cp.dataset.copy;
        const done = () => { cp.textContent = 'Copied!'; setTimeout(() => { cp.textContent = 'Copy'; }, 1400); };
        try { navigator.clipboard.writeText(text).then(done, () => selectText(cp.previousElementSibling)); } catch (err) { selectText(cp.previousElementSibling); }
      }
    });
    $('#sheet').addEventListener('change', e => {
      const t = e.target; if (!t.matches('[data-set]')) return;
      PR.settings[t.dataset.set] = t.checked; TT.saveProgress(); applySettings();
      if (t.dataset.set === 'speak' && t.checked) Sound.say('Hello! I will read names out loud.');
    });
    $('#sheet').addEventListener('submit', e => {
      if (e.target.id === 'ideaForm') { e.preventDefault(); sendIdea(e.target); return; }
      if (e.target.id !== 'codeForm') return;
      e.preventDefault();
      try { loadCode($('#codeInput').value); closeModal($('#sheet')); Sound.whoosh(); }
      catch (err) { $('#codeErr').textContent = err.message && err.message.length > 12 ? err.message : 'Hmm, that code didn’t work. Check that you copied all of it.'; Sound.undo(); }
    });

    // the paper doll window works like its own page: Back (or the phone's back gesture) returns to the studio
    const closeDoll = () => { if (!$('#dollModal').hidden) closeModal($('#dollModal')); };
    window.addEventListener('hashchange', () => {
      if (location.hash === '#doll') { if (!$('#dollModal').hidden) dollHash = true; return; }
      if (dollHash) { dollHash = false; closeDoll(); }
    });
    $('#dollModal').addEventListener('click', e => {
      if (e.target === $('#dollModal') || e.target.closest('[data-dollback]')) {
        const useBack = dollHash && location.hash === '#doll';
        closeDoll();
        if (useBack) { dollHash = false; try { window.history.back(); } catch (err) { } }
        return;
      }
      const m = e.target.closest('[data-dollmode]'); if (m) return openDoll(m.dataset.dollmode === 'coloring');
      const a = e.target.closest('[data-dollact]'); if (a) return dollAction(a.dataset.dollact);
    });
    $('#gamesBtn').addEventListener('click', openGames);
    $('#challengeBtn').addEventListener('click', openChallengePicker);
    $('#challengeDone').addEventListener('click', judgeNow);
    $('#challengeNew').addEventListener('click', openChallengePicker);
    $('#challengeClose').addEventListener('click', () => { $('#challenge').hidden = true; challenge = null; });

    document.querySelectorAll('.modal').forEach(m => {
      if (m.id === 'sheet' || m.id === 'closet') return;
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
    });
    $('#closet').addEventListener('click', e => { if (e.target === $('#closet') || e.target.closest('[data-close]')) closeModal($('#closet')); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !$('#viewer').hidden) { leaveViewer(); return; }
      if (e.key === 'Escape') { if (!$('#dollModal').hidden && dollHash && location.hash === '#doll') { dollHash = false; window.history.back(); } document.querySelectorAll('.modal:not([hidden])').forEach(closeModal); }
      // shortcuts only for the dress-up screen: never while typing, or while a window is open
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (document.querySelector('.modal:not([hidden]), .game, .runway') || !$('#viewer').hidden) return;
      if ($('#app').hidden) return;
      if (e.key === 'r' || e.key === 'R') $('#surprise').click();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); (e.shiftKey ? $('#redo') : $('#undo')).click(); }
    });
    bindPetDrag();
    // full-screen critter: corner button opens it; Back, Esc, or the phone's back gesture closes it
    $('#sizeBtn').addEventListener('click', openViewer);
    $('#viewer').addEventListener('click', e => {
      if (e.target.closest('[data-viewback]')) return leaveViewer();
      const a = e.target.closest('[data-viewact]');
      if (a && a.dataset.viewact === 'dance') dance();
      if (a && a.dataset.viewact === 'photo') $('#photo').click();
    });
    window.addEventListener('hashchange', () => {
      if (location.hash === '#view') { if (!$('#viewer').hidden) viewHash = true; return; }
      if (viewHash) { viewHash = false; closeViewer(); }
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && !$('#viewer').hidden) leaveViewer(); });
  }
  function stopDanceIf() { if (danceTimer) stopDance(); }
  function selectText(el) { if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }

  /* keep the pinned critter and the pinned drawer tabs stacked neatly on phones */
  function measurePins() {
    const bar = document.querySelector('.bar'), row = $('#stageRow');
    if (bar) document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px');
    if (row) document.documentElement.style.setProperty('--row-h', row.offsetHeight + 'px');
  }

  /* ---------------- boot ---------------- */
  function boot() {
    measurePins();
    window.addEventListener('resize', measurePins);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', measurePins);
    if (window.ResizeObserver) { const ro = new ResizeObserver(measurePins); ro.observe(document.querySelector('.bar')); ro.observe($('#stageRow')); }
    applySettings();
    $('#looksCount').textContent = TT.bigWords(TT.countLooks());
    renderParade();
    bind();
    const m = location.hash.match(/#look=([A-Za-z0-9_\-]+)/);
    if (m) {
      try { startStudio(); loadCode('TT1-' + m[1].replace(/^TT1-/, '')); } catch (e) { }
    } else if (location.hash === '#studio') startStudio();
    else if (location.hash === '#doll' || location.hash === '#view') { try { window.history.replaceState(null, '', location.pathname + location.search); } catch (e) { } }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  TT.app = { get state() { return state; }, set state(v) { state = sanitize(v); commit({ force: true, tabs: true }); }, randomLook, sanitize, judgeNow, setChallenge };
})(window.TT);
