/* Tiny Tailors — photo booth.
   Before a photo is saved you can add stickers, speech bubbles and a frame.
   Drag stickers to move them; tap one to pick it, then make it bigger, smaller, turn it or remove it. */
(function (TT) {
  const { C, E, P, S, R, OL, INK } = TT;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = `font-family="Sniglet, 'Baloo 2', sans-serif" font-weight="800"`;

  /* stickers are drawn around (0,0) at about 60px across */
  const STICKERS = [
    { id: 'heart', name: 'Heart', draw: () => TT.heart(0, 0, 22, '#ff6f96', 4) + E(-9, -8, 5, 3, '#fff', 0, 'opacity=".7"') },
    { id: 'star', name: 'Star', draw: () => TT.star(0, 0, 28, '#ffe17a', 4) },
    { id: 'sparkle', name: 'Sparkles', draw: () => TT.star(-6, -4, 20, '#fff3a8', 3, 0.3, 4) + TT.star(18, 16, 9, '#ffffff', 2.5, 0.3, 4) + TT.star(-20, 18, 7, '#ff9ec0', 2, 0.3, 4) },
    { id: 'crown', name: 'Crown', draw: () => P('M-26,14 L-30,-16 L-14,-2 L0,-24 L14,-2 L30,-16 L26,14Z', '#ffd84d', 4) + C(0, 4, 5, '#ff6f96', 2.5) + C(-15, 6, 3.5, '#9cd3ff', 2) + C(15, 6, 3.5, '#9ee6c0', 2) },
    { id: 'bow', name: 'Bow', draw: () => P('M0,0 Q-30,-22 -30,0 Q-30,22 0,0Z M0,0 Q30,-22 30,0 Q30,22 0,0Z', '#ff9ec0', 4) + C(0, 0, 7, '#ff6f96', 3) },
    { id: 'rainbow', name: 'Rainbow', draw: () => ['#ff9eb0', '#ffc38a', '#ffe98a', '#a8e8b8', '#9cd3ff'].map((col, i) => S(`M${-30 + i * 5},10 A${30 - i * 5},${30 - i * 5} 0 0 1 ${30 - i * 5},10`, col, 5)).join('') + C(-30, 12, 8, '#fff', 3) + C(30, 12, 8, '#fff', 3) },
    { id: 'shades', name: 'Cool shades', draw: () => P('M-30,-6 L-4,-6 Q-4,12 -17,12 Q-30,12 -30,-6Z M4,-6 L30,-6 Q30,12 17,12 Q4,12 4,-6Z', '#4f4560', 3.5) + S('M-4,-3 Q0,-6 4,-3', OL, 3) + S('M-24,-1 L-16,-1 M10,-1 L18,-1', '#ffffff', 2.5) },
    { id: 'flower', name: 'Flower', draw: () => TT.flower(0, 0, 26, '#ff9ec0', '#ffe17a', 3.5) },
    { id: 'note', name: 'Music note', draw: () => S('M-6,16 L-6,-20 L18,-26 L18,10', OL, 5) + E(-14, 18, 10, 8, '#cfa8ff', 4) + E(10, 12, 10, 8, '#cfa8ff', 4) },
    { id: 'cat', name: 'Kitty ears', draw: () => P('M-28,10 L-22,-22 L-6,-2Z M28,10 L22,-22 L6,-2Z', '#ffc98f', 4) + P('M-22,4 L-19,-12 L-11,-2Z M22,4 L19,-12 L11,-2Z', '#ffb3c8', 0) },
    { id: 'cloud', name: 'Cloud', draw: () => C(-14, 2, 14, '#fff', 3.5) + C(4, -6, 17, '#fff', 3.5) + C(20, 4, 12, '#fff', 3.5) + E(2, 10, 28, 9, '#fff', 0) },
    { id: 'pumpkin', name: 'Pumpkin', event: 'masquerade', draw: () => E(-12, 4, 14, 17, '#ffa05c', 3.5) + E(12, 4, 14, 17, '#ffa05c', 3.5) + E(0, 4, 14, 18, '#ffa05c', 3.5) + S('M0,-14 L3,-24', '#6bb27a', 4) + P('M-9,0 l5,-6 l5,6z M2,0 l5,-6 l5,6z', '#5b3f58', 0) + S('M-7,9 Q0,14 7,9', '#5b3f58', 2.5) },
    { id: 'leaf', name: 'Autumn leaf', event: 'harvest', draw: () => P('M-20,14 Q-24,-18 18,-22 Q22,8 -20,14Z', '#ff9f5a', 3.5) + S('M-16,10 Q0,-4 14,-18', '#d9744e', 2.5) }
  ];
  /* speech bubbles: a word inside a bubble */
  const WORDS = ['Hi!', 'Wow!', 'So cute!', 'Best friends!', 'Ta-da!', 'Yay!', 'I love it!', 'Boo!'];
  const bubble = text => {
    const t = String(text).slice(0, 24);
    const w = Math.max(60, t.length * 12 + 28);
    return R(-w / 2, -24, w, 40, 18, '#fffdf9', 4) + P(`M-10,14 L-18,30 L4,15`, '#fffdf9', 4) + R(-w / 2 + 3, -21, w - 6, 34, 15, '#fffdf9', 0) +
      `<text x="0" y="3" text-anchor="middle" dominant-baseline="middle" ${FONT} font-size="20" fill="#e64f7c">${esc(t)}</text>`;
  };
  /* frames are drawn over the whole picture (w × h) */
  const FRAMES = [
    { id: 'none', name: 'No frame', draw: () => '' },
    { id: 'hearts', name: 'Hearts', draw: (w, h) => edge(w, h, (x, y, i) => TT.heart(x, y, 9, i % 2 ? '#ff9ec0' : '#ff6f96', 2.5)) },
    { id: 'stars', name: 'Stars', draw: (w, h) => edge(w, h, (x, y, i) => TT.star(x, y, 11, i % 2 ? '#ffe17a' : '#fff3a8', 2.5)) },
    { id: 'flowers', name: 'Flowers', draw: (w, h) => edge(w, h, (x, y, i) => TT.flower(x, y, 11, ['#ff9ec0', '#cfa8ff', '#9cd3ff', '#ffffff'][i % 4], '#ffe17a', 2)) },
    { id: 'film', name: 'Film strip', draw: (w, h) => R(0, 0, w, 30, 0, '#4f4560', 0) + R(0, h - 30, w, 30, 0, '#4f4560', 0) + Array.from({ length: Math.ceil(w / 34) }, (_, i) => R(8 + i * 34, 8, 18, 14, 3, '#fffdf9', 0) + R(8 + i * 34, h - 22, 18, 14, 3, '#fffdf9', 0)).join('') },
    { id: 'confetti', name: 'Confetti', draw: (w, h) => { const r = TT.rng(77); let s = ''; for (let i = 0; i < 46; i++) { const x = r() * w, y = r() * h; if (x > 50 && x < w - 50 && y > 50 && y < h - 50) continue; s += R(x, y, 7, 13, 2, ['#ff9ec0', '#ffe17a', '#9ee6c0', '#9cd3ff', '#cfa8ff'][i % 5], 0, TT.rot(r() * 180, x, y)); } return s; } },
    { id: 'spooky', name: 'Spooky', event: 'masquerade', draw: (w, h) => edge(w, h, (x, y, i) => i % 3 === 0 ? E(x, y, 11, 10, '#ffa05c', 2.5) + S(`M${x},${y - 10} l2,-5`, '#6bb27a', 3) : C(x, y, 5, '#cfa8ff', 2)) },
    { id: 'leaves', name: 'Falling leaves', event: 'harvest', draw: (w, h) => edge(w, h, (x, y, i) => P(`M${x - 9},${y + 6} Q${x - 11},${y - 8} ${x + 8},${y - 10} Q${x + 10},${y + 4} ${x - 9},${y + 6}Z`, ['#ff9f5a', '#ffcf5a', '#ff7d6b'][i % 3], 2.5)) }
  ];
  function edge(w, h, f) {
    let s = '', i = 0;
    const step = 40;
    for (let x = 20; x <= w - 10; x += step) { s += f(x, 18, i++) + f(x, h - 18, i++); }
    for (let y = 20 + step; y <= h - step; y += step) { s += f(18, y, i++) + f(w - 18, y, i++); }
    return s;
  }
  const available = list => list.filter(x => !x.event || TT.eventOpen(x.event));

  /* ---------------- the booth window ---------------- */
  let root = null;
  TT.openBooth = function ({ inner, vw, vh, caption, onDone }) {
    if (root) root.remove();
    const items = []; // {kind:'st'|'word', id, text, x, y, s, r}
    let frame = 'none', sel = -1, tab = 'stickers', drag = null;
    root = document.createElement('div');
    root.className = 'modal booth-modal';
    root.innerHTML = `<div class="modal-card booth-card" role="dialog" aria-modal="true" aria-labelledby="boothTitle">
      <div class="modal-head"><h2 id="boothTitle">Photo booth</h2><button class="mini ghost" data-bclose type="button" aria-label="Close photo booth">✕</button></div>
      <div class="booth-main">
        <div class="booth-pic"><svg id="boothSvg" viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Your photo with stickers"></svg>
          <div class="booth-tools" id="boothTools" hidden>
            <button class="mini" type="button" data-btool="smaller" aria-label="Smaller">−</button><button class="mini" type="button" data-btool="bigger" aria-label="Bigger">+</button>
            <button class="mini" type="button" data-btool="turn" aria-label="Turn">↻</button><button class="mini" type="button" data-btool="del" aria-label="Remove">🗑</button></div></div>
        <div class="booth-side">
          <div class="booth-tabs" role="tablist"><button class="mini" type="button" data-btab="stickers">Stickers</button><button class="mini" type="button" data-btab="words">Words</button><button class="mini" type="button" data-btab="frames">Frames</button></div>
          <div class="booth-pal" id="boothPal"></div>
          <p class="modal-sub booth-help">Tap a sticker to add it, then drag it where you want.</p>
          <button class="btn-big booth-done" type="button" data-bdone>Take the photo!</button>
        </div></div></div>`;
    document.body.appendChild(root);
    const svg = root.querySelector('#boothSvg');
    const drawPic = () => {
      const fr = FRAMES.find(f => f.id === frame) || FRAMES[0];
      svg.innerHTML = inner + `<g pointer-events="none">${fr.draw(vw, vh)}</g>` + items.map((it, i) => itemSVG(it, i, i === sel)).join('');
      root.querySelector('#boothTools').hidden = sel < 0;
    };
    const itemSVG = (it, i, on) => {
      const art = it.kind === 'word' ? bubble(it.text) : (STICKERS.find(s => s.id === it.id) || STICKERS[0]).draw();
      return `<g class="booth-item" data-bi="${i}" transform="translate(${it.x.toFixed(1)} ${it.y.toFixed(1)}) rotate(${it.r}) scale(${it.s})">${on ? `<circle r="42" fill="none" stroke="#ff6f96" stroke-width="${3 / it.s}" stroke-dasharray="6 5"/>` : ''}<circle r="34" fill="transparent"/>${art}</g>`;
    };
    const drawPal = () => {
      root.querySelectorAll('[data-btab]').forEach(b => b.setAttribute('aria-pressed', b.dataset.btab === tab));
      const pal = root.querySelector('#boothPal');
      if (tab === 'stickers') pal.innerHTML = available(STICKERS).map(s => `<button class="booth-opt" type="button" data-badd="${s.id}" aria-label="${esc(s.name)}">${TT.svg(s.draw(), '-40 -40 80 80')}</button>`).join('');
      else if (tab === 'words') pal.innerHTML = WORDS.map(w => `<button class="booth-word" type="button" data-bword="${esc(w)}">${esc(w)}</button>`).join('') +
        `<form class="booth-own" id="boothOwn"><input class="text-in" id="boothText" maxlength="20" placeholder="Type your own" autocomplete="off" aria-label="Your own words"><button class="mini" type="submit">Add</button></form>`;
      else pal.innerHTML = available(FRAMES).map(f => `<button class="booth-frame" type="button" data-bframe="${f.id}" aria-pressed="${f.id === frame}">${TT.svg(R(0, 0, 120, 90, 10, '#fff3f7', 0) + f.draw(120, 90).replace(/scale\([^)]*\)/g, ''), '0 0 120 90')}<span>${esc(f.name)}</span></button>`).join('');
    };
    const add = it => { items.push(Object.assign({ x: vw / 2 + (Math.random() * 80 - 40), y: vh * 0.3 + (Math.random() * 60 - 30), s: 1, r: 0 }, it)); sel = items.length - 1; TT.Sound.pop(); drawPic(); };
    const close = () => { if (root) root.remove(); root = null; };
    root.addEventListener('click', e => {
      const t = e.target;
      if (t === root || t.closest('[data-bclose]')) return close();
      const tb = t.closest('[data-btab]'); if (tb) { tab = tb.dataset.btab; TT.Sound.tap(); return drawPal(); }
      const ad = t.closest('[data-badd]'); if (ad) return add({ kind: 'st', id: ad.dataset.badd });
      const wd = t.closest('[data-bword]'); if (wd) return add({ kind: 'word', text: wd.dataset.bword });
      const fr = t.closest('[data-bframe]'); if (fr) { frame = fr.dataset.bframe; TT.Sound.swatch(); drawPal(); return drawPic(); }
      const tool = t.closest('[data-btool]');
      if (tool && sel >= 0) {
        const it = items[sel], k = tool.dataset.btool;
        if (k === 'bigger') it.s = Math.min(3, +(it.s * 1.2).toFixed(2));
        if (k === 'smaller') it.s = Math.max(0.4, +(it.s / 1.2).toFixed(2));
        if (k === 'turn') it.r = (it.r + 20) % 360;
        if (k === 'del') { items.splice(sel, 1); sel = -1; TT.Sound.undo(); }
        else TT.Sound.tap();
        return drawPic();
      }
      if (t.closest('[data-bdone]')) {
        sel = -1;
        const fr2 = FRAMES.find(f => f.id === frame) || FRAMES[0];
        const finalInner = inner + fr2.draw(vw, vh) + items.map((it, i) => itemSVG(it, i, false)).join('');
        close();
        onDone(finalInner, items.length || frame !== 'none');
      }
    });
    root.addEventListener('submit', e => {
      if (e.target.id !== 'boothOwn') return;
      e.preventDefault();
      const v = root.querySelector('#boothText').value.trim();
      if (v) add({ kind: 'word', text: v });
    });
    // dragging stickers
    const toSvg = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
    svg.addEventListener('pointerdown', ev => {
      const g = ev.target.closest && ev.target.closest('[data-bi]');
      if (!g) { if (sel >= 0) { sel = -1; drawPic(); } return; }
      ev.preventDefault();
      sel = +g.dataset.bi;
      const p = toSvg(ev);
      drag = { i: sel, dx: items[sel].x - p.x, dy: items[sel].y - p.y };
      svg.setPointerCapture(ev.pointerId);
      drawPic();
    });
    svg.addEventListener('pointermove', ev => {
      if (!drag) return;
      const p = toSvg(ev), it = items[drag.i];
      it.x = Math.max(0, Math.min(vw, p.x + drag.dx)); it.y = Math.max(0, Math.min(vh, p.y + drag.dy));
      const g = svg.querySelector(`[data-bi="${drag.i}"]`);
      if (g) g.setAttribute('transform', `translate(${it.x.toFixed(1)} ${it.y.toFixed(1)}) rotate(${it.r}) scale(${it.s})`);
    });
    const end = () => { if (drag) { drag = null; drawPic(); } };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    const onKey = e => { if (!root) return document.removeEventListener('keydown', onKey, true); if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    drawPal(); drawPic();
    TT.Sound.whoosh();
    setTimeout(() => { const b = root && root.querySelector('[data-bclose]'); b && b.focus({ preventScroll: true }); }, 30);
  };
})(window.TT);
