/* Tiny Tailors — pet pals, scenes and magic effects. */
(function (TT) {
  const { P, C, E, S, R, TUBE, SYM, rot, OL, INK, shade, tint } = TT;
  const I = (id, name, draw, o = {}) => Object.assign({ id, name, draw }, o);
  const face = (x, y, s = 1, blush = true) => C(x - 6 * s, y, 2.6 * s, INK, 0) + C(x + 6 * s, y, 2.6 * s, INK, 0) +
    S(`M${x - 3 * s},${y + 5 * s} Q${x},${y + 8 * s} ${x + 3 * s},${y + 5 * s}`, OL, 2) +
    (blush ? E(x - 11 * s, y + 4 * s, 4 * s, 2.5 * s, '#ff9ec0', 0) + E(x + 11 * s, y + 4 * s, 4 * s, 2.5 * s, '#ff9ec0', 0) : '');

  /* ---------------- pet pals (stand near 70,410) ---------------- */
  TT.PETS = [
    I('chick', 'Chickie', c => S('M62,424 l0,8 M78,424 l0,8', '#ffa23f', 3) + C(70, 404, 22, '#ffe27a') + P('M62,382 Q66,372 72,382', 'none', 3) +
      P('M84,404 Q96,398 92,412 Q88,418 82,414Z', '#ffd24d', 3) + face(66, 400, 0.9) + P('M62,404 L70,402 L66,408Z', '#ffa23f', 2) + TT.heart(80, 386, 6, c.fill, 2.5)),
    I('snail', 'Shelly', c => P('M36,428 Q40,410 56,410 L104,412 Q112,428 96,430 L40,432Z', '#ffd8b8') + S('M50,412 L44,390 M58,412 L58,390', OL, 3) + C(44, 388, 4, INK, 0) + C(58, 388, 4, INK, 0) +
      C(84, 404, 22, c.fill) + S('M84,404 m-12,0 a12,12 0 1,1 12,12 a8,8 0 1,1 -8,-8 a3,3 0 1,1 3,3', c.darker, 3) + E(48, 420, 3, 2, '#ff9ec0', 0)),
    I('bunny', 'Mini bun', c => E(60, 372, 7, 18, '#ffffff', 3.5, rot(-8, 60, 372)) + E(80, 372, 7, 18, '#ffffff', 3.5, rot(8, 80, 372)) + E(70, 418, 22, 16, '#ffffff') + C(70, 396, 18, '#ffffff') + face(70, 396, 0.85) + P('M70,410 L62,404 L62,416Z M70,410 L78,404 L78,416Z', c.fill, 2.5)),
    I('kitten', 'Kitty pal', c => P('M54,388 L52,364 L70,380 L88,364 L86,388Z', c.light) + E(70, 418, 22, 15, c.light) + C(70, 394, 19, c.light) + face(70, 394, 0.85) + S('M92,420 Q110,414 104,396', OL, 9) + S('M92,420 Q110,414 104,396', c.light, 4) + S('M56,406 Q70,412 84,406', c.dark, 4)),
    I('puppy', 'Pup pal', c => E(70, 418, 24, 15, '#f3cf9e') + C(70, 394, 20, '#f3cf9e') + P('M50,384 Q40,390 44,410 Q52,414 56,400Z M90,384 Q100,390 96,410 Q88,414 84,400Z', '#bf8a66', 3) + face(70, 394, 0.85, false) + E(70, 402, 4, 3, INK, 0) + S('M54,408 Q70,416 86,408', c.fill, 5)),
    I('ladybug', 'Dotty', c => C(52, 412, 11, '#5b4a66') + E(74, 414, 26, 20, c.fill) + S('M74,394 L74,434', OL, 3) + C(64, 408, 4, '#4b3a50', 0) + C(84, 406, 4, '#4b3a50', 0) + C(66, 424, 3.5, '#4b3a50', 0) + C(86, 422, 3.5, '#4b3a50', 0) + C(48, 410, 2, '#ffffff', 0) + C(55, 410, 2, '#ffffff', 0)),
    I('butterfly', 'Flutter', c => `<g class="flutter">` + E(54, 292, 16, 20, c.fill, 3.5, rot(-20, 54, 292)) + E(86, 292, 16, 20, c.fill, 3.5, rot(20, 86, 292)) + E(58, 316, 10, 12, c.light, 3, rot(-20, 58, 316)) + E(82, 316, 10, 12, c.light, 3, rot(20, 82, 316)) +
      E(70, 304, 5, 18, '#5b4a66', 0) + S('M68,288 Q62,276 58,272 M72,288 Q78,276 82,272', OL, 2) + '</g>', { float: 1 }),
    I('fishbowl', 'Bubbles the fish', c => `<circle cx="72" cy="404" r="30" fill="#d8f0ff" fill-opacity=".6" stroke="${OL}" stroke-width="4"/>` + P('M46,396 Q72,402 98,396 Q100,430 72,434 Q44,430 46,396Z', '#9cd3ff', 0, 'opacity=".7"') +
      P('M62,412 Q74,402 86,412 Q74,422 62,412Z', c.fill, 2.5) + P('M60,412 L52,406 L52,418Z', c.fill, 2.5) + C(80, 410, 1.8, INK, 0) + E(72, 374, 22, 5, '#ffffff', 3) + C(64, 388, 3, '#ffffff', 0)),
    I('dragon', 'Tiny dragon', c => P('M50,396 L30,380 L36,400Z M90,396 L110,380 L104,400Z', c.dark, 3) + E(70, 418, 22, 15, c.fill) + C(70, 394, 19, c.fill) + P('M60,378 L56,364 L66,374Z M80,378 L84,364 L74,374Z', '#fff4c2', 2.5) + face(70, 396, 0.85) + E(70, 420, 10, 8, '#fff4c2', 0)),
    I('ghost', 'Boo buddy', c => P('M42,330 Q42,292 72,292 Q102,292 102,330 L102,356 Q95,348 88,356 Q80,348 72,356 Q64,348 56,356 Q49,348 42,356Z', '#ffffff') + face(72, 322, 1) + TT.heart(94, 300, 6, c.fill, 2), { float: 1 }),
    I('cloud', 'Cloudy', c => C(52, 316, 18, '#ffffff') + C(76, 306, 22, '#ffffff') + C(96, 320, 16, '#ffffff') + P('M40,330 L108,330 Q110,338 100,338 L46,338 Q38,338 40,330Z', '#ffffff', 0) + E(74, 330, 34, 8, '#ffffff', 0) + face(74, 320, 0.9) + S('M60,348 l-4,10 M76,348 l-4,10 M92,348 l-4,10', c.fill, 3), { float: 1 }),
    I('hedgehog', 'Prickles', c => P('M40,424 Q40,388 70,384 Q100,388 102,424Z', '#b98a6d') + S('M48,400 l-8,-8 M58,390 l-4,-12 M72,386 l0,-12 M86,390 l4,-12 M96,402 l8,-8', OL, 3) + E(58, 414, 14, 12, '#ffe1c8', 0) + C(52, 410, 2.4, INK, 0) + C(46, 416, 2.5, INK, 0) + TT.flower(88, 388, 7, c.fill, '#ffd34d', 2)),
    I('shroom', 'Mushie', c => P('M58,408 L82,408 L84,432 L56,432Z', '#fff3e4') + P('M38,410 Q38,370 70,370 Q102,370 102,410Z', c.fill) + C(56, 386, 6, '#ffffff', 2.5) + C(80, 380, 5, '#ffffff', 2.5) + C(92, 398, 4, '#ffffff', 2.5) + face(70, 418, 0.75)),
    I('bee', 'Buzzy', c => `<g class="flutter">` + E(62, 296, 9, 13, '#e6f6ff', 3, rot(-30, 62, 296) + ' fill-opacity=".9"') + E(80, 294, 9, 13, '#e6f6ff', 3, rot(30, 80, 294) + ' fill-opacity=".9"') + '</g>' +
      E(72, 314, 18, 14, '#ffe27a') + S('M66,302 L66,326 M78,302 L78,326', '#4f4560', 5) + face(62, 312, 0.7, false) + P('M90,314 L98,314 L90,318Z', '#4f4560', 2), { float: 1 }),
    I('turtle', 'Slowpoke', c => E(42, 418, 10, 9, '#a8e6a1') + E(82, 428, 8, 5, '#a8e6a1') + E(52, 428, 8, 5, '#a8e6a1') + P('M48,424 Q50,388 76,388 Q102,388 104,424Z', c.fill) + S('M62,398 L66,412 L86,412 L90,398 M66,412 L60,424 M86,412 L92,424', c.dark, 3) + C(36, 414, 2.4, INK, 0))
  ];

  /* ---------------- scenes ---------------- */
  const ground = (y, col, sw = 0) => P(`M0,${y} Q100,${y - 10} 200,${y} Q300,${y + 10} 400,${y} L400,470 L0,470Z`, col, sw);
  const cloud = (x, y, s = 1, col = '#ffffff', op = 1) => `<g opacity="${op}">` + C(x, y, 18 * s, col, 0) + C(x + 20 * s, y - 8 * s, 22 * s, col, 0) + C(x + 42 * s, y, 18 * s, col, 0) + E(x + 20 * s, y + 8 * s, 38 * s, 12 * s, col, 0) + '</g>';
  const tree = (x, y, s, leaf, trunk = '#c69c7a') => R(x - 6 * s, y, 12 * s, 40 * s, 4, trunk, 0) + C(x, y - 6 * s, 30 * s, leaf, 0) + C(x - 20 * s, y + 6 * s, 20 * s, leaf, 0) + C(x + 20 * s, y + 6 * s, 20 * s, leaf, 0);
  const dots = (seed, n, col, r0, r1, y0 = 0, y1 = 460, op = 1) => { const r = TT.rng(seed); let s = ''; for (let i = 0; i < n; i++) s += C((r() * 400).toFixed(1), (y0 + r() * (y1 - y0)).toFixed(1), (r0 + r() * (r1 - r0)).toFixed(1), col, 0, `opacity="${op}"`); return s; };
  const bg = col => `<rect x="-10" y="-10" width="420" height="490" fill="${col}"/>`;

  TT.SCENES = [
    I('tailor', "Tailor's shop", () => {
      let s = bg('#ffeef3') + `<rect x="-10" y="-10" width="420" height="490" fill="#ffe2ea" opacity=".0"/>`;
      for (let x = 10; x < 400; x += 40) s += S(`M${x},0 L${x},350`, '#ffd9e4', 14);
      s += R(-10, 22, 420, 26, 0, '#ffe08a', 0) + Array.from({ length: 41 }, (_, i) => S(`M${i * 10},22 L${i * 10},${i % 5 ? 30 : 36}`, '#c99a4e', 1.6)).join('');
      // shelf with spools & buttons
      s += R(250, 120, 140, 10, 4, '#d9a074', 3);
      [[270, '#ff9ec0'], [298, '#9ee6c0'], [326, '#9cd3ff'], [354, '#cfa8ff']].forEach(([x, col]) => { s += R(x - 11, 84, 22, 36, 3, '#f0d2b0', 2.5) + R(x - 9, 90, 18, 24, 2, col, 0) + S(`M${x - 9},96 L${x + 9},96 M${x - 9},104 L${x + 9},104`, shade(col, 0.2), 1.5); });
      // dress form
      s += P('M40,120 Q60,110 80,120 Q88,150 78,180 Q90,210 84,240 L36,240 Q30,210 42,180 Q32,150 40,120Z', '#ffd0dc', 3) + S('M60,240 L60,300 M44,300 L76,300', '#c69c7a', 5) + S('M40,160 Q60,168 80,160', '#ff8fb1', 2.5, 'stroke-dasharray="4 4"');
      // big buttons on wall
      [[330, 200, 16, '#ffb38a'], [366, 236, 11, '#aab0ff'], [300, 246, 9, '#9ee6c0']].forEach(([x, y, r, col]) => { s += C(x, y, r, col, 3) + C(x - r * .3, y - r * .3, r * .12, OL, 0) + C(x + r * .3, y - r * .3, r * .12, OL, 0) + C(x - r * .3, y + r * .3, r * .12, OL, 0) + C(x + r * .3, y + r * .3, r * .12, OL, 0); });
      s += R(-10, 350, 420, 130, 0, '#f3d3b8', 0) + Array.from({ length: 9 }, (_, i) => S(`M${-10 + i * 52},350 L${-40 + i * 52},470`, '#e8c2a2', 3)).join('') + S('M-10,350 L410,350', '#e3b896', 5);
      s += E(340, 410, 34, 12, '#ff9ec0', 3) + C(340, 398, 20, '#ff9ec0', 3) + S('M332,384 L326,370 M344,382 L350,368 M338,380 L338,364', '#9aa0b8', 2.5) + C(326, 368, 3, '#ffe17a', 0) + C(350, 366, 3, '#9ee6c0', 0) + C(338, 362, 3, '#cfa8ff', 0);
      return s;
    }),
    I('studio', 'Pink studio', () => bg('#ffe3ec') + dots(3, 40, '#ffffff', 5, 9, 0, 350, 0.7) + E(200, 160, 190, 170, '#fff2f6', 0, 'opacity=".7"') + ground(372, '#ffcfdd') + E(200, 430, 160, 26, '#ffbfd2', 0, 'opacity=".6"')),
    I('meadow', 'Sunny meadow', () => bg('#c6e9ff') + C(330, 70, 34, '#ffe17a', 0) + C(330, 70, 46, '#ffe17a', 0, 'opacity=".35"') + cloud(40, 70, 1) + cloud(200, 40, 0.8) +
      P('M-10,330 Q90,260 200,320 Q300,270 410,320 L410,480 L-10,480Z', '#b6e8a8', 0) + ground(370, '#9ad98f') + (() => { const r = TT.rng(9); let s = ''; for (let i = 0; i < 16; i++) { const x = r() * 400, y = 380 + r() * 70; s += TT.flower(x.toFixed(1), y.toFixed(1), 6, ['#ffffff', '#ff9ec0', '#ffe17a', '#cfa8ff'][i % 4], '#ffb347', 0); } return s; })()),
    I('beach', 'Beach day', () => bg('#bfe9ff') + C(70, 80, 34, '#ffe17a', 0) + cloud(230, 60, 0.9) + R(-10, 250, 420, 110, 0, '#7fd3e8', 0) +
      S('M-10,280 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0', '#ffffff', 4, 'opacity=".8"') +
      S('M-10,320 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0 q20,8 40,0 q20,-8 40,0', '#ffffff', 4, 'opacity=".6"') +
      ground(350, '#ffe5ae') + dots(21, 30, '#f5cf86', 1.5, 3, 360, 460) + P('M340,420 Q350,400 362,420Z', '#ffb3c4', 2.5) + S('M346,418 L350,406 M356,418 L352,406', OL, 1.5) + TT.star(36, 430, 10, '#ffa07a', 2.5)),
    I('forest', 'Mossy forest', () => bg('#dff3d6') + tree(40, 230, 1.6, '#8fd18f') + tree(360, 220, 1.8, '#7fc683') + tree(120, 250, 1.1, '#a6dc9a') + tree(290, 252, 1.2, '#9ad98f') +
      ground(360, '#b5e0a0') + P('M320,420 L328,404 L336,420Z', '#fff3e4', 2.5) + P('M310,408 Q328,384 346,408Z', '#ff6f86', 3) + C(322, 398, 3, '#ffffff', 0) + C(334, 396, 2.5, '#ffffff', 0) + dots(31, 12, '#ffffff', 2, 3, 380, 455, 0.8)),
    I('space', 'Outer space', () => bg('#2f2b5e') + dots(41, 60, '#ffffff', 0.8, 2.4, 0, 360, 0.9) + C(330, 90, 30, '#ffb3d1', 3) + `<ellipse cx="330" cy="90" rx="52" ry="12" fill="none" stroke="#ffe17a" stroke-width="5" ${rot(-16, 330, 90)}/>` +
      C(60, 150, 18, '#9ee6c0', 3) + C(54, 144, 4, '#7fcfa8', 0) + TT.star(110, 60, 8, '#ffe17a', 0) + P('M-10,380 Q200,340 410,380 L410,480 L-10,480Z', '#6d5fa8', 0) + E(90, 420, 22, 7, '#5c4f94', 0) + E(310, 400, 16, 5, '#5c4f94', 0) + E(240, 446, 26, 8, '#5c4f94', 0)),
    I('candy', 'Candy land', () => bg('#ffe6f2') + dots(51, 24, '#ffffff', 4, 8, 0, 300, 0.8) +
      S('M50,370 L50,230', '#ffffff', 8) + C(50, 210, 30, '#9cd3ff', 3) + S('M50,210 m-16,0 a16,16 0 1,1 16,16 a10,10 0 1,1 -10,-10', '#ffffff', 5) +
      S('M350,370 L350,250 Q350,226 330,226 Q312,228 314,246', '#ffffff', 14) + S('M350,370 L350,250 Q350,226 330,226 Q312,228 314,246', '#ff6f86', 14, 'stroke-dasharray="10 10"') +
      P('M100,370 Q130,300 160,370Z', '#cfa8ff', 3) + P('M250,370 Q280,310 310,370Z', '#9ee6c0', 3) + ground(370, '#ffc9de') + dots(53, 40, '#ffffff', 1.5, 3, 380, 460) + dots(54, 30, '#ffe17a', 1.5, 3, 380, 460)),
    I('sea', 'Under the sea', () => bg('#8fd8f0') + `<rect x="-10" y="200" width="420" height="280" fill="#7ccbe6"/>` + dots(61, 20, '#e6f6ff', 3, 9, 20, 340, 0.6) +
      S('M40,400 Q30,360 44,330 Q56,300 40,270', '#6bc28a', 12) + S('M70,400 Q80,350 66,320', '#7fd19a', 10) + S('M360,400 Q372,350 354,310 Q344,290 356,264', '#6bc28a', 12) +
      P('M300,400 L304,360 L290,340 L306,348 L310,320 L318,350 L332,336 L322,366 L326,400Z', '#ff9ec0', 3) + ground(386, '#ffe9b8') + TT.star(120, 430, 10, '#ffb38a', 2.5) + P('M260,436 Q270,420 282,436Z', '#ffffff', 2.5)),
    I('snow', 'Snow day', () => bg('#dbeeff') + dots(71, 50, '#ffffff', 2, 5, 0, 460, 0.9) + P('M-10,330 Q100,280 220,330 Q320,290 410,320 L410,480 L-10,480Z', '#f4f9ff', 0) +
      [[40, 300], [360, 290]].map(([x, y]) => P(`M${x},${y - 80} L${x - 30},${y} L${x + 30},${y}Z`, '#8fc9a8', 0) + P(`M${x},${y - 80} L${x - 14},${y - 44} L${x + 14},${y - 44}Z`, '#ffffff', 0) + R(x - 5, y, 10, 14, 2, '#c69c7a', 0)).join('') +
      ground(372, '#ffffff', 0) + C(330, 410, 20, '#ffffff', 3) + C(330, 380, 14, '#ffffff', 3) + C(326, 377, 1.8, INK, 0) + C(334, 377, 1.8, INK, 0) + P('M330,382 l10,2 l-10,2z', '#ffa05c', 1.5) + S('M318,394 Q330,400 342,394', '#ff6f86', 5)),
    I('city', 'City lights', () => {
      let s = bg('#3d3a6b') + dots(81, 30, '#ffffff', 0.8, 2, 0, 200, 0.8) + C(320, 70, 26, '#fff3c2', 0) + C(308, 64, 22, '#3d3a6b', 0);
      const b = [[-10, 200, 70], [56, 160, 60], [112, 230, 56], [256, 180, 64], [316, 140, 50], [362, 210, 50]];
      b.forEach(([x, y, w], i) => { s += R(x, y, w, 400 - y, 6, i % 2 ? '#5a5690' : '#4c4880', 0); for (let yy = y + 14; yy < 360; yy += 26) for (let xx = x + 10; xx < x + w - 10; xx += 18) s += R(xx, yy, 10, 12, 2, (xx * yy) % 3 ? '#ffe68a' : '#6f6aa8', 0); });
      return s + ground(372, '#5a5680') + S('M0,420 L400,420', '#ffe68a', 3, 'stroke-dasharray="18 14" opacity=".6"');
    }),
    I('rainbow', 'Rainbow sky', () => bg('#fff0f6') + ['#ffb3c4', '#ffd2a8', '#fff0a8', '#c6f0cf', '#c2e4ff', '#dccaff'].map((col, i) => S(`M${20 + i * 16},360 A${180 - i * 16},${180 - i * 16} 0 0,1 ${380 - i * 16},360`, col, 16)).join('') +
      cloud(-10, 340, 1.4) + cloud(300, 340, 1.4) + ground(380, '#ffffff') + dots(91, 12, '#ffd6e5', 3, 6, 390, 460)),
    I('party', 'Birthday bash', () => {
      let s = bg('#fff2da') + S('M-10,40 Q100,90 200,50 Q300,90 410,40', OL, 2);
      const cols = ['#ff9ec0', '#9ee6c0', '#ffe17a', '#9cd3ff', '#cfa8ff'];
      for (let i = 0; i < 11; i++) { const x = -4 + i * 40, y = 40 + Math.sin(i / 10 * Math.PI * 2) * 0 + (i < 6 ? (i * 8) : (88 - i * 8)) * 0.7; s += P(`M${x},${y} L${x + 30},${y + 2} L${x + 14},${y + 30}Z`, cols[i % 5], 2.5); }
      s += [[50, 180, '#ff9ec0'], [86, 150, '#9cd3ff'], [340, 170, '#ffe17a'], [362, 140, '#cfa8ff']].map(([x, y, col]) => S(`M${x},${y + 30} Q${x - 6},${y + 80} ${x + 4},${y + 120}`, OL, 1.5) + E(x, y, 22, 27, col, 3)).join('');
      for (let x = -10; x < 410; x += 40) for (let y = 370; y < 480; y += 40) s += R(x + ((y / 40) % 2 ? 20 : 0), y, 20, 40, 0, '#ffe0e9', 0);
      return s + S('M-10,370 L410,370', '#f3c4d2', 4) + dots(93, 30, '#ff9ec0', 2, 3.5, 100, 360, 0.7);
    }),
    I('castle', 'Castle garden', () => bg('#e9e0ff') + cloud(20, 70, 0.9) +
      R(120, 150, 160, 200, 4, '#ffd6e5', 3) + R(90, 110, 50, 240, 4, '#ffc4d9', 3) + R(260, 110, 50, 240, 4, '#ffc4d9', 3) + P('M84,112 L115,54 L146,112Z M254,112 L285,54 L316,112Z', '#cfa8ff', 3) +
      S('M115,54 L115,30 M285,54 L285,30', OL, 2.5) + P('M115,30 L134,36 L115,42Z M285,30 L304,36 L285,42Z', '#ff6f86', 2) + P('M180,350 L180,290 Q200,264 220,290 L220,350Z', '#b98a6d', 3) + [150, 230].map(x => R(x, 190, 20, 26, 10, '#fff3c2', 3)).join('') +
      ground(366, '#b8e6a8') + TT.flower(40, 400, 7, '#ff9ec0', '#ffd34d', 0) + TT.flower(370, 420, 7, '#ffffff', '#ffd34d', 0) + TT.flower(330, 440, 6, '#cfa8ff', '#ffd34d', 0)),
    I('bedroom', 'Cozy bedroom', () => bg('#e8e0ff') + dots(101, 18, '#ffffff', 2, 3.5, 0, 340, 0.8) + R(260, 60, 110, 110, 10, '#bcd7ff', 4) + C(320, 104, 18, '#fff3c2', 0) + S('M315,60 L315,170 M260,115 L370,115', OL, 4) +
      R(20, 120, 120, 10, 4, '#d9a074', 3) + R(30, 86, 18, 34, 3, '#ff9ec0', 2.5) + R(52, 92, 16, 28, 3, '#9ee6c0', 2.5) + C(100, 104, 14, '#ffe17a', 2.5) + C(96, 102, 2, INK, 0) + C(104, 102, 2, INK, 0) +
      R(-10, 360, 420, 120, 0, '#e8c6a8', 0) + Array.from({ length: 9 }, (_, i) => S(`M${-10 + i * 52},360 L${-10 + i * 52},480`, '#dcb592', 3)).join('') + E(200, 420, 150, 34, '#ffc9da', 3) + E(200, 420, 120, 24, '#ffe0ea', 0)),
    I('autumn', 'Autumn park', () => bg('#ffe9cf') + tree(50, 230, 1.6, '#ffb36b') + tree(350, 220, 1.7, '#ff8f6b') + tree(140, 250, 1, '#ffd27a') + ground(364, '#e8b886') +
      dots(111, 20, '#ff9f5a', 3, 5, 370, 460) + dots(112, 14, '#ffcf5a', 3, 5, 370, 460) + P('M300,420 Q320,396 340,420Z', '#ff8f6b', 3) + S('M320,420 L320,430', OL, 3)),
    I('sakura', 'Cherry blossoms', () => bg('#fff0f5') + R(30, 200, 16, 170, 6, '#b98a6d', 0) + C(38, 190, 54, '#ffc4d9', 0) + C(80, 210, 36, '#ffd6e5', 0) + C(10, 220, 30, '#ffb3cc', 0) +
      R(350, 180, 16, 190, 6, '#b98a6d', 0) + C(358, 170, 56, '#ffc4d9', 0) + C(320, 200, 34, '#ffd6e5', 0) + dots(121, 30, '#ffb3cc', 2, 4, 0, 460, 0.9) + ground(370, '#cfe8b8') + E(200, 430, 90, 14, '#ffd6e5', 0, 'opacity=".7"')),
    I('stage', 'Spotlight stage', () => bg('#5a3d6e') + `<path d="M150,-10 L250,-10 L330,420 L70,420Z" fill="#fff3c2" opacity=".22"/>` +
      P('M-10,-10 L90,-10 Q70,200 100,380 L-10,380Z', '#e2668e', 0) + P('M410,-10 L310,-10 Q330,200 300,380 L410,380Z', '#e2668e', 0) + S('M20,0 Q10,200 30,370 M50,0 Q40,200 60,370 M380,0 Q390,200 370,370 M350,0 Q360,200 340,370', '#c8507a', 4) +
      R(-10, -10, 420, 34, 0, '#c8507a', 0) + S('M-10,24 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0 q20,16 40,0', '#ffd84d', 4) +
      R(-10, 372, 420, 110, 0, '#d9a074', 0) + S('M-10,372 L410,372', '#b98a6d', 6) + E(200, 420, 120, 18, '#fff3c2', 0, 'opacity=".35"')),
    I('spooky', 'Not-so-spooky', () => bg('#4b3f78') + C(310, 90, 46, '#fff3c2', 0) + dots(131, 20, '#ffffff', 0.8, 2, 0, 250, 0.7) +
      P('M40,150 Q40,120 62,120 Q84,120 84,150 L84,170 L77,164 L70,170 L62,164 L55,170 L48,164 L40,170Z', '#ffffff', 3) + C(55, 146, 2.5, INK, 0) + C(69, 146, 2.5, INK, 0) +
      ground(370, '#3d3466') + [[60, 400], [330, 410]].map(([x, y]) => E(x, y, 26, 20, '#ffa05c', 3) + S(`M${x},${y - 20} L${x + 4},${y - 30}`, '#6bb27a', 4) + P(`M${x - 12},${y - 4} l6,-6 l6,6z M${x + 2},${y - 4} l6,-6 l6,6z`, '#5b3f58', 0) + S(`M${x - 10},${y + 8} Q${x},${y + 14} ${x + 10},${y + 8}`, '#5b3f58', 3)).join('')),
    I('clouds', 'Cloud kingdom', () => bg('#cfe9ff') + TT.star(60, 60, 10, '#fff3a8', 0) + TT.star(340, 100, 8, '#fff3a8', 0) + TT.star(280, 40, 6, '#ffffff', 0) +
      cloud(30, 180, 1.1, '#ffffff', 0.9) + cloud(270, 220, 1.2, '#ffffff', 0.9) + P('M150,120 L150,60 Q200,30 250,60 L250,120', 'none', 0) +
      `<path d="M-10,380 Q30,340 70,370 Q110,330 150,366 Q200,330 250,366 Q290,330 330,370 Q370,340 410,376 L410,480 L-10,480Z" fill="#ffffff"/>` + dots(141, 10, '#ffe3ef', 6, 12, 390, 460, 0.8))
  ];

  /* ---------------- magic effects ---------------- */
  // static=true gives a still layout (thumbnails, photos)
  function particles(seed, n, cls, make, animated, dur = [5, 9]) {
    const r = TT.rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = r() * 400, y = r() * 460, d = dur[0] + r() * (dur[1] - dur[0]), delay = -r() * d, k = r();
      const shape = make(x, y, k, i);
      s += animated ? `<g class="${cls}" style="animation-duration:${d.toFixed(2)}s;animation-delay:${delay.toFixed(2)}s">${shape}</g>` : shape;
    }
    return s;
  }
  const CONF = ['#ff9ec0', '#ffe17a', '#9ee6c0', '#9cd3ff', '#cfa8ff', '#ffb38a'];
  TT.FX = [
    I('sparkles', 'Sparkles', (c, an) => particles(1, 18, 'fx-twinkle', (x, y, k) => TT.star(x, y, 5 + k * 7, k > 0.5 ? '#ffffff' : '#fff3a8', 0, 0.3, 4), an, [1.4, 2.6])),
    I('hearts', 'Floating hearts', (c, an) => particles(2, 16, 'fx-rise', (x, y, k) => TT.heart(x, y, 6 + k * 8, CONF[(k * 3) | 0], 2.5), an, [6, 11])),
    I('bubbles', 'Bubbles', (c, an) => particles(3, 18, 'fx-rise', (x, y, k) => `<circle cx="${x}" cy="${y}" r="${5 + k * 12}" fill="#e6f6ff" fill-opacity=".35" stroke="#ffffff" stroke-width="2.5"/>` + C(x - 3, y - 3, 2 + k * 2, '#ffffff', 0), an, [6, 12])),
    I('confetti', 'Confetti', (c, an) => particles(4, 34, 'fx-fall', (x, y, k, i) => R(x, y, 6, 12, 2, CONF[i % 6], 0, rot(k * 180, x + 3, y + 6)), an, [4, 8])),
    I('stars', 'Shooting stars', (c, an) => particles(5, 14, 'fx-twinkle', (x, y, k) => TT.star(x, y, 6 + k * 6, '#ffe17a', 2.5), an, [1.6, 3])),
    I('snow', 'Snowflakes', (c, an) => particles(6, 36, 'fx-fall', (x, y, k) => C(x, y, 2 + k * 4, '#ffffff', 0, 'opacity=".9"'), an, [7, 13])),
    I('petals', 'Petal shower', (c, an) => particles(7, 26, 'fx-fall', (x, y, k) => E(x, y, 6, 3.6, k > 0.5 ? '#ffc4d9' : '#ffb3cc', 0, rot(k * 180, x, y)), an, [7, 12])),
    I('notes', 'Music notes', (c, an) => particles(8, 12, 'fx-rise', (x, y, k, i) => S(`M${x},${y} L${x},${y - 18} L${x + 10},${y - 22}`, CONF[i % 6], 3.5) + E(x - 4, y, 6, 4.5, CONF[i % 6], 0, rot(-20, x - 4, y)), an, [7, 12])),
    I('fireflies', 'Fireflies', (c, an) => particles(9, 22, 'fx-twinkle', (x, y, k) => C(x, y, 7, '#fff7a8', 0, 'opacity=".35"') + C(x, y, 3, '#fff3a0', 0), an, [1.5, 3.5])),
    I('leaves', 'Falling leaves', (c, an) => particles(10, 20, 'fx-fall', (x, y, k, i) => P(`M${x},${y} q8,-10 16,0 q-8,10 -16,0z`, ['#ff9f5a', '#ffcf5a', '#ff8f6b'][i % 3], 2, rot(k * 360, x + 8, y)), an, [7, 12])),
    I('glitter', 'Rainbow glitter', (c, an) => particles(11, 40, 'fx-twinkle', (x, y, k, i) => TT.star(x, y, 3 + k * 4, CONF[i % 6], 0, 0.35, 4), an, [1, 2.2]))
  ];
})(window.TT);
