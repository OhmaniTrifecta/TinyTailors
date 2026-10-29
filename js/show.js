/* Tiny Tailors — fashion show runway and group photos. */
(function (TT) {
  const { P, C, E, S, R } = TT;
  const strip = st => Object.assign({}, st, { fx: { id: null } });

  /* ---------- runway backdrop (600 × 460) ---------- */
  function runway() {
    let s = `<rect width="600" height="460" fill="#4a3566"/>`;
    s += `<path d="M0,0 L130,0 Q100,200 150,360 L0,360Z" fill="#e2668e"/><path d="M600,0 L470,0 Q500,200 450,360 L600,360Z" fill="#e2668e"/>`;
    s += S('M30,0 Q20,200 60,350 M70,0 Q60,200 100,350 M570,0 Q580,200 540,350 M530,0 Q540,200 500,350', '#c8507a', 5);
    s += `<rect width="600" height="30" fill="#c8507a"/>` + S('M0,28 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0 q25,18 50,0', '#ffd84d', 4);
    s += `<path d="M230,330 L370,330 L470,460 L130,460Z" fill="#ffe0ea"/><path d="M230,330 L370,330 L470,460 L130,460Z" fill="none" stroke="#ffd84d" stroke-width="4"/>`;
    s += [180, 300, 420].map(x => `<path d="M${x},30 L${x - 60},420 L${x + 60},420Z" fill="#fff3c2" opacity=".12"/>`).join('');
    // audience
    const cols = ['#9cd3ff', '#ffb38a', '#cfa8ff', '#9ee6c0', '#ff9ec0', '#ffe17a'];
    for (let i = 0; i < 12; i++) { const x = 20 + i * 50 + (i % 2) * 10; s += C(x, 446 - (i % 2) * 6, 22, cols[i % 6], 3) + C(x - 6, 440 - (i % 2) * 6, 2.4, TT.INK, 0) + C(x + 6, 440 - (i % 2) * 6, 2.4, TT.INK, 0); }
    return s;
  }

  let running = null;
  TT.runFashionShow = function (looks, opts = {}) {
    if (running) running.stop();
    const wrap = document.createElement('div');
    wrap.className = 'runway';
    wrap.innerHTML = `<div class="show-card" role="dialog" aria-modal="true" aria-label="Fashion show">
      <svg viewBox="0 0 600 460" class="show-svg"><g>${runway()}</g><g id="walker"></g><g id="flashes"></g></svg>
      <div class="show-bar"><div><span class="show-label">Now on the runway</span><strong id="showName"></strong></div>
      <div class="meter" aria-label="Crowd cheer meter"><span id="meterFill"></span></div>
      <button class="mini" type="button" id="showClose">Close</button></div></div>`;
    document.body.appendChild(wrap);
    const walker = wrap.querySelector('#walker'), flashes = wrap.querySelector('#flashes');
    const nameEl = wrap.querySelector('#showName'), fill = wrap.querySelector('#meterFill');
    let stopped = false, raf = 0;
    const stop = () => { stopped = true; cancelAnimationFrame(raf); TT.Sound.stopMusic(); wrap.remove(); running = null; };
    running = { stop };
    wrap.querySelector('#showClose').addEventListener('click', () => { stop(); opts.onClose && opts.onClose(); });
    // a random song from the library, long enough for every model's walk
    const song = TT.SONGS[Math.floor(Math.random() * TT.SONGS.length)];
    TT.Sound.playSong(TT.songFor(song, looks.length * 5 + 1), 0.05);
    wrap.querySelector('.show-label').insertAdjacentHTML('beforeend', ` · ♪ ${song.name.replace(/[<>&]/g, '')}`);

    const poseById = id => TT.itemOf('pose', id) || TT.POSES[0];
    const sprites = looks.map((st, i) => ({
      name: st.name || 'Mystery model',
      score: TT.styleScore(st),
      frames: ['stand', 'tada', 'wave', 'hooray'].map(p => TT.compose(strip(st), { pfx: `sh${i}${p}-`, animated: false, scene: false, pet: false, pose: poseById(p) }))
    }));
    let idx = 0, t0 = performance.now();
    const WALK_IN = 1300, POSE = 2600, WALK_OUT = 1100, TOTAL = WALK_IN + POSE + WALK_OUT;
    let lastFrame = -1, lastFlash = 0;
    function tick(now) {
      if (stopped) return;
      const sp = sprites[idx];
      const t = now - t0;
      let x, frame = 0, bob = 0;
      if (t < WALK_IN) { const k = t / WALK_IN; x = 700 - 400 * (1 - Math.pow(1 - k, 2)); bob = Math.abs(Math.sin(t / 120)) * -10; }
      else if (t < WALK_IN + POSE) { x = 300; const k = (t - WALK_IN) / POSE; frame = k < 0.33 ? 1 : k < 0.66 ? 2 : 3; fill.style.width = Math.round(sp.score * Math.min(1, k * 1.6)) + '%';
        if (now - lastFlash > 260) { lastFlash = now; flashes.innerHTML = `<circle cx="${80 + Math.random() * 440}" cy="${380 + Math.random() * 60}" r="${18 + Math.random() * 18}" fill="#ffffff" opacity=".9" class="flash"/>`; TT.Sound.tone(1500 + Math.random() * 400, 0.04, 'square', 0.03); }
      } else { const k = (t - WALK_IN - POSE) / WALK_OUT; x = 300 - 460 * k * k; bob = Math.abs(Math.sin(t / 120)) * -10; flashes.innerHTML = ''; }
      if (frame !== lastFrame || t < 30) { walker.innerHTML = `<g class="walk-inner">${sp.frames[frame]}</g>`; lastFrame = frame; nameEl.textContent = sp.name; if (frame === 1) TT.Sound.cheer(); }
      const g = walker.firstChild; if (g) g.setAttribute('transform', `translate(${x - 200 * 0.86} ${44 + bob}) scale(.86)`);
      if (t >= TOTAL) {
        idx++; t0 = now; lastFrame = -1; fill.style.width = '0%';
        if (idx >= sprites.length) { finale(); return; }
      }
      raf = requestAnimationFrame(tick);
    }
    function finale() {
      TT.Sound.stopMusic(); TT.Sound.cheer();
      const earned = TT.dailyBonus('show', 8, 2);
      walker.innerHTML = '';
      flashes.innerHTML = `<g><rect x="120" y="150" width="360" height="130" rx="26" fill="#fffdf9" stroke="#5b3f58" stroke-width="5"/>
        <text x="300" y="205" text-anchor="middle" font-family="Sniglet, 'Baloo 2', sans-serif" font-size="34" font-weight="800" fill="#e64f7c">What a show!</text>
        <text x="300" y="245" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-size="20" font-weight="700" fill="#5b3f58">${earned ? `+${earned} stitches for putting on a show` : 'Encore! Encore!'}</text></g>` + TT.FX.find(f => f.id === 'confetti').draw(null, true).replace(/<g class="fx-fall"/g, '<g class="fx-fall"');
      nameEl.textContent = 'Thanks for watching!';
      opts.onEnd && opts.onEnd(earned);
    }
    raf = requestAnimationFrame(tick);
  };

  /* ---------- group photo (600 × 460) ---------- */
  TT.groupPhotoSVG = function (looks, sceneId, pfx = 'gp-') {
    const n = looks.length;
    const scene = TT.itemOf('scene', sceneId) || TT.SCENES[0];
    const s = n <= 2 ? 0.8 : n === 3 ? 0.7 : 0.6;
    let out = `<g transform="translate(0 -170) scale(1.5)">${scene.draw(null, pfx)}</g>`;
    looks.forEach((st, i) => {
      const cx = 600 / n * (i + 0.5);
      out += `<g transform="translate(${cx - 200 * s} ${448 - 424 * s}) scale(${s})">${TT.compose(st, { pfx: `${pfx}${i}-`, animated: false, scene: false, pet: false, fx: false })}</g>`;
    });
    const fx = looks[0].fx && looks[0].fx.id ? TT.itemOf('fx', looks[0].fx.id) : null;
    if (fx) out += `<g transform="scale(1.5 1)">${fx.draw(null, false)}</g>`;
    return out;
  };
})(window.TT);
