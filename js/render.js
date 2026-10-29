/* Tiny Tailors — puts a critter together from the outfit state. */
(function (TT) {
  const { E, C, TUBE } = TT;

  /* Every wardrobe slot: which items, whether "none" is allowed, colours and fabric patterns. */
  TT.SLOTS = {
    animal: { label: 'Critter', items: TT.ANIMALS, palette: TT.FUR, paletteLabel: 'Fur color', paletteKind: 'fur' },
    eyes: { label: 'Eyes', items: TT.EYES },
    mouth: { label: 'Mouth', items: TT.MOUTHS },
    blush: { label: 'Cheeks', items: TT.BLUSH, none: true },
    hair: { label: 'Hair', items: TT.HAIR, none: true, palette: TT.COLORS, paletteLabel: 'Hair color' },
    top: { label: 'Tops', items: TT.TOPS, none: true, palette: TT.COLORS, patterns: true, trim: true },
    bottom: { label: 'Bottoms', items: TT.BOTTOMS, none: true, palette: TT.COLORS, patterns: true, trim: true },
    shoes: { label: 'Shoes', items: TT.SHOES, none: true, palette: TT.COLORS, trim: true },
    hat: { label: 'Hats', items: TT.HATS, none: true, palette: TT.COLORS, patterns: true, trim: true },
    face: { label: 'Specs & face fun', items: TT.FACE, none: true, palette: TT.COLORS, trim: true },
    neck: { label: 'Neckwear', items: TT.NECK, none: true, palette: TT.COLORS, patterns: true, trim: true },
    back: { label: 'Wings & capes', items: TT.BACK, none: true, palette: TT.COLORS, patterns: true, trim: true },
    hold: { label: 'Holding', items: TT.HOLD, none: true, palette: TT.COLORS, trim: true },
    pet: { label: 'Pet pal', items: TT.PETS, none: true, palette: TT.COLORS },
    scene: { label: 'Scene', items: TT.SCENES },
    fx: { label: 'Magic', items: TT.FX, none: true },
    pose: { label: 'Pose', items: TT.POSES }
  };
  TT.itemOf = (slot, id) => (TT.SLOTS[slot].items.find(i => i.id === id) || null);
  const isHex = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
  TT.isHex = isHex;
  const hexOf = (pal, id) => { if (isHex(id)) return id.toLowerCase(); const c = pal.find(p => p.id === id); return c ? c.hex : pal[0].hex; };
  TT.colorHex = (slot, id) => hexOf(TT.SLOTS[slot].palette || TT.COLORS, id);
  TT.trimHex = (slot, entry) => (entry && entry.color2 ? hexOf(TT.SLOTS[slot].palette || TT.COLORS, entry.color2) : null);
  TT.patternExists = id => !id || TT.PATTERNS.some(p => p.id === id) || !!TT.fabricById(id);

  TT.furOf = function (st) {
    const a = TT.animalById(st.animal.id);
    const v = st.animal.color;
    if (isHex(v)) return { a, F: v };
    const f = TT.FUR.find(x => x.id === v);
    return { a, F: (f && f.hex) || a.fur };
  };

  /* pack for one slot, registering its fabric pattern in defs */
  function packFor(slot, entry, defs, pfx) {
    const base = TT.colorHex(slot, entry.color);
    const trim = TT.SLOTS[slot].trim ? TT.trimHex(slot, entry) : null;
    let fill = base;
    if (TT.SLOTS[slot].patterns && entry.pattern && entry.pattern !== 'solid') {
      const id = `${pfx}pat-${slot}`;
      const def = TT.patternDef(id, entry.pattern, base, trim);
      if (def) { defs.push(def); fill = `url(#${id})`; }
    }
    return TT.pack(base, fill, trim);
  }
  const asParts = r => (r == null ? {} : typeof r === 'string' ? { main: r } : r);
  /* tops mark their sleeves (left arm only); pull them out so they can ride on the arms */
  function splitSleeves(markup) {
    if (!markup) return { main: '', sleeve: '' };
    let sleeve = '';
    const main = markup.replace(/<!--SL-->([\s\S]*?)<!--\/SL-->/g, (m, x) => { sleeve += x; return ''; });
    return { main, sleeve };
  }
  TT.poseOf = st => TT.itemOf('pose', st.pose && st.pose.id) || TT.POSES[0];
  TT.PET_HOME = { x: 66, y: 432 };

  /* Build the whole picture.
     opts: {pfx, animated, scene:false, fx:false, pet:false, pose: poseObject} */
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
    const topRaw = part('top');
    const sleeves = splitSleeves(topRaw.main);
    const bottom = part('bottom'), shoes = part('shoes'), hat = part('hat'), hair = part('hair'),
      face = part('face'), neck = part('neck'), back = part('back'), hold = part('hold'), pet = part('pet');
    const hideFeet = bottom.item && bottom.item.hideFeet;
    const eyes = TT.itemOf('eyes', st.eyes.id) || TT.EYES[0];
    const mouth = TT.itemOf('mouth', st.mouth.id) || TT.MOUTHS[0];
    const blush = st.blush && st.blush.id ? TT.itemOf('blush', st.blush.id) : null;
    const scene = TT.itemOf('scene', st.scene.id) || TT.SCENES[0];
    const fx = st.fx && st.fx.id ? TT.itemOf('fx', st.fx.id) : null;
    const pose = opts.pose || TT.poseOf(st);
    const k = TT.critter;
    const lc = a.limb && a.limbOnly !== 'feet' ? a.limb : F;
    const eyeDY = a.eyeDY || 0, hatDY = a.hatDY || 0;
    const tilt = `rotate(${pose.tilt || 0} 200 250)`;

    let body = '';
    body += back.back || '';
    body += `<g class="${animated ? 'tail' : ''}">${k.tail(a, F)}</g>`;
    if (hair.back) body += `<g transform="${tilt} translate(0 ${hatDY})">${hair.back}</g>`;
    // legs, then shoes (socks & boot shafts sit on the leg), then torso, then bottoms over all of it
    body += hideFeet ? '' : k.legs(a, F) + k.feet(a, F) + (shoes.main || '');
    body += k.torso(a, F);
    body += bottom.main || '';
    // arms (with their sleeves) go under the shirt body so shoulders look tucked in, like before poses existed
    const armL = TUBE(TT.SKEL.armL, 26, lc) + sleeves.sleeve;
    const rotL = `rotate(${pose.l} 152 266)`, rotR = `rotate(${pose.r} 248 266)`;
    body += `<g transform="${rotL}">${armL}</g><g transform="${rotR}"><g transform="matrix(-1 0 0 1 400 0)">${armL}</g></g>`;
    body += sleeves.main;
    body += bottom.over || '';
    body += neck.main || '';
    body += back.front || '';
    // paws on top; the held item stays upright in the right paw whatever the pose
    body += `<g transform="${rotL}">${C(115, 329, 15, lc)}</g>`;
    body += `<g transform="${rotR}">` + (hold.main ? `<g transform="rotate(${-pose.r} 285 329)">${hold.main}</g>` : '') + `${C(285, 329, 15, lc)}</g>`;
    // the head (tilts as one piece)
    let head = k.headBack(a, F) + k.head(a, F) + k.headFront(a, F);
    head += `<g transform="translate(0 ${eyeDY})"><g class="${animated ? 'blink' : ''}">${eyes.draw(a)}</g></g>`;
    head += mouth.draw(a) + (blush ? blush.draw(a) : '');
    if (hair.front) head += `<g transform="translate(0 ${hatDY})">${hair.front}</g>`;
    if (face.main) head += `<g transform="translate(0 ${eyeDY})">${face.main}</g>`;
    const hs = a.hatScale || 1;
    if (hat.main) head += `<g transform="translate(0 ${hatDY}) translate(200 110) scale(${hs}) translate(-200 -110)">${hat.main}</g>`;
    body += `<g transform="${tilt}">${head}</g>`;

    let out = '';
    if (opts.scene !== false) out += `<g class="scene">${scene.draw(null, pfx)}</g>`;
    out += E(200, 424, 96, 13, '#5b3f58', 0, 'opacity=".12"');
    out += `<g transform="translate(0 ${pose.lift || 0})"><g class="${animated ? 'critter' : ''}" id="${pfx}critter">${body}</g></g>`;
    if (pet.main && opts.pet !== false) {
      const pp = st.petPos || { x: 0, y: 0 };
      out += `<g id="${pfx}pet" class="pet-wrap" transform="translate(${pp.x} ${pp.y})"><g transform="translate(66 432) scale(1.4) translate(-66 -432)"><g class="${animated ? (pet.item.float ? 'pet-float' : 'pet') : ''}">${pet.main}</g></g></g>`;
    }
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
  TT.fitBox = bbox;

  const GHOST = '#f6e9f0';
  TT.thumb = function (slot, item, st) {
    const S = TT.SLOTS[slot];
    if (!item) return TT.svg(`<circle cx="50" cy="50" r="26" fill="none" stroke="#e3c9d6" stroke-width="6"/><path d="M32,68 L68,32" stroke="#e3c9d6" stroke-width="6" stroke-linecap="round"/>`, '0 0 100 100');
    const { a, F } = TT.furOf(st);
    const ctx = { a, F };
    const entry = st[slot] || {};
    const base = S.palette && slot !== 'animal' ? TT.colorHex(slot, entry.color) : '#ff9ec0';
    const c = TT.pack(base, null, S.trim ? TT.trimHex(slot, entry) : null);
    const k = TT.critter;
    const headOf = (aa, FF) => k.headBack(aa, FF) + k.head(aa, FF) + k.headFront(aa, FF);
    let inner, key = slot + ':' + item.id;
    switch (slot) {
      case 'animal': {
        const fur = isHex(entry.color) ? entry.color : ((TT.FUR.find(f => f.id === entry.color) || {}).hex || item.fur);
        inner = headOf(item, fur) + `<g transform="translate(0 ${item.eyeDY || 0})">${TT.EYES[0].draw(item)}</g>` + TT.MOUTHS[0].draw(item) + TT.BLUSH[0].draw(item);
        key = 'animal:' + item.id;
        break;
      }
      case 'eyes': case 'mouth': case 'blush': {
        const dy = a.eyeDY || 0;
        inner = k.head(a, F) + k.headFront(a, F) + `<g transform="translate(0 ${dy})">${slot === 'eyes' ? item.draw(a) : (TT.itemOf('eyes', st.eyes.id) || TT.EYES[0]).draw(a)}</g>` +
          (slot === 'mouth' ? item.draw(a) : (TT.itemOf('mouth', st.mouth.id) || TT.MOUTHS[0]).draw(a)) + (slot === 'blush' ? item.draw(a) : '');
        return TT.svg(inner, dy ? '96 70 208 170' : '106 128 188 106');
      }
      case 'pose': {
        const s2 = Object.assign({}, st, { pet: { id: null }, fx: { id: null } });
        return TT.svg(TT.compose(s2, { pfx: 'po-' + item.id + '-', animated: false, scene: false, pose: item }), '40 0 320 440');
      }
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
        inner = ((p.back || '') + (p.main || '') + (p.over || '') + (p.front || '')).replace(/<!--SL-->([\s\S]*?)<!--\/SL-->/g, (m, x) => x + `<g transform="matrix(-1 0 0 1 400 0)">${x}</g>`);
      }
    }
    return TT.svg(inner, bbox(key, inner));
  };

  /* ---------- how many looks are possible? ---------- */
  TT.countLooks = function () {
    let total = 1n;
    for (const [, S] of Object.entries(TT.SLOTS)) {
      const colors = BigInt(S.palette ? S.palette.length : 1);
      const trims = S.trim ? colors + 1n : 1n;
      const pats = BigInt(S.patterns ? TT.PATTERNS.length : 1);
      let n = 0n;
      for (const it of S.items) n += it.fixed ? 1n : colors * trims * pats;
      if (S.none) n += 1n;
      total *= n;
    }
    return total;
  };
  TT.bigWords = function (n) {
    const names = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'unvigintillion', 'duovigintillion', 'trevigintillion'];
    const s = n.toString();
    const groups = Math.floor((s.length - 1) / 3);
    if (groups >= names.length) return 'more than a trevigintillion';
    // names starting with "sex" (sextillion, sexdecillion) are skipped: say it with the name below instead, e.g. "1,234 quindecillion"
    const g = /^sex/.test(names[groups]) ? groups - 1 : groups;
    const lead = s.slice(0, s.length - g * 3).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${lead} ${names[g]}`.trim();
  };
})(window.TT);
