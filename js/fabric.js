/* Tiny Tailors — Fabric studio: draw an 8×8 tile and it repeats across clothes.
   Empty squares take the item's own color, so one fabric works in every color. */
(function (TT) {
  const N = 8, CELL = 4;
  TT.sharedFabrics = {};
  TT.allFabrics = () => (TT.progress.fabrics || []);
  TT.fabricById = id => TT.allFabrics().find(f => f.id === id) || TT.sharedFabrics[id] || null;

  TT.fabricDef = function (id, kind, base, accent) {
    const f = TT.fabricById(kind);
    if (!f) return '';
    let body = `<rect width="${N * CELL}" height="${N * CELL}" fill="${base}"/>`;
    f.px.forEach((c, i) => {
      if (!c) return;
      const col = c === 'trim' ? (accent || TT.tint(base, 0.6)) : c;
      body += `<rect x="${(i % N) * CELL}" y="${Math.floor(i / N) * CELL}" width="${CELL}" height="${CELL}" fill="${col}"/>`;
    });
    return `<pattern id="${id}" width="${N * CELL}" height="${N * CELL}" patternUnits="userSpaceOnUse">${body}</pattern>`;
  };

  /* starter ideas so the grid is never a blank page */
  const STARTERS = {
    heart: '..........##.##..#######.#######..#####....###......#...........',
    star: '....#.......#.....#####...###.....#.#....................#.......',
    smile: '.........#....#..........#....#...####..........................',
    diamond: '...#.......#.#.....#...#...#.#.....#..................#.........',
    stripes: '########................########................................',
    checks: '####....####....####....####........####....####....####....####'
  };

  TT.openFabricStudio = function (opts) {
    const P = TT.progress;
    const editing = opts && opts.id ? TT.fabricById(opts.id) : null;
    let px = editing ? editing.px.slice() : Array(N * N).fill('');
    let name = editing ? editing.name : 'My fabric';
    let brush = '#ff6f96', mirror = true, painting = false;
    const colors = TT.COLORS.filter(c => !TT.isLocked('color', c));

    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = `<div class="modal-card fabric-card" role="dialog" aria-modal="true" aria-labelledby="fabTitle">
      <div class="modal-head"><h2 id="fabTitle">Fabric studio</h2><button class="mini ghost" data-x type="button" aria-label="Close">✕</button></div>
      <p class="modal-sub">Draw one square. It repeats across your clothes. Empty squares use the clothing color, and “Trim” squares use the second color.</p>
      <div class="fab-layout">
        <div>
          <div class="fab-grid" id="fabGrid" role="grid" aria-label="Fabric grid"></div>
          <div class="fab-tools">
            <label class="toggle"><input type="checkbox" id="fabMirror" checked> Mirror</label>
            <button class="mini" type="button" data-fill>Fill all</button>
            <button class="mini" type="button" data-clear>Clear</button>
          </div>
          <div class="row-label">Start from</div>
          <div class="fab-starters">${Object.keys(STARTERS).map(k => `<button class="mini" type="button" data-start="${k}">${k}</button>`).join('')}</div>
        </div>
        <div class="fab-side">
          <div class="row-label">Paint with</div>
          <div class="swatches" id="fabColors">
            <button class="swatch base-swatch" data-brush="" aria-label="Clothing color (empty)" title="Clothing color"></button>
            <button class="swatch trim-swatch" data-brush="trim" aria-label="Trim color" title="Trim color"></button>
            ${colors.map(c => `<button class="swatch" style="background:${c.hex}" data-brush="${c.hex}" aria-label="${c.name}" title="${c.name}"></button>`).join('')}
          </div>
          <div class="row-label">Preview</div>
          <div class="fab-preview" id="fabPreview"></div>
          <label class="row-label" for="fabName">Name</label>
          <input id="fabName" class="text-in" maxlength="20" value="${name.replace(/"/g, '&quot;')}">
          <div class="fab-actions">
            <button class="btn-big" type="button" data-save>Save fabric</button>
            ${editing ? '<button class="mini ghost" type="button" data-del>Delete</button>' : ''}
          </div>
        </div>
      </div></div>`;
    document.body.appendChild(wrap);
    const grid = wrap.querySelector('#fabGrid');
    const draw = () => {
      grid.innerHTML = px.map((c, i) => `<button type="button" class="cell" data-i="${i}" style="background:${c === 'trim' ? '#ffd0df' : (c || 'var(--cell-base)')}" aria-label="Square ${i + 1}">${c === 'trim' ? '•' : ''}</button>`).join('');
      const tmp = { id: 'fab-preview', name, px };
      TT.sharedFabrics['fab-preview'] = tmp;
      const base = '#9cd3ff';
      wrap.querySelector('#fabPreview').innerHTML = TT.svg(`<defs>${TT.fabricDef('fp1', 'fab-preview', base, '#ff9ec0')}</defs>` +
        (TT.TOPS[0].draw(TT.pack(base, 'url(#fp1)', '#ff9ec0'), {}) || '').replace(/<!--\/?SL-->/g, ''), '120 228 160 130');
      wrap.querySelectorAll('[data-brush]').forEach(b => b.setAttribute('aria-pressed', b.dataset.brush === brush));
    };
    const paint = i => {
      px[i] = brush;
      if (mirror) { const r = Math.floor(i / N), c = i % N; px[r * N + (N - 1 - c)] = brush; }
      draw();
    };
    grid.addEventListener('pointerdown', e => { const b = e.target.closest('.cell'); if (!b) return; painting = true; paint(+b.dataset.i); grid.setPointerCapture && grid.setPointerCapture(e.pointerId); });
    grid.addEventListener('pointermove', e => {
      if (!painting) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const b = el && el.closest && el.closest('.cell');
      if (b && px[+b.dataset.i] !== brush) paint(+b.dataset.i);
    });
    window.addEventListener('pointerup', () => { painting = false; }, { once: false });
    wrap.addEventListener('click', e => {
      const t = e.target;
      if (t === wrap || t.closest('[data-x]')) return close();
      const br = t.closest('[data-brush]'); if (br) { brush = br.dataset.brush; draw(); TT.Sound && TT.Sound.tap(); }
      if (t.closest('[data-fill]')) { px = px.map(() => brush); draw(); }
      if (t.closest('[data-clear]')) { px = Array(N * N).fill(''); draw(); }
      const st = t.closest('[data-start]'); if (st) { px = STARTERS[st.dataset.start].split('').map(ch => ch === '#' ? brush : ''); draw(); }
      if (t.closest('[data-save]')) {
        name = (wrap.querySelector('#fabName').value || 'My fabric').slice(0, 20);
        if (editing) { editing.px = px.slice(); editing.name = name; }
        else { const id = 'fab' + Date.now().toString(36); P.fabrics.push({ id, name, px: px.slice() }); opts && opts.onSave && opts.onSave(id); }
        if (P.fabrics.length > 12) P.fabrics.shift();
        TT.saveProgress(); close(); opts && opts.onDone && opts.onDone();
      }
      if (t.closest('[data-del]') && editing) {
        P.fabrics = P.fabrics.filter(f => f.id !== editing.id); TT.progress.fabrics = P.fabrics; TT.saveProgress(); close(); opts && opts.onDone && opts.onDone();
      }
    });
    wrap.querySelector('#fabMirror').addEventListener('change', e => { mirror = e.target.checked; });
    wrap.querySelector('#fabName').addEventListener('input', e => { name = e.target.value; });
    function close() { delete TT.sharedFabrics['fab-preview']; wrap.remove(); }
    draw();
  };
})(window.TT);
