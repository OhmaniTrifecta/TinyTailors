/* Tiny Tailors — unlockable goodies, poses and moods.
   Anything with `locked: N` costs N stitches to unlock. */
(function (TT) {
  const { P, C, E, S, R, TUBE, SYM, rot, OL, INK, shade, tint } = TT;
  const I = (id, name, draw, o = {}) => Object.assign({ id, name, draw }, o);
  const A = TT.ANIMAL_DEF;
  const T = TT.TOPKIT, B = TT.BOTKIT, SH = TT.SHOEKIT;
  const GOLD = '#ffd84d';

  /* ---------- critters ---------- */
  TT.ANIMALS.push(
    A('capybara', 'Capybara', { fur: '#c8996e', alt: '#e6c3a0', ears: 'small', muzzle: 'capy', extra: ['yuzu'], mouthY: 228, locked: 280 }),
    A('otter', 'Otter', { fur: '#a87b5e', alt: '#f3e2cc', ears: 'small', muzzle: 'otter', whiskers: 1, tail: 'otter', mouthY: 212, locked: 225 }),
    A('sloth', 'Sloth', { fur: '#bfa58a', alt: '#efe2cf', ears: 'none', marks: ['sloth'], muzzle: 'small', locked: 225 }),
    A('alpaca', 'Alpaca', { tall: 1, fur: '#fff6ea', alt: '#fffdf8', inner: '#ffc4d6', ears: 'alpaca', extra: ['alpacawool'], muzzle: 'horse', tail: 'fluff', mouthY: 222, locked: 250 }),
    A('narwhal', 'Narwhal', { tall: 1, fur: '#9cc8e8', alt: '#e8f4ff', ears: 'none', marks: ['narwhal'], extra: ['tusk'], muzzle: 'none', tail: 'whale', mouthY: 206, locked: 335 }),
    A('bat', 'Batty', { tall: 1, fur: '#8a7aa6', alt: '#d6cbe8', inner: '#ffb3c4', ears: 'bat', muzzle: 'small', tail: 'none', locked: 240 })
  );

  /* ---------- tops ---------- */
  TT.TOPS.push(
    I('dinohoodie', 'Dino hoodie', c => P('M118,254 Q116,224 150,224 L250,224 Q284,224 282,254 Q200,246 118,254Z', c.dark) +
      [124, 148, 252, 276].map(x => P(`M${x - 12},236 L${x},206 L${x + 12},236Z`, c.light, 3.5)).join('') +
      T.longSl(c.fill, c.dark) + T.body(346, c.fill) + E(200, 304, 38, 30, c.lighter, 3) + S('M180,292 Q200,286 220,292 M180,308 Q200,302 220,308', c.dark, 2.5), { locked: 125 }),
    I('royalrobe', 'Royal robe', c => T.longSl(c.fill, '#ffffff') + P('M150,240 Q200,232 250,240 Q270,250 274,276 L292,386 Q200,400 108,386 L126,276 Q130,250 150,240Z', c.fill) +
      P('M188,252 L212,252 L218,394 L182,394Z', '#ffffff', 3) + [[196, 272], [204, 300], [195, 328], [205, 356], [197, 382]].map(([x, y]) => P(`M${x},${y} l-3,6 l6,0z`, '#3a2f4a', 0)).join('') +
      [150, 170, 230, 250].map(x => C(x, 248 - (x === 170 || x === 230 ? 4 : 0), 12, '#ffffff', 3)).join('') + C(222, 300, 5, GOLD, 2.5) + C(178, 300, 5, GOLD, 2.5), { locked: 170 }),
    I('starlight', 'Starlight gown', c => SYM(C(144, 262, 22, c.light)) + P('M144,300 L256,300 Q306,352 306,402 Q200,424 94,402 Q94,352 144,300Z', c.fill) +
      P('M146,250 Q200,262 254,250 L256,306 L144,306Z', c.fill) + P('M144,298 L256,298 L256,310 L144,310Z', GOLD, 3) +
      [[130, 380, 7], [170, 344, 9], [214, 372, 8], [252, 340, 7], [278, 392, 6], [190, 398, 5], [234, 404, 5], [160, 270, 5], [236, 282, 6], [150, 396, 5]].map(([x, y, r]) => TT.star(x, y, r, '#fff3a8', 2)).join('') +
      S('M100,402 Q200,426 300,402', '#fff3a8', 3, 'opacity=".9"'), { locked: 225 }),
    I('shelltop', 'Seashell top', c => S('M168,250 L176,270 M232,250 L224,270', '#fffaf2', 3) + SYM(P('M152,296 Q156,266 178,264 Q200,266 200,296 Q176,304 152,296Z', c.fill) + S('M176,268 L176,298 M164,272 L160,296 M188,272 L192,296', c.dark, 2.5)) +
      [168, 180, 192, 204, 216, 228].map((x, i) => C(x, 254 + (i === 0 || i === 5 ? 0 : 4), 4.2, '#fffaf2', 2)).join(''), { locked: 100 })
  );

  /* ---------- bottoms ---------- */
  TT.BOTTOMS.push(
    I('rainbowtutu', 'Rainbow tutu', c => ['#c8a8ff', '#9cd3ff', '#a8e8b8', '#ffe98a', '#ffc38a', '#ff9eb0'].map((col, i) => E(200, 360 - i * 5, 96 - i * 6, 22 - i, col, 3)).join('') + P('M138,312 L262,312 L262,330 L138,330Z', c.dark, 3), { locked: 120 }),
    I('cloudskirt', 'Cloud skirt', c => P('M138,314 L262,314 L280,372 L120,372Z', c.fill) + [124, 148, 174, 200, 226, 252, 276].map((x, i) => C(x, 372 + (i % 2) * 4, 16, c.fill)).join('') +
      [150, 200, 250].map(x => C(x, 340, 9, '#ffffff', 0, 'opacity=".75"')).join('') + B.waist(c), { locked: 105 })
  );

  /* ---------- shoes ---------- */
  TT.SHOES.push(
    I('glass', 'Glass slippers', () => SYM(P('M150,414 Q150,398 172,398 Q196,398 202,412 Q202,422 188,422 L160,422 Q150,422 150,414Z', '#d8f0ff', 4, 'fill-opacity=".8"') + S('M160,404 Q170,400 180,402', '#ffffff', 3) + P('M196,416 L202,432 L194,432Z', '#d8f0ff', 3) + TT.star(186, 404, 5, '#ffffff', 0, 0.35, 4)), { locked: 140, fixed: 1 }),
    I('rocket', 'Rocket boots', c => SYM(P('M160,424 Q166,446 174,452 Q176,440 182,436 Q186,446 192,448 Q190,432 186,424Z', '#ffb347', 2.5) + P('M166,424 Q172,440 176,440 Q180,432 182,424Z', '#ffe17a', 0) +
      SH.shaft(370, c.fill) + P(SH.lowShoe, c.fill) + SH.sole('#c9cede') + P('M156,382 L146,396 L156,398Z', c.dark, 3) + C(174, 388, 5, '#9cd3ff', 2.5)), { locked: 155 })
  );

  /* ---------- hats ---------- */
  TT.HATS.push(
    I('icecreamhat', 'Ice cream hat', c => P('M178,58 L200,4 L222,58Z', '#ffcf8a') + S('M186,44 L210,24 M214,44 L192,24', '#e6a85c', 2.5) +
      P('M124,112 Q120,56 200,52 Q280,56 276,112 Q264,124 252,112 Q240,128 226,112 Q214,126 200,112 Q186,126 174,112 Q160,128 148,112 Q136,124 124,112Z', c.fill) +
      [[150, 80, '#ff6f86'], [176, 70, '#9cd3ff'], [228, 72, '#ffe17a'], [250, 90, '#9ee6c0'], [196, 92, '#ffffff']].map(([x, y, col]) => R(x, y, 9, 4, 2, col, 0, rot(30, x, y))).join(''), { locked: 90 }),
    I('unicornband', 'Unicorn headband', c => TUBE('M118,112 Q122,70 200,66 Q278,70 282,112', 7, c.dark) + P('M186,72 L200,12 L214,72 Q200,78 186,72Z', '#fff3a8') + S('M190,60 L210,52 M193,44 L207,38', '#e8c86a', 3) +
      TT.flower(168, 74, 10, c.fill, GOLD) + TT.flower(232, 74, 10, c.light, GOLD) + E(152, 84, 10, 5, '#9ee6c0', 2.5, rot(-30, 152, 84)), { locked: 110 }),
    I('froghat', 'Froggy hat', () => P('M120,118 Q118,60 200,56 Q282,60 280,118 Z', '#a6e394') + C(160, 54, 20, '#a6e394') + C(240, 54, 20, '#a6e394') + E(200, 70, 60, 16, '#a6e394', 0) +
      C(160, 52, 11, '#ffffff', 3) + C(240, 52, 11, '#ffffff', 3) + C(162, 54, 5, INK, 0) + C(242, 54, 5, INK, 0) + S('M184,92 Q200,102 216,92', OL, 3.5) + E(166, 94, 8, 4, '#ff9ec0', 0) + E(234, 94, 8, 4, '#ff9ec0', 0), { locked: 100, fixed: 1 }),
    I('cupcakehat', 'Cupcake hat', c => P('M146,112 L154,84 L246,84 L254,112Z', c.fill) + S('M166,86 L162,110 M186,86 L184,110 M206,86 L206,110 M226,86 L228,110 M244,86 L248,110', c.dark, 2.5) +
      P('M138,88 Q130,62 160,58 Q166,36 196,40 Q206,22 228,36 Q262,40 258,62 Q276,74 262,90Z', '#ffd0e0') + C(204, 26, 9, '#ff5c7a') + S('M204,18 Q208,8 216,6', OL, 3) +
      [[166, 62, '#9cd3ff'], [190, 56, '#ffe17a'], [226, 56, '#9ee6c0'], [242, 72, '#cfa8ff']].map(([x, y, col]) => R(x, y, 8, 3.5, 2, col, 0, rot(-25, x, y))).join(''), { locked: 85 }),
    I('starhalo', 'Star halo', () => [0, 1, 2, 3, 4, 5, 6].map(i => { const t = Math.PI * (0.08 + i * 0.84 / 6); return TT.star((200 - 74 * Math.cos(t)).toFixed(1), (60 - 22 * Math.sin(t)).toFixed(1), 11 + (i === 3 ? 4 : 0), i % 2 ? '#fff3a8' : GOLD, 2.5); }).join(''), { locked: 160, fixed: 1 })
  );

  /* ---------- specs ---------- */
  TT.FACE.push(
    I('diamond', 'Diamond shades', c => SYM(P('M162,148 L188,172 L162,198 L136,172Z', c.fill, 4, 'fill-opacity=".85"') + S('M152,166 L160,158', '#ffffff', 3.5) + TT.star(176, 158, 5, '#ffffff', 0, 0.35, 4)) + TUBE('M186,170 Q200,164 214,170', 3, c.dark), { locked: 75 }),
    I('galaxygoggles', 'Galaxy goggles', c => TUBE('M100,172 L300,172', 9, c.dark) + SYM(`<circle cx="162" cy="172" r="23" fill="#3d3478" stroke="${OL}" stroke-width="12"/><circle cx="162" cy="172" r="23" fill="none" stroke="${c.fill}" stroke-width="6"/>` +
      C(154, 166, 2, '#ffffff', 0) + C(170, 178, 1.5, '#ffe17a', 0) + C(166, 162, 1.2, '#ffffff', 0) + TT.star(158, 180, 3.5, '#c8b6ff', 0, 0.4, 4)) + TUBE('M186,172 L214,172', 4, c.fill), { locked: 90 })
  );

  /* ---------- neckwear ---------- */
  TT.NECK.push(
    I('goldchain', 'Star chain', c => S('M164,248 Q200,300 236,248', GOLD, 4) + S('M164,248 Q200,300 236,248', '#e8b33a', 1.5, 'stroke-dasharray="2 4"') + TT.star(200, 292, 15, GOLD, 3) + C(200, 292, 5, c.fill, 2), { locked: 70 }),
    I('butterflyneck', 'Butterfly choker', c => P('M150,250 Q200,266 250,250 L250,260 Q200,276 150,260Z', c.dark) + E(190, 266, 10, 12, c.fill, 3, rot(-20, 190, 266)) + E(210, 266, 10, 12, c.fill, 3, rot(20, 210, 266)) + E(200, 268, 3, 9, OL, 0), { locked: 65 })
  );

  /* ---------- wings & capes ---------- */
  TT.BACK.push(
    I('phoenix', 'Phoenix wings', () => ({ back: SYM(P('M176,282 Q120,190 56,180 Q72,206 58,222 Q80,232 66,256 Q96,262 86,290 Q130,300 176,304Z', '#ff8f6b') + P('M176,286 Q130,220 84,214 Q94,236 84,250 Q104,258 98,280 Q140,292 176,300Z', '#ffb347', 0) + P('M176,290 Q144,250 116,248 Q122,266 116,276 Q146,288 176,298Z', '#ffe17a', 0)) }), { locked: 265, fixed: 1 }),
    I('galaxycape', 'Galaxy cape', c => ({ back: P('M146,246 L254,246 Q292,330 308,424 Q200,442 92,424 Q108,330 146,246Z', '#3d3478') + S('M94,424 Q200,440 306,424', c.fill, 6) +
      [[130, 340], [170, 300], [236, 320], [270, 390], [190, 380], [120, 404], [228, 410]].map(([x, y], i) => i % 2 ? TT.star(x, y, 6, '#fff3a8', 0) : C(x, y, 2.4, '#ffffff', 0)).join(''), front: C(158, 254, 7, c.fill) + C(242, 254, 7, c.fill) }), { locked: 180 }),
    I('bubblewings', 'Bubble wings', () => ({ back: SYM([[120, 230, 34], [86, 280, 26], [140, 296, 22], [96, 196, 18], [66, 240, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e6f6ff" fill-opacity=".55" stroke="#b8a8ff" stroke-width="3"/>` + S(`M${x - r * 0.5},${y - r * 0.3} q${r * 0.2},${-r * 0.4} ${r * 0.5},${-r * 0.4}`, '#ffffff', 3)).join('')) }), { locked: 140, fixed: 1 })
  );

  /* ---------- things to hold ---------- */
  TT.HOLD.push(
    I('orb', 'Crystal orb', c => P('M290,318 L322,318 L326,332 L286,332Z', GOLD) + `<circle cx="306" cy="292" r="26" fill="${c.light}" fill-opacity=".85" stroke="${OL}" stroke-width="4"/>` +
      S('M292,296 Q306,278 320,292 Q306,306 296,292', '#ffffff', 3) + TT.star(314, 280, 4, '#ffffff', 0, 0.35, 4), { locked: 105 }),
    I('trophy', 'Golden trophy', () => P('M284,332 L316,332 L320,346 L280,346Z', '#c99a2e') + R(296, 312, 8, 22, 2, GOLD, 3) + P('M276,262 L324,262 Q324,306 300,312 Q276,306 276,262Z', GOLD) +
      S('M276,272 Q260,272 262,286 Q264,298 280,296 M324,272 Q340,272 338,286 Q336,298 320,296', OL, 4) + TT.star(300, 282, 9, '#fff7c2', 2), { locked: 120, fixed: 1 }),
    I('starballoon', 'Star balloon', c => S('M286,332 Q300,260 330,200', OL, 2.5) + TT.star(334, 160, 42, c.fill, 4, 0.5) + S('M318,140 Q324,128 334,126', '#ffffff', 5), { locked: 70 })
  );

  /* ---------- pet pals ---------- */
  const face = (x, y, s = 1) => C(x - 6 * s, y, 2.6 * s, INK, 0) + C(x + 6 * s, y, 2.6 * s, INK, 0) + S(`M${x - 3 * s},${y + 5 * s} Q${x},${y + 8 * s} ${x + 3 * s},${y + 5 * s}`, OL, 2) +
    E(x - 11 * s, y + 4 * s, 4 * s, 2.5 * s, '#ff9ec0', 0) + E(x + 11 * s, y + 4 * s, 4 * s, 2.5 * s, '#ff9ec0', 0);
  TT.PETS.push(
    I('babyunicorn', 'Baby unicorn', () => P('M44,420 L44,434 M58,422 L58,434 M80,422 L80,434 M94,420 L94,434', 'none', 0) + S('M48,422 L48,434 M62,424 L62,434 M82,424 L82,434 M94,422 L94,434', OL, 6) +
      E(70, 414, 30, 16, '#ffffff') + P('M96,404 Q112,400 110,420 Q104,412 96,414Z', '#c9a8ff', 3) + C(52, 392, 18, '#ffffff') + P('M48,376 L54,350 L60,376Z', '#fff3a8', 2.5) + P('M60,378 Q76,380 74,402 Q68,392 60,392Z', '#ffb3d1', 3) + face(48, 394, 0.8), { locked: 210 }),
    I('phoenixchick', 'Phoenix chick', () => P('M62,384 Q58,362 68,360 Q66,372 74,376 Q74,358 86,360 Q78,372 80,386Z', '#ffb347', 3) + S('M62,424 l0,8 M78,424 l0,8', '#ffa23f', 3) +
      C(70, 404, 22, '#ff8f6b') + P('M84,404 Q100,396 94,414 Q88,420 82,414Z', '#ffe17a', 3) + face(66, 400, 0.9) + P('M62,404 L70,402 L66,408Z', '#ffe17a', 2), { locked: 180 }),
    I('starbuddy', 'Star buddy', () => TT.star(70, 318, 30, '#ffe17a', 4, 0.55) + face(70, 320, 0.85) + TT.star(102, 292, 6, '#fff3a8', 2) + TT.star(40, 296, 4, '#fff3a8', 2), { locked: 140, float: 1 }),
    I('whale', 'Mini whale', () => S('M62,284 Q58,272 52,268 M66,284 Q68,270 76,266', '#9cd3ff', 4) + P('M36,318 Q40,290 74,290 Q106,292 104,318 Q100,338 70,340 Q40,338 36,318Z', '#7fb8e8') +
      P('M100,316 L120,302 L116,322 L122,338 L100,326Z', '#7fb8e8', 3.5) + P('M44,324 Q70,342 98,324 Q90,338 70,340 Q50,338 44,324Z', '#e8f4ff', 0) + face(62, 312, 0.8), { locked: 170, float: 1 })
  );

  /* ---------- scenes ---------- */
  const bg = col => `<rect x="-10" y="-10" width="420" height="490" fill="${col}"/>`;
  const dots = (seed, n, col, r0, r1, y0, y1, op = 1) => { const r = TT.rng(seed); let s = ''; for (let i = 0; i < n; i++) s += C((r() * 400).toFixed(1), (y0 + r() * (y1 - y0)).toFixed(1), (r0 + r() * (r1 - r0)).toFixed(1), col, 0, `opacity="${op}"`); return s; };
  TT.SCENES.push(
    I('aurora', 'Aurora night', () => bg('#283a66') + dots(201, 50, '#ffffff', 0.8, 2, 0, 260, 0.9) +
      S('M-10,120 Q80,60 160,110 Q240,160 320,90 Q370,50 420,80', '#8ff0c4', 26, 'opacity=".55"') + S('M-10,160 Q90,110 180,150 Q260,190 340,130 Q380,110 420,120', '#ff9ee0', 18, 'opacity=".45"') +
      P('M-10,340 Q100,300 210,340 Q310,300 410,330 L410,480 L-10,480Z', '#e6f0ff', 0) +
      [[50, 330], [350, 320], [300, 345]].map(([x, y]) => P(`M${x},${y - 70} L${x - 24},${y} L${x + 24},${y}Z`, '#3f6b6a', 0)).join('') + P('M-10,372 Q200,356 410,372 L410,480 L-10,480Z', '#ffffff', 0), { locked: 155 }),
    I('volcano', 'Volcano island', () => bg('#ffe0c8') + C(330, 70, 28, '#fff3a8', 0) + R(-10, 290, 420, 90, 0, '#7fd3e8', 0) +
      P('M90,300 L170,140 L230,140 L310,300Z', '#b98a6d', 0) + P('M170,140 Q200,170 230,140 L222,156 Q200,178 178,156Z', '#ff8f6b', 0) +
      C(200, 110, 18, '#ffffff', 0, 'opacity=".9"') + C(184, 84, 14, '#ffffff', 0, 'opacity=".9"') + TT.heart(214, 60, 14, '#ffb3cc', 0) +
      S('M60,370 Q66,320 54,280', '#b98a6d', 9) + P('M54,280 Q30,268 18,284 Q38,278 54,286 Q40,300 44,318 Q54,296 58,288 Q76,300 84,316 Q80,290 62,282 Q84,268 100,276 Q76,264 54,280Z', '#7fcf8f', 3) +
      P('M-10,372 Q200,352 410,372 L410,480 L-10,480Z', '#ffe5ae', 0) + dots(203, 20, '#f5cf86', 1.5, 3, 384, 460), { locked: 140 }),
    I('crystal', 'Crystal cave', () => bg('#3b2f5e') + P('M-10,-10 L410,-10 L410,60 Q300,120 200,80 Q100,120 -10,60Z', '#2c2248', 0) +
      [[40, 330, 50, '#c8a8ff'], [80, 330, 34, '#9cd3ff'], [340, 330, 56, '#ffb3d1'], [372, 330, 36, '#c8a8ff'], [300, 330, 26, '#9ee6c0']].map(([x, y, h, col]) => P(`M${x - 14},${y} L${x - 8},${y - h} L${x},${y - h - 14} L${x + 8},${y - h} L${x + 14},${y}Z`, col, 3) + S(`M${x - 4},${y - h + 4} L${x - 4},${y - 10}`, '#ffffff', 3, 'opacity=".6"')).join('') +
      dots(205, 24, '#e6d6ff', 1, 3, 40, 300, 0.7) + P('M-10,350 Q200,330 410,350 L410,480 L-10,480Z', '#4e3f7a', 0) + E(200, 420, 150, 26, '#c8a8ff', 0, 'opacity=".25"'), { locked: 170 })
  );

  /* ---------- magic effects (rendered by the same particle engine) ---------- */
  const particles = (seed, n, cls, make, animated, dur) => {
    const r = TT.rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = r() * 400, y = r() * 460, d = dur[0] + r() * (dur[1] - dur[0]), delay = -r() * d, k = r();
      const shape = make(x, y, k, i);
      s += animated ? `<g class="${cls}" style="animation-duration:${d.toFixed(2)}s;animation-delay:${delay.toFixed(2)}s">${shape}</g>` : shape;
    }
    return s;
  };
  const CONF = ['#ff9ec0', '#ffe17a', '#9ee6c0', '#9cd3ff', '#cfa8ff', '#ffb38a'];
  TT.FX.push(
    I('goldsparkle', 'Golden sparkles', (c, an) => particles(21, 22, 'fx-twinkle', (x, y, k) => TT.star(x, y, 6 + k * 8, k > 0.5 ? '#ffd84d' : '#fff3a8', 0, 0.3, 4), an, [1.2, 2.4]), { locked: 85 }),
    I('comets', 'Shooting comets', (c, an) => particles(22, 9, 'fx-fall', (x, y, k, i) => S(`M${x},${y} L${x - 30},${y - 40}`, CONF[i % 6], 4, 'opacity=".6"') + TT.star(x, y, 7, '#fff3a8', 2), an, [2.5, 4.5]), { locked: 105 }),
    I('balloonfx', 'Floating balloons', (c, an) => particles(23, 9, 'fx-rise', (x, y, k, i) => S(`M${x},${y + 24} q4,12 -2,24`, OL, 1.5) + E(x, y, 14, 17, CONF[i % 6], 3), an, [8, 13]), { locked: 100 })
  );

  /* ---------- poses ----------
     l / r : arm rotation in degrees (left arm + raises it, right arm − raises it)
     tilt  : head tilt, lift : hop the whole body up */
  TT.POSES = [
    { id: 'stand', name: 'Stand', l: 0, r: 0 },
    { id: 'wave', name: 'Wave', l: 0, r: -98, tilt: 5 },
    { id: 'hooray', name: 'Hooray!', l: 98, r: -98 },
    { id: 'tada', name: 'Ta-da!', l: 70, r: -70 },
    { id: 'shy', name: 'Shy', l: -24, r: 24, tilt: -9 },
    { id: 'jump', name: 'Jump!', l: 92, r: -92, lift: -28 },
    { id: 'point', name: 'Point', l: 0, r: -95, tilt: -4 },
    { id: 'dab', name: 'Dab', l: 96, r: -55, tilt: 12 },
    { id: 'lean', name: 'Chill', l: 12, r: -12, tilt: 10 },
    { id: 'superstar', name: 'Superstar', l: 100, r: -30, tilt: -6, lift: -12, locked: 110 },
    { id: 'ballerina', name: 'Ballerina', l: 102, r: -102, lift: -16, tilt: 3, locked: 110 }
  ].map(p => Object.assign({ tilt: 0, lift: 0, draw: () => '' }, p));
  TT.DANCE = ['hooray', 'tada', 'wave', 'dab', 'jump', 'point', 'hooray', 'stand'];

  /* ---------- moods: quick face presets ---------- */
  TT.MOODS = [
    { id: 'happy', name: 'Happy', eyes: 'happy', mouth: 'open', blush: 'rosy' },
    { id: 'silly', name: 'Silly', eyes: 'wink', mouth: 'tongue', blush: 'hearts' },
    { id: 'love', name: 'In love', eyes: 'heart', mouth: 'cat', blush: 'hearts' },
    { id: 'starry', name: 'Starstruck', eyes: 'star', mouth: 'grin', blush: 'stars' },
    { id: 'cool', name: 'Cool', eyes: 'dot', mouth: 'smirk', blush: null },
    { id: 'sleepy', name: 'Sleepy', eyes: 'sleepy', mouth: 'o', blush: 'rosy' },
    { id: 'shocked', name: 'Shocked', eyes: 'surprised', mouth: 'o', blush: 'shy' },
    { id: 'grumpy', name: 'Grumpy', eyes: 'determined', mouth: 'frown', blush: null },
    { id: 'sad', name: 'Sad', eyes: 'teary', mouth: 'wobbly', blush: 'shy' },
    { id: 'brave', name: 'Brave', eyes: 'determined', mouth: 'grin', blush: 'freckles' }
  ];
})(window.TT);
