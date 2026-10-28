/* Tiny Tailors — printable paper doll and coloring page.
   Builds one letter-size page (as a single SVG) from the look on screen:
   the dressed-up look, the critter on a fold-out stand, and every piece it's wearing with fold-over tabs.
   The page can be printed, saved as a PDF, or saved as a picture. */
(function (TT) {
  const OL = TT.OL;
  const PAGE_W = 816, PAGE_H = 1056, M = 36; // US letter at 96 dpi
  const PIECES = [
    // slot, where the fold-back tabs go
    ['top', 'topedge'], ['bottom', 'sides'], ['back', 'sides'], ['hat', 'bottomedge'], ['shoes', 'topedge'],
    ['neck', 'topedge'], ['face', 'sides'], ['hold', 'left'], ['pet', 'stand']
  ];
  const mirrorSleeves = m => m.replace(/<!--SL-->([\s\S]*?)<!--\/SL-->/g, (x, a) => a + `<g transform="matrix(-1 0 0 1 400 0)">${a}</g>`);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toColoring(markup) {
    const keep = [OL.toLowerCase(), TT.INK.toLowerCase()];
    return markup
      .replace(/<pattern[\s\S]*?<\/pattern>/g, '')
      .replace(/fill="url\([^"]*\)"/g, 'fill="#ffffff"')
      .replace(/stroke="url\([^"]*\)"/g, 'stroke="#ffffff"')
      .replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (m, c) => keep.includes(c.toLowerCase()) ? m : 'fill="#ffffff"')
      // thick coloured strokes are arms, legs and tails: white so they can be colored in; thin ones become light lines
      .replace(/stroke="(#[0-9a-fA-F]{3,6})" stroke-width="([\d.]+)"/g, (m, c, w) => keep.includes(c.toLowerCase()) ? m : `stroke="${+w >= 6 ? '#ffffff' : '#a898a6'}" stroke-width="${w}"`)
      .replace(/stroke="(#[0-9a-fA-F]{3,6})"(?! stroke-width="[\d.]+")/g, (m, c) => keep.includes(c.toLowerCase()) ? m : 'stroke="#a898a6"')
      .replace(/opacity="\.\d+"/g, 'opacity="1"');
  }
  function tabs(b, kind) {
    const t = (x, y, w, h) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="3"/>`;
    const w = 22, h = 16;
    switch (kind) {
      case 'topedge': return t(b.x + b.width * 0.22 - w / 2, b.y - h + 4, w, h) + t(b.x + b.width * 0.78 - w / 2, b.y - h + 4, w, h);
      case 'bottomedge': return t(b.x + b.width * 0.25 - w / 2, b.y + b.height - 4, w, h) + t(b.x + b.width * 0.75 - w / 2, b.y + b.height - 4, w, h);
      case 'sides': return t(b.x - h + 4, b.y + Math.min(30, b.height * 0.3), h, w) + t(b.x + b.width - 4, b.y + Math.min(30, b.height * 0.3), h, w);
      case 'left': return t(b.x - h + 4, b.y + b.height * 0.6, h, w);
      case 'stand': return `<rect x="${(b.x + b.width / 2 - 30).toFixed(1)}" y="${(b.y + b.height - 2).toFixed(1)}" width="60" height="26" rx="4"/>`;
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
  // one cut-out: white dashed cut line around the shape and its tabs, then the art on top
  function cutout(markup, tabMarkup, b, pad = 18) {
    let defs = '';
    const art = markup.replace(/<defs>([\s\S]*?)<\/defs>/g, (m, d) => { defs += d; return ''; });
    return {
      vb: [b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2],
      body: `<defs>${defs}</defs><g class="pd-cut">${art}${tabMarkup}</g><g class="pd-cut2">${art}${tabMarkup}</g><g class="pd-tabs">${tabMarkup}</g>${art}`
    };
  }

  /* Build the page. Returns { svg, title } */
  TT.paperDollSVG = function (st, coloring) {
    const conv = m => coloring ? toColoring(m) : m;
    const look = JSON.parse(JSON.stringify(st));
    look.pose = { id: 'stand' }; // pieces are cut for the standing pose
    const fur = TT.furOf(look);

    // 1. the dressed-up look, exactly as on screen (standing pose so the clothes line up)
    const noShadow = m => m.replace(/<ellipse cx="200" cy="424"[^>]*\/>/, '');
    const lookArt = conv(noShadow(TT.compose(look, { pfx: 'pdl-', animated: false, scene: false, fx: false, pet: false })));

    // 2. the doll: critter + hair + face, no clothes, on a fold-back stand
    const bare = JSON.parse(JSON.stringify(look));
    ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold', 'pet', 'fx'].forEach(s => { if (bare[s]) bare[s].id = null; });
    let dollArt = conv(TT.compose(bare, { pfx: 'pdd-', animated: false, scene: false, pet: false, fx: false }).replace(/<ellipse cx="200" cy="424"[^>]*\/>/, ''));
    const standTab = `<rect x="120" y="420" width="160" height="44" rx="6"/>`;
    const dollB = measure(dollArt + standTab);
    const doll = cutout(dollArt + `<rect x="120" y="420" width="160" height="44" rx="6" fill="#ffffff" stroke="${OL}" stroke-width="2"/><path d="M120,420 L280,420" stroke="#a898a6" stroke-width="2" stroke-dasharray="5 4"/><text x="200" y="447" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#a898a6">fold back to stand</text>`, standTab, dollB);

    // 3. every piece the critter is wearing
    const pieces = [];
    for (const [slot, kind] of PIECES) {
      const e = look[slot];
      if (!e || !e.id) continue;
      const it = TT.itemOf(slot, e.id);
      if (!it) continue;
      const S = TT.SLOTS[slot];
      const baseHex = S.palette ? TT.colorHex(slot, e.color) : '#ff9ec0';
      const trim = S.trim ? TT.trimHex(slot, e) : null;
      let fill = baseHex, defs = '';
      if (S.patterns && e.pattern && e.pattern !== 'solid') {
        const id = `pdp-${slot}`; const d = TT.patternDef(id, e.pattern, baseHex, trim);
        if (d) { defs = d; fill = `url(#${id})`; }
      }
      const r = it.draw(TT.pack(baseHex, fill, trim), fur);
      const parts = typeof r === 'string' ? { main: r } : (r || {});
      let markup = mirrorSleeves((parts.back || '') + (parts.main || '') + (parts.over || '') + (parts.front || ''));
      if (slot === 'pet') markup = `<g transform="translate(66 432) scale(1.4) translate(-66 -432)">${markup}</g>`;
      if (!markup) continue;
      markup = conv(`<defs>${defs}</defs>${markup}`);
      const b = measure(markup);
      if (!b.width) continue;
      pieces.push(Object.assign(cutout(markup, tabs(b, kind), b), { name: it.name }));
    }

    // 4. lay it out on a letter page, shrinking until it fits
    const name = (st.name || '').trim();
    const kindName = coloring ? 'coloring page' : 'paper doll';
    const title = name ? `${name}'s ${kindName}` : `My ${kindName}`;
    const steps = coloring ? 'Color it in, cut along the dashed lines, fold the tabs back and hook them over your doll.' : 'Cut along the dashed lines, fold the tabs back and hook them over your doll.';
    let scale = 0.92, placed;
    for (let tries = 0; tries < 12; tries++) {
      placed = layout(scale);
      if (placed.ok) break;
      scale *= 0.92;
    }
    function layout(k) {
      const top = M + 92, out = [];
      const dw = doll.vb[2] * k, dh = doll.vb[3] * k;
      out.push({ p: doll, x: M, y: top, w: dw, h: dh, cap: 'Your critter' });
      // the dressed look sits top-right as a guide
      const lw = Math.min(200, PAGE_W - M * 2 - dw - 20), lh = lw * 460 / 400;
      const lookBox = { x: PAGE_W - M - lw, y: top, w: lw, h: lh };
      // shelf-pack the pieces: first beside the doll (under the look), then under the doll across the page
      const areas = [{ x: M + dw + 20, y: top + lh + 30, r: PAGE_W - M, b: top + dh }, { x: M, y: top + dh + 26, r: PAGE_W - M, b: PAGE_H - M - 24 }];
      let ai = 0, cx = areas[0].x, cy = areas[0].y, rowH = 0;
      for (const p of pieces.slice().sort((a, b) => b.vb[3] - a.vb[3])) {
        const w = p.vb[2] * k, h = p.vb[3] * k;
        for (;;) {
          const A = areas[ai];
          if (!A) return { ok: false };
          if (cx + w > A.r) { cx = A.x; cy += rowH + 20; rowH = 0; }
          if (cy + h + 14 > A.b || w > A.r - A.x) { ai++; if (!areas[ai]) return { ok: false }; cx = areas[ai].x; cy = areas[ai].y; rowH = 0; continue; }
          out.push({ p, x: cx, y: cy, w, h, cap: p.name });
          cx += w + 18; rowH = Math.max(rowH, h + 14);
          break;
        }
      }
      return { ok: true, out, lookBox };
    }

    const style = `<style>
      .pd-cut * { fill: #ffffff !important; stroke: #8a7a88 !important; stroke-width: 12px !important; stroke-dasharray: 7 6; stroke-linejoin: round; }
      .pd-cut2 * { fill: #ffffff !important; stroke: #ffffff !important; stroke-width: 7px !important; stroke-dasharray: none; }
      .pd-tabs * { fill: #ffffff; stroke: #a898a6; stroke-width: 2px; stroke-dasharray: 3 3; }
      .pd-cap { font: 600 11px 'Baloo 2', 'Trebuchet MS', sans-serif; fill: #8a6f88; }
    </style>`;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}" height="${PAGE_H}" viewBox="0 0 ${PAGE_W} ${PAGE_H}">${style}`;
    svg += `<rect width="${PAGE_W}" height="${PAGE_H}" fill="#ffffff"/>`;
    svg += `<text x="${M}" y="${M + 30}" font-family="Sniglet, 'Baloo 2', 'Trebuchet MS', sans-serif" font-weight="800" font-size="32" fill="#e64f7c">${esc(title)}</text>`;
    svg += `<text x="${M}" y="${M + 58}" font-family="'Baloo 2', 'Trebuchet MS', sans-serif" font-size="14" fill="#5b3f58">${esc(steps)} Fold the base back so it stands up!</text>`;
    const L = placed.lookBox;
    svg += `<rect x="${L.x - 6}" y="${L.y - 6}" width="${L.w + 12}" height="${L.h + 12}" rx="14" fill="${coloring ? '#ffffff' : '#fff4f7'}" stroke="#f4b3c8" stroke-width="2" stroke-dasharray="6 5"/>`;
    svg += `<svg x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" viewBox="0 0 400 460">${lookArt}</svg>`;
    svg += `<text class="pd-cap" x="${L.x + L.w / 2}" y="${L.y + L.h + 20}" text-anchor="middle">${coloring ? 'Color your look!' : 'Your look'}</text>`;
    placed.out.forEach(({ p, x, y, w, h, cap }) => {
      svg += `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${p.vb.map(v => v.toFixed(1)).join(' ')}">${p.body}</svg>`;
      svg += `<text class="pd-cap" x="${(x + w / 2).toFixed(1)}" y="${(y + h + 11).toFixed(1)}" text-anchor="middle">${esc(cap)}</text>`;
    });
    svg += `<text x="${PAGE_W / 2}" y="${PAGE_H - M + 10}" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-size="11" fill="#8a6f88">Made with Tiny Tailors · App design by Sophia and Sabrina Pernal · 2026</text>`;
    svg += '</svg>';
    return { svg, title };
  };

  /* SVG page -> PNG data URL */
  TT.pageToPNG = async function (svg, scale = 2) {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    try { await img.decode(); } catch (e) { await new Promise(r => { img.onload = r; img.onerror = r; }); }
    const c = document.createElement('canvas'); c.width = PAGE_W * scale; c.height = PAGE_H * scale;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  };

  /* load jsPDF only when someone asks for a PDF */
  let pdfLib = null;
  TT.loadPDF = function () {
    if (window.jspdf) return Promise.resolve(window.jspdf);
    if (pdfLib) return pdfLib;
    pdfLib = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = () => window.jspdf ? res(window.jspdf) : rej(new Error('no pdf'));
      s.onerror = () => { pdfLib = null; rej(new Error('offline')); };
      document.head.appendChild(s);
    });
    return pdfLib;
  };
  TT.pngToPDF = async function (png, fileName) {
    const { jsPDF } = await TT.loadPDF();
    const doc = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });
    doc.addImage(png, 'PNG', 0, 0, 8.5, 11);
    doc.save(fileName);
  };
  TT.PAGE = { W: PAGE_W, H: PAGE_H };
})(window.TT);
