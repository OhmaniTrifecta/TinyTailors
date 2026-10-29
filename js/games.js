/* Tiny Tailors — mini-games starring your critter.
   Copycat Closet, Customer Rush, Runway Rhythm, Critter Catch, Hide & Seek and Memory.
   Everything runs inside one full-screen game window; each game pays a few stitches a day. */
(function (TT) {
  const { C, E, R, S, P } = TT;
  const Sound = TT.Sound;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const free = list => list.filter(x => !x.locked);
  const COLS = () => free(TT.COLORS);
  // tops that cover the bottoms, and bottoms that hide the feet: skipped when a game needs every piece visible
  const LONG_TOPS = ['sundress', 'gown', 'wizard', 'labcoat', 'royalrobe', 'starlight', 'raincoat'];
  const okItem = (slot, it) => !(slot === 'top' && LONG_TOPS.includes(it.id)) && !(slot === 'bottom' && it.hideFeet);

  /* ---------- best scores (this device) ---------- */
  const KEY = 'tinytailors.games';
  const loadBest = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const saveBest = b => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) { } };

  /* ---------- drawing helpers ---------- */
  const plain = st => Object.assign(clone(st), { fx: { id: null }, pet: { id: null }, petPos: null });
  const critter = (st, pfx, pose, animated = false) => TT.compose(plain(st), { pfx, animated, scene: false, pet: false, fx: false, pose: pose ? TT.itemOf('pose', pose) : undefined });
  const critterSVG = (st, pfx, cls = '', pose) => TT.svg(critter(st, pfx, pose), '40 0 320 440', `class="${cls}"`);
  const sceneSVG = (id, w, h, pfx) => `<svg x="0" y="0" width="${w}" height="${h}" viewBox="0 40 400 400" preserveAspectRatio="xMidYMid slice">${(TT.itemOf('scene', id) || TT.SCENES[0]).draw(null, pfx)}</svg>`;
  const starsHTML = n => `<span class="g-stars" aria-label="${n} out of 5 stars">${'★'.repeat(n)}<span>${'★'.repeat(5 - n)}</span></span>`;
  const sewButton = (cx, cy, r, fill) => C(cx, cy, r, fill, 3) + C(cx, cy, r * 0.62, 'none', 2) + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => C(cx + x * r * 0.24, cy + y * r * 0.24, r * 0.12, TT.OL, 0)).join('');
  const spool = (cx, cy, s) => R(cx - 13 * s, cy - 15 * s, 26 * s, 7 * s, 3, '#c99a6e', 2.5) + R(cx - 13 * s, cy + 8 * s, 26 * s, 7 * s, 3, '#c99a6e', 2.5) + R(cx - 9 * s, cy - 8 * s, 18 * s, 16 * s, 1, '#ff6f96', 2.5) + S(`M${cx - 9 * s},${cy - 3 * s}h${18 * s}M${cx - 9 * s},${cy + 2 * s}h${18 * s}`, '#ffb3c8', 2);
  const scissors = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) scale(${s}) rotate(-30)">${P('M-4,-2 L-30,-26 L-24,-30 L2,-6Z', '#d9dee8', 3)}${P('M4,-2 L30,-26 L24,-30 L-2,-6Z', '#c3c9d6', 3)}${C(-12, 12, 10, '#ff8a8a', 4)}${C(12, 12, 10, '#ff8a8a', 4)}${C(-12, 12, 4, '#fff', 0)}${C(12, 12, 4, '#fff', 0)}${C(0, -3, 3, TT.OL, 0)}</g>`;

  /* ---------- the game list ---------- */
  const GAMES = [
    { id: 'copycat', name: 'Copycat Closet', blurb: 'Remember an outfit, then rebuild it before you forget!', color: '#ffd1e0' },
    { id: 'rush', name: 'Customer Rush', blurb: 'Critters rush into your shop. Dress each one for their big day!', color: '#d7f3e6' },
    { id: 'rhythm', name: 'Runway Rhythm', blurb: 'Tap the poses to the beat while your critter struts.', color: '#e6dcff' },
    { id: 'catch', name: 'Critter Catch', blurb: 'Catch falling buttons and spools. Dodge the scissors!', color: '#fff0c2' },
    { id: 'seek', name: 'Hide & Seek', blurb: 'Find your critter in a crowd of look-alikes.', color: '#d5ecff' },
    { id: 'memory', name: 'Memory Match', blurb: 'Flip cards to find matching pairs.', color: '#ffe0cc' }
  ];

  /* ================= shell ================= */
  let root = null, ctx = null, timers = [], gen = 0, keyHandler = null, cleanup = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
  // an animation loop that stops by itself when the screen changes (or when fn returns false)
  function loop(fn) { const my = gen; const step = now => { if (my !== gen || !root) return; if (fn(now) === false) return; requestAnimationFrame(step); }; requestAnimationFrame(step); }
  function stopAll() {
    gen++;
    timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
    cleanup.forEach(f => { try { f(); } catch (e) { } }); cleanup = [];
    keyHandler = null; Sound.stopMusic();
  }
  const $ = s => root.querySelector(s);
  const body = () => $('.game-body');
  function setBar(title, hud = '') { $('.game-title').textContent = title; $('.game-hud').innerHTML = hud; }
  const hud = html => { $('.game-hud').innerHTML = html; };

  TT.openGames = function (context) {
    ctx = context;
    if (root) closeGames();
    root = document.createElement('div');
    root.className = 'game';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Games');
    root.innerHTML = `<div class="game-bar"><button class="chip game-back" type="button" data-gback><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span>Back</span></button>
      <strong class="game-title"></strong><div class="game-hud" aria-live="polite"></div></div><div class="game-body"></div>`;
    document.body.appendChild(root);
    document.body.classList.add('gaming');
    root.addEventListener('click', e => { if (e.target.closest('[data-gback]')) back(); });
    document.addEventListener('keydown', onKey);
    Sound.wake(); Sound.whoosh();
    hub();
  };
  function onKey(e) {
    if (!root) return;
    if (e.defaultPrevented || document.querySelector('.modal:not([hidden])')) return; // a window on top of the game handles its own keys
    if (e.key === 'Escape') { e.preventDefault(); back(); return; }
    if (keyHandler) keyHandler(e);
  }
  let atHub = true;
  function back() { if (atHub) closeGames(); else { Sound.tap(); hub(); } }
  function closeGames() {
    stopAll();
    document.removeEventListener('keydown', onKey);
    if (root) root.remove();
    root = null; document.body.classList.remove('gaming');
    ctx && ctx.onClose && ctx.onClose();
  }
  TT.closeGames = closeGames;

  /* ================= hub ================= */
  function hub() {
    stopAll(); atHub = true;
    setBar('Games', `<span class="g-pill">${TT.SPOOL}${TT.progress.stitches}</span>`);
    $('.game-back span').textContent = 'Studio';
    const me = ctx.look();
    const best = loadBest();
    const art = {
      copycat: critterSVG(me, 'gh-a-') + `<span class="g-eq">=</span>` + `<span class="g-q">?</span>`,
      rush: TT.thumb('hat', TT.itemOf('hat', 'tophat'), Object.assign(clone(me), { hat: { id: 'tophat', color: 'grape' } })) + TT.thumb('hold', TT.itemOf('hold', 'bouquet'), Object.assign(clone(me), { hold: { id: 'bouquet', color: 'bubblegum' } })),
      rhythm: TT.svg(S('M30,72 V26 L74,18 V64', TT.OL, 6) + E(22, 74, 11, 9, '#cfa8ff', 4) + E(66, 66, 11, 9, '#ff9ec0', 4) + TT.star(84, 20, 9, '#ffe17a', 3), '0 0 100 100'),
      catch: TT.svg(sewButton(30, 30, 16, '#ff9ec0') + spool(70, 40, 1) + TT.star(36, 74, 12, '#ffe17a', 3) + scissors(74, 78, 0.55), '0 0 100 100'),
      seek: TT.thumb('hold', TT.itemOf('hold', 'magnifier'), Object.assign(clone(me), { hold: { id: 'magnifier', color: 'sky' } })),
      memory: TT.svg(R(10, 14, 38, 54, 8, '#ff9ec0', 4) + TT.heart(29, 44, 11, '#fff', 2.5) + R(52, 30, 38, 54, 8, '#fffdf9', 4) + TT.star(71, 57, 12, '#ffe17a', 3), '0 0 100 100')
    };
    body().innerHTML = `<div class="g-hub">
      <p class="g-intro">Play with <b>${esc(me.name || 'your critter')}</b>! Every game pays up to 12 stitches. Playing the same one again pays a little less, so mix it up!</p>
      <div class="g-cards">${GAMES.map(g => `<button class="g-card" type="button" data-game="${g.id}" style="--card:${g.color}">
        <span class="g-art g-art-${g.id}">${art[g.id] || (g.art ? g.art(me) : '')}</span>
        <span class="g-name">${g.name}</span><span class="g-blurb">${g.blurb}</span>
        <span class="g-meta">${best[g.id] ? `Best: ${best[g.id]}` : 'New!'} · ${TT.SPOOL}up to ${TT.gameNext(g.id)}</span></button>`).join('')}</div></div>`;
    body().scrollTop = 0;
    body().querySelectorAll('[data-game]').forEach(b => b.addEventListener('click', () => start(b.dataset.game)));
  }
  function start(id) {
    stopAll(); atHub = false; Sound.tap();
    $('.game-back span').textContent = 'Games';
    body().scrollTop = 0;
    (REG[id] || hub)();
  }

  /* ---------- the toolkit other game files use (js/games2.js) ---------- */
  const REG = {};
  TT.gameKit = {
    add(meta, fn) { GAMES.push(meta); REG[meta.id] = fn; },
    get root() { return root; }, get ctx() { return ctx; },
    $: s => root.querySelector(s), body, setBar, hud, finish: (...a) => finish(...a), starsFor: (...a) => starsFor(...a),
    later, every, loop, cleanup: f => cleanup.push(f), keys: f => { keyHandler = f; },
    critter, critterSVG, sceneSVG, starsHTML, sewButton, spool, scissors, plain, pick, shuffle, clone, esc, COLS, free, okItem, LONG_TOPS,
    loadBest, saveBest, Sound
  };

  /* ---------- end-of-game card ---------- */
  function finish(id, { stars, score, line, pay }) {
    stopAll();
    const g = GAMES.find(x => x.id === id);
    const best = loadBest();
    const isBest = score > (best[id] || 0);
    if (isBest) { best[id] = score; saveBest(best); }
    const rw = TT.rewardGame(id, stars);
    if (rw.earned) ctx.wallet();
    const nxt = TT.gameNext(id);
    const why = `Playing ${g.name} again pays up to ${nxt} stitch${nxt === 1 ? '' : 'es'}. A different game pays full!`;
    setBar(g.name, '');
    body().innerHTML = `<div class="g-end">
      ${starsHTML(stars)}
      <p class="g-end-word">${['', 'Nice try!', 'Getting there!', 'Great job!', 'Amazing!', 'Superstar!'][stars]}</p>
      <p class="g-end-line">${line}</p>
      ${isBest && score ? '<p class="g-best">New best score!</p>' : ''}
      ${rw.earned ? `<p class="g-earn">${TT.SPOOL} +${rw.earned} stitches</p>` : ''}
      ${why ? `<p class="g-note">${why}</p>` : ''}
      <div class="g-end-actions"><button class="btn-soft" type="button" data-again>Play again</button><button class="btn-big" type="button" data-more>More games</button></div></div>`;
    if (stars >= 4) Sound.cheer(); else Sound.sparkle();
    body().querySelector('[data-again]').addEventListener('click', () => start(id));
    body().querySelector('[data-more]').addEventListener('click', () => { Sound.tap(); hub(); });
  }
  const starsFor = (ratio, cuts = [0.2, 0.4, 0.6, 0.8, 0.95]) => Math.max(1, cuts.filter(c => ratio >= c).length);

  Object.assign(REG, { copycat: () => copycat(), rush: () => rush(), rhythm: () => rhythm(), catch: () => catchGame(), seek: () => seek(), memory: () => memory() });

  /* ================= 1. Copycat Closet ================= */
  function copycat() {
    const me = ctx.look();
    const ROUNDS = [['top', 'bottom', 'hat'], ['top', 'bottom', 'shoes', 'hat'], ['top', 'bottom', 'shoes', 'hat', 'hold']];
    let round = 0, right = 0, total = 0;
    setBar('Copycat Closet');
    const base = plain(me);
    ['top', 'bottom', 'shoes', 'hat', 'hold', 'face', 'neck', 'back'].forEach(s => { base[s] = { id: null, color: 'bubblegum', color2: null, pattern: 'solid' }; });
    base.pose = { id: 'stand' };

    function next() {
      if (round >= ROUNDS.length) return finish('copycat', { stars: starsFor(right / total), score: right, line: `You remembered <b>${right} of ${total}</b> pieces.`, pay: right });
      const slots = ROUNDS[round];
      const target = clone(base);
      const trick = round === 2 ? 'top' : null; // last round: one piece comes in 4 colors
      slots.forEach(s => {
        const it = pick(TT.SLOTS[s].items.filter(i => okItem(s, i) && (s !== trick || !i.fixed)));
        target[s] = { id: it.id, color: pick(COLS()).id, color2: null, pattern: 'solid' };
      });
      const secs = [5, 6, 7][round];
      hud(`<span class="g-pill">Round ${round + 1} of 3</span>`);
      body().innerHTML = `<div class="cc-look"><p class="g-say">Remember this outfit!</p>${critterSVG(target, `cc${round}t-`, 'cc-critter')}
        <div class="g-count"><span id="ccCount">${secs}</span></div></div>`;
      let left = secs;
      const t = every(() => { left--; const el = $('#ccCount'); if (el) el.textContent = left; Sound.tap(); if (left <= 0) { clearInterval(t); rebuild(target, slots, trick); } }, 1000);
    }
    function rebuild(target, slots, trick) {
      const mine = clone(base);
      const options = {};
      slots.forEach(s => {
        const want = target[s];
        if (s === trick) {
          const fam = TT.colorFamily(TT.colorHex(s, want.color));
          const others = shuffle(COLS().filter(c => TT.colorFamily(c.hex) !== fam));
          const used = new Set([fam]); const picks = [];
          for (const c of others) { const f = TT.colorFamily(c.hex); if (!used.has(f)) { used.add(f); picks.push(c.id); } if (picks.length === 3) break; }
          options[s] = shuffle([want.color, ...picks].map(color => ({ id: want.id, color })));
        } else {
          const others = shuffle(TT.SLOTS[s].items.filter(i => i.id !== want.id && okItem(s, i))).slice(0, 3);
          options[s] = shuffle([want, ...others.map(i => ({ id: i.id, color: want.color }))].map(o => ({ id: o.id, color: o.color })));
        }
      });
      const chosen = {};
      const draw = () => {
        body().innerHTML = `<div class="cc-build">
          <div class="cc-preview">${critterSVG(mine, `cc${round}m-`, 'cc-critter')}</div>
          <div class="cc-rows"><p class="g-say">Rebuild the outfit!</p>${slots.map(s => `<div class="cc-row"><span class="cc-label">${TT.SLOTS[s].label}</span><div class="cc-opts">${options[s].map((o, i) => {
            const it = TT.itemOf(s, o.id);
            const st = Object.assign(clone(base), { [s]: { id: o.id, color: o.color, color2: null, pattern: 'solid' } });
            return `<button class="g-opt" type="button" data-s="${s}" data-i="${i}" aria-pressed="${chosen[s] === i}" aria-label="${esc(it.name)}${s === trick ? ' in ' + o.color : ''}">${TT.thumb(s, it, st)}</button>`;
          }).join('')}</div></div>`).join('')}
          <button class="btn-big cc-check" type="button" data-check ${Object.keys(chosen).length < slots.length ? 'disabled' : ''}>Check it!</button></div></div>`;
      };
      draw();
      const onClick = e => {
        const b = e.target.closest('[data-s]');
        if (b) { const s = b.dataset.s, i = +b.dataset.i; chosen[s] = i; const o = options[s][i]; mine[s] = { id: o.id, color: o.color, color2: null, pattern: 'solid' }; Sound.pop(); const y = body().scrollTop; draw(); body().scrollTop = y; return; }
        if (e.target.closest('[data-check]')) { body().removeEventListener('click', onClick); reveal(target, mine, slots); }
      };
      body().addEventListener('click', onClick);
      cleanup.push(() => body() && body().removeEventListener('click', onClick));
    }
    function reveal(target, mine, slots) {
      const res = slots.map(s => ({ s, ok: target[s].id === mine[s].id && target[s].color === mine[s].color }));
      const n = res.filter(r => r.ok).length; right += n; total += slots.length;
      body().innerHTML = `<div class="cc-reveal">
        <div class="cc-pair"><figure>${critterSVG(mine, `cc${round}r1-`, 'cc-critter')}<figcaption>Yours</figcaption></figure><figure>${critterSVG(target, `cc${round}r2-`, 'cc-critter')}<figcaption>The look</figcaption></figure></div>
        <ul class="cc-results">${res.map(r => `<li class="${r.ok ? 'ok' : 'no'}"><span>${r.ok ? '✓' : '✗'}</span>${TT.SLOTS[r.s].label}</li>`).join('')}</ul>
        <button class="btn-big" type="button" data-next>${round < 2 ? 'Next round' : 'See my score'}</button></div>`;
      n === slots.length ? Sound.cheer() : Sound.sparkle();
      body().querySelector('[data-next]').addEventListener('click', () => { round++; next(); });
    }
    next();
  }

  /* ================= 2. Customer Rush ================= */
  const RUSH_SLOTS = ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold'];
  const RUSH_RULES = ['tags', 'avoid', 'dressed', 'hold'];
  const CUSTOMERS = ['Penny', 'Biscuit', 'Waffles', 'Pip', 'Clover', 'Mochi', 'Toffee', 'Bao', 'Juniper', 'Pickles', 'Nugget', 'Poppy', 'Fig', 'Sprout', 'Dumpling'];
  function rush() {
    const pool = shuffle(TT.CHALLENGES.map(ch => ({ id: ch.id, text: ch.text, rules: ch.rules.filter(r => RUSH_RULES.includes(r.type)) })).filter(ch => ch.rules.some(r => r.type === 'tags')));
    const COUNT = 3, TIME = 45;
    let n = 0, earnedStars = 0;
    setBar('Customer Rush');
    const names = shuffle(CUSTOMERS);
    function customer() {
      if (n >= COUNT) {
        const avg = earnedStars / COUNT;
        return finish('rush', { stars: Math.max(1, Math.round(avg)), score: earnedStars, line: `You earned <b>${earnedStars} stars</b> from ${COUNT} happy customers.`, pay: earnedStars - 3 });
      }
      const ch = pool[n % pool.length];
      const animal = pick(TT.ANIMALS.filter(a => !a.locked));
      const st = plain(ctx.look());
      st.animal = { id: animal.id, color: 'natural' };
      st.eyes = { id: pick(free(TT.EYES)).id }; st.mouth = { id: TT.MOUTHS[0].id }; st.blush = { id: (TT.BLUSH[0] || {}).id || null };
      st.hair = { id: null, color: 'cocoa' };
      RUSH_SLOTS.forEach(s => { st[s] = { id: null, color: 'bubblegum', color2: null, pattern: 'solid' }; });
      st.pose = { id: 'stand' }; st.scene = { id: 'tailor' }; st.name = names[n % names.length];
      const good = new Set(ch.rules.filter(r => r.type === 'tags' || r.type === 'hold').flatMap(r => r.tags));
      const tagsOf = (s, id) => ((TT.TAGS[s] || {})[id] || '').split(' ');
      const opts = {};
      RUSH_SLOTS.forEach(s => {
        const items = TT.SLOTS[s].items;
        const fits = shuffle(items.filter(i => tagsOf(s, i.id).some(t => good.has(t)))).slice(0, 2);
        const rest = shuffle(items.filter(i => !fits.includes(i))).slice(0, 6 - fits.length);
        opts[s] = shuffle(fits.concat(rest)).map(i => ({ id: i.id, color: pick(COLS()).id }));
      });
      let tab = 'top', left = TIME, done = false;
      hud(`<span class="g-pill">Customer ${n + 1} of ${COUNT}</span>`);
      body().innerHTML = `<div class="ru">
        <div class="ru-shop"><div class="ru-stage" id="ruStage"></div>
          <div class="ru-ask"><span class="ru-who">${esc(st.name)} the ${esc(animal.name.toLowerCase())} says:</span><strong>“${esc(ch.text)}!”</strong>
          <div class="g-timer"><span id="ruTime"></span></div></div></div>
        <div class="ru-tabs" role="tablist">${RUSH_SLOTS.map(s => `<button class="ru-tab" type="button" role="tab" data-tab="${s}">${TT.SLOTS[s].label.replace('Specs & face fun', 'Specs').replace('Wings & capes', 'Wings').replace('Neckwear', 'Neck')}</button>`).join('')}</div>
        <div class="ru-items" id="ruItems"></div>
        <button class="btn-big ru-done" type="button" data-done>All done!</button></div>`;
      const drawStage = () => { $('#ruStage').innerHTML = TT.svg(TT.compose(st, { pfx: `ru${n}-`, animated: false, pet: false, fx: false }), '0 0 400 460'); };
      const drawItems = () => {
        root.querySelectorAll('.ru-tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab));
        $('#ruItems').innerHTML = opts[tab].map((o, i) => {
          const it = TT.itemOf(tab, o.id);
          const s2 = Object.assign(clone(st), { [tab]: { id: o.id, color: o.color, color2: null, pattern: 'solid' } });
          return `<button class="g-opt" type="button" data-i="${i}" aria-pressed="${st[tab].id === o.id}">${TT.thumb(tab, it, s2)}<span>${esc(it.name)}</span></button>`;
        }).join('');
      };
      const drawTime = () => { const el = $('#ruTime'); if (el) { el.style.width = (left / TIME * 100) + '%'; el.classList.toggle('low', left <= 10); } };
      drawStage(); drawItems(); drawTime();
      const onClick = e => {
        const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; Sound.tap(); drawItems(); return; }
        const b = e.target.closest('#ruItems [data-i]');
        if (b) { const o = opts[tab][+b.dataset.i]; st[tab] = st[tab].id === o.id ? { id: null, color: o.color, color2: null, pattern: 'solid' } : { id: o.id, color: o.color, color2: null, pattern: 'solid' }; Sound.pop(); drawStage(); drawItems(); return; }
        if (e.target.closest('[data-done]')) judge();
      };
      body().addEventListener('click', onClick);
      cleanup.push(() => body() && body().removeEventListener('click', onClick));
      const tick = every(() => { left -= 0.25; drawTime(); if (left <= 0) judge(); }, 250);
      function judge() {
        if (done) return; done = true; clearInterval(tick);
        body().removeEventListener('click', onClick);
        const res = TT.judge(st, ch);
        const stars = res.stars;
        earnedStars += stars;
        const quote = ['', 'Hmm… not quite what I wanted.', 'It’s okay, I guess!', 'I like it!', 'I love it!', 'This is PERFECT! Thank you!'][stars];
        st.pose = { id: stars >= 4 ? 'hooray' : stars >= 3 ? 'wave' : 'shy' };
        st.eyes = { id: stars >= 4 ? 'happy' : stars >= 3 ? 'sparkle' : 'sleepy' };
        if (!TT.itemOf('eyes', st.eyes.id)) st.eyes = { id: TT.EYES[0].id };
        const tips = res.lines.filter(l => !l.good).slice(0, 2);
        body().innerHTML = `<div class="ru-result"><div class="ru-stage">${TT.svg(TT.compose(st, { pfx: `rr${n}-`, animated: true, pet: false }), '0 0 400 460')}</div>
          <div class="ru-verdict">${starsHTML(stars)}<p class="g-say">“${quote}”</p>${tips.length ? `<ul class="ru-tips">${tips.map(l => `<li>${esc(l.msg)}</li>`).join('')}</ul>` : ''}
          <form class="ru-save" id="ruSave"><label for="ruName">Keep this critter? Give it a name:</label>
            <div class="ru-save-row"><input id="ruName" class="text-in" maxlength="24" value="${esc(st.name)}" autocomplete="off" aria-label="Critter name">
            <button class="btn-soft" type="submit">Save to closet</button></div><p class="ru-saved" id="ruSaved" role="status" aria-live="polite"></p></form>
          <button class="btn-big" type="button" data-next>${n + 1 < COUNT ? 'Next customer' : 'Close the shop'}</button></div></div>`;
        stars >= 4 ? Sound.cheer() : stars >= 3 ? Sound.sparkle() : Sound.undo();
        body().querySelector('[data-next]').addEventListener('click', () => { n++; customer(); });
        $('#ruSave').addEventListener('submit', e => {
          e.preventDefault();
          const name = $('#ruName').value.trim().slice(0, 24) || st.name;
          const look = clone(st); look.name = name; look.pose = { id: 'wave' };
          ctx.saveLook(look, saved => {
            const msg = $('#ruSaved'); if (!msg) return;
            msg.textContent = saved ? `${name} is hanging in your closet!` : 'Not saved. You can still save if you change your mind.';
            if (saved) { Sound.sparkle(); $('#ruSave').querySelector('button').disabled = true; $('#ruName').disabled = true; }
          });
        });
      }
    }
    customer();
  }

  /* ================= 3. Runway Rhythm ================= */
  function rhythm() {
    const me = plain(ctx.look());
    const LANES = [
      { pose: 'wave', label: 'Wave', color: '#ff9ec0', keys: ['ArrowLeft', '1', 'd', 'D'] },
      { pose: 'hooray', label: 'Hooray!', color: '#9ee6c0', keys: ['ArrowDown', '2', 'f', 'F'] },
      { pose: 'tada', label: 'Ta-da!', color: '#ffe17a', keys: ['ArrowUp', '3', 'j', 'J'] },
      { pose: 'jump', label: 'Jump!', color: '#cfa8ff', keys: ['ArrowRight', '4', 'k', 'K'] }
    ];
    const LEAD = 2000, FALL = 1700, WIN = 190, PERFECT = 85;
    // pick a song first (tap ▶ to hear a little of it)
    setBar('Runway Rhythm', '');
    const best = loadBest();
    body().innerHTML = `<div class="rh-pick"><p class="g-say">Pick a song!</p>
      <div class="rh-songs">${TT.SONGS.map(sg => `<div class="rh-song" style="--card:${sg.color}">
        <button class="rh-song-go" type="button" data-song="${sg.id}"><span class="rh-song-name">${esc(sg.name)}</span><span class="rh-song-mood">${esc(sg.mood)}</span>
          <span class="rh-song-meta"><b class="lv lv${sg.level}">${TT.SONG_LEVEL[sg.level]}</b> ${Math.round(60000 / sg.beat)} beats a minute${best['rhythm-' + sg.id] ? ` · best ${best['rhythm-' + sg.id]}` : ''}</span></button>
        <button class="rh-song-hear" type="button" data-hear="${sg.id}" aria-label="Listen to ${esc(sg.name)}">▶</button></div>`).join('')}</div></div>`;
    let hearing = null;
    body().querySelector('.rh-songs').addEventListener('click', e => {
      const h = e.target.closest('[data-hear]');
      if (h) {
        root.querySelectorAll('.rh-song-hear').forEach(b => { b.textContent = '▶'; });
        if (hearing === h.dataset.hear) { Sound.stopMusic(); hearing = null; return; }
        hearing = h.dataset.hear; h.textContent = '■';
        const sg = TT.songById(hearing);
        Sound.playSong(TT.songEvents(sg, { bars: 4 }).events, 0.05);
        return;
      }
      const g = e.target.closest('[data-song]');
      if (g) { Sound.stopMusic(); Sound.tap(); play(TT.songById(g.dataset.song)); }
    });
    function play(song) {
    const built = TT.songEvents(song, { countIn: true });
    const notes = built.chart.notes.map(n => ({ ms: built.msOf(n), lane: n.lane, state: 0 }));
    setBar(song.name);
    hud(`<span class="g-pill" id="rhScore">0</span>`);
    const frames = {};
    ['stand'].concat(LANES.map(l => l.pose)).forEach(p => { frames[p] = critter(me, `rh-${p}-`, p); });
    const s = 0.62;
    body().innerHTML = `<div class="rh">
      <svg class="rh-runway" viewBox="0 0 600 320" role="img" aria-label="${esc(me.name || 'Your critter')} on the runway">
        <rect width="600" height="320" fill="#4a3566"/><path d="M0,0 L120,0 Q90,170 140,270 L0,270Z" fill="#e2668e"/><path d="M600,0 L480,0 Q510,170 460,270 L600,270Z" fill="#e2668e"/>
        <rect width="600" height="24" fill="#c8507a"/>${S('M0,22 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0 q25,16 50,0', '#ffd84d', 4)}
        <path d="M230,250 L370,250 L450,320 L150,320Z" fill="#ffe0ea"/><path d="M300,24 L210,300 L390,300Z" fill="#fff3c2" opacity=".14"/>
        <g id="rhCritter" transform="translate(${300 - 200 * s} ${312 - 440 * s}) scale(${s})">${frames.stand}</g><g id="rhFlash"></g>
        <text id="rhWord" x="300" y="70" text-anchor="middle" font-family="Sniglet, 'Baloo 2', sans-serif" font-size="34" font-weight="800" fill="#ffe17a" stroke="#5b3f58" stroke-width="6" paint-order="stroke"></text>
        <text id="rhCombo" x="300" y="104" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-size="20" font-weight="800" fill="#fff"></text></svg>
      <svg class="rh-track" viewBox="0 0 400 230">
        ${LANES.map((l, i) => `<rect x="${i * 100 + 4}" y="0" width="92" height="230" rx="16" fill="${l.color}" opacity=".22"/>`).join('')}
        <rect x="0" y="194" width="400" height="6" fill="#5b3f58" opacity=".5"/>
        ${LANES.map((l, i) => C(i * 100 + 50, 197, 30, 'none', 4, `opacity=".45" id="rhRing${i}"`)).join('')}
        <g id="rhNotes">${notes.map((nt, k) => `<g id="rhN${k}" transform="translate(-100 -100)">${C(0, 0, 26, LANES[nt.lane].color, 4)}${TT.star(0, 0, 13, '#fff', 2.5)}</g>`).join('')}</g></svg>
      <div class="rh-pads">${LANES.map((l, i) => `<button class="rh-pad" type="button" data-lane="${i}" style="--pad:${l.color}">${TT.svg(frames[l.pose], '40 0 320 440')}<span>${l.label}</span></button>`).join('')}</div>
      <p class="rh-help">Tap a pose when its star reaches the line. Keys: ← ↓ ↑ → or D F J K</p></div>`;
    const crit = $('#rhCritter'), word = $('#rhWord'), combo = $('#rhCombo');
    let score = 0, streak = 0, bestStreak = 0, hits = 0, perfects = 0, poseTimer = 0, cur = 'stand';
    // the music and the stars come from the same chart and run on the audio clock, so they stay together
    const music = Sound.playSong(built.events, LEAD / 1000);
    const clock = () => music.clockMs();
    const timeOf = nt => nt.ms;
    const setPose = p => { if (cur !== p) { cur = p; crit.innerHTML = frames[p]; } };
    const say = (txt, col) => { word.textContent = txt; word.setAttribute('fill', col); word.animate([{ transform: 'scale(1.25)', transformOrigin: '300px 60px' }, { transform: 'scale(1)', transformOrigin: '300px 60px' }], { duration: 220 }); };
    function hit(lane) {
      const now = clock();
      const pad = root.querySelector(`.rh-pad[data-lane="${lane}"]`); if (pad) { pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit'); }
      let best = null, bd = 1e9;
      notes.forEach(nt => { if (nt.state || nt.lane !== lane) return; const d = Math.abs(now - timeOf(nt)); if (d < bd) { bd = d; best = nt; } });
      setPose(LANES[lane].pose); clearTimeout(poseTimer); poseTimer = setTimeout(() => setPose('stand'), 320);
      if (!best || bd > WIN) { Sound.tone(220, 0.08, 'sine', 0.06); return; }
      best.state = 1; hits++; streak++; bestStreak = Math.max(bestStreak, streak);
      const perfect = bd <= PERFECT; if (perfect) perfects++;
      score += (perfect ? 100 : 60) + Math.min(50, streak * 2);
      say(perfect ? 'Perfect!' : 'Good!', perfect ? '#ffe17a' : '#9ee6c0');
      combo.textContent = streak > 2 ? `${streak} in a row!` : '';
      Sound.tone(1900, 0.04, 'square', 0.03);
      $('#rhScore').textContent = score;
      $('#rhFlash').innerHTML = `<circle cx="${120 + Math.random() * 360}" cy="${290 + Math.random() * 20}" r="22" fill="#fff" opacity=".85" class="flash"/>`;
    }
    root.querySelectorAll('.rh-pad').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); hit(+b.dataset.lane); }));
    keyHandler = e => { if (e.repeat) return; const i = LANES.findIndex(l => l.keys.includes(e.key)); if (i >= 0) { e.preventDefault(); hit(i); } };
    cleanup.push(() => clearTimeout(poseTimer));
    const els = notes.map((nt, k) => root.querySelector('#rhN' + k));
    const endAt = notes[notes.length - 1].ms + 900;
    loop(() => {
      const now = clock();
      notes.forEach((nt, k) => {
        const dt = timeOf(nt) - now;
        if (!nt.state && dt < -WIN) { nt.state = 2; streak = 0; combo.textContent = ''; say('Miss', '#ffb3c8'); }
        const y = 197 - dt / FALL * 197;
        els[k].setAttribute('transform', nt.state === 1 || y < -40 || y > 260 ? 'translate(-100 -100)' : `translate(${nt.lane * 100 + 50} ${y})`);
      });
      if (now > endAt) {
        Sound.stopMusic();
        const acc = hits / notes.length;
        const bs = loadBest(); if (score > (bs['rhythm-' + song.id] || 0)) { bs['rhythm-' + song.id] = score; saveBest(bs); }
        finish('rhythm', { stars: starsFor(acc, [0.2, 0.45, 0.65, 0.8, 0.92]), score, line: `<b>${esc(song.name)}</b>: you hit <b>${hits} of ${notes.length}</b> beats (${perfects} perfect) · best streak ${bestStreak}.`, pay: Math.round(acc * 12) });
        return false;
      }
    });
    }
  }

  /* ================= 4. Critter Catch ================= */
  function catchGame() {
    const me = plain(ctx.look());
    const W = 400, H = 560, s = 0.4, TIME = 45;
    const scene = (me.scene && me.scene.id) || 'meadow';
    setBar('Critter Catch');
    body().innerHTML = `<div class="ca">
      <svg class="ca-field" viewBox="0 0 ${W} ${H}" role="img" aria-label="Catch the falling buttons">
        ${sceneSVG(scene, W, H, 'ca-')}<rect width="${W}" height="${H}" fill="#fff" opacity=".18"/>
        <g id="caItems"></g><g id="caMe">${critter(me, 'ca-', 'hooray')}</g><g id="caPops"></g></svg>
      <div class="ca-ctrl"><button class="rh-pad ca-btn" type="button" data-dir="-1" aria-label="Move left">◀</button>
        <p class="rh-help">Drag, or hold ◀ ▶ (arrow keys work too)</p>
        <button class="rh-pad ca-btn" type="button" data-dir="1" aria-label="Move right">▶</button></div></div>`;
    const field = $('.ca-field'), meG = $('#caMe'), itemsG = $('#caItems'), pops = $('#caPops');
    let x = W / 2, target = null, dir = 0, score = 0, lives = 3, left = TIME, spawnT = 0, last = performance.now(), started = last, caught = 0;
    const items = [];
    const KINDS = [
      { k: 'button', pts: 1, w: 58, draw: () => sewButton(0, 0, 17, pick(['#ff9ec0', '#9ee6c0', '#9cd3ff', '#ffe17a', '#cfa8ff'])) },
      { k: 'spool', pts: 2, w: 20, draw: () => spool(0, 0, 1.15) },
      { k: 'star', pts: 5, w: 7, draw: () => TT.star(0, 0, 18, '#ffe17a', 3) },
      { k: 'scissors', pts: 0, w: 15, bad: true, draw: () => scissors(0, 0, 0.8) }
    ];
    const drawHud = () => hud(`<span class="g-pill">${'♥'.repeat(lives)}<span class="g-off">${'♥'.repeat(3 - lives)}</span></span><span class="g-pill">${score}</span><span class="g-pill">${Math.ceil(left)}s</span>`);
    drawHud();
    const toX = e => { const r = field.getBoundingClientRect(); const k = W / r.width; return (e.clientX - r.left) * k; };
    field.addEventListener('pointerdown', e => { target = toX(e); field.setPointerCapture(e.pointerId); });
    field.addEventListener('pointermove', e => { target = toX(e); });
    root.querySelectorAll('.ca-btn').forEach(b => {
      b.addEventListener('pointerdown', e => { e.preventDefault(); dir = +b.dataset.dir; target = null; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { dir = 0; }));
    });
    keyHandler = e => { if (e.key === 'ArrowLeft') { dir = -1; target = null; e.preventDefault(); } if (e.key === 'ArrowRight') { dir = 1; target = null; e.preventDefault(); } };
    const keyUp = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dir = 0; };
    document.addEventListener('keyup', keyUp); cleanup.push(() => document.removeEventListener('keyup', keyUp));
    const pop = (px, py, txt, col) => { const id = 'p' + Math.random().toString(36).slice(2); pops.insertAdjacentHTML('beforeend', `<text id="${id}" x="${px}" y="${py}" text-anchor="middle" font-family="Sniglet, 'Baloo 2', sans-serif" font-size="26" font-weight="800" fill="${col}" stroke="#5b3f58" stroke-width="5" paint-order="stroke" class="ca-pop">${txt}</text>`); setTimeout(() => { const el = document.getElementById(id); el && el.remove(); }, 700); };
    loop(now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const el = (now - started) / 1000;
      left = Math.max(0, TIME - el);
      // move
      if (dir) x += dir * 330 * dt;
      else if (target != null) x += (target - x) * Math.min(1, dt * 12);
      x = Math.max(40, Math.min(W - 40, x));
      meG.setAttribute('transform', `translate(${x - 200 * s} ${H - 430 * s}) scale(${s})`);
      // spawn
      spawnT -= dt;
      if (spawnT <= 0) {
        spawnT = Math.max(0.36, 0.8 - el * 0.01);
        const badBoost = Math.min(10, el / 4);
        const tot = KINDS.reduce((a, k) => a + k.w + (k.bad ? badBoost : 0), 0);
        let r = Math.random() * tot, kind = KINDS[0];
        for (const k of KINDS) { r -= k.w + (k.bad ? badBoost : 0); if (r <= 0) { kind = k; break; } }
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = kind.draw();
        itemsG.appendChild(g);
        items.push({ kind, x: 30 + Math.random() * (W - 60), y: -30, v: 150 + el * 3 + Math.random() * 50, spin: (Math.random() - 0.5) * 120, a: 0, g });
      }
      // fall & catch
      const catchY = H - 400 * s; // around the critter's raised paws and head
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.v * dt; it.a += it.spin * dt;
        it.g.setAttribute('transform', `translate(${it.x} ${it.y}) rotate(${it.a})`);
        if (it.y > catchY - 10 && it.y < catchY + 60 && Math.abs(it.x - x) < 62) {
          if (it.kind.bad) { lives--; pop(it.x, it.y, 'Ouch!', '#ff8a8a'); Sound.undo(); meG.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 400, iterations: 2 }); }
          else { score += it.kind.pts; caught++; pop(it.x, it.y, '+' + it.kind.pts, it.kind.k === 'star' ? '#ffe17a' : '#ff6f96'); it.kind.k === 'star' ? Sound.sparkle() : Sound.coin(); }
          it.g.remove(); items.splice(i, 1); drawHud(); continue;
        }
        if (it.y > H + 40) { it.g.remove(); items.splice(i, 1); }
      }
      if (Math.floor(left * 4) !== Math.floor((left + dt) * 4)) drawHud();
      if (left <= 0 || lives <= 0) {
        finish('catch', { stars: score >= 70 ? 5 : score >= 50 ? 4 : score >= 32 ? 3 : score >= 16 ? 2 : 1, score, line: `You caught <b>${caught}</b> things for <b>${score}</b> points${lives <= 0 ? ' before the scissors got you' : ''}.`, pay: Math.round(score / 6) });
        return false;
      }
    });
  }

  /* ================= 5. Hide & Seek ================= */
  function seek() {
    const me = plain(ctx.look()); me.pose = me.pose && me.pose.id ? me.pose : { id: 'stand' };
    const LEVELS = [{ n: 4, diff: 2, color: false }, { n: 6, diff: 2, color: false }, { n: 8, diff: 1, color: false }, { n: 10, diff: 1, color: true }, { n: 12, diff: 1, color: true }];
    const TIME = 25;
    let lv = 0, points = 0, found = 0;
    setBar('Hide & Seek');
    const top = TT.itemOf('top', me.top.id), bot = TT.itemOf('bottom', me.bottom.id);
    const slotsOK = ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold'].filter(s => !(s === 'bottom' && top && LONG_TOPS.includes(top.id)) && !(s === 'shoes' && bot && bot.hideFeet));
    const look = st => critter(st, 'cmp-');
    const mine = look(me);
    function decoy(diff, colorOnly) {
      for (let tries = 0; tries < 40; tries++) {
        const d = clone(me);
        shuffle(slotsOK).slice(0, diff).forEach(s => {
          const e = d[s]; const it = e.id && TT.itemOf(s, e.id);
          if (colorOnly && it && !it.fixed && Math.random() < 0.75) {
            const fam = TT.colorFamily(TT.colorHex(s, e.color));
            e.color = pick(COLS().filter(c => TT.colorFamily(c.hex) !== fam)).id; e.pattern = 'solid';
          } else {
            const others = TT.SLOTS[s].items.filter(i => i.id !== e.id && okItem(s, i));
            e.id = (e.id && Math.random() < 0.2) ? null : pick(others).id;
          }
        });
        if (look(d) !== mine) return d;
      }
      const d = clone(me); d.hat.id = d.hat.id ? null : 'crown'; return d;
    }
    function level() {
      if (lv >= LEVELS.length) return end();
      const L = LEVELS[lv];
      const crowd = [];
      const seen = new Set([mine]);
      while (crowd.length < L.n - 1) { const d = decoy(L.diff, L.color); const k = look(d); if (!seen.has(k) || crowd.length > 30) { seen.add(k); crowd.push(d); } }
      const spot = Math.floor(Math.random() * L.n);
      crowd.splice(spot, 0, me);
      const box = body().getBoundingClientRect();
      const wide = box.width > box.height * 0.9;
      const cols = L.n <= 4 ? (wide ? 4 : 2) : L.n <= 6 ? 3 : wide ? (L.n <= 8 ? 4 : L.n <= 10 ? 5 : 6) : (L.n <= 9 ? 3 : 4);
      const rows = Math.ceil(L.n / cols);
      const CW = 300, CH = 380, VW = cols * CW, VH = rows * CH;
      let left = TIME, over = false;
      hud(`<span class="g-pill">Level ${lv + 1} of 5</span><span class="g-pill" id="hsTime">${TIME}s</span>`);
      body().innerHTML = `<div class="hs">
        <div class="hs-find"><div class="hs-me">${critterSVG(me, `hsme${lv}-`)}</div><p><b>Find ${esc(me.name || 'your critter')}!</b><br>${L.color ? 'Look closely at the colors.' : L.diff === 1 ? 'Only one thing is different on each look-alike.' : 'Tap the one that matches exactly.'}</p></div>
        <svg class="hs-field" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="A crowd of critters"><g id="hsBg"></g>
          ${crowd.map((st, i) => { const cx = (i % cols) * CW + (Math.random() - 0.5) * 30, cy = Math.floor(i / cols) * CH + (Math.random() - 0.5) * 20; const sc = 0.86 + Math.random() * 0.06;
            return `<g class="hs-pal" data-i="${i}" tabindex="0" role="button" aria-label="Critter ${i + 1}" transform="translate(${cx + CW / 2 - 200 * sc} ${cy + CH - 440 * sc}) scale(${sc})"><rect x="40" y="0" width="320" height="440" fill="transparent"/>${critter(st, `hs${lv}c${i}-`)}</g>`; }).join('')}
        </svg></div>`;
      const timer = every(() => { left--; const el = $('#hsTime'); if (el) el.textContent = left + 's'; if (left <= 5 && left > 0) Sound.tap(); if (left <= 0 && !over) { over = true; clearInterval(timer); reveal(false); } }, 1000);
      const field = $('.hs-field');
      // stretch the picture to fill the whole box, with the crowd centered in it
      const fr = field.getBoundingClientRect();
      let bx = 0, by = 0, bw = VW, bh = VH;
      if (fr.width && fr.height) { const asp = fr.width / fr.height; if (asp > VW / VH) { bw = VH * asp; bx = -(bw - VW) / 2; } else { bh = VW / asp; by = -(bh - VH) / 2; } }
      field.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
      $('#hsBg').innerHTML = `<g transform="translate(${bx} ${by})">${sceneSVG((me.scene && me.scene.id) || 'meadow', bw, bh, `hs${lv}-`)}</g><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#fff" opacity=".12"/>`;
      const tap = g => {
        if (over || !g) return;
        const i = +g.dataset.i;
        if (i === spot) { over = true; clearInterval(timer); found++; points += 100 + left * 10; reveal(true); }
        else { left = Math.max(1, left - 3); Sound.undo(); g.classList.remove('nope'); void g.getBoundingClientRect(); g.classList.add('nope'); const el = $('#hsTime'); if (el) el.textContent = left + 's'; }
      };
      field.addEventListener('click', e => tap(e.target.closest('.hs-pal')));
      field.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(e.target.closest('.hs-pal')); } });
      function reveal(ok) {
        const g = field.querySelector(`.hs-pal[data-i="${spot}"]`);
        g.classList.add('found');
        field.insertAdjacentHTML('beforeend', `<circle cx="${(spot % cols) * CW + CW / 2}" cy="${Math.floor(spot / cols) * CH + CH / 2}" r="${CW * 0.55}" fill="none" stroke="${ok ? '#ffe17a' : '#ff6f96'}" stroke-width="16" class="hs-ring"/>`);
        ok ? Sound.cheer() : Sound.undo();
        later(() => { if (ok) { lv++; level(); } else end(); }, 1300);
      }
    }
    function end() {
      finish('seek', { stars: Math.max(1, found), score: points, line: found === 5 ? `You found ${esc(me.name || 'your critter')} on <b>all 5 levels</b>! ${points} points.` : `You found ${esc(me.name || 'your critter')} on <b>${found} of 5</b> levels. ${points} points.`, pay: found * 2 + Math.round(points / 400) });
    }
    level();
  }

  /* ================= 6. Memory Match ================= */
  function memory() {
    setBar('Memory Match');
    body().innerHTML = `<div class="g-pick"><p class="g-say">How many cards?</p>
      <button class="g-card" type="button" data-size="6" style="--card:#d7f3e6"><span class="g-name">Easy</span><span class="g-blurb">12 cards</span></button>
      <button class="g-card" type="button" data-size="8" style="--card:#ffd1e0"><span class="g-name">Tricky</span><span class="g-blurb">16 cards · pays more</span></button></div>`;
    body().querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => { Sound.tap(); play(+b.dataset.size); }));
    function play(pairs) {
      const me = ctx.look();
      const slots = ['hat', 'hold', 'pet', 'animal', 'shoes', 'back', 'top', 'face'];
      const faces = []; const used = new Set();
      while (faces.length < pairs) {
        const s = pick(slots); const it = pick(TT.SLOTS[s].items); const key = s + it.id;
        if (used.has(key)) continue; used.add(key);
        const st = clone(me); st[s] = Object.assign({}, st[s], { id: it.id, color: s === 'animal' ? 'natural' : pick(COLS()).id, color2: null, pattern: 'solid' });
        faces.push({ key, name: it.name, art: TT.thumb(s, it, st) });
      }
      const deck = shuffle(faces.concat(faces).map((f, i) => Object.assign({ uid: i }, f)));
      let open = [], moves = 0, matched = 0, lock = false;
      const t0 = Date.now();
      const drawHud = () => hud(`<span class="g-pill">Moves: ${moves}</span><span class="g-pill">Pairs: ${matched}/${pairs}</span>`);
      drawHud();
      body().innerHTML = `<div class="mm mm-${pairs}">${deck.map((c, i) => `<button class="mm-card" type="button" data-i="${i}" aria-label="Card ${i + 1}, face down"><span class="mm-in"><span class="mm-back">${TT.SPOOL}</span><span class="mm-face">${c.art}</span></span></button>`).join('')}</div>`;
      const cards = [...body().querySelectorAll('.mm-card')];
      body().querySelector('.mm').addEventListener('click', e => {
        const b = e.target.closest('.mm-card'); if (!b || lock) return;
        const i = +b.dataset.i;
        if (b.classList.contains('up') || b.classList.contains('done')) return;
        b.classList.add('up'); b.setAttribute('aria-label', deck[i].name); Sound.tap();
        open.push(i);
        if (open.length < 2) return;
        moves++;
        const [a, c] = open; open = [];
        if (deck[a].key === deck[c].key) {
          matched++; [a, c].forEach(k => cards[k].classList.add('done')); Sound.sparkle(); drawHud();
          if (matched === pairs) {
            const secs = Math.round((Date.now() - t0) / 1000);
            const cuts = pairs === 6 ? [17, 13, 10, 8] : [23, 18, 14, 11];
            const stars = 1 + cuts.filter(k => moves <= k).length;
            later(() => finish('memory', { stars, score: Math.max(1, (pairs === 8 ? 300 : 200) - moves * 8 - secs), line: `You matched all ${pairs} pairs in <b>${moves} moves</b> (${secs} second${secs === 1 ? '' : 's'}).`, pay: stars * 2 + (pairs === 8 ? 2 : 0) }), 700);
          }
        } else {
          lock = true; drawHud();
          later(() => { [a, c].forEach(k => { cards[k].classList.remove('up'); cards[k].setAttribute('aria-label', `Card ${k + 1}, face down`); }); lock = false; }, 850);
        }
      });
    }
  }
})(window.TT);
