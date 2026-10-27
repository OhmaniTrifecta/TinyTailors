/* Tiny Tailors — puts a critter together from the outfit state. */
(function (TT) {
  const { E } = TT;

  /* Every wardrobe slot: which items, whether "none" is allowed, colours and fabric patterns. */
  TT.SLOTS = {
    animal: { label: 'Critter', items: TT.ANIMALS, palette: TT.FUR, paletteLabel: 'Fur color' },
    eyes: { label: 'Eyes', items: TT.EYES },
    mouth: { label: 'Mouth', items: TT.MOUTHS },
    blush: { label: 'Cheeks', items: TT.BLUSH, none: true },
    hair: { label: 'Hair', items: TT.HAIR, none: true, palette: TT.COLORS, paletteLabel: 'Hair color' },
    top: { label: 'Tops', items: TT.TOPS, none: true, palette: TT.COLORS, patterns: true },
    bottom: { label: 'Bottoms', items: TT.BOTTOMS, none: true, palette: TT.COLORS, patterns: true },
    shoes: { label: 'Shoes', items: TT.SHOES, none: true, palette: TT.COLORS },
    hat: { label: 'Hats', items: TT.HATS, none: true, palette: TT.COLORS, patterns: true },
    face: { label: 'Specs & face fun', items: TT.FACE, none: true, palette: TT.COLORS },
    neck: { label: 'Neckwear', items: TT.NECK, none: true, palette: TT.COLORS, patterns: true },
    back: { label: 'Wings & capes', items: TT.BACK, none: true, palette: TT.COLORS, patterns: true },
    hold: { label: 'Holding', items: TT.HOLD, none: true, palette: TT.COLORS },
    pet: { label: 'Pet pal', items: TT.PETS, none: true, palette: TT.COLORS },
    scene: { label: 'Scene', items: TT.SCENES },
    fx: { label: 'Magic', items: TT.FX, none: true }
  };
  TT.itemOf = (slot, id) => (TT.SLOTS[slot].items.find(i => i.id === id) || null);
  const hexOf = (pal, id) => { const c = pal.find(p => p.id === id); return c ? c.hex : pal[0].hex; };
  TT.colorHex = (slot, id) => hexOf(TT.SLOTS[slot].palette || TT.COLORS, id);

  TT.furOf = function (st) {
    const a = TT.animalById(st.animal.id);
    const f = TT.FUR.find(x => x.id === st.animal.color);
    return { a, F: (f && f.hex) || a.fur };
  };

  /* pack for one slot, registering its fabric pattern in defs */
  function packFor(slot, entry, defs, pfx) {
    const base = TT.colorHex(slot, entry.color);
    let fill = base;
    if (TT.SLOTS[slot].patterns && entry.pattern && entry.pattern !== 'solid') {
      const id = `${pfx}pat-${slot}`;
      defs.push(TT.patternDef(id, entry.pattern, base));
      fill = `url(#${id})`;
    }
    return TT.pack(base, fill);
  }
  const asParts = r => (r == null ? {} : typeof r === 'string' ? { main: r } : r);

  /* Build the whole picture. opts: {pfx, animated, scene:false, fx:false} */
  TT.compose = function (st, opts = {}) {
    const pfx = opts.pfx || 'tt-';
    const animated = opts.animated !== false;
    const { a, F } = TT.furOf(st);
    const ctx = { a, F };
    const defs = [];
    const part = slot => {
      const e = st[slot];
      if (!e || !e.id) return {};
      const it = TT.itemOf(slot, e.id);
      if (!it) return {};
      return Object.assign(asParts(it.draw(packFor(slot, e, defs, pfx), ctx)), { item: it });
    };
    const top = part('top'), bottom = part('bottom'), shoes = part('shoes'), hat = part('hat'), hair = part('hair'),
      face = part('face'), neck = part('neck'), back = part('back'), hold = part('hold'), pet = part('pet');
    const hideFeet = bottom.item && bottom.item.hideFeet;
    const eyes = TT.itemOf('eyes', st.eyes.id) || TT.EYES[0];
    const mouth = TT.itemOf('mouth', st.mouth.id) || TT.MOUTHS[0];
    const blush = st.blush && st.blush.id ? TT.itemOf('blush', st.blush.id) : null;
    const scene = TT.itemOf('scene', st.scene.id) || TT.SCENES[0];
    const fx = st.fx && st.fx.id ? TT.itemOf('fx', st.fx.id) : null;
    const k = TT.critter;

    let critter = '';
    critter += back.back || '';
    critter += `<g class="${animated ? 'tail' : ''}">${k.tail(a, F)}</g>`;
    critter += hair.back || '';
    critter += hideFeet ? '' : k.legs(a, F) + k.feet(a, F);
    critter += k.torso(a, F);
    critter += bottom.main || '';
    critter += hideFeet ? '' : (shoes.main || '');
    critter += k.arms(a, F);
    critter += top.main || '';
    critter += bottom.over || '';
    critter += neck.main || '';
    critter += back.front || '';
    critter += hold.main || '';
    critter += k.paws(a, F);
    critter += k.headBack(a, F) + k.head(a, F) + k.headFront(a, F);
    critter += `<g class="${animated ? 'blink' : ''}">${eyes.draw(a)}</g>`;
    critter += mouth.draw(a) + (blush ? blush.draw(a) : '');
    critter += hair.front || '';
    critter += face.main || '';
    critter += hat.main || '';

    let out = '';
    if (opts.scene !== false) out += `<g class="scene">${scene.draw(null, pfx)}</g>`;
    out += E(200, 424, 96, 13, '#5b3f58', 0, 'opacity=".12"');
    out += `<g class="${animated ? 'critter' : ''}" id="${pfx}critter">${critter}</g>`;
    if (pet.main) out += `<g transform="translate(66 432) scale(1.4) translate(-66 -432)"><g class="${animated ? (pet.item.float ? 'pet-float' : 'pet') : ''}">${pet.main}</g></g>`;
    if (fx && opts.fx !== false) out += `<g class="fx">${fx.draw(null, animated)}</g>`;
    return `<defs>${defs.join('')}</defs>${out}`;
  };

  TT.svg = (inner, vb = '0 0 400 460', x = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ${x}>${inner}</svg>`;

  /* ---------- thumbnails: fit each item's own bounding box ---------- */
  let measurer = null;
  const boxCache = new Map();
  function bbox(key, inner) {
    if (boxCache.has(key)) return boxCache.get(key);
    if (!measurer) {
      measurer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      measurer.setAttribute('viewBox', '0 0 400 460');
      measurer.style.cssText = 'position:absolute;left:-9999px;top:0;width:400px;height:460px;visibility:hidden';
      document.body.appendChild(measurer);
    }
    measurer.innerHTML = inner;
    let b;
    try { b = measurer.getBBox(); } catch (e) { b = { x: 0, y: 0, width: 400, height: 460 }; }
    const pad = 10, w = b.width + pad * 2, h = b.height + pad * 2, s = Math.max(w, h, 60);
    const vb = `${(b.x - pad - (s - w) / 2).toFixed(1)} ${(b.y - pad - (s - h) / 2).toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`;
    boxCache.set(key, vb);
    return vb;
  }

  const GHOST = '#f6e9f0';
  TT.thumb = function (slot, item, st) {
    const S = TT.SLOTS[slot];
    if (!item) return TT.svg(`<circle cx="50" cy="50" r="26" fill="none" stroke="#e3c9d6" stroke-width="6"/><path d="M32,68 L68,32" stroke="#e3c9d6" stroke-width="6" stroke-linecap="round"/>`, '0 0 100 100');
    const { a, F } = TT.furOf(st);
    const ctx = { a, F };
    const entry = st[slot] || {};
    const base = S.palette && slot !== 'animal' ? TT.colorHex(slot, entry.color) : '#ff9ec0';
    const c = TT.pack(base);
    const k = TT.critter;
    const headOf = (aa, FF) => k.headBack(aa, FF) + k.head(aa, FF) + k.headFront(aa, FF);
    let inner, key = slot + ':' + item.id;
    switch (slot) {
      case 'animal': {
        const fur = (TT.FUR.find(f => f.id === entry.color) || {}).hex || item.fur;
        inner = headOf(item, fur) + TT.EYES[0].draw(item) + TT.MOUTHS[0].draw(item) + TT.BLUSH[0].draw(item);
        key = 'animal:' + item.id;
        break;
      }
      case 'eyes': case 'mouth': case 'blush':
        inner = k.head(a, F) + k.headFront(a, F) + (slot === 'eyes' ? item.draw(a) : (TT.itemOf('eyes', st.eyes.id) || TT.EYES[0]).draw(a)) +
          (slot === 'mouth' ? item.draw(a) : (TT.itemOf('mouth', st.mouth.id) || TT.MOUTHS[0]).draw(a)) + (slot === 'blush' ? item.draw(a) : '');
        return TT.svg(inner, '106 128 188 106');
      case 'hair': {
        const p = asParts(item.draw(c, ctx));
        inner = (p.back || '') + E(200, 165, 98, 86, GHOST, 4) + (p.front || '') + (p.main || '');
        break;
      }
      case 'scene':
        return TT.svg(item.draw(null, 'th-'), '0 40 400 400', 'preserveAspectRatio="xMidYMid slice"');
      case 'fx':
        return TT.svg(`<rect width="400" height="460" fill="#efe6fb"/>` + item.draw(null, false), '0 30 400 400', 'preserveAspectRatio="xMidYMid slice"');
      default: {
        const p = asParts(item.draw(c, ctx));
        inner = (p.back || '') + (p.main || '') + (p.over || '') + (p.front || '');
      }
    }
    return TT.svg(inner, bbox(key, inner));
  };

  /* ---------- how many looks are possible? ---------- */
  TT.countLooks = function () {
    let total = 1n;
    for (const [id, S] of Object.entries(TT.SLOTS)) {
      const colors = BigInt(S.palette ? S.palette.length : 1);
      const pats = BigInt(S.patterns ? TT.PATTERNS.length : 1);
      let n = 0n;
      for (const it of S.items) n += it.fixed ? 1n : colors * pats;
      if (S.none) n += 1n;
      total *= n;
    }
    return total;
  };
  TT.bigWords = function (n) {
    const names = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion'];
    const s = n.toString();
    const groups = Math.floor((s.length - 1) / 3);
    if (groups >= names.length) return 'more than a vigintillion';
    const lead = s.slice(0, s.length - groups * 3);
    return `${lead} ${names[groups]}`.trim();
  };
})(window.TT);
