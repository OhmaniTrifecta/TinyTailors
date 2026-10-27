/* Tiny Tailors — printable paper doll (in color, or as a coloring page). */
(function (TT) {
  const OL = TT.OL;
  const PIECES = [
    // slot, where the fold-back tabs go
    ['back', 'sides'], ['top', 'topedge'], ['bottom', 'sides'], ['shoes', 'topedge'], ['hat', 'bottomedge'],
    ['neck', 'topedge'], ['face', 'sides'], ['hold', 'left']
  ];
  const MM = 0.32; // millimetres per drawing unit, so pieces print at the same size as the doll

  const mirrorSleeves = m => m.replace(/<!--SL-->([\s\S]*?)<!--\/SL-->/g, (x, a) => a + `<g transform="matrix(-1 0 0 1 400 0)">${a}</g>`);
  function toColoring(markup) {
    const keep = [OL.toLowerCase(), TT.INK.toLowerCase()];
    return markup
      .replace(/fill="url\([^"]*\)"/g, 'fill="#ffffff"')
      .replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (m, c) => keep.includes(c.toLowerCase()) ? m : 'fill="#ffffff"')
      // thick coloured strokes are arms, legs and tails: make them white to color in; thin ones become light lines
      .replace(/stroke="(#[0-9a-fA-F]{3,6})" stroke-width="([\d.]+)"/g, (m, c, w) => keep.includes(c.toLowerCase()) ? m : `stroke="${+w >= 6 ? '#ffffff' : '#a898a6'}" stroke-width="${w}"`)
      .replace(/stroke="(#[0-9a-fA-F]{3,6})"/g, (m, c) => keep.includes(c.toLowerCase()) ? m : 'stroke="#a898a6"')
      .replace(/<pattern[\s\S]*?<\/pattern>/g, '');
  }
  function tabs(b, kind) {
    const t = (x, y, w, h) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="3"/>`;
    const w = 22, h = 16;
    switch (kind) {
      case 'topedge': return t(b.x + b.width * 0.22 - w / 2, b.y - h + 4, w, h) + t(b.x + b.width * 0.78 - w / 2, b.y - h + 4, w, h);
      case 'bottomedge': return t(b.x + b.width * 0.25 - w / 2, b.y + b.height - 4, w, h) + t(b.x + b.width * 0.75 - w / 2, b.y + b.height - 4, w, h);
      case 'sides': return t(b.x - h + 4, b.y + Math.min(30, b.height * 0.3), h, w) + t(b.x + b.width - 4, b.y + Math.min(30, b.height * 0.3), h, w);
      case 'left': return t(b.x - h + 4, b.y + b.height * 0.6, h, w);
      default: return '';
    }
  }
  function measure(inner) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 460');
    svg.style.cssText = 'position:absolute;left:-9999px;top:0;width:400px;height:460px;visibility:hidden';
    svg.innerHTML = inner; document.body.appendChild(svg);
    let b; try { b = svg.getBBox(); } catch (e) { b = { x: 0, y: 0, width: 400, height: 460 }; }
    svg.remove();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  }
  function cutSvg(markup, tabMarkup, b, pad = 22) {
    const vb = `${(b.x - pad).toFixed(1)} ${(b.y - pad).toFixed(1)} ${(b.width + pad * 2).toFixed(1)} ${(b.height + pad * 2).toFixed(1)}`;
    const body = `<g class="cut">${markup}${tabMarkup}</g><g class="cut2">${markup}${tabMarkup}</g><g class="tabs">${tabMarkup}</g>${markup}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" style="width:${((b.width + pad * 2) * MM).toFixed(1)}mm;height:${((b.height + pad * 2) * MM).toFixed(1)}mm">${body}</svg>`;
  }

  TT.paperDollHTML = function (st, coloring) {
    const conv = m => coloring ? toColoring(m) : m;
    // the doll: critter + hair + face, no clothes, standing on a fold-out base
    const bare = JSON.parse(JSON.stringify(st));
    ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold', 'pet', 'fx'].forEach(s => { if (bare[s]) bare[s].id = null; });
    bare.pose = { id: 'stand' };
    const dollInner = conv(TT.compose(bare, { pfx: 'pd-', animated: false, scene: false, pet: false, fx: false }).replace(/<ellipse cx="200" cy="424"[^>]*\/>/, ''));
    const base = `<rect x="110" y="420" width="180" height="46" rx="6"/>`;
    const dollB = measure(dollInner + base);
    const doll = cutSvg(dollInner + `<rect x="110" y="420" width="180" height="46" rx="6" fill="#ffffff" stroke="${OL}" stroke-width="2"/><path d="M110,420 L290,420" stroke="#a898a6" stroke-width="2" stroke-dasharray="5 4"/><text x="200" y="448" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#a898a6">fold back to stand</text>`, base, dollB);

    // clothing pieces, each with fold-back tabs
    const pieces = [];
    const defs = [];
    for (const [slot, kind] of PIECES) {
      const e = st[slot];
      if (!e || !e.id) continue;
      const it = TT.itemOf(slot, e.id);
      if (!it) continue;
      const S = TT.SLOTS[slot];
      const baseHex = S.palette ? TT.colorHex(slot, e.color) : '#ff9ec0';
      const trim = S.trim ? TT.trimHex(slot, e) : null;
      let fill = baseHex;
      if (S.patterns && e.pattern && e.pattern !== 'solid') { const id = `pdp-${slot}`; const d = TT.patternDef(id, e.pattern, baseHex, trim); if (d) { defs.push(d); fill = `url(#${id})`; } }
      const r = it.draw(TT.pack(baseHex, fill, trim), TT.furOf(st));
      const parts = typeof r === 'string' ? { main: r } : (r || {});
      let markup = mirrorSleeves((parts.back || '') + (parts.main || '') + (parts.over || '') + (parts.front || ''));
      if (!markup) continue;
      markup = `<defs>${defs.join('')}</defs>` + conv(markup);
      const b = measure(markup);
      if (!b.width) continue;
      pieces.push({ name: it.name, svg: cutSvg(markup, tabs(b, kind), b) });
    }
    const title = st.name ? `${st.name}'s paper doll` : 'My paper doll';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/</g, '&lt;')} · Tiny Tailors</title>
