/* Tiny Tailors — ten more mini-games, plugged into the games window from js/games.js.
   Fabric Match, Pet Parade, Dress-Up Dash, Tailor's Puzzle, Spot the Difference, Critter Says,
   Sewing Machine, Bubble Pop Boutique, Weather Wardrobe and Design Contest. */
(function (TT) {
  const K = TT.gameKit;
  if (!K) return;
  const { C, E, R, S, P } = TT;
  const { critter, critterSVG, sceneSVG, plain, pick, shuffle, clone, esc, COLS, free, okItem, LONG_TOPS, Sound } = K;
  const $ = s => K.$(s);
  const body = () => K.body();
  const wait = ms => new Promise(r => K.later(r, ms));
  const NS = 'http://www.w3.org/2000/svg';
  const toSvgPt = (svg, e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  const CLOTHES = ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold'];
  const blankOutfit = st => { CLOTHES.forEach(s => { st[s] = { id: null, color: 'bubblegum', color2: null, pattern: 'solid' }; }); return st; };
  const tagsOf = (s, id) => ((TT.TAGS[s] || {})[id] || '').split(' ').filter(Boolean);
  const thumbOf = (slot, id, color, base) => { const it = TT.itemOf(slot, id); const st = Object.assign(clone(base), { [slot]: { id, color, color2: null, pattern: 'solid' } }); return TT.thumb(slot, it, st); };
  const POSE_PADS = [
    { pose: 'wave', label: 'Wave', color: '#ff9ec0', note: 523, keys: ['ArrowLeft', '1', 'd', 'D'] },
    { pose: 'hooray', label: 'Hooray!', color: '#9ee6c0', note: 659, keys: ['ArrowDown', '2', 'f', 'F'] },
    { pose: 'tada', label: 'Ta-da!', color: '#ffe17a', note: 784, keys: ['ArrowUp', '3', 'j', 'J'] },
    { pose: 'jump', label: 'Jump!', color: '#cfa8ff', note: 1047, keys: ['ArrowRight', '4', 'k', 'K'] }
  ];

  /* the quick wardrobe used by Design Contest: tabs + a few choices per slot */
  function quickWardrobe(st, goodTags, onChange, per = 8) {
    const good = new Set(goodTags);
    const opts = {};
    CLOTHES.forEach(s => {
      const items = TT.SLOTS[s].items;
      const fits = shuffle(items.filter(i => tagsOf(s, i.id).some(t => good.has(t)))).slice(0, 3);
      const rest = shuffle(items.filter(i => !fits.includes(i))).slice(0, per - fits.length);
      opts[s] = shuffle(fits.concat(rest)).map(i => ({ id: i.id, color: pick(COLS()).id }));
    });
    let tab = 'top';
    const short = s => TT.SLOTS[s].label.replace('Specs & face fun', 'Specs').replace('Wings & capes', 'Wings').replace('Neckwear', 'Neck');
    const html = `<div class="ru-tabs" role="tablist">${CLOTHES.map(s => `<button class="ru-tab" type="button" role="tab" data-qtab="${s}">${short(s)}</button>`).join('')}</div><div class="ru-items" id="qItems"></div>`;
    const draw = () => {
      K.root.querySelectorAll('[data-qtab]').forEach(b => b.setAttribute('aria-selected', b.dataset.qtab === tab));
      $('#qItems').innerHTML = opts[tab].map((o, i) => `<button class="g-opt" type="button" data-qi="${i}" aria-pressed="${st[tab].id === o.id}">${thumbOf(tab, o.id, o.color, st)}<span>${esc(TT.itemOf(tab, o.id).name)}</span></button>`).join('');
    };
    const click = e => {
      const t = e.target.closest('[data-qtab]'); if (t) { tab = t.dataset.qtab; Sound.tap(); draw(); return true; }
      const b = e.target.closest('[data-qi]');
      if (b) { const o = opts[tab][+b.dataset.qi]; st[tab] = st[tab].id === o.id ? { id: null, color: o.color, color2: null, pattern: 'solid' } : { id: o.id, color: o.color, color2: null, pattern: 'solid' }; Sound.pop(); draw(); onChange(); return true; }
      return false;
    };
    return { html, draw, click };
  }
  const JUDGE_RULES = ['tags', 'avoid', 'dressed', 'hold'];
  // themes judged mostly on what you can pick here (not scenes, poses or fabric patterns), with at least two rules left
  const themePool = () => TT.CHALLENGES.map(ch => ({ id: ch.id, text: ch.text, rules: ch.rules.filter(r => JUDGE_RULES.includes(r.type)), all: ch.rules }))
    .filter(ch => ch.rules.some(r => r.type === 'tags') && ch.rules.length >= 2 && ch.rules.reduce((a, r) => a + r.w, 0) >= ch.all.reduce((a, r) => a + r.w, 0) * 0.6);

  /* ======================================================================
     1. Fabric Match — swap fabric swatches to line up three or more.
        Four in a row makes a spool that clears its whole row when matched.
     ====================================================================== */
  const SWATCH = [
    { c: '#ff9ec0', p: 'dots' }, { c: '#9ee6c0', p: 'stripes' }, { c: '#ffe17a', p: 'stars' },
    { c: '#9cd3ff', p: 'hearts' }, { c: '#cfa8ff', p: 'gingham' }, { c: '#ffb38a', p: 'zigzag' }
  ];
  function match3() {
    const N = 7, MOVES = 20;
    K.setBar('Fabric Match');
    let grid = [], spool = [], moves = MOVES, score = 0, busy = false, sel = null;
    const defs = SWATCH.map((sw, i) => TT.patternDef(`m3p${i}`, sw.p, sw.c, '#ffffff')).join('');
    const rnd = () => Math.floor(Math.random() * SWATCH.length);
    for (let r = 0; r < N; r++) { grid[r] = []; spool[r] = []; for (let c = 0; c < N; c++) { let k; do { k = rnd(); } while ((c > 1 && grid[r][c - 1] === k && grid[r][c - 2] === k) || (r > 1 && grid[r - 1][c] === k && grid[r - 2][c] === k)); grid[r][c] = k; spool[r][c] = false; } }
    const tile = (k, sp) => `<svg viewBox="0 0 40 40">${R(3, 3, 34, 34, 9, `url(#m3p${k})`, 2.5)}${sp ? `<g transform="translate(20 20) scale(.62) translate(-12 -12)">${TT.SPOOL.replace(/<svg[^>]*>|<\/svg>/g, '')}</g>` : ''}</svg>`;
    body().innerHTML = `<div class="m3"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>
      <p class="g-say">Swap side-by-side swatches to make rows of 3!</p>
      <div class="m3-board" id="m3" style="--n:${N}" role="grid" aria-label="Fabric board"></div>
      <p class="rh-help">Tap two swatches next to each other to swap them (or swipe). 4 in a row makes a spool that clears a whole row.</p></div>`;
    const board = $('#m3');
    const hudNow = () => K.hud(`<span class="g-pill">Moves: ${moves}</span><span class="g-pill">${score}</span>`);
    const draw = (fresh = []) => {
      board.innerHTML = grid.map((row, r) => row.map((k, c) => `<button class="m3-cell${fresh.some(f => f[0] === r && f[1] === c) ? ' drop' : ''}${sel && sel[0] === r && sel[1] === c ? ' sel' : ''}" type="button" data-r="${r}" data-c="${c}" aria-label="${SWATCH[k].p} swatch${spool[r][c] ? ', spool' : ''}">${tile(k, spool[r][c])}</button>`).join('')).join('');
      hudNow();
    };
    const findRuns = () => {
      const runs = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N;) { let e = c; while (e + 1 < N && grid[r][e + 1] === grid[r][c]) e++; if (e - c >= 2) runs.push(Array.from({ length: e - c + 1 }, (_, i) => [r, c + i])); c = e + 1; }
      for (let c = 0; c < N; c++) for (let r = 0; r < N;) { let e = r; while (e + 1 < N && grid[e + 1][c] === grid[r][c]) e++; if (e - r >= 2) runs.push(Array.from({ length: e - r + 1 }, (_, i) => [r + i, c])); r = e + 1; }
      return runs;
    };
    const hasMove = () => {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr, c2 = c + dc; if (r2 >= N || c2 >= N) continue;
        [grid[r][c], grid[r2][c2]] = [grid[r2][c2], grid[r][c]];
        const ok = findRuns().length > 0;
        [grid[r][c], grid[r2][c2]] = [grid[r2][c2], grid[r][c]];
        if (ok) return true;
      }
      return false;
    };
    async function resolve(at) {
      let combo = 1;
      for (;;) {
        const runs = findRuns();
        if (!runs.length) break;
        const clear = new Set(), make = [];
        runs.forEach(run => {
          run.forEach(([r, c]) => clear.add(r * N + c));
          if (run.length >= 4) { const keep = run.find(([r, c]) => at && r === at[0] && c === at[1]) || run[Math.floor(run.length / 2)]; make.push(keep); }
        });
        // matched spools clear their whole row
        [...clear].forEach(i => { const r = Math.floor(i / N), c = i % N; if (spool[r][c]) for (let x = 0; x < N; x++) clear.add(r * N + x); });
        make.forEach(([r, c]) => clear.delete(r * N + c));
        score += clear.size * 10 * combo;
        board.querySelectorAll('.m3-cell').forEach(b => { if (clear.has(+b.dataset.r * N + +b.dataset.c)) b.classList.add('pop'); });
        Sound.tone(600 + combo * 120, 0.12, 'triangle', 0.12); if (combo > 1) Sound.sparkle();
        await wait(230);
        clear.forEach(i => { grid[Math.floor(i / N)][i % N] = -1; spool[Math.floor(i / N)][i % N] = false; });
        make.forEach(([r, c]) => { spool[r][c] = true; });
        // fall down and refill
        const fresh = [];
        for (let c = 0; c < N; c++) {
          const col = [], sp = [];
          for (let r = N - 1; r >= 0; r--) if (grid[r][c] >= 0) { col.push(grid[r][c]); sp.push(spool[r][c]); }
          for (let r = N - 1, i = 0; r >= 0; r--, i++) {
            if (i < col.length) { grid[r][c] = col[i]; spool[r][c] = sp[i]; } else { grid[r][c] = rnd(); spool[r][c] = false; fresh.push([r, c]); }
          }
        }
        draw(fresh); at = null; combo++;
        await wait(260);
      }
      if (!hasMove()) { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) grid[r][c] = rnd(); draw(); await resolve(null); }
    }
    async function trySwap(a, b) {
      if (busy || moves <= 0) return;
      busy = true; sel = null;
      [grid[a[0]][a[1]], grid[b[0]][b[1]]] = [grid[b[0]][b[1]], grid[a[0]][a[1]]];
      [spool[a[0]][a[1]], spool[b[0]][b[1]]] = [spool[b[0]][b[1]], spool[a[0]][a[1]]];
      draw();
      if (!findRuns().length) {
        Sound.undo(); await wait(200);
        [grid[a[0]][a[1]], grid[b[0]][b[1]]] = [grid[b[0]][b[1]], grid[a[0]][a[1]]];
        [spool[a[0]][a[1]], spool[b[0]][b[1]]] = [spool[b[0]][b[1]], spool[a[0]][a[1]]];
        draw(); busy = false; return;
      }
      moves--; hudNow();
      await resolve(b);
      busy = false;
      if (moves <= 0) {
        await wait(500);
        const stars = score >= 3000 ? 5 : score >= 2300 ? 4 : score >= 1600 ? 3 : score >= 900 ? 2 : 1;
        K.finish('match3', { stars, score, line: `You stitched up <b>${score}</b> points in ${MOVES} moves.` });
      }
    }
    let down = null;
    board.addEventListener('pointerdown', e => { const b = e.target.closest('.m3-cell'); if (b) down = { r: +b.dataset.r, c: +b.dataset.c, x: e.clientX, y: e.clientY }; });
    board.addEventListener('pointerup', e => {
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y, d = down; down = null;
      if (Math.hypot(dx, dy) > 18) { // swipe
        const [dr, dc] = Math.abs(dx) > Math.abs(dy) ? [0, Math.sign(dx)] : [Math.sign(dy), 0];
        const r2 = d.r + dr, c2 = d.c + dc; if (r2 >= 0 && r2 < N && c2 >= 0 && c2 < N) trySwap([d.r, d.c], [r2, c2]);
        return;
      }
      if (sel && Math.abs(sel[0] - d.r) + Math.abs(sel[1] - d.c) === 1) return trySwap(sel, [d.r, d.c]);
      sel = sel && sel[0] === d.r && sel[1] === d.c ? null : [d.r, d.c]; Sound.tap(); draw();
    });
    K.keys(e => {
      if (!sel) return;
      const m = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key]; if (!m) return;
      e.preventDefault(); const r2 = sel[0] + m[0], c2 = sel[1] + m[1]; if (r2 >= 0 && r2 < N && c2 >= 0 && c2 < N) trySwap(sel, [r2, c2]);
    });
    draw();
  }

  /* ======================================================================
     2. Pet Parade — run with your pet pal, jump the puddles, grab buttons.
     ====================================================================== */
  function parade() {
    const me = Object.assign(clone(K.ctx.look()), { fx: { id: null }, petPos: null });
    if (!me.pet || !me.pet.id) me.pet = { id: 'chick', color: 'bubblegum' };
    me.pose = { id: 'hooray' };
    const W = 800, H = 400, GROUND = 352, s = 0.5, X = 190, TIME = 45;
    K.setBar('Pet Parade');
    const look = TT.compose(me, { pfx: 'pp-', animated: false, scene: false, fx: false });
    const sceneId = (me.scene && me.scene.id) || 'meadow';
    body().innerHTML = `<div class="pp"><svg class="pp-field" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pet parade course">
        <g id="ppBg">${[0, 1, 2].map(i => `<g transform="translate(${i * 400} 0)">${sceneSVG(sceneId, 400, H, `pp${i}-`)}</g>`).join('')}</g>
        <rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="#d9b48c"/><path d="M0,${GROUND} H${W}" stroke="#5b3f58" stroke-width="4"/>
        <g id="ppStripes"></g><g id="ppThings"></g><g id="ppMe">${look}</g><g id="ppPops"></g></svg>
      <div class="ca-ctrl"><button class="btn-big pp-jump" type="button" data-jump>Jump!</button></div>
      <p class="rh-help">Tap anywhere (or press Space / ↑) to jump over puddles, pots and cones. Grab the buttons!</p></div>`;
    const field = $('.pp-field'), meG = $('#ppMe'), things = $('#ppThings'), bg = $('#ppBg'), stripes = $('#ppStripes'), pops = $('#ppPops');
    let y = 0, vy = 0, lives = 3, buttons = 0, dist = 0, last = performance.now(), start = last, hurtUntil = 0, nextObs = 1.2, nextBtn = 0.6, left = TIME;
    const items = [];
    const OBS = [
      { k: 'puddle', w: 70, h: 14, draw: () => E(0, -5, 38, 10, '#9cd3ff', 3) + E(-10, -7, 10, 3, '#ffffff', 0) },
      { k: 'pot', w: 44, h: 46, draw: () => P('M-20,-30 L20,-30 L15,0 L-15,0Z', '#e9967a', 3) + R(-24, -38, 48, 10, 4, '#d77e62', 3) + TT.flower(0, -50, 13, '#ff9ec0') },
      { k: 'cone', w: 40, h: 52, draw: () => P('M-18,0 L0,-52 L18,0Z', '#ffb38a', 3) + S('M-9,-20 L9,-20 M-13,-9 L13,-9', '#ffffff', 4) + R(-24, -4, 48, 6, 2, '#ff8a65', 3) }
    ];
    const jump = () => { if (y >= -0.5) { vy = -860; Sound.tone(520, 0.12, 'sine', 0.12, 0, 1.8); } };
    field.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
    $('[data-jump]').addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
    K.keys(e => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); } });
    const hud = () => K.hud(`<span class="g-pill">${'♥'.repeat(lives)}<span class="g-off">${'♥'.repeat(3 - lives)}</span></span><span class="g-pill">${TT.SPOOL}${buttons}</span><span class="g-pill">${Math.ceil(left)}s</span>`);
    hud();
    const pop = (px, py, txt, col) => { const t = document.createElementNS(NS, 'text'); t.setAttribute('x', px); t.setAttribute('y', py); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'ca-pop pp-pop'); t.setAttribute('fill', col); t.textContent = txt; pops.appendChild(t); setTimeout(() => t.remove(), 700); };
    K.loop(now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const el = (now - start) / 1000; left = Math.max(0, TIME - el);
      const speed = 300 + el * 6;
      dist += speed * dt;
      vy += 2300 * dt; y = Math.min(0, y + vy * dt); if (y === 0 && vy > 0) vy = 0;
      // background drifts slowly, ground stripes fast
      bg.setAttribute('transform', `translate(${-(dist * 0.15) % 400} 0)`);
      stripes.innerHTML = Array.from({ length: 9 }, (_, i) => { const sx = ((i * 100 - dist) % 900 + 900) % 900 - 50; return `<path d="M${sx},${GROUND + 18} l40,0" stroke="#c49a72" stroke-width="5" stroke-linecap="round"/>`; }).join('');
      const bob = y === 0 ? Math.abs(Math.sin(el * 14)) * -5 : 0;
      meG.setAttribute('transform', `translate(${X - 200 * s} ${GROUND - 440 * s + y + bob}) scale(${s})`);
      meG.style.opacity = now < hurtUntil ? (Math.floor(now / 90) % 2 ? 0.35 : 1) : 1;
      // spawn
      nextObs -= dt; nextBtn -= dt;
      if (nextObs <= 0) {
        const o = pick(OBS); const g = document.createElementNS(NS, 'g'); g.innerHTML = o.draw(); things.appendChild(g);
        items.push({ o, x: W + 60, g, bad: true });
        nextObs = Math.max(0.85, 1.9 - el * 0.02) + Math.random() * 0.9;
      }
      if (nextBtn <= 0) {
        const high = Math.random() < 0.5; const g = document.createElementNS(NS, 'g'); g.innerHTML = K.sewButton(0, 0, 13, pick(['#ff9ec0', '#9ee6c0', '#9cd3ff', '#ffe17a'])); things.appendChild(g);
        items.push({ x: W + 40, g, by: high ? GROUND - 230 : GROUND - 80 });
        nextBtn = 0.5 + Math.random() * 0.8;
      }
      // move & collide (the critter's body is about x ±34 around X, from its feet up ~150)
      const feet = GROUND + y;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i]; it.x -= speed * dt;
        if (it.bad) {
          it.g.setAttribute('transform', `translate(${it.x} ${GROUND})`);
          if (!it.hit && now > hurtUntil && Math.abs(it.x - X) < it.o.w / 2 + 22 && feet > GROUND - it.o.h + 4) {
            it.hit = true; lives--; hurtUntil = now + 1100; Sound.undo(); pop(X, GROUND - 170, 'Oops!', '#ff6f96'); hud();
          }
        } else {
          it.g.setAttribute('transform', `translate(${it.x} ${it.by})`);
          if (Math.abs(it.x - X) < 46 && it.by > feet - 205 && it.by < feet + 5) { buttons++; Sound.coin(); pop(it.x, it.by - 14, '+1', '#ff6f96'); it.g.remove(); items.splice(i, 1); hud(); continue; }
        }
        if (it.x < -80) { it.g.remove(); items.splice(i, 1); }
      }
      if (Math.floor(left * 4) !== Math.floor((left + dt) * 4)) hud();
      if (left <= 0 || lives <= 0) {
        const m = Math.round(dist / 40);
        const pts = buttons * 10 + m;
        const stars = pts >= 650 ? 5 : pts >= 480 ? 4 : pts >= 320 ? 3 : pts >= 160 ? 2 : 1;
        K.finish('parade', { stars, score: pts, line: `You ran <b>${m} meters</b> and grabbed <b>${buttons} buttons</b>${lives <= 0 ? ' before you ran out of hearts' : ''}. ${pts} points!` });
        return false;
      }
    });
  }

  /* ======================================================================
     3. Dress-Up Dash — find each piece of the outfit before the timer runs out.
     ====================================================================== */
  function dash() {
    const me = blankOutfit(plain(K.ctx.look())); me.pose = { id: 'stand' };
    const SLOTS = ['hat', 'top', 'bottom', 'shoes', 'hold'];
    const OUTFITS = 3;
    let o = 0, k = 0, right = 0, pts = 0, target = null, mine = null, timer = 0, tLeft = 0, limit = 0, busy = false;
    K.setBar('Dress-Up Dash');
    const newOutfit = () => {
      target = clone(me);
      SLOTS.forEach(s => { const it = pick(TT.SLOTS[s].items.filter(i => okItem(s, i))); target[s] = { id: it.id, color: pick(COLS()).id, color2: null, pattern: 'solid' }; });
      mine = clone(me);
    };
    const step = () => {
      if (k >= SLOTS.length) { o++; k = 0; if (o >= OUTFITS) return end(); newOutfit(); }
      const s = SLOTS[k];
      const want = target[s];
      const others = shuffle(TT.SLOTS[s].items.filter(i => i.id !== want.id && okItem(s, i))).slice(0, 3);
      const choices = shuffle([want].concat(others.map(i => ({ id: i.id, color: want.color }))));
      limit = [4, 3.2, 2.6][o]; tLeft = limit; busy = false;
      K.hud(`<span class="g-pill">Outfit ${o + 1} of ${OUTFITS}</span><span class="g-pill">${pts}</span>`);
      body().innerHTML = `<div class="dd">
        <div class="dd-looks"><figure>${critterSVG(target, `dd${o}t${k}-`)}<figcaption>Match this!</figcaption></figure><figure class="mine">${critterSVG(mine, `dd${o}m${k}-`)}<figcaption>Yours</figcaption></figure></div>
        <p class="g-say">Quick! Find the <b>${{ hat: 'hat', top: 'top', bottom: 'bottoms', shoes: 'shoes', hold: 'thing to hold' }[s]}</b>!</p>
        <div class="g-timer dd-timer"><span id="ddT"></span></div>
        <div class="dd-opts">${choices.map((c, i) => `<button class="g-opt" type="button" data-pick="${i}">${thumbOf(s, c.id, c.color, me)}</button>`).join('')}</div></div>`;
      body().querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => choose(choices[+b.dataset.pick], b)));
      clearInterval(timer);
      timer = K.every(() => { tLeft -= 0.1; const el = $('#ddT'); if (el) { el.style.width = Math.max(0, tLeft / limit * 100) + '%'; el.classList.toggle('low', tLeft < limit * 0.35); } if (tLeft <= 0) choose(null, null); }, 100);
      function choose(c, btn) {
        if (busy) return; busy = true; clearInterval(timer);
        const ok = c && c.id === want.id;
        if (ok) { right++; pts += 100 + Math.round(tLeft * 40); mine[s] = clone(want); Sound.pop(); btn.classList.add('ok'); }
        else { Sound.undo(); if (btn) btn.classList.add('no'); body().querySelectorAll('[data-pick]').forEach((b, i) => { if (choices[i].id === want.id) b.classList.add('ok'); }); mine[s] = clone(want); }
        K.later(() => { k++; step(); }, ok ? 350 : 800);
      }
    };
    const end = () => {
      const total = OUTFITS * SLOTS.length;
      const stars = right >= 15 ? 5 : right >= 13 ? 4 : right >= 10 ? 3 : right >= 7 ? 2 : 1;
      K.finish('dash', { stars, score: pts, line: `You found <b>${right} of ${total}</b> pieces in time. ${pts} points!` });
    };
    newOutfit(); step();
  }

  /* ======================================================================
     4. Tailor's Puzzle — slide the tiles to put your critter's picture back together.
     ====================================================================== */
  function slide() {
    K.setBar("Tailor's Puzzle");
    body().innerHTML = `<div class="g-pick"><p class="g-say">How big a puzzle?</p>
      <button class="g-card" type="button" data-n="3" style="--card:#d7f3e6"><span class="g-name">Easy</span><span class="g-blurb">3 × 3 tiles</span></button>
      <button class="g-card" type="button" data-n="4" style="--card:#ffd1e0"><span class="g-name">Tricky</span><span class="g-blurb">4 × 4 tiles</span></button></div>`;
    body().querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { Sound.tap(); play(+b.dataset.n); }));
    function play(n) {
      const me = Object.assign(clone(K.ctx.look()), { fx: { id: null } });
      const img = TT.compose(me, { pfx: 'sl-', animated: false });
      const tw = 400 / n, th = 460 / n;
      let tiles = Array.from({ length: n * n }, (_, i) => i); // tiles[pos] = which piece; n*n-1 is the gap
      const gap = () => tiles.indexOf(n * n - 1);
      const nbrs = p => [p - n, p + n, p % n ? p - 1 : -1, p % n < n - 1 ? p + 1 : -1].filter(q => q >= 0 && q < n * n);
      let prev = -1;
      for (let i = 0; i < (n === 3 ? 160 : 320); i++) { const g = gap(); const opts = nbrs(g).filter(q => q !== prev); const q = pick(opts); [tiles[g], tiles[q]] = [tiles[q], tiles[g]]; prev = g; }
      if (tiles.every((t, i) => t === i)) { const g = gap(), q = nbrs(g)[0]; [tiles[g], tiles[q]] = [tiles[q], tiles[g]]; }
      let moves = 0, nums = false, done = false;
      const t0 = Date.now();
      body().innerHTML = `<div class="sl"><svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="slImg" viewBox="0 0 400 460">${img}</symbol></svg>
        <div class="sl-board" id="slB" style="--n:${n}" aria-label="Sliding puzzle"></div>
        <div class="sl-tools"><button class="btn-soft" type="button" data-peek>Peek</button><button class="btn-soft" type="button" data-nums aria-pressed="false">Numbers</button></div>
        <p class="rh-help">Tap a tile next to the empty space to slide it.</p></div>`;
      const B = $('#slB');
      const draw = () => {
        B.innerHTML = tiles.map((t, p) => t === n * n - 1 && !done ? `<div class="sl-gap"></div>` :
          `<button class="sl-tile" type="button" data-p="${p}" aria-label="Tile ${t + 1}"><svg viewBox="${(t % n) * tw} ${Math.floor(t / n) * th} ${tw} ${th}" preserveAspectRatio="none"><use href="#slImg" width="400" height="460"/></svg>${nums ? `<i>${t + 1}</i>` : ''}</button>`).join('') + `<svg class="sl-peek" viewBox="0 0 400 460" aria-hidden="true"><use href="#slImg" width="400" height="460"/></svg>`;
        K.hud(`<span class="g-pill">Moves: ${moves}</span>`);
      };
      const move = p => {
        if (done) return;
        const g = gap();
        // tap any tile in the gap's row or column to slide the whole line
        const sameRow = Math.floor(p / n) === Math.floor(g / n), sameCol = p % n === g % n;
        if (!(sameRow || sameCol) || p === g) return;
        const stepBy = sameRow ? (p > g ? 1 : -1) : (p > g ? n : -n);
        for (let q = g; q !== p; q += stepBy) { [tiles[q], tiles[q + stepBy]] = [tiles[q + stepBy], tiles[q]]; moves++; }
        Sound.tone(700 + Math.random() * 80, 0.05, 'triangle', 0.08);
        if (tiles.every((t, i) => t === i)) { done = true; draw(); B.classList.add('solved'); Sound.cheer(); K.later(win, 900); return; }
        draw();
      };
      B.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) move(+b.dataset.p); });
      K.keys(e => { const g = gap(); const d = { ArrowLeft: g % n < n - 1 ? g + 1 : -1, ArrowRight: g % n ? g - 1 : -1, ArrowUp: g + n < n * n ? g + n : -1, ArrowDown: g - n }[e.key]; if (d !== undefined && d >= 0) { e.preventDefault(); move(d); } });
      const peek = $('[data-peek]');
      const show = on => { B.classList.toggle('peek', on); };
      peek.addEventListener('pointerdown', () => show(true)); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => peek.addEventListener(ev, () => show(false)));
      $('[data-nums]').addEventListener('click', e => { nums = !nums; e.currentTarget.setAttribute('aria-pressed', nums); draw(); });
      function win() {
        const secs = Math.round((Date.now() - t0) / 1000);
        const par = n === 3 ? [40, 60, 90, 140] : [120, 180, 260, 360];
        const stars = 1 + par.filter(x => moves <= x).length;
        K.finish('slide', { stars, score: Math.max(1, (n === 3 ? 500 : 1000) - moves * 3 - secs), line: `You solved the ${n} × ${n} puzzle in <b>${moves} moves</b> (${secs} seconds).` });
      }
      draw();
    }
  }

  /* ======================================================================
     5. Spot the Difference — five sneaky changes between two pictures.
     ====================================================================== */
  const SPOTS = [
    { slot: 'hat', x: 200, y: 92, r: 62 }, { slot: 'face', x: 200, y: 180, r: 48, group: 'face' }, { slot: 'eyes', x: 200, y: 178, r: 48, group: 'face' },
    { slot: 'neck', x: 200, y: 252, r: 40 }, { slot: 'top', x: 200, y: 300, r: 52 }, { slot: 'bottom', x: 200, y: 362, r: 48 },
    { slot: 'shoes', x: 200, y: 408, r: 42 }, { slot: 'hold', x: 288, y: 318, r: 44 }, { slot: 'pet', x: 66, y: 418, r: 46 }, { slot: 'back', x: 112, y: 270, r: 44 }
  ];
  function spot() {
    const base = Object.assign(clone(K.ctx.look()), { fx: { id: null }, petPos: null, pose: { id: 'stand' } });
    if (!base.pet || !base.pet.id) base.pet = { id: 'bunny', color: 'cloud' };
    const view = st => TT.compose(st, { pfx: 'sdcmp-', animated: false });
    const orig = view(base);
    const changed = clone(base), diffs = [];
    const top = TT.itemOf('top', base.top.id), bot = TT.itemOf('bottom', base.bottom.id);
    const usable = shuffle(SPOTS.filter(sp => !(sp.slot === 'bottom' && top && LONG_TOPS.includes(top.id)) && !(sp.slot === 'shoes' && bot && bot.hideFeet)));
    const groups = new Set();
    for (const sp of usable) {
      if (diffs.length >= 5) break;
      if (sp.group && groups.has(sp.group)) continue;
      for (let tries = 0; tries < 12; tries++) {
        const test = clone(changed);
        const e = test[sp.slot] || (test[sp.slot] = {});
        const items = TT.SLOTS[sp.slot].items.filter(i => i.id !== e.id && (sp.slot !== 'top' || !LONG_TOPS.includes(i.id)) && (sp.slot !== 'bottom' || !i.hideFeet));
        const it = e.id && TT.itemOf(sp.slot, e.id);
        if (it && TT.SLOTS[sp.slot].palette && !it.fixed && Math.random() < 0.45) { const fam = TT.colorFamily(TT.colorHex(sp.slot, e.color)); e.color = pick(COLS().filter(c => TT.colorFamily(c.hex) !== fam)).id; e.pattern = 'solid'; }
        else e.id = pick(items).id;
        const before = TT.compose(changed, { pfx: 'sdcmp-', animated: false });
        if (view(test) !== before) { Object.assign(changed, test); diffs.push(Object.assign({ found: false }, sp)); if (sp.group) groups.add(sp.group); break; }
      }
    }
    const TIME = 75;
    let left = TIME, over = false;
    K.setBar('Spot the Difference');
    const pic = (st, id) => `<svg class="sd-pic" id="${id}" viewBox="0 0 400 460" role="img" aria-label="${id === 'sdA' ? 'First' : 'Second'} picture">${TT.compose(st, { pfx: id + '-', animated: false })}<g class="sd-marks"></g></svg>`;
    body().innerHTML = `<div class="sd"><p class="g-say">Find the <b>${diffs.length}</b> differences!</p>
      <div class="sd-pics">${pic(base, 'sdA')}${pic(changed, 'sdB')}</div>
      <p class="rh-help">Tap a difference on either picture. Wrong taps cost 3 seconds.</p></div>`;
    const hud = () => K.hud(`<span class="g-pill">Found ${diffs.filter(d => d.found).length}/${diffs.length}</span><span class="g-pill">${left}s</span>`);
    hud();
    const mark = (svg, x, y, r, cls) => { svg.querySelector('.sd-marks').insertAdjacentHTML('beforeend', `<circle cx="${x}" cy="${y}" r="${r}" class="${cls}" fill="none" stroke-width="8"/>`); };
    const tap = (svg, e) => {
      if (over) return;
      const p = toSvgPt(svg, e);
      const hit = diffs.filter(d => !d.found).map(d => ({ d, dist: Math.hypot(d.x - p.x, d.y - p.y) })).filter(h => h.dist <= h.d.r).sort((a, b) => a.dist - b.dist)[0];
      if (hit) {
        hit.d.found = true; Sound.sparkle();
        ['#sdA', '#sdB'].forEach(id => mark($(id), hit.d.x, hit.d.y, hit.d.r * 0.9, 'sd-ring'));
        hud();
        if (diffs.every(d => d.found)) { over = true; end(); }
      } else {
        left = Math.max(1, left - 3); Sound.undo(); hud();
        mark(svg, p.x, p.y, 16, 'sd-miss'); const m = svg.querySelector('.sd-marks').lastChild; setTimeout(() => m && m.remove(), 600);
      }
    };
    ['#sdA', '#sdB'].forEach(id => { const s = $(id); s.addEventListener('pointerdown', e => { e.preventDefault(); tap(s, e); }); });
    K.every(() => {
      if (over) return; left--; hud();
      if (left <= 0) { over = true; diffs.filter(d => !d.found).forEach(d => ['#sdA', '#sdB'].forEach(id => mark($(id), d.x, d.y, d.r * 0.9, 'sd-show'))); Sound.undo(); K.later(end, 1600); }
    }, 1000);
    function end() {
      const found = diffs.filter(d => d.found).length;
      const stars = found === diffs.length ? (left >= 20 ? 5 : 4) : found >= 4 ? 3 : found >= 2 ? 2 : 1;
      K.finish('spot', { stars, score: found * 100 + left * 5, line: `You spotted <b>${found} of ${diffs.length}</b> differences${found === diffs.length ? ` with ${left} seconds to spare` : ''}.` });
    }
  }

  /* ======================================================================
     6. Critter Says — watch the poses, then copy them. One more each round!
     ====================================================================== */
  function says() {
    const me = plain(K.ctx.look());
    K.setBar('Critter Says');
    const frames = {}; ['stand'].concat(POSE_PADS.map(p => p.pose)).forEach(p => { frames[p] = critter(me, `cs-${p}-`, p); });
    body().innerHTML = `<div class="cs"><div class="cs-stage"><svg viewBox="40 0 320 440" id="csMe" role="img" aria-label="${esc(me.name || 'Your critter')}">${frames.stand}</svg></div>
      <p class="g-say" id="csSay">Watch closely…</p>
      <div class="rh-pads">${POSE_PADS.map((l, i) => `<button class="rh-pad" type="button" data-lane="${i}" style="--pad:${l.color}" disabled>${TT.svg(frames[l.pose], '40 0 320 440')}<span>${l.label}</span></button>`).join('')}</div>
      <p class="rh-help">Keys: ← ↓ ↑ → or D F J K</p></div>`;
    const seq = [], meSvg = $('#csMe'), say = $('#csSay');
    let input = 0, listening = false, round = 0;
    const pads = [...K.root.querySelectorAll('.rh-pad')];
    const flash = (i, ms) => { const p = POSE_PADS[i]; meSvg.innerHTML = frames[p.pose]; pads[i].classList.add('lit'); Sound.tone(p.note, ms / 1000 * 0.9, 'triangle', 0.16); K.later(() => { pads[i].classList.remove('lit'); meSvg.innerHTML = frames.stand; }, ms); };
    const enable = on => { listening = on; pads.forEach(b => { b.disabled = !on; }); };
    async function playRound() {
      enable(false); round = seq.length; seq.push(Math.floor(Math.random() * 4));
      K.hud(`<span class="g-pill">Round ${seq.length}</span>`);
      say.textContent = 'Watch closely…'; await wait(700);
      const ms = Math.max(320, 620 - seq.length * 25);
      for (const i of seq) { flash(i, ms); await wait(ms + 140); }
      say.textContent = 'Your turn! Copy the poses.'; input = 0; enable(true);
    }
    function press(i) {
      if (!listening) return;
      flash(i, 260);
      if (i !== seq[input]) { enable(false); Sound.undo(); say.textContent = 'Oops! That wasn’t it.'; pads[seq[input]].classList.add('lit'); K.later(end, 1200); return; }
      input++;
      if (input === seq.length) { enable(false); say.textContent = seq.length >= 5 ? 'Wow, great memory!' : 'Yes! Next round…'; Sound.sparkle(); K.later(playRound, 900); }
    }
    pads.forEach((b, i) => b.addEventListener('pointerdown', e => { e.preventDefault(); press(i); }));
    K.keys(e => { if (e.repeat) return; const i = POSE_PADS.findIndex(l => l.keys.includes(e.key)); if (i >= 0) { e.preventDefault(); press(i); } });
    function end() {
      const done = seq.length - 1;
      const stars = 1 + [3, 5, 7, 10].filter(x => done >= x).length;
      K.finish('says', { stars, score: done, line: `You copied <b>${done}</b> round${done === 1 ? '' : 's'} in a row (${done} poses at the end).` });
    }
    playRound();
  }

  /* ======================================================================
     7. Sewing Machine — keep your finger on the needle as it sews the pattern.
     ====================================================================== */
  const SEW_PATHS = [
    { name: 'Wavy hem', d: 'M40,160 C90,80 130,80 170,160 S250,240 290,160 S350,100 370,150', secs: 9 },
    { name: 'Heart patch', d: 'M200,250 C120,195 70,150 95,105 C120,62 180,70 200,118 C220,70 280,62 305,105 C330,150 280,195 200,250', secs: 9 },
    { name: 'Zigzag trim', d: 'M40,90 L95,210 L150,90 L205,210 L260,90 L315,210 L365,110', secs: 8 }
  ];
  function sew() {
    K.setBar('Sewing Machine');
    let round = 0; const scores = [];
    const fabric = TT.patternDef('sewFab', 'gingham', '#ffd1e0', '#ffffff');
    function play() {
      if (round >= SEW_PATHS.length) return end();
      const P0 = SEW_PATHS[round];
      K.hud(`<span class="g-pill">Pattern ${round + 1} of ${SEW_PATHS.length}</span>`);
      body().innerHTML = `<div class="sw"><p class="g-say">${P0.name}: put your finger on the needle, then follow it!</p>
        <svg class="sw-field" viewBox="0 0 400 300" role="img" aria-label="Fabric to sew"><defs>${fabric}</defs>
          <rect x="6" y="6" width="388" height="288" rx="22" fill="url(#sewFab)" stroke="#5b3f58" stroke-width="4"/>
          <path id="swGuide" d="${P0.d}" fill="none" stroke="#8a6f88" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" opacity=".7"/>
          <g id="swStitches"></g>
          <g id="swNeedle"><circle r="30" fill="#ffffff" opacity=".55" stroke="#e64f7c" stroke-width="3" stroke-dasharray="6 5"/><path d="M0,-26 L0,6" stroke="#9aa3b5" stroke-width="5" stroke-linecap="round"/><circle cy="-20" r="3" fill="#5b3f58"/><circle r="5" fill="#e64f7c"/></g>
          <g id="swFinger"></g></svg>
        <div class="g-timer"><span id="swBar" style="width:0%"></span></div>
        <p class="rh-help" id="swMsg">Touch the pink circle to start sewing.</p></div>`;
      const svg = $('.sw-field'), guide = $('#swGuide'), needle = $('#swNeedle'), st = $('#swStitches'), fing = $('#swFinger');
      const L = guide.getTotalLength();
      const at = k => guide.getPointAtLength(L * k);
      let finger = null, started = false, on = 0, total = 0, t0 = 0, lastK = 0;
      const p0 = at(0); needle.setAttribute('transform', `translate(${p0.x} ${p0.y})`);
      const setF = e => { const p = toSvgPt(svg, e); finger = { x: p.x, y: p.y }; fing.innerHTML = `<circle cx="${p.x}" cy="${p.y}" r="7" fill="#5b3f58" opacity=".35"/>`; };
      svg.addEventListener('pointerdown', e => { e.preventDefault(); svg.setPointerCapture(e.pointerId); setF(e); if (!started && Math.hypot(finger.x - p0.x, finger.y - p0.y) < 40) { started = true; t0 = performance.now(); $('#swMsg').textContent = 'Keep your finger on the needle!'; Sound.whoosh(); } });
      svg.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) setF(e); });
      const lift = e => { if (e.pointerType !== 'mouse') { finger = null; fing.innerHTML = ''; } };
      svg.addEventListener('pointerup', lift); svg.addEventListener('pointercancel', lift);
      K.loop(now => {
        if (!started) return;
        const k = Math.min(1, (now - t0) / (P0.secs * 1000));
        const p = at(k);
        needle.setAttribute('transform', `translate(${p.x} ${p.y})`);
        $('#swBar').style.width = (k * 100) + '%';
        const good = finger && Math.hypot(finger.x - p.x, finger.y - p.y) < 32;
        total++; if (good) on++;
        if (k - lastK > 0.012) { // lay down a stitch
          const a = at(lastK);
          st.insertAdjacentHTML('beforeend', `<path d="M${a.x.toFixed(1)},${a.y.toFixed(1)} L${p.x.toFixed(1)},${p.y.toFixed(1)}" stroke="${good ? '#e64f7c' : '#c9bcc8'}" stroke-width="${good ? 5 : 3}" stroke-linecap="round"/>`);
          if (good) Sound.tone(1600 + Math.random() * 200, 0.02, 'square', 0.015);
          lastK = k;
        }
        if (k >= 1) {
          const acc = total ? on / total : 0; scores.push(acc);
          $('#swMsg').textContent = `${Math.round(acc * 100)}% on the line!`; acc > 0.75 ? Sound.cheer() : Sound.sparkle();
          round++; K.later(play, 1300);
          return false;
        }
      });
    }
    function end() {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const stars = 1 + [0.4, 0.6, 0.75, 0.88].filter(x => avg >= x).length;
      K.finish('sew', { stars, score: Math.round(avg * 100), line: `Your stitches were <b>${Math.round(avg * 100)}%</b> on the line across ${SEW_PATHS.length} patterns.` });
    }
    play();
  }

  /* ======================================================================
     8. Bubble Pop Boutique — pop only what the customer asks for.
     ====================================================================== */
  function bubbles() {
    const me = plain(K.ctx.look());
    K.setBar('Bubble Pop Boutique');
    const FAMS = [{ fam: 'pink', id: 'bubblegum', word: 'pink' }, { fam: 'blue', id: 'sky', word: 'blue' }, { fam: 'green', id: 'mint', word: 'green' }, { fam: 'yellow', id: 'butter', word: 'yellow' }, { fam: 'purple', id: 'lavender', word: 'purple' }];
    const SL = [{ slot: 'hat', word: 'hats' }, { slot: 'shoes', word: 'shoes' }, { slot: 'top', word: 'tops' }, { slot: 'hold', word: 'things to hold' }, { slot: 'pet', word: 'pets' }];
    const cache = {};
    const art = (slot, id, color) => cache[slot + id + color] || (cache[slot + id + color] = thumbOf(slot, id, color, me));
    const items = SL.map(s => ({ slot: s.slot, list: TT.SLOTS[s.slot].items.filter(i => !i.fixed) }));
    let rule = null, ruleT = 0, score = 0, lives = 3, left = 45, spawnT = 0, last = performance.now(), start = last;
    const bubs = [];
    body().innerHTML = `<div class="bp"><div class="bp-ask"><span class="ru-who">Your customer says:</span><strong id="bpRule"></strong></div>
      <div class="bp-field" id="bpF" aria-label="Bubbles"></div><p class="rh-help">Tap the right bubbles. Wrong ones cost a heart!</p></div>`;
    const field = $('#bpF');
    const newRule = () => {
      const r = Math.random() < 0.55 ? Object.assign({ type: 'slot' }, pick(SL)) : Object.assign({ type: 'color' }, pick(FAMS));
      rule = r; ruleT = 11;
      $('#bpRule').textContent = r.type === 'slot' ? `“Pop only the ${r.word}!”` : `“Pop everything ${r.word}!”`;
      $('#bpRule').animate([{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 300 });
      Sound.whoosh();
    };
    const fits = b => rule.type === 'slot' ? b.slot === rule.slot : b.fam === rule.fam;
    const hud = () => K.hud(`<span class="g-pill">${'♥'.repeat(lives)}<span class="g-off">${'♥'.repeat(3 - lives)}</span></span><span class="g-pill">${score}</span><span class="g-pill">${Math.ceil(left)}s</span>`);
    const spawn = () => {
      // about half the bubbles are things the customer wants
      let slot, f;
      const want = Math.random() < 0.5;
      if (rule.type === 'slot') { slot = want ? rule.slot : pick(SL.filter(s => s.slot !== rule.slot)).slot; f = pick(FAMS); }
      else { f = want ? FAMS.find(x => x.fam === rule.fam) : pick(FAMS.filter(x => x.fam !== rule.fam)); slot = pick(SL).slot; }
      const it = pick(items.find(x => x.slot === slot).list);
      const el = document.createElement('button');
      el.className = 'bp-bub'; el.type = 'button'; el.innerHTML = art(slot, it.id, f.id); el.setAttribute('aria-label', `${f.word} ${it.name}`);
      field.appendChild(el);
      const W = field.clientWidth, H = field.clientHeight, size = Math.min(92, Math.max(64, W / 5));
      el.style.width = el.style.height = size + 'px';
      el.dataset.slot = slot; el.dataset.fam = f.fam;
      const b = { el, slot, fam: f.fam, x: Math.random() * (W - size), y: H + 10, v: 55 + Math.random() * 35 + (45 - left) * 2.2, ph: Math.random() * 6, size };
      el.addEventListener('pointerdown', e => {
        e.preventDefault(); if (b.gone) return; b.gone = true;
        if (fits(b)) { score++; Sound.pop(); el.classList.add('good'); } else { lives--; Sound.undo(); el.classList.add('bad'); }
        hud(); setTimeout(() => el.remove(), 250);
      });
      bubs.push(b);
    };
    newRule(); hud();
    K.loop(now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      left = Math.max(0, 45 - (now - start) / 1000);
      ruleT -= dt; if (ruleT <= 0) newRule();
      spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = Math.max(0.45, 0.95 - (45 - left) * 0.01); }
      for (let i = bubs.length - 1; i >= 0; i--) {
        const b = bubs[i]; b.y -= b.v * dt; b.ph += dt * 2;
        b.el.style.transform = `translate(${b.x + Math.sin(b.ph) * 12}px, ${b.y}px)`;
        if (b.y < -b.size - 10 || (b.gone && !b.el.isConnected)) { b.el.remove(); bubs.splice(i, 1); }
      }
      if (Math.floor(left * 4) !== Math.floor((left + dt) * 4)) hud();
      if (left <= 0 || lives <= 0) {
        const stars = score >= 30 ? 5 : score >= 22 ? 4 : score >= 15 ? 3 : score >= 8 ? 2 : 1;
        K.finish('bubbles', { stars, score, line: `You popped <b>${score}</b> right bubbles${lives <= 0 ? ' before your hearts ran out' : ''}.` });
        return false;
      }
    });
  }

  /* ======================================================================
     9. Weather Wardrobe — the forecast says… pick the outfit that fits!
     ====================================================================== */
  const WEATHER = [
    { id: 'sunny', tags: ['beach', 'summer'], scene: 'beach', text: 'Sunny beach day!', avoid: [],
      icon: () => C(50, 50, 20, '#ffe17a', 4) + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M50,50 m${(30 * Math.sin(a * Math.PI / 180)).toFixed(1)},${(-30 * Math.cos(a * Math.PI / 180)).toFixed(1)} l${(10 * Math.sin(a * Math.PI / 180)).toFixed(1)},${(-10 * Math.cos(a * Math.PI / 180)).toFixed(1)}" stroke="#f2a93b" stroke-width="5" stroke-linecap="round"/>`).join('') },
    { id: 'snowy', tags: ['winter'], scene: 'snow', text: 'Snowy and cold!', avoid: ['autumn'],
      icon: () => [0, 60, 120].map(a => `<path d="M50,18 L50,82" transform="rotate(${a} 50 50)" stroke="#7cb7ff" stroke-width="6" stroke-linecap="round"/>`).join('') + C(50, 50, 8, '#ffffff', 4) },
    { id: 'rainy', tags: ['rainy'], scene: 'clouds', text: 'Rainy and splashy!', avoid: [],
      icon: () => E(50, 44, 34, 18, '#cfd8e8', 4) + C(36, 38, 14, '#cfd8e8', 0) + C(58, 32, 16, '#cfd8e8', 0) + [30, 50, 70].map(x => `<path d="M${x},70 l-5,12" stroke="#7cb7ff" stroke-width="5" stroke-linecap="round"/>`).join('') },
    { id: 'autumn', tags: ['autumn'], scene: 'autumn', text: 'Windy fall day!', avoid: ['winter'],
      icon: () => P('M50,14 C78,30 82,62 50,86 C18,62 22,30 50,14Z', '#ff9a52', 4) + S('M50,22 L50,84 M50,46 L36,36 M50,60 L64,50', '#c96a2a', 3) }
  ];
  function weather() {
    const me = blankOutfit(plain(K.ctx.look())); me.pose = { id: 'stand' };
    const ROUNDS = 12;
    let r = 0, right = 0, pts = 0, timer = 0, busy = false;
    K.setBar('Weather Wardrobe');
    const SL = ['top', 'bottom', 'shoes', 'hat', 'neck', 'hold'];
    const has = (s, i, tags) => tagsOf(s, i.id).some(t => tags.includes(t));
    const outfitFor = (w, others) => {
      const st = clone(me);
      const bad = others.flatMap(o => o.tags).concat(w.avoid);
      let hits = 0;
      SL.forEach(s => {
        const list = TT.SLOTS[s].items.filter(i => okItem(s, i));
        const good = list.filter(i => has(s, i, w.tags) && !has(s, i, bad));
        const neutral = list.filter(i => !WEATHER.some(x => has(s, i, x.tags)));
        let it = null;
        if (good.length && (Math.random() < 0.8 || hits < 2)) { it = pick(good); hits++; }
        else if (['top', 'bottom', 'shoes'].includes(s) && neutral.length) it = pick(neutral);
        if (it) st[s] = { id: it.id, color: pick(COLS()).id, color2: null, pattern: 'solid' };
      });
      return st;
    };
    function round() {
      if (r >= ROUNDS) return end();
      busy = false;
      const w = pick(WEATHER);
      const foes = shuffle(WEATHER.filter(x => x.id !== w.id && !w.avoid.includes(x.id) && !x.avoid.includes(w.id))).slice(0, 2);
      while (foes.length < 2) foes.push(pick(WEATHER.filter(x => x.id !== w.id)));
      const looks = shuffle([{ ok: true, st: outfitFor(w, foes) }].concat(foes.map(f => ({ ok: false, st: outfitFor(f, [w]) }))));
      const limit = Math.max(3, 7 - r * 0.35); let tLeft = limit;
      K.hud(`<span class="g-pill">Day ${r + 1} of ${ROUNDS}</span><span class="g-pill">${pts}</span>`);
      body().innerHTML = `<div class="ww">
        <div class="ww-cast">${TT.svg(w.icon(), '0 0 100 100', 'class="ww-icon" aria-hidden="true"')}<div><span class="ru-who">Today's forecast</span><strong>${w.text}</strong></div></div>
        <div class="g-timer"><span id="wwT"></span></div>
        <div class="ww-looks">${looks.map((l, i) => `<button class="ww-look" type="button" data-i="${i}" aria-label="Outfit ${i + 1}">${critterSVG(l.st, `ww${r}${i}-`)}</button>`).join('')}</div>
        <p class="rh-help">Tap the outfit that's right for the weather!</p></div>`;
      const btns = [...body().querySelectorAll('.ww-look')];
      btns.forEach((b, i) => b.addEventListener('click', () => choose(i)));
      K.keys(e => { const i = ['1', '2', '3'].indexOf(e.key); if (i >= 0) choose(i); });
      timer = K.every(() => { tLeft -= 0.1; const el = $('#wwT'); if (el) { el.style.width = Math.max(0, tLeft / limit * 100) + '%'; el.classList.toggle('low', tLeft < limit * 0.35); } if (tLeft <= 0) choose(-1); }, 100);
      function choose(i) {
        if (busy) return; busy = true; clearInterval(timer);
        const ok = i >= 0 && looks[i].ok;
        btns.forEach((b, j) => { if (looks[j].ok) b.classList.add('ok'); else if (j === i) b.classList.add('no'); });
        if (ok) { right++; pts += 100 + Math.round(tLeft * 30); Sound.sparkle(); } else Sound.undo();
        r++; K.later(round, ok ? 700 : 1200);
      }
    }
    function end() {
      const stars = 1 + [6, 8, 10, 12].filter(x => right >= x).length;
      K.finish('weather', { stars, score: pts, line: `You dressed for the weather <b>${right} of ${ROUNDS}</b> days. ${pts} points!` });
    }
    round();
  }

  /* ======================================================================
     10. Design Contest — beat three rival designers. The style judge decides!
     ====================================================================== */
  const RIVALS = ['Madame Purrfect', 'Coco Whiskers', 'Sir Stitchington', 'Lulu Lacey', 'Professor Pom', 'Duchess Doodle', 'Monty Moss', 'Bijou Bunbun'];
  function contest() {
    const best = K.loadBest();
    const trophies = best['contest-trophies'] || 0;
    const ch = pick(themePool());
    const good = ch.rules.filter(r => r.type === 'tags' || r.type === 'hold').flatMap(r => r.tags);
    const me = blankOutfit(plain(K.ctx.look())); me.pose = { id: 'stand' }; me.scene = { id: 'stage' };
    const names = shuffle(RIVALS).slice(0, 3);
    // rivals get better and better: 1, 2, then 2–3 pieces that fit the theme; everything else is ordinary
    const rivals = [1, 2, 2 + (Math.random() < 0.5 ? 1 : 0)].map((k, i) => {
      const st = blankOutfit(plain(K.ctx.look()));
      st.animal = { id: pick(TT.ANIMALS.filter(a => !a.locked)).id, color: 'natural' }; st.hair = { id: null, color: 'cocoa' };
      st.pose = { id: pick(['wave', 'tada', 'hooray', 'stand']) }; st.name = names[i];
      const fitsIn = s => TT.SLOTS[s].items.filter(it => tagsOf(s, it.id).some(t => good.includes(t)));
      shuffle(CLOTHES.filter(s => fitsIn(s).length)).slice(0, k).forEach(s => { st[s] = { id: pick(fitsIn(s)).id, color: pick(COLS()).id, color2: null, pattern: 'solid' }; });
      ['top', 'bottom', 'shoes'].forEach(s => {
        if (st[s].id) return;
        const plainOnes = TT.SLOTS[s].items.filter(it => okItem(s, it) && !tagsOf(s, it.id).some(t => good.includes(t)));
        if (Math.random() < 0.85) st[s] = { id: pick(plainOnes).id, color: pick(COLS()).id, color2: null, pattern: 'solid' };
      });
      return st;
    });
    K.setBar('Design Contest');
    body().innerHTML = `<div class="dc-intro"><p class="ru-who">This round's theme</p><p class="g-say">“${esc(ch.text)}”</p>
      <div class="dc-rivals">${rivals.map((st, i) => `<figure>${critterSVG(Object.assign(clone(st), { top: { id: null }, bottom: { id: null }, shoes: { id: null }, hat: { id: null }, face: { id: null }, neck: { id: null }, back: { id: null }, hold: { id: null } }), `dcr${i}-`)}<figcaption>${esc(st.name)}</figcaption></figure>`).join('')}</div>
      <p class="g-intro">Three rival designers are dressing their models right now. Dress <b>${esc(me.name || 'your critter')}</b> to win!</p>
      ${trophies ? `<p class="dc-shelf">${'🏆'.repeat(Math.min(trophies, 12))} <span>${trophies} win${trophies === 1 ? '' : 's'}</span></p>` : ''}
      <button class="btn-big" type="button" data-go>Start designing!</button></div>`;
    $('[data-go]').addEventListener('click', () => { Sound.tap(); design(); });
    function design() {
      const TIME = 90; let left = TIME, done = false;
      const wardrobe = quickWardrobe(me, good, () => drawMe());
      body().innerHTML = `<div class="ru">
        <div class="ru-shop"><div class="ru-stage" id="dcMe"></div>
          <div class="ru-ask"><span class="ru-who">Theme</span><strong>“${esc(ch.text)}”</strong><div class="g-timer"><span id="dcT"></span></div></div></div>
        ${wardrobe.html}
        <button class="btn-big ru-done" type="button" data-done>To the runway!</button></div>`;
      const drawMe = () => { $('#dcMe').innerHTML = TT.svg(TT.compose(me, { pfx: 'dcme-', animated: false, pet: false, fx: false }), '0 0 400 460'); };
      drawMe(); wardrobe.draw();
      const onClick = e => { if (wardrobe.click(e)) return; if (e.target.closest('[data-done]')) reveal(); };
      body().addEventListener('click', onClick); K.cleanup(() => K.root && body().removeEventListener('click', onClick));
      const t = K.every(() => { left -= 0.25; const el = $('#dcT'); if (el) { el.style.width = (left / TIME * 100) + '%'; el.classList.toggle('low', left <= 15); } if (left <= 0) reveal(); }, 250);
      function reveal() {
        if (done) return; done = true; clearInterval(t); body().removeEventListener('click', onClick);
        const all = [{ st: me, mine: true }].concat(rivals.map(st => ({ st }))).map(x => Object.assign(x, { res: TT.judge(x.st, ch) }));
        // ties are broken by overall style (complete, well-matched outfits win)
        all.forEach(x => { x.style = TT.styleScore(x.st); });
        const ranked = all.slice().sort((a, b) => b.res.score - a.res.score || b.style - a.style || (a.mine ? -1 : 1));
        const place = ranked.findIndex(x => x.mine) + 1;
        const medal = ['', '🥇', '🥈', '🥉', '🎀'];
        body().innerHTML = `<div class="dc-results"><p class="g-say">${place === 1 ? 'You won the contest!' : place === 2 ? 'So close: second place!' : place === 3 ? 'Third place!' : 'Fourth place this time.'}</p>
          <div class="dc-podium">${ranked.map((x, i) => `<figure class="${x.mine ? 'mine' : ''}"><span class="dc-medal">${medal[i + 1]}</span>${critterSVG(Object.assign(clone(x.st), { pose: { id: i === 0 ? 'hooray' : x.st.pose.id } }), `dcp${i}-`)}<figcaption><b>${esc(x.mine ? (x.st.name || 'You') : x.st.name)}</b>${x.res.score}/100</figcaption></figure>`).join('')}</div>
          <button class="btn-big" type="button" data-fin>See my prize</button></div>`;
        place === 1 ? Sound.cheer() : Sound.sparkle();
        if (place === 1) { const b = K.loadBest(); b['contest-trophies'] = (b['contest-trophies'] || 0) + 1; K.saveBest(b); }
        $('[data-fin]').addEventListener('click', () => {
          const stars = [0, 5, 4, 3, 1][place];
          const mine = all[0].res.score;
          K.finish('contest', { stars, score: mine, line: `You placed <b>${['', '1st', '2nd', '3rd', '4th'][place]}</b> with a score of ${mine}/100 for “${esc(ch.text)}”.${place === 1 ? ' A new trophy for your shelf!' : ''}` });
        });
      }
    }
  }

  /* ---------- hub cards ---------- */
  const ic = inner => TT.svg(inner, '0 0 100 100');
  const add = (id, name, blurb, color, art, fn) => K.add({ id, name, blurb, color, art }, fn);
  add('match3', 'Fabric Match', 'Swap fabric swatches to line up three in a row.', '#ffe0ea',
    () => ic([[10, 10, 0], [52, 10, 1], [10, 52, 2], [52, 52, 3]].map(([x, y, k]) => R(x, y, 38, 38, 9, SWATCH[k].c, 4)).join('') + TT.star(71, 71, 9, '#fff', 0)), match3);
  add('parade', 'Pet Parade', 'Run with your pet pal, hop the puddles and grab buttons.', '#e2f5d6',
    me => TT.thumb('pet', TT.itemOf('pet', (me.pet && me.pet.id) || 'chick'), Object.assign(clone(me), { pet: { id: (me.pet && me.pet.id) || 'chick', color: (me.pet && me.pet.color) || 'bubblegum' } })), parade);
  add('dash', 'Dress-Up Dash', 'Find each piece of the outfit before the timer runs out!', '#ffe9c7',
    () => ic(P('M56,8 L22,56 L46,56 L38,92 L78,40 L52,40 L62,8Z', '#ffe17a', 4)), dash);
  add('slide', "Tailor's Puzzle", 'Slide the tiles to put your critter back together.', '#e3e0ff',
    () => ic([0, 1, 2, 3, 4, 5, 6, 7].map(i => R(8 + (i % 3) * 29, 8 + Math.floor(i / 3) * 29, 26, 26, 6, ['#ff9ec0', '#9ee6c0', '#ffe17a', '#9cd3ff', '#cfa8ff', '#ffb38a', '#ff9ec0', '#9ee6c0'][i], 3)).join('')), slide);
  add('spot', 'Spot the Difference', 'Two pictures, five sneaky changes. Find them all!', '#d5ecff',
    () => ic(R(6, 20, 40, 52, 8, '#fff', 4) + R(54, 20, 40, 52, 8, '#fff', 4) + C(26, 44, 9, '#ff9ec0', 3) + C(74, 44, 9, '#9ee6c0', 3) + C(74, 44, 15, 'none', 3, 'stroke-dasharray="4 4"')), spot);
  add('says', 'Critter Says', 'Watch the poses, then copy them. One more each round!', '#f0e2ff',
    () => ic(POSE_PADS.map((p, i) => C(30 + (i % 2) * 40, 30 + Math.floor(i / 2) * 40, 16, p.color, 4)).join('')), says);
  add('sew', 'Sewing Machine', 'Keep your finger on the needle as it sews a pattern.', '#ffd9e2',
    () => ic(S('M10,70 C30,30 50,30 60,60 S80,90 92,50', '#e64f7c', 5, 'stroke-dasharray="6 6"') + S('M60,10 L60,52', '#9aa3b5', 6) + C(60, 56, 6, '#e64f7c', 3)), sew);
  add('bubbles', 'Bubble Pop Boutique', 'Pop only what the customer asks for!', '#d9f4ff',
    () => ic(C(34, 60, 24, '#e8f7ff', 4) + C(70, 34, 18, '#ffe9f2', 4) + C(72, 74, 12, '#f0ffe9', 3) + E(26, 50, 6, 4, '#fff', 0)), bubbles);
  add('weather', 'Weather Wardrobe', 'Check the forecast, then pick the right outfit fast!', '#fff3cf',
    () => ic(C(36, 38, 18, '#ffe17a', 4) + E(60, 62, 30, 16, '#e5ecf7', 4) + C(46, 56, 12, '#e5ecf7', 0) + [52, 66].map(x => `<path d="M${x},84 l-4,10" stroke="#7cb7ff" stroke-width="5" stroke-linecap="round"/>`).join('')), weather);
  add('contest', 'Design Contest', 'Beat three rival designers. The style judge decides!', '#ffe0cc',
    me => TT.thumb('hold', TT.itemOf('hold', 'trophy'), Object.assign(clone(me), { hold: { id: 'trophy', color: 'gold' } })), contest);
})(window.TT);
