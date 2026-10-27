/* Tiny Tailors — share codes. A whole look is packed into bits and written as a short code.
   Codes also work as links: https://your-site/#look=CODE */
(function (TT) {
  const ORDER = ['animal', 'eyes', 'mouth', 'blush', 'hair', 'top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold', 'pet', 'scene', 'fx'];
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const paletteOf = slot => TT.SLOTS[slot].palette;

  function Writer() { this.bits = []; }
  Writer.prototype.put = function (v, n) { for (let i = n - 1; i >= 0; i--) this.bits.push((v >> i) & 1); };
  Writer.prototype.text = function () {
    let s = '';
    for (let i = 0; i < this.bits.length; i += 6) { let v = 0; for (let j = 0; j < 6; j++) v = (v << 1) | (this.bits[i + j] || 0); s += B64[v]; }
    return s;
  };
  function Reader(text) {
    this.bits = []; this.i = 0;
    for (const ch of text) { const v = B64.indexOf(ch); if (v < 0) throw new Error('bad'); for (let j = 5; j >= 0; j--) this.bits.push((v >> j) & 1); }
  }
  Reader.prototype.get = function (n) { let v = 0; for (let i = 0; i < n; i++) { if (this.i >= this.bits.length) throw new Error('short'); v = (v << 1) | this.bits[this.i++]; } return v; };

  const hexBits = (w, hex) => w.put(parseInt(hex.slice(1), 16), 24);
  const readHex = r => '#' + r.get(24).toString(16).padStart(6, '0');

  function putColor(w, pal, val, allowAuto) {
    if (allowAuto && !val) return w.put(0, 6);
    if (typeof val === 'string' && val[0] === '#') { w.put(63, 6); return hexBits(w, val); }
    const i = Math.max(0, pal.findIndex(p => p.id === val));
    w.put(i + (allowAuto ? 1 : 0), 6);
  }
  function getColor(r, pal, allowAuto) {
    const v = r.get(6);
    if (v === 63) return readHex(r);
    if (allowAuto) return v === 0 ? null : (pal[v - 1] || pal[0]).id;
    return (pal[v] || pal[0]).id;
  }

  TT.encodeLook = function (st) {
    const w = new Writer();
    w.put(1, 4);
    for (const slot of ORDER) {
      const S = TT.SLOTS[slot], e = st[slot] || {};
      const idx = e.id ? S.items.findIndex(i => i.id === e.id) : -1;
      w.put(idx + 1, 7);
      const pal = paletteOf(slot);
      if (pal) { putColor(w, pal, e.color, false); if (slot !== 'animal') putColor(w, pal, e.color2, true); }
      if (S.patterns) {
        const pat = e.pattern || 'solid';
        const pi = TT.PATTERNS.findIndex(p => p.id === pat);
        const fab = pi < 0 ? TT.fabricById(pat) : null;
        if (fab) {
          w.put(31, 5);
          fab.px.forEach(c => { const k = !c ? 0 : c === 'trim' ? 1 : 2 + Math.max(0, TT.COLORS.findIndex(x => x.hex === c)); w.put(k, 5); });
        } else w.put(Math.max(0, pi), 5);
      }
    }
    w.put(Math.max(0, TT.POSES.findIndex(p => p.id === (st.pose && st.pose.id))), 5);
    const pos = st.petPos;
    if (pos) { w.put(1, 1); w.put(Math.round(pos.x) + 256, 9); w.put(Math.round(pos.y) + 256, 9); } else w.put(0, 1);
    const name = (st.name || '').replace(/[^\x20-\x7e]/g, '?').slice(0, 24);
    w.put(name.length, 5);
    for (const ch of name) w.put(ch.charCodeAt(0), 7);
    return 'TT1-' + w.text();
  };

  TT.decodeLook = function (code) {
    code = String(code || '').trim().replace(/^.*#look=/, '').replace(/\s+/g, '');
    if (!code.startsWith('TT1-')) throw new Error('That code doesn’t look like a Tiny Tailors code.');
    const r = new Reader(code.slice(4));
    if (r.get(4) !== 1) throw new Error('This code is from a newer version.');
    const st = {};
    for (const slot of ORDER) {
      const S = TT.SLOTS[slot];
      const idx = r.get(7) - 1;
      const e = { id: idx >= 0 && S.items[idx] ? S.items[idx].id : null };
      const pal = paletteOf(slot);
      if (pal) { e.color = getColor(r, pal, false); if (slot !== 'animal') e.color2 = getColor(r, pal, true); }
      if (S.patterns) {
        const p = r.get(5);
        if (p === 31) {
          const px = [];
          for (let i = 0; i < 64; i++) { const k = r.get(5); px.push(k === 0 ? '' : k === 1 ? 'trim' : (TT.COLORS[k - 2] || TT.COLORS[0]).hex); }
          const sig = px.join(',');
          let fab = TT.allFabrics().find(f => f.px.join(',') === sig);
          if (!fab) { const id = 'fabs' + Math.abs([...sig].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)).toString(36); fab = { id, name: 'Shared fabric', px }; TT.sharedFabrics[id] = fab; }
          e.pattern = fab.id;
        } else e.pattern = (TT.PATTERNS[p] || TT.PATTERNS[0]).id;
      }
      st[slot] = e;
    }
    st.pose = { id: (TT.POSES[r.get(5)] || TT.POSES[0]).id };
    if (r.get(1)) st.petPos = { x: r.get(9) - 256, y: r.get(9) - 256 };
    const n = r.get(5); let name = '';
    for (let i = 0; i < n; i++) name += String.fromCharCode(r.get(7));
    st.name = name;
    return st;
  };
})(window.TT);
