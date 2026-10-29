/* Tiny Tailors — a small QR code maker (byte mode, error level M, versions 1–40).
   Follows the QR Code standard (ISO/IEC 18004). Used for "scan to see my critter" on the
   share window, the full-screen view, photos and printouts. */
(function (TT) {
  // error correction level M
  const ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
  const NUM_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];
  const ECL_BITS = 0; // M

  const rawModules = v => {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  };
  const dataCodewords = v => Math.floor(rawModules(v) / 8) - ECC_PER_BLOCK[v] * NUM_BLOCKS[v];

  const gfMul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 0xFF; };
  function rsDivisor(n) {
    const r = new Array(n).fill(0); r[n - 1] = 1; let root = 1;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) { r[j] = gfMul(r[j], root); if (j + 1 < n) r[j] ^= r[j + 1]; }
      root = gfMul(root, 0x02);
    }
    return r;
  }
  function rsRemainder(data, div) {
    const r = div.map(() => 0);
    for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= gfMul(c, f); }); }
    return r;
  }

  function utf8(text) {
    const out = []; const s = unescape(encodeURIComponent(String(text)));
    for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  TT.qr = function (text) {
    const bytes = utf8(text);
    let ver = 1;
    for (; ver <= 40; ver++) { const cc = ver <= 9 ? 8 : 16; if (4 + cc + bytes.length * 8 <= dataCodewords(ver) * 8) break; }
    if (ver > 40) return null;
    // data bits
    const bits = [];
    const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
    const cap = dataCodewords(ver) * 8;
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (let pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    // error correction blocks, interleaved
    const nb = NUM_BLOCKS[ver], el = ECC_PER_BLOCK[ver], raw = Math.floor(rawModules(ver) / 8);
    const nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDivisor(el);
    const blocks = [];
    for (let i = 0, k = 0; i < nb; i++) {
      const d = data.slice(k, k + shortLen - el + (i < nShort ? 0 : 1)); k += d.length;
      const e = rsRemainder(d, div); if (i < nShort) d.push(0);
      blocks.push(d.concat(e));
    }
    const all = [];
    for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - el || j >= nShort) all.push(b[i]); });

    // the grid
    const size = ver * 4 + 17;
    const mod = Array.from({ length: size }, () => new Array(size).fill(false));
    const fn = Array.from({ length: size }, () => new Array(size).fill(false));
    const setF = (x, y, on) => { mod[y][x] = on; fn[y][x] = true; };
    for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy; if (x >= 0 && x < size && y >= 0 && y < size) setF(x, y, d !== 2 && d !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    const align = [];
    if (ver > 1) {
      const n = Math.floor(ver / 7) + 2, step = Math.floor((ver * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
      align.push(6); for (let p = size - 7; align.length < n; p -= step) align.splice(1, 0, p);
    }
    align.forEach((ay, i) => align.forEach((ax, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === align.length - 1) || (i === align.length - 1 && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }));
    const bit = (v, i) => ((v >>> i) & 1) !== 0;
    const format = mask => {
      const d = (ECL_BITS << 3) | mask; let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412;
      for (let i = 0; i <= 5; i++) setF(8, i, bit(b, i));
      setF(8, 7, bit(b, 6)); setF(8, 8, bit(b, 7)); setF(7, 8, bit(b, 8));
      for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(b, i));
      for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(b, i));
      for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(b, i));
      setF(8, size - 8, true);
    };
    format(0);
    if (ver >= 7) {
      let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const b = (ver << 12) | r;
      for (let i = 0; i < 18; i++) { const a = size - 11 + i % 3, c = Math.floor(i / 3); setF(a, c, bit(b, i)); setF(c, a, bit(b, i)); }
    }
    // place the data
    let n = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - v : v;
        if (!fn[y][x] && n < all.length * 8) { mod[y][x] = bit(all[n >>> 3], 7 - (n & 7)); n++; }
      }
    }
    const MASKS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
    const applyMask = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[m](x, y)) mod[y][x] = !mod[y][x]; };
    const penalty = () => {
      let p = 0, dark = 0;
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        if (mod[y][x]) dark++;
        if (x < size - 1 && y < size - 1) { const c = mod[y][x]; if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) p += 3; }
      }
      for (let a = 0; a < size; a++) {
        let rx = 1, ry = 1;
        for (let b = 1; b < size; b++) {
          if (mod[a][b] === mod[a][b - 1]) { rx++; if (rx === 5) p += 3; else if (rx > 5) p++; } else rx = 1;
          if (mod[b][a] === mod[b - 1][a]) { ry++; if (ry === 5) p += 3; else if (ry > 5) p++; } else ry = 1;
        }
      }
      return p + Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    };
    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) { applyMask(m); format(m); const p = penalty(); if (p < bestP) { bestP = p; best = m; } applyMask(m); }
    applyMask(best); format(best);
    return { size, get: (x, y) => x >= 0 && y >= 0 && x < size && y < size && mod[y][x] };
  };

  /* SVG markup for a QR code with its white border, filling a box (x, y, w) */
  TT.qrSVG = function (text, x, y, w, color = '#3b2a39') {
    const q = TT.qr(text); if (!q) return '';
    const n = q.size + 8, u = w / n; let d = '';
    for (let r = 0; r < q.size; r++) for (let c = 0; c < q.size; c++) if (q.get(c, r)) d += `M${c + 4},${r + 4}h1v1h-1z`;
    return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${w}" rx="${(u * 2).toFixed(1)}" fill="#ffffff"/>` +
      `<path transform="scale(${u.toFixed(4)})" d="${d}" fill="${color}" shape-rendering="crispEdges"/></g>`;
  };

  /* draw onto a canvas */
  TT.qrDraw = function (g, text, x, y, w, color = '#3b2a39') {
    const q = TT.qr(text); if (!q) return false;
    const n = q.size + 8, u = w / n;
    g.save(); g.fillStyle = '#ffffff'; g.fillRect(x, y, w, w); g.fillStyle = color;
    for (let r = 0; r < q.size; r++) for (let c = 0; c < q.size; c++) if (q.get(c, r)) g.fillRect(Math.floor(x + (c + 4) * u), Math.floor(y + (r + 4) * u), Math.ceil(u), Math.ceil(u));
    g.restore(); return true;
  };

  /* the link a QR code points to: this site when it's the real app, otherwise the live site */
  TT.SITE = 'https://tinytailors.vercel.app/';
  TT.lookLink = function (code) {
    const c = String(code || '').replace(/^TT1-/, '');
    let base = TT.SITE;
    try { if (/^https:$/.test(location.protocol) && /tinytailors/i.test(location.hostname)) base = location.origin + location.pathname.replace(/index\.html$/, ''); } catch (e) { }
    return `${base}#look=${c}`;
  };
})(window.TT);