<style>
  @page { size: auto; margin: 12mm; }
  body { font-family: 'Baloo 2', 'Trebuchet MS', sans-serif; color: #5b3f58; margin: 0; }
  h1 { font-family: 'Sniglet', 'Baloo 2', sans-serif; font-size: 26pt; margin: 0 0 2mm; color: #e64f7c; }
  .how { font-size: 11pt; margin: 0 0 6mm; }
  .sheet { display: flex; flex-wrap: wrap; gap: 6mm; align-items: flex-start; }
  figure { margin: 0; text-align: center; break-inside: avoid; }
  figcaption { font-size: 9pt; color: #8a6f88; }
  .cut * { fill: #ffffff !important; stroke: #8a7a88 !important; stroke-width: 12px !important; stroke-dasharray: 7 6; stroke-linejoin: round; }
  .cut2 * { fill: #ffffff !important; stroke: #ffffff !important; stroke-width: 7px !important; stroke-dasharray: none; }
  .tabs * { fill: #ffffff; stroke: #a898a6; stroke-width: 2px; stroke-dasharray: 3 3; }
  .foot { margin-top: 8mm; font-size: 9pt; color: #8a6f88; }
  .print-btn { position: fixed; top: 10px; right: 10px; font: 700 14pt sans-serif; padding: 8px 16px; border-radius: 99px; border: 2px solid #5b3f58; background: #ff6f96; color: #fff; cursor: pointer; }
  @media print { .print-btn { display: none; } }
</style></head><body>
<button class="print-btn" onclick="window.print()">Print</button>
<h1>${title.replace(/</g, '&lt;')}</h1>
<p class="how">${coloring ? '1. Color everything in. ' : ''}${coloring ? '2' : '1'}. Cut along the dashed lines. ${coloring ? '3' : '2'}. Fold the little tabs back and hook them over your doll. ${coloring ? '4' : '3'}. Fold the base back so your doll can stand up!</p>
<div class="sheet"><figure>${doll}<figcaption>Your critter</figcaption></figure>
${pieces.map(p => `<figure>${p.svg}<figcaption>${p.name}</figcaption></figure>`).join('')}</div>
<p class="foot">Made with Tiny Tailors · App design by Sophia Pernal · 2026</p>
<script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 400); });<\/script>
</body></html>`;
  };

  TT.printPaperDoll = function (st, coloring) {
    const html = TT.paperDollHTML(st, coloring);
    let w = null;
    try { w = window.open('', '_blank'); } catch (e) { w = null; }
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); return true; }
    // pop-ups blocked: print from a hidden frame instead
    try {
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
      document.body.appendChild(f);
      f.contentDocument.open(); f.contentDocument.write(html.replace(/<script>[\s\S]*?<\/script>/, '')); f.contentDocument.close();
      setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { } setTimeout(() => f.remove(), 2000); }, 500);
      return true;
    } catch (e) { return false; }
  };
})(window.TT);
