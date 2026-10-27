/* Tiny Tailors — hats, hair, specs & face fun, neckwear, back pieces and things to hold. */
(function (TT) {
  const { P, C, E, S, R, TUBE, SYM, rot, OL, INK } = TT;
  const I = (id, name, draw, o = {}) => Object.assign({ id, name, draw }, o);
  const GOLD = '#ffd84d';
  const ring = (cx, cy, r, col, w = 5) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" fill-opacity=".28"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${OL}" stroke-width="${w + 7}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const headTop = x => 165 - 86 * Math.sqrt(Math.max(0, 1 - ((x - 200) / 98) ** 2));

  /* ---------------- hats ---------------- */
  TT.HATS = [
    I('beanie', 'Beanie', c => P('M118,122 Q118,56 200,52 Q282,56 282,122 Z', c.fill) + P('M112,110 Q200,94 288,110 L290,130 Q200,114 110,130Z', c.dark) +
      S('M130,108 L130,124 M150,104 L150,120 M170,101 L170,117 M190,100 L190,116 M210,100 L210,116 M230,101 L230,117 M250,104 L250,120 M270,108 L270,124', OL, 2) + C(200, 48, 16, c.lighter)),
    I('cap', 'Ball cap', c => P('M132,108 Q134,58 200,56 Q266,58 268,108Z', c.fill) + S('M200,58 L200,104 M166,66 Q160,86 162,106 M234,66 Q240,86 238,106', OL, 2.5) + C(200, 57, 5, c.dark, 3) +
      P('M128,106 Q200,94 272,106 Q254,130 200,130 Q146,130 128,106Z', c.dark)),
    I('tophat', 'Top hat', c => P('M158,100 L162,24 Q200,18 238,24 L242,100Z', c.fill) + P('M160,78 L240,78 L241,96 L159,96Z', c.dark, 3) + E(200, 100, 68, 12, c.fill) +
      TT.flower(226, 86, 9, '#ffffff', GOLD, 2)),
    I('crown', 'Royal crown', c => P('M146,108 L140,48 L170,76 L200,34 L230,76 L260,48 L254,108Z', GOLD) + S('M146,96 L254,96', '#e8b33a', 3) +
      C(200, 86, 8, c.fill, 3) + C(170, 90, 5.5, c.light, 2.5) + C(230, 90, 5.5, c.light, 2.5) + C(140, 46, 5.5, '#fff7c2', 3) + C(200, 32, 6.5, '#fff7c2', 3) + C(260, 46, 5.5, '#fff7c2', 3), { thumbY: 1 }),
    I('tiara', 'Tiara', c => P('M184,98 L200,58 L216,98Z', '#eef1fa') + P('M160,100 L170,76 L182,98Z M218,98 L230,76 L240,100Z', '#eef1fa') +
      P('M146,106 Q200,86 254,106 L250,114 Q200,96 150,114Z', '#eef1fa') + TT.heart(200, 84, 9, c.fill, 3) + C(170, 92, 4, c.light, 2) + C(230, 92, 4, c.light, 2)),
    I('party', 'Party hat', c => `<g ${rot(12, 200, 100)}>` + P('M164,102 L202,18 L240,102 Q202,112 164,102Z', c.fill) +
      S('M166,100 l8,-6 l8,6 l8,-6 l8,6 l8,-6 l8,6 l8,-6 l8,6 l8,-6', '#ffffff', 3) + C(202, 18, 11, '#ffffff') + '</g>'),
    I('witch', 'Witch hat', c => E(200, 102, 86, 15, c.dark) + P('M150,100 Q172,60 192,24 Q206,6 238,20 Q216,28 214,44 Q232,74 250,100Z', c.fill) +
      P('M152,86 L248,86 L250,100 L150,100Z', c.lighter, 3) + R(190, 84, 20, 18, 4, GOLD, 3) + TT.star(222, 60, 6, '#fff7c2', 2)),
    I('flowers', 'Flower crown', c => {
      let s = '';
      const xs = [118, 138, 160, 182, 204, 226, 248, 268, 284];
      xs.forEach((x, i) => { s += E(x + 8, headTop(x) + 22, 10, 5, '#8fd18f', 2.5, rot(-30 + i * 8, x + 8, headTop(x) + 22)); });
      xs.forEach((x, i) => { s += TT.flower(x, headTop(x) + 16, i % 2 ? 11 : 13, i % 3 === 0 ? c.fill : (i % 3 === 1 ? c.lighter : '#ffffff'), GOLD, 2.5); });
      return s;
    }),
    I('bow', 'Big bow', c => `<g ${rot(-18, 146, 96)}>` + P('M146,96 Q110,62 102,90 Q98,120 146,96Z', c.fill) + P('M146,96 Q182,62 190,90 Q194,120 146,96Z', c.fill) +
      P('M140,100 L128,132 L142,126 L146,136 L152,102Z', c.dark, 3) + C(146, 96, 10, c.dark) + '</g>'),
    I('beret', 'Beret', c => P('M118,110 Q104,72 160,62 Q236,50 282,84 Q292,104 276,108 Q200,96 118,110Z', c.fill) + S('M200,58 L202,44', OL, 6)),
    I('chef', 'Chef hat', c => C(166, 60, 26, '#ffffff') + C(234, 60, 26, '#ffffff') + C(200, 46, 30, '#ffffff') + P('M160,106 L164,64 L236,64 L240,106Z', '#ffffff') +
      S('M184,72 L184,100 M216,72 L216,100', '#e7e2ee', 3), { fixed: 1 }),
    I('bucket', 'Bucket hat', c => P('M142,104 Q144,60 200,58 Q256,60 258,104Z', c.fill) + S('M144,94 Q200,86 256,94', c.dark, 6) + P('M118,112 Q200,88 282,112 L274,130 Q200,108 126,130Z', c.fill)),
    I('cowboy', 'Cowboy hat', c => P('M150,100 Q148,52 176,54 Q200,66 224,54 Q252,52 250,100Z', c.fill) + S('M151,90 Q200,82 249,90', c.dark, 7) +
      P('M96,94 Q110,112 140,110 Q200,118 260,110 Q290,112 304,94 Q296,128 262,126 Q200,134 138,126 Q104,128 96,94Z', c.fill) + TT.star(200, 88, 6, GOLD, 2)),
    I('headphones', 'Headphones', c => TUBE('M106,166 Q104,62 200,56 Q296,62 294,166', 10, c.fill) + SYM(E(104, 172, 18, 30, c.fill) + E(104, 172, 9, 19, c.dark, 0)) +
      TT.heart(104, 172, 5, '#ffffff', 0) + TT.heart(296, 172, 5, '#ffffff', 0)),
    I('viking', 'Viking helmet', c => SYM(P('M130,98 Q96,90 88,46 Q112,70 140,76Z', '#fff3d6')) + P('M126,114 Q126,52 200,50 Q274,52 274,114Z', '#cfd4e2') +
      P('M120,104 L280,104 L282,120 L118,120Z', c.fill) + S('M200,52 L200,104', '#aeb4c8', 6) + [140, 170, 230, 260].map(x => C(x, 112, 3, '#fff7c2', 0)).join('')),
    I('propeller', 'Propeller cap', c => P('M128,110 Q128,58 200,56 L200,110Z', c.fill) + P('M272,110 Q272,58 200,56 L200,110Z', '#ffe17a') +
      P('M164,64 Q186,57 200,56 L200,110 L164,110Z', '#9cd3ff', 0) + P('M128,110 Q128,58 200,56 Q272,58 272,110Z', 'none') + S('M200,56 L200,40', OL, 4) +
      E(176, 38, 24, 7, '#ff8fb1', 3) + E(224, 38, 24, 7, '#9ee6c0', 3) + C(200, 38, 5, GOLD, 3)),
    I('wizard', 'Wizard hat', c => P('M144,104 Q170,70 186,30 Q196,6 236,12 Q214,22 210,40 Q226,76 256,104Z', c.fill) + E(200, 104, 74, 12, c.fill) +
      TT.star(184, 76, 7, GOLD, 2.5) + TT.star(214, 56, 5, '#fff7c2', 2) + P('M222,88 a8,8 0 1,0 8,11 a6,6 0 1,1 -8,-11z', '#fff7c2', 2)),
    I('halo', 'Halo', () => `<ellipse cx="200" cy="44" rx="46" ry="11" fill="none" stroke="#fff3b0" stroke-width="20" opacity=".55"/>` +
      `<ellipse cx="200" cy="44" rx="46" ry="11" fill="none" stroke="${OL}" stroke-width="13"/><ellipse cx="200" cy="44" rx="46" ry="11" fill="none" stroke="#ffe680" stroke-width="6"/>`, { fixed: 1 }),
    I('sunhat', 'Sun hat', c => E(200, 104, 118, 26, c.fill) + P('M140,104 Q142,54 200,52 Q258,54 260,104Z', c.fill) + S('M141,94 Q200,84 259,94', c.dark, 8) +
      TT.flower(150, 92, 12, '#ffffff', GOLD, 2.5) + TT.flower(170, 98, 8, c.lighter, GOLD, 2)),
    I('grad', 'Graduation cap', c => P('M150,104 L150,80 Q200,70 250,80 L250,104 Q200,96 150,104Z', '#5a5070') + P('M200,44 L292,70 L200,96 L108,70Z', '#6a6084') +
      C(200, 70, 4, c.fill, 2) + S('M200,70 L268,82 L270,114', c.fill, 3) + P('M264,112 L276,112 L278,130 L262,130Z', c.fill, 2.5), { thumbY: 1 }),
    I('pirate', 'Pirate hat', c => P('M108,106 Q118,58 200,54 Q282,58 292,106 Q250,86 200,96 Q150,86 108,106Z', '#4f4560') + S('M112,102 Q150,84 200,92 Q250,84 288,102', GOLD, 4) +
      C(200, 74, 10, '#ffffff', 2.5) + C(196, 73, 2, INK, 0) + C(204, 73, 2, INK, 0) + S('M188,88 L212,96 M212,88 L188,96', '#ffffff', 3), { fixed: 1 }),
    I('astro', 'Space helmet', () => `<circle cx="200" cy="165" r="128" fill="#d8f0ff" fill-opacity=".22" stroke="${OL}" stroke-width="5"/>` +
      `<circle cx="200" cy="165" r="122" fill="none" stroke="#ffffff" stroke-width="5" opacity=".9"/>` + S('M110,120 Q130,72 182,56', '#ffffff', 9, 'opacity=".85"') + C(118, 146, 6, '#ffffff', 0, 'opacity=".85"'), { fixed: 1 }),
    I('strawberry', 'Strawberry hat', () => P('M118,118 Q112,48 200,44 Q288,48 282,118 Q200,104 118,118Z', '#ff6f86') +
      [[150, 84], [180, 66], [214, 70], [246, 86], [170, 100], [228, 102], [200, 90], [140, 106], [262, 106]].map(([x, y]) => E(x, y, 3, 4.5, '#fff1a8', 0)).join('') +
      P('M200,52 L178,40 L192,52 L170,58 L200,60 L230,58 L208,52 L222,40Z', '#7fcf8f', 3) + S('M200,48 L204,32', '#6bb27a', 5), { fixed: 1 }),
    I('mushroom', 'Mushroom cap', c => P('M108,124 Q104,46 200,42 Q296,46 292,124 Q200,108 108,124Z', c.fill) +
      C(158, 76, 12, '#ffffff', 3) + C(214, 62, 9, '#ffffff', 3) + C(246, 96, 11, '#ffffff', 3) + C(136, 106, 7, '#ffffff', 3) + C(196, 98, 7, '#ffffff', 3)),
    I('santa', 'Cozy Santa hat', () => P('M126,112 Q130,48 200,44 Q264,42 300,96 L282,100 Q262,76 252,110Z', '#ff6f86') + P('M116,104 Q200,88 284,104 Q290,124 276,128 Q200,114 124,128 Q110,124 116,104Z', '#ffffff') + C(298, 100, 15, '#ffffff'), { fixed: 1 }),
    I('bunnyband', 'Bunny ears band', c => SYM(E(160, 46, 17, 44, c.fill, 4, rot(-14, 160, 46)) + E(160, 50, 8, 32, c.lighter, 0, rot(-14, 160, 50))) + TUBE('M120,112 Q124,70 200,66 Q276,70 280,112', 7, c.dark)),
    I('antennae', 'Bug antennae', c => S('M176,72 Q160,40 146,30', OL, 5) + S('M224,72 Q240,40 254,30', OL, 5) + C(146, 28, 10, c.fill) + C(254, 28, 10, c.fill) + TUBE('M122,112 Q126,70 200,66 Q274,70 278,112', 7, c.dark))
  ];

  /* ---------------- hair (back part sits behind the head) ---------------- */
  const bangs = col => P('M126,124 Q124,80 200,74 Q276,80 274,124 Q260,110 246,122 Q234,102 220,116 Q208,98 196,114 Q182,100 168,116 Q154,102 140,120 Q132,112 126,124Z', col);
  const sideBangs = col => P('M118,140 Q118,78 200,74 Q264,76 282,126 Q240,96 196,104 Q150,112 118,140Z', col);
  TT.HAIR = [
    I('tuft', 'Little curl', c => ({ front: TUBE('M198,84 Q184,58 204,54 Q220,56 212,70', 7, c.base) })),
    I('bangs', 'Bangs', c => ({ front: bangs(c.base) })),
    I('bob', 'Bob', c => ({ back: P('M102,176 Q92,78 200,70 Q308,78 298,176 L300,238 Q274,252 252,234 L148,234 Q126,252 100,238Z', c.base), front: bangs(c.base) })),
    I('long', 'Long & flowy', c => ({ back: P('M104,160 Q96,76 200,70 Q304,76 296,160 L310,304 Q282,318 262,292 L138,292 Q118,318 90,304Z', c.base), front: sideBangs(c.base) })),
    I('pigtails', 'Pigtails', c => ({ back: C(90, 184, 32, c.base) + C(310, 184, 32, c.base) + C(84, 222, 24, c.base) + C(316, 222, 24, c.base), front: bangs(c.base) + SYM(TT.heart(112, 150, 9, c.lighter, 3)) })),
    I('buns', 'Space buns', c => ({ front: C(134, 86, 28, c.base) + C(266, 86, 28, c.base) + S('M124,80 Q134,70 144,82 M256,80 Q266,70 276,82', c.dark, 3) + bangs(c.base) })),
    I('topbun', 'Top bun', c => ({ front: C(200, 64, 28, c.base) + S('M188,60 Q200,48 212,62', c.dark, 3) + P('M182,86 Q200,80 218,86 L216,94 Q200,88 184,94Z', c.lighter, 3) + sideBangs(c.base) })),
    I('curly', 'Curly mop', c => {
      let s = '';
      for (let i = 0; i <= 10; i++) { const t = Math.PI + i * Math.PI / 10; s += C((200 + 92 * Math.cos(t)).toFixed(1), (150 + 74 * Math.sin(t)).toFixed(1), 21, c.base); }
      for (let i = 1; i < 10; i++) { const t = Math.PI + i * Math.PI / 10; s += C((200 + 92 * Math.cos(t)).toFixed(1), (156 + 74 * Math.sin(t)).toFixed(1), 19, c.base, 0); }
      return { front: s };
    }),
    I('mohawk', 'Mohawk', c => ({ front: P('M166,98 L172,46 L188,84 L200,30 L212,84 L228,46 L234,98 Q200,90 166,98Z', c.base) })),
    I('ponytail', 'Ponytail', c => ({ back: P('M246,90 Q322,88 328,170 Q332,232 300,266 Q306,200 284,150 Q270,120 246,110Z', c.base), front: sideBangs(c.base) + C(256, 96, 10, c.lighter) })),
    I('braids', 'Braids', c => ({ back: SYM([200, 226, 252, 278].map(y => E(108, y, 16, 15, c.base)).join('') + C(108, 298, 8, c.lighter)) + P('M104,170 Q96,80 200,72 Q304,80 296,170 Z', c.base), front: P('M122,130 Q122,80 196,76 L196,98 Q150,104 122,130Z M204,76 Q278,80 278,130 Q250,104 204,98Z', c.base) })),
    I('swoop', 'Side swoop', c => ({ front: P('M120,136 Q118,72 200,70 Q272,72 284,120 Q252,92 214,106 Q170,122 120,136Z', c.base) + S('M150,104 Q190,88 240,90', c.light, 3) })),
    I('afro', 'Big & fluffy', c => ({ back: C(200, 136, 122, c.base) + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const t = i / 12 * Math.PI * 2; return C((200 + 118 * Math.cos(t)).toFixed(1), (136 + 118 * Math.sin(t)).toFixed(1), 18, c.base, 0); }).join(''), front: P('M128,118 Q140,82 200,80 Q260,82 272,118 Q236,98 200,104 Q164,98 128,118Z', c.base) }))
  ];

  /* ---------------- specs & face fun (eyes at 162/238, y172) ---------------- */
  TT.FACE = [
    I('round', 'Round specs', c => ring(162, 172, 22, c.dark) + ring(238, 172, 22, c.dark) + TUBE('M184,170 Q200,162 216,170', 3, c.dark) + SYM(TUBE('M140,168 L106,160', 3, c.dark))),
    I('hearts', 'Heart shades', c => SYM(TT.heart(162, 174, 20, c.dark, 4, 'fill-opacity=".9"') + S('M150,166 L158,160', '#ffffff', 3.5)) + TUBE('M182,168 Q200,160 218,168', 3, c.dark)),
    I('stars', 'Star glasses', c => SYM(TT.star(162, 172, 28, c.fill, 4, 0.55, 5, 'fill-opacity=".85"') + C(162, 172, 11, '#ffffff', 0, 'fill-opacity=".35"')) + TUBE('M186,170 Q200,164 214,170', 3, c.dark)),
    I('shades', 'Cool shades', c => SYM(R(134, 156, 54, 32, 13, '#3f3550') + S('M146,166 L156,162', '#ffffff', 3.5) + TUBE('M134,166 L106,160', 3, c.fill)) + TUBE('M188,168 L212,168', 3, c.fill), { fixed: 0 }),
    I('cateye', 'Cat-eye frames', c => {
      const d = 'M138,164 Q138,154 150,152 L190,156 Q192,176 180,188 Q158,196 142,184 Q132,176 128,152 Z';
      return SYM(P(d, '#ffffff', 0, 'fill-opacity=".3"') + S(d, OL, 12) + S(d, c.dark, 5) + C(130, 152, 4.5, GOLD, 2)) + TUBE('M190,166 Q200,160 210,166', 3, c.dark);
    }),
    I('monocle', 'Monocle', c => ring(238, 172, 22, GOLD) + S('M258,184 Q276,226 252,262', GOLD, 3)),
    I('goggles', 'Swim goggles', c => TUBE('M100,172 L300,172', 9, c.dark) + SYM(`<circle cx="162" cy="172" r="23" fill="#bfe7ff" fill-opacity=".45" stroke="${OL}" stroke-width="13"/><circle cx="162" cy="172" r="23" fill="none" stroke="${c.fill}" stroke-width="7"/>` + S('M150,160 L158,156', '#ffffff', 3)) + TUBE('M186,172 L214,172', 4, c.fill)),
    I('patch', 'Pirate patch', () => S('M116,138 L282,206', OL, 4) + E(162, 172, 23, 20, '#3f3550') + TT.star(162, 172, 6, '#ffffff', 0), { fixed: 1 }),
    I('mask', 'Hero mask', c => P('M108,170 Q118,138 162,146 Q200,156 238,146 Q282,138 292,170 Q282,200 238,198 Q200,190 162,198 Q118,200 108,170Z M144,172 a18,15 0 1,0 36,0 a18,15 0 1,0 -36,0Z M220,172 a18,15 0 1,0 36,0 a18,15 0 1,0 -36,0Z', c.fill, 4, 'fill-rule="evenodd"')),
    I('3d', '3D glasses', () => R(134, 154, 56, 36, 6, '#ff6f86', 4, 'fill-opacity=".8"') + R(210, 154, 56, 36, 6, '#6fbfff', 4, 'fill-opacity=".8"') + S('M190,166 L210,166', '#ffffff', 6) + S('M134,166 L106,160 M266,166 L294,160', '#ffffff', 5), { fixed: 1 }),
    I('mustache', 'Fancy mustache', () => P('M200,206 Q186,196 174,204 Q164,214 152,204 Q156,222 178,218 Q192,216 200,210 Q208,216 222,218 Q244,222 248,204 Q236,214 226,204 Q214,196 200,206Z', '#6b4a52', 3), { fixed: 1 }),
    I('clown', 'Clown nose', () => C(200, 197, 13, '#ff5c7a') + C(195, 192, 3.5, '#ffffff', 0), { fixed: 1 }),
    I('bandaid', 'Band-aid', () => R(240, 194, 38, 14, 6, '#ffd8b8', 3, rot(-24, 259, 201)) + R(252, 195, 14, 12, 2, '#ffbf98', 0, rot(-24, 259, 201)), { fixed: 1 }),
    I('rainbow', 'Rainbow paint', () => ['#ff8fa8', '#ffc38a', '#ffe17a', '#9ee6c0', '#9cd3ff'].map((col, i) => S(`M${238 + i * 3},214 A${20 - i * 3},${20 - i * 3} 0 0,1 ${278 - i * 3},214`, col, 3.2)).join(''), { fixed: 1 }),
    I('whiskers', 'Painted whiskers', c => SYM(S('M110,196 L148,202 M112,212 L148,208 M118,226 L150,214', c.dark, 3.5)) + C(200, 194, 6, c.dark, 0))
  ];

  /* ---------------- neckwear (sits under the chin) ---------------- */
  TT.NECK = [
    I('bowtie', 'Bow tie', c => P('M200,262 L174,248 L174,278Z M200,262 L226,248 L226,278Z', c.fill) + C(200, 262, 7, c.dark)),
    I('scarf', 'Snuggly scarf', c => P('M220,260 L242,326 L218,332 L204,268Z', c.fill) + S('M222,331 l-2,8 M230,329 l0,8 M238,326 l2,8', OL, 3) + P('M136,236 Q200,262 264,236 L268,262 Q200,292 132,262Z', c.fill)),
    I('pearls', 'Pearl necklace', () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => C((156 + t * 8.8).toFixed(1), (250 + 24 * Math.sin(Math.PI * t / 10)).toFixed(1), 5.4, '#fffaf2', 2.5)).join(''), { fixed: 1 }),
    I('medal', 'Gold medal', c => P('M182,244 L196,300 L204,300 L218,244 L206,244 L200,276 L194,244Z', c.fill, 3) + C(200, 308, 15, GOLD) + TT.star(200, 308, 8, '#fff7c2', 2)),
    I('bandana', 'Bandana', c => P('M144,242 Q200,262 256,242 L200,304Z', c.fill) + P('M244,244 l20,-6 l-4,16z', c.fill, 3)),
    I('tie', 'Necktie', c => P('M192,252 L208,252 L206,268 L194,268Z', c.dark, 3) + P('M194,266 L206,266 L216,324 L200,342 L184,324Z', c.fill) + S('M190,290 L210,282 M188,310 L212,300', c.lighter, 4)),
    I('locket', 'Heart locket', c => S('M168,246 Q200,290 232,246', GOLD, 3) + TT.heart(200, 290, 12, c.fill, 3) + C(196, 286, 2.5, '#ffffff', 0)),
    I('bell', 'Bell collar', c => P('M148,248 Q200,266 252,248 L252,262 Q200,282 148,262Z', c.fill) + C(200, 284, 11, GOLD) + S('M190,284 L210,284', '#c99a2e', 2.5) + C(200, 289, 2.5, '#8a6a20', 0)),
    I('lei', 'Flower lei', c => [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const t = Math.PI * i / 8; return TT.flower((200 - 64 * Math.cos(t)).toFixed(1), (250 + 30 * Math.sin(t)).toFixed(1), 10, i % 2 ? c.fill : '#ffffff', GOLD, 2.5); }).join('')),
    I('ruffle', 'Ruffle collar', c => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const t = Math.PI * i / 9; return C((200 - 66 * Math.cos(t)).toFixed(1), (250 + 22 * Math.sin(t)).toFixed(1), 14, i % 2 ? c.fill : c.lighter, 3); }).join('')),
    I('bigbow', 'Chest bow', c => P('M200,268 Q166,240 160,262 Q156,290 200,268Z', c.fill) + P('M200,268 Q234,240 240,262 Q244,290 200,268Z', c.fill) +
      P('M196,272 L184,306 L194,302 L198,310 L202,274Z M204,272 L216,306 L206,302 L202,310Z', c.dark, 3) + C(200, 268, 8, c.dark))
  ];

  /* ---------------- back pieces: wings, capes, packs ---------------- */
  TT.BACK = [
    I('angel', 'Angel wings', () => ({ back: SYM(P('M170,276 Q122,236 80,234 Q54,238 62,260 Q46,272 62,290 Q50,308 72,318 Q70,338 98,334 Q142,326 172,300Z', '#ffffff') + S('M84,262 Q120,264 150,276 M80,292 Q118,292 150,290 M96,318 Q126,312 152,302', '#d7dcef', 3)) }), { fixed: 1 }),
    I('butterfly', 'Butterfly wings', c => ({ back: SYM(P('M182,282 Q118,196 64,212 Q38,240 70,282 Q110,302 182,296Z', c.fill) + P('M182,300 Q112,300 88,340 Q94,376 130,362 Q168,340 184,312Z', c.light) + C(96, 246, 12, '#ffffff', 3, 'fill-opacity=".8"') + C(122, 334, 8, '#ffffff', 3, 'fill-opacity=".8"') + C(126, 262, 6, c.lighter, 0)) })),
    I('fairy', 'Fairy wings', c => ({ back: SYM(E(118, 236, 64, 30, c.lighter, 4, rot(-32, 118, 236) + ' fill-opacity=".75"') + E(128, 320, 44, 20, c.light, 4, rot(28, 128, 320) + ' fill-opacity=".75"') + S('M178,280 Q140,250 80,214 M178,300 Q150,316 100,334', '#ffffff', 2.5) + TT.star(88, 210, 5, '#ffffff', 0) + TT.star(104, 342, 4, '#ffffff', 0)) })),
    I('bat', 'Bat wings', c => ({ back: SYM(P('M178,282 L122,226 Q92,226 62,244 Q78,256 76,272 Q58,274 50,292 Q72,294 84,306 Q100,300 112,314 Q144,302 178,306Z', c.dark) + S('M122,228 L112,312 M122,228 L78,274', c.darker, 3)) })),
    I('dragon', 'Dragon wings', c => ({ back: SYM(P('M180,280 Q140,210 70,196 Q84,224 74,246 Q56,252 50,274 Q72,272 84,286 Q72,304 76,320 Q120,304 180,310Z', c.fill) + S('M178,280 L74,198 M178,286 L78,246 M178,294 L84,286 M178,300 L80,318', c.darker, 3)) })),
    I('bee', 'Bee wings', () => ({ back: SYM(E(110, 236, 54, 32, '#e6f6ff', 4, rot(-26, 110, 236) + ' fill-opacity=".85"') + E(122, 300, 40, 24, '#e6f6ff', 4, rot(22, 122, 300) + ' fill-opacity=".85"') + S('M160,268 Q120,246 70,222', '#b9dcf2', 2.5)) }), { fixed: 1 }),
    I('cape', 'Hero cape', c => ({ back: P('M146,246 L254,246 Q292,330 308,424 Q200,442 92,424 Q108,330 146,246Z', c.fill) + S('M200,262 Q196,350 200,432 M170,262 Q150,350 140,428 M230,262 Q250,350 260,428', c.dark, 2.5), front: C(158, 254, 7, GOLD) + C(242, 254, 7, GOLD) })),
    I('backpack', 'Backpack', c => ({ back: TUBE('M170,250 Q200,226 230,250', 7, c.dark) + R(100, 254, 200, 116, 38, c.fill) + R(106, 300, 26, 40, 10, c.dark, 3) + R(268, 300, 26, 40, 10, c.dark, 3), front: SYM(TUBE('M166,250 L160,334', 8, c.dark)) + SYM(R(152, 300, 16, 10, 3, GOLD, 2.5)) })),
    I('jetpack', 'Jetpack', c => ({ back: SYM(P('M118,346 Q128,392 124,412 Q140,388 138,346Z', '#ffb347') + P('M122,346 Q128,376 126,392 Q134,374 134,346Z', '#ffe17a', 0) + R(106, 246, 42, 104, 18, '#d6dae8') + R(106, 270, 42, 14, 0, c.fill, 3) + P('M108,246 Q127,218 146,246Z', c.fill)), front: SYM(TUBE('M164,250 L158,330', 7, '#9aa0b8')) })),
    I('shell', 'Turtle shell', c => ({ back: E(200, 306, 118, 96, c.fill) + E(200, 306, 104, 82, c.light, 0) + S('M200,214 L200,398 M96,282 L304,282 M96,334 L304,334', c.dark, 4) })),
    I('rainbow', 'Rainbow aura', () => ({ back: ['#ff9eb0', '#ffc38a', '#ffe98a', '#a8e8b8', '#9cd3ff', '#c8a8ff'].map((col, i) => S(`M${30 + i * 13},270 A${170 - i * 13},${170 - i * 13} 0 0,1 ${370 - i * 13},270`, col, 13, 'opacity=".9"')).join('') }), { fixed: 1 }),
    I('balloonpack', 'Floaty balloons', c => ({ back: S('M150,276 Q100,200 66,140 M154,278 Q120,180 104,96 M158,280 Q150,170 148,58', '#ffffff', 2.5, 'opacity=".95"') + S('M150,276 Q100,200 66,140 M154,278 Q120,180 104,96 M158,280 Q150,170 148,58', OL, 1.2, 'opacity=".5"') +
      E(62, 112, 26, 31, c.fill) + E(102, 66, 26, 31, '#ffe17a') + E(148, 30, 24, 28, '#9cd3ff') + S('M52,98 Q56,88 64,86 M92,52 Q96,42 104,40 M138,18 Q142,10 150,8', '#ffffff', 4) }))
  ];

  /* ---------------- things to hold (right paw at 285,329) ---------------- */
  TT.HOLD = [
    I('balloon', 'Balloon', c => S('M286,332 Q300,270 330,198', OL, 2.5) + E(332, 158, 32, 38, c.fill) + P('M326,194 L338,194 L334,202 L330,202Z', c.fill, 3) + S('M316,140 Q320,128 330,126', '#ffffff', 5)),
    I('icecream', 'Ice cream', c => P('M270,318 L302,318 L286,362Z', '#ffcf8a') + S('M276,326 L294,346 M296,326 L282,346', '#e6a85c', 2.5) + C(286, 308, 16, '#fff3dc') + C(286, 288, 15, c.fill) + C(288, 270, 6, '#ff5c7a')),
    I('lollipop', 'Lollipop', c => TUBE('M286,336 L300,268', 4, '#ffffff') + C(302, 252, 26, c.fill) + S('M302,252 m-14,0 a14,14 0 1,1 14,14 a9,9 0 1,1 -9,-9 a4,4 0 1,1 4,4', '#ffffff', 4)),
    I('wand', 'Magic wand', c => TUBE('M286,336 L312,262', 5, '#fff3d6') + TT.star(316, 250, 22, c.fill, 4) + TT.star(342, 228, 6, '#fff7c2', 2) + TT.star(330, 282, 4, '#fff7c2', 2) + C(296, 230, 3, '#ffffff', 0)),
    I('bouquet', 'Bouquet', c => S('M286,334 L272,282 M286,334 L290,276 M286,334 L310,284', '#6bb27a', 4) + TT.flower(270, 276, 13, c.fill, GOLD) + TT.flower(292, 268, 14, '#ffffff', GOLD) + TT.flower(312, 280, 12, c.light, GOLD) +
      P('M266,300 L306,300 L292,344 L280,344Z', c.lighter, 3.5)),
    I('teddy', 'Teddy bear', c => C(292, 292, 7, '#d9a074') + C(320, 292, 7, '#d9a074') + C(306, 304, 16, '#d9a074') + E(306, 330, 15, 17, '#d9a074') + E(306, 309, 6, 4.5, '#f6dfc6', 0) + C(300, 302, 2.2, INK, 0) + C(312, 302, 2.2, INK, 0) +
      P('M306,318 L298,312 L298,324Z M306,318 L314,312 L314,324Z', c.fill, 2.5), { fixed: 0 }),
    I('umbrella', 'Umbrella', c => S('M286,338 L300,102', OL, 4) + S('M286,338 Q282,350 290,352', OL, 4) + P('M222,106 Q300,20 378,106 Q365,96 352,106 Q339,96 326,106 Q313,96 300,106 Q287,96 274,106 Q261,96 248,106 Q235,96 222,106Z', c.fill) +
      S('M300,30 L300,104 M300,30 Q262,60 248,104 M300,30 Q338,60 352,104', c.dark, 2.5) + C(300, 26, 5, c.dark, 3)),
    I('sword', 'Foam sword', c => P('M290,318 L318,214 Q324,204 328,214 L304,322Z', '#eef1fa') + TUBE('M278,316 L312,328', 6, c.fill) + TUBE('M286,336 L292,316', 6, c.dark)),
    I('book', 'Storybook', c => P('M262,300 Q284,290 300,302 L300,348 Q284,336 262,346Z', '#fffaf2') + P('M300,302 Q316,290 338,300 L338,346 Q316,336 300,348Z', '#fffaf2') +
      P('M258,304 L262,300 L262,346 Q284,336 300,348 Q316,336 338,346 L338,300 L342,304 L342,352 Q316,342 300,354 Q284,342 258,352Z', c.fill, 3.5) + TT.heart(318, 318, 6, c.fill, 0) + S('M270,312 L292,312 M270,322 L290,322', '#d7d0e2', 2.5)),
    I('boba', 'Boba tea', c => S('M292,282 L304,240', '#ff8fb1', 6) + P('M268,286 L306,286 L300,350 L274,350Z', '#ffffff', 4, 'fill-opacity=".7"') + P('M271,300 L303,300 L300,346 L274,346Z', c.light, 0) +
      [[278, 338], [288, 340], [296, 336], [282, 330], [294, 328]].map(([x, y]) => C(x, y, 3.6, '#5b3f58', 0)).join('') + E(287, 286, 21, 5, '#ffffff', 3)),
    I('cupcake', 'Cupcake', c => P('M270,304 L304,304 L298,334 L276,334Z', '#ffcf8a') + S('M278,306 L280,332 M287,306 L287,334 M296,306 L294,332', '#e6a85c', 2) +
      P('M266,306 Q262,286 278,284 Q280,268 292,272 Q306,270 304,286 Q314,292 308,306Z', c.fill) + C(290, 266, 6, '#ff5c7a') + C(278, 292, 2, '#ffffff', 0) + C(298, 290, 2, '#ffe17a', 0)),
    I('magnifier', 'Magnifying glass', c => TUBE('M286,336 L304,300', 7, c.dark) + ring(320, 276, 24, GOLD, 6) + S('M308,266 Q312,258 320,256', '#ffffff', 4)),
    I('mic', 'Microphone', c => P('M280,334 L292,334 L296,300 L284,300Z', c.fill) + C(292, 290, 15, '#c9cede') + S('M282,284 L302,284 M280,292 L304,292', '#9aa0b8', 2)),
    I('brush', 'Paintbrush', c => TUBE('M282,340 L300,276', 6, c.fill) + P('M296,276 L306,278 L312,252 Q306,240 300,252Z', '#e6c08a', 3) + P('M300,252 Q306,236 312,252 L310,260 L302,258Z', '#ff6f86', 0)),
    I('bubbles', 'Bubble wand', c => TUBE('M286,336 L304,292', 4, c.fill) + ring(310, 278, 14, c.fill, 4) +
      [[338, 236, 14], [312, 214, 9], [352, 196, 18], [330, 166, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e6f6ff" fill-opacity=".45" stroke="#9cd3ff" stroke-width="2.5"/>` + C(x - r * 0.35, y - r * 0.35, r * 0.2, '#ffffff', 0)).join('')),
    I('kite', 'Kite', c => S('M286,330 Q330,240 340,108', OL, 2) + P('M340,28 L372,70 L340,112 L308,70Z', c.fill) + S('M340,28 L340,112 M308,70 L372,70', c.dark, 2.5) +
      S('M340,112 Q330,130 344,146 Q356,160 344,176', OL, 2) + P('M336,128 l8,4 l-8,4z M346,154 l8,4 l-8,4z', '#ffe17a', 2)),
    I('donut', 'Donut', c => C(298, 310, 22, '#e8b07a') + P('M298,290 Q320,290 318,310 Q316,326 298,328 Q280,326 278,310 Q278,290 298,290Z M298,302 a8,8 0 1,0 0.1,0Z', c.fill, 3, 'fill-rule="evenodd"') +
      S('M286,298 l4,2 M306,296 l3,4 M310,316 l4,-1 M284,318 l3,3', '#ffffff', 2.5)),
    I('carrot', 'Carrot', () => P('M288,336 L300,282 Q310,280 312,290Z', '#ffa05c') + S('M296,304 l6,2 M293,318 l6,1', '#e07a3c', 2.5) + P('M304,284 Q296,262 306,258 Q308,272 312,280 Q318,262 328,266 Q318,276 312,286Z', '#7fcf8f', 3), { fixed: 1 }),
    I('fish', 'Fishy snack', c => P('M262,312 Q286,290 314,310 Q286,330 262,312Z', c.fill) + P('M312,310 L334,296 L330,312 L334,326Z', c.fill) + C(274, 308, 3, INK, 0) + S('M288,302 Q294,310 288,318', c.dark, 2.5)),
    I('teacup', 'Tea party cup', c => E(292, 340, 28, 6, '#ffffff') + P('M270,306 L314,306 Q312,334 292,336 Q272,334 270,306Z', c.fill) + S('M312,312 Q326,314 322,326 Q318,330 308,328', OL, 4) + E(292, 306, 22, 5, '#e6b48a', 3) +
      S('M284,296 Q278,286 286,278 Q292,270 286,262 M298,296 Q292,286 300,278', '#ffffff', 3, 'opacity=".9"'))
  ];
})(window.TT);
