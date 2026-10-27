/* Tiny Tailors — tops, bottoms and shoes.
   draw(c, ctx) -> svg string, or {main, over} for things that sit on top of the shirt.
   c = colour pack (fill may be a fabric pattern), ctx = {F: fur colour, a: critter} */
(function (TT) {
  const { P, C, E, S, R, TUBE, SYM, rot, OL } = TT;
  const I = (id, name, draw, o = {}) => Object.assign({ id, name, draw }, o);
  const dash = 'stroke-dasharray="5 5"';
  const stitch = (d, col = '#ffffff') => S(d, col, 2.2, `${dash} opacity=".85"`);

  /* --- shirt building blocks --- */
  const body = (hem, fill) => P(`M150,240 Q200,232 250,240 Q268,248 270,272 L272,${hem - 14} Q272,${hem} 256,${hem + 2} L144,${hem + 2} Q128,${hem} 128,${hem - 14} L130,272 Q132,248 150,240Z`, fill);
  const shortSl = fill => SYM(TUBE('M156,258 L138,290', 34, fill));
  const longSl = (fill, cuff) => SYM(TUBE('M156,258 L120,318', 31, fill) + (cuff ? TUBE('M121,315 L118,320', 33, cuff) : ''));
  const wideSl = fill => SYM(P('M150,250 L92,318 Q98,348 136,340 L156,306Z', fill));
  const crew = col => P('M170,246 Q200,264 230,246 L234,253 Q200,274 166,253Z', col, 3);
  const vneck = (col, depth = 278) => P(`M176,246 L200,${depth} L224,246Z`, col, 3);
  const buttons = (x, ys, col = '#fff') => ys.map(y => C(x, y, 4.2, col, 2.5)).join('');

  TT.TOPS = [
    I('tee', 'Comfy tee', c => shortSl(c.fill) + body(340, c.fill) + crew(c.dark)),
    I('tank', 'Tank top', (c, x) => body(338, c.fill) + P('M166,244 Q200,286 234,244Z', x.F, 3) + stitch('M134,330 L266,330', c.light)),
    I('hoodie', 'Hoodie', c => P('M118,254 Q116,224 150,224 L250,224 Q284,224 282,254 Q200,246 118,254Z', c.dark) + longSl(c.fill, c.dark) + body(346, c.fill) +
      P('M160,304 L240,304 L250,336 L150,336Z', c.fill) + S('M186,254 L183,292 M214,254 L217,292', '#ffffff', 3.5) + C(183, 295, 4, '#ffffff', 2) + C(217, 295, 4, '#ffffff', 2)),
    I('sweater', 'Cozy sweater', c => longSl(c.fill, c.dark) + body(346, c.fill) + P('M129,330 L271,330 L272,348 L128,348Z', c.dark, 3) +
      crew(c.dark) + TT.heart(200, 292, 15, c.lighter, 3) + S('M140,338 L140,344 M156,338 L156,344 M172,338 L172,344 M188,338 L188,344 M212,338 L212,344 M228,338 L228,344 M244,338 L244,344 M260,338 L260,344', OL, 2)),
    I('cardigan', 'Cardigan', c => longSl(c.fill, c.dark) + body(346, c.fill) + P('M184,246 L194,348 L206,348 L216,246 Q200,254 184,246Z', '#fffaf0', 3) +
      buttons(212, [276, 302, 328], c.lighter) + R(146, 312, 26, 20, 5, c.dark, 3) + R(228, 312, 26, 20, 5, c.dark, 3)),
    I('sundress', 'Sundress', c => TUBE('M162,262 L166,244', 5, c.dark) + TUBE('M238,262 L234,244', 5, c.dark) +
      P('M146,300 L254,300 L286,388 Q200,406 114,388Z', c.fill) + P('M150,256 Q200,268 250,256 L254,304 L146,304Z', c.fill) +
      P('M146,296 L254,296 L255,308 L145,308Z', c.dark, 3) + P('M200,302 L184,292 L184,312Z M200,302 L216,292 L216,312Z', c.dark, 3) + C(200, 302, 4.5, c.light, 2.5)),
    I('gown', 'Princess gown', c => SYM(C(144, 262, 23, c.light)) +
      P('M144,300 L256,300 Q302,350 302,398 Q200,420 98,398 Q98,350 144,300Z', c.fill) +
      [108, 132, 156, 180, 204, 228, 252, 276, 296].map(x => C(x, 400 + (x > 120 && x < 280 ? 6 : 0), 11, c.lighter, 3)).join('') +
      P('M146,250 Q200,262 254,250 L256,306 L144,306Z', c.fill) + P('M150,250 Q200,282 250,250', 'none', 3) +
      TT.star(150, 360, 6, '#fff7c2', 2) + TT.star(244, 372, 7, '#fff7c2', 2) + TT.star(198, 384, 5, '#fff7c2', 2) +
      P('M200,304 L180,292 L180,316Z M200,304 L220,292 L220,316Z', c.lighter, 3) + C(200, 304, 5, '#ffe17a', 2.5)),
    I('raincoat', 'Raincoat', c => longSl(c.fill, c.dark) + body(366, c.fill) + P('M154,240 L200,252 L246,240 L244,262 L200,272 L156,262Z', c.dark) +
      S('M200,272 L200,366', OL, 3) + [290, 314, 338].map(y => R(186, y - 4, 10, 8, 3, '#fffaf0', 2.5) + R(204, y - 4, 10, 8, 3, '#fffaf0', 2.5)).join('') +
      R(144, 326, 30, 8, 3, c.dark, 3) + R(226, 326, 30, 8, 3, c.dark, 3)),
    I('denim', 'Jean jacket', c => longSl(c.fill, c.dark) + body(344, c.fill) + P('M182,246 L190,346 L210,346 L218,246Z', '#ffffff', 3) +
      SYM(P('M164,242 L184,272 L196,248Z', c.dark, 3) + R(144, 280, 30, 22, 4, c.fill, 3) + stitch('M147,284 L171,284', c.lighter) + stitch('M136,262 L134,336', c.lighter)) +
      buttons(176, [300, 324], '#ffd36e')),
    I('sailor', 'Sailor top', c => shortSl(c.fill) + body(340, c.fill) +
      P('M146,240 L254,240 L264,274 L200,304 L136,274Z', '#4f5b9a') + S('M146,252 L200,290 L254,252', '#ffffff', 3) +
      P('M200,288 L186,300 L194,322 L200,306 L206,322 L214,300Z', '#ff6f86', 3)),
    I('hawaiian', 'Aloha shirt', c => shortSl(c.fill) + body(342, c.fill) + SYM(P('M168,242 L184,270 L198,248Z', c.light, 3)) + S('M200,262 L200,342', OL, 3) +
      TT.flower(156, 290, 13, '#ffffff', '#ffd34d', 2) + TT.flower(240, 312, 12, '#ff9ec0', '#ffd34d', 2) + TT.flower(170, 330, 9, '#ffe17a', '#ff8f6b', 2) +
      P('M232,276 q14,-10 22,2 q-12,8 -22,-2z', '#7fcf8f', 2.5) + P('M144,316 q-4,-16 10,-18 q2,14 -10,18z', '#7fcf8f', 2.5)),
    I('puffer', 'Puffer jacket', c => longSl(c.fill, c.dark) + SYM(S('M140,282 L150,288 M128,302 L138,308', OL, 3)) + body(350, c.fill) +
      S('M131,278 Q200,288 269,278 M130,304 Q200,314 270,304 M130,328 Q200,338 270,328', OL, 3) + P('M156,236 L244,236 L242,258 Q200,268 158,258Z', c.fill) +
      S('M200,262 L200,350', c.darker, 3) + R(196, 268, 8, 12, 2, '#e9e4f0', 2)),
    I('astro', 'Space suit', c => longSl(c.fill, '#c9cde0') + SYM(TUBE('M136,290 L132,296', 33, '#ff8f6b')) + body(348, c.fill) +
      R(172, 280, 56, 36, 8, '#e4e7f2', 3) + C(186, 292, 5, '#ff6f86', 2) + C(200, 292, 5, '#ffe17a', 2) + C(214, 292, 5, '#6fd3cf', 2) + R(182, 303, 36, 6, 3, '#9cd3ff', 2) +
      R(232, 262, 22, 14, 3, '#9cd3ff', 2.5) + TT.star(243, 269, 4.5, '#ffffff', 0) + S('M131,332 L269,332', OL, 3)),
    I('knight', 'Knight armor', c => longSl('#c9cede', '#aeb4c8') + body(346, '#dde1ec') + S('M132,296 Q200,306 268,296 M131,320 Q200,330 269,320', '#aeb4c8', 3) +
      P('M174,250 L226,250 L232,352 L168,352Z', c.fill) + TT.heart(200, 292, 12, '#ffe17a', 3) +
      SYM(E(144, 262, 24, 16, '#c9cede', 4, rot(-24, 144, 262)) + C(144, 262, 3, '#8f97b0', 0))),
    I('pajama', 'Comfy PJs', c => longSl(c.fill, c.light) + body(346, c.fill) + SYM(P('M166,242 L184,268 L198,248Z', c.light, 3)) +
      S('M196,262 L196,346', c.light, 4) + buttons(206, [282, 306, 330], c.lighter) + R(146, 288, 28, 24, 6, c.light, 3) + P('M156,294 a7,7 0 1,0 8,10 a6,6 0 1,1 -8,-10z', '#ffe17a', 2)),
    I('jersey', 'Team jersey', c => shortSl(c.fill) + SYM(TUBE('M141,285 L139,289', 34, '#ffffff')) + body(344, c.fill) + vneck('#ffffff', 274) + P('M182,246 L200,268 L218,246', 'none', 0) +
      SYM(S('M134,280 L132,340', '#ffffff', 6)) + TT.star(200, 306, 20, '#ffffff', 3) + TT.star(200, 306, 9, c.dark, 0)),
    I('labcoat', 'Lab coat', c => longSl(c.lighter, c.light) + body(372, c.lighter) + S('M200,262 L200,372', OL, 3) +
      SYM(P('M160,240 L190,288 L196,252Z', c.light, 3)) + R(222, 290, 28, 26, 4, c.lighter, 3) + S('M230,292 L230,280 M238,292 L238,282', '#ff6f86', 4) + S('M244,292 L244,282', '#7c9fe0', 4) + buttons(206, [300, 330], c.light)),
    I('chef', 'Chef coat', c => longSl(c.lighter, c.light) + body(352, c.lighter) + P('M164,242 Q200,262 236,242 L232,258 Q200,276 168,258Z', c.base, 3) +
      buttons(184, [286, 310, 334], c.dark) + buttons(216, [286, 310, 334], c.dark)),
    I('bee', 'Bumble bee', c => shortSl(c.fill) + body(346, c.fill) + P('M130,282 Q200,292 270,282 L270,300 Q200,310 130,300Z', '#4f4560', 0) + P('M129,318 Q200,328 271,318 L271,336 Q200,346 129,336Z', '#4f4560', 0) + crew('#4f4560')),
    I('kimono', 'Kimono', c => wideSl(c.fill) + body(352, c.fill) + P('M168,240 L214,316 L232,316 L186,240Z', c.lighter, 3) + P('M232,240 L196,300', 'none', 3) + S('M232,242 L190,300', OL, 3) +
      P('M130,300 L270,300 L270,322 L130,322Z', c.dark, 3) + P('M232,311 l20,-12 l0,24z', c.dark, 3) + TT.flower(158, 336, 8, c.lighter, '#ffd34d', 2) + TT.flower(240, 274, 7, c.lighter, '#ffd34d', 2)),
    I('leotard', 'Sparkle leotard', (c, x) => body(352, c.fill) + P('M164,244 Q200,290 236,244Z', x.F, 3) + P('M138,342 Q200,368 262,342', 'none', 0) +
      TT.star(170, 300, 5, '#ffffff', 0) + TT.star(222, 322, 6, '#ffffff', 0) + TT.star(240, 288, 4, '#fff7c2', 0) + TT.star(186, 336, 4, '#fff7c2', 0)),
    I('wizard', 'Wizard robe', c => wideSl(c.fill) + P('M150,240 Q200,232 250,240 Q270,250 272,276 L284,398 Q200,412 116,398 L128,276 Q130,250 150,240Z', c.fill) +
      TT.star(160, 300, 8, '#ffe17a', 2.5) + TT.star(236, 340, 10, '#ffe17a', 2.5) + TT.star(176, 372, 6, '#ffe17a', 2.5) + P('M232,286 a10,10 0 1,0 10,14 a8,8 0 1,1 -10,-14z', '#fff7c2', 2.5) +
      S('M132,312 Q200,322 268,312', '#ffd36e', 5) + S('M222,318 L226,346 M230,316 L238,342', '#ffd36e', 4)),
    I('vest', 'Fancy vest', c => longSl('#ffffff', '#ffffff') + body(342, '#ffffff') + SYM(P('M150,242 L190,252 L198,344 L144,344 Q130,342 130,328 L132,270 Q134,248 150,242Z', c.fill)) +
      buttons(192, [284, 306, 328], '#ffe17a') + SYM(R(146, 300, 24, 6, 3, c.dark, 2.5))),
    I('hero', 'Super suit', c => longSl(c.fill, c.dark) + body(344, c.fill) + C(200, 290, 26, '#ffe17a') + P('M204,272 L188,294 L200,294 L194,310 L212,286 L200,286 L206,272Z', '#ff6f86', 2.5) +
      P('M130,322 L270,322 L270,336 L130,336Z', '#ffe17a', 3) + R(190, 320, 20, 18, 4, '#ffd34d', 3)),
    I('tux', 'Tuxedo', c => longSl(c.fill, '#ffffff') + body(352, c.fill) + P('M176,244 L200,300 L224,244Z', '#ffffff', 3) +
      SYM(P('M168,242 L198,304 L184,262Z', c.dark, 3)) + buttons(200, [316, 336], c.darker) + P('M226,280 l14,0 l-2,8 l-10,0z', '#ffffff', 2)),
    I('ruffle', 'Ruffle blouse', c => SYM(TUBE('M156,258 L132,300', 38, c.fill) + C(132, 302, 13, c.light, 3)) + body(338, c.fill) +
      [252, 268, 284].map(y => P(`M186,${y} Q200,${y + 12} 214,${y} Q200,${y + 22} 186,${y}Z`, c.light, 3)).join(''))
  ];

  /* --- bottoms (waist ≈ y 316) --- */
  const pantsD = 'M134,316 L266,316 L264,402 L206,402 L200,358 L194,402 L136,402Z';
  const shortsD = 'M132,316 L268,316 L272,370 L208,372 L200,350 L192,372 L128,370Z';
  const skirtD = 'M138,314 L262,314 L286,384 Q200,398 114,384Z';
  const waist = c => P('M133,314 L267,314 L267,328 L133,328Z', c.dark, 3);
  TT.BOTTOMS = [
    I('shorts', 'Shorts', c => P(shortsD, c.fill) + waist(c)),
    I('pants', 'Trousers', c => P(pantsD, c.fill) + waist(c) + S('M200,328 L200,346', OL, 3)),
    I('jeans', 'Jeans', c => P(pantsD, c.fill) + waist(c) + SYM(stitch('M144,330 Q164,352 184,330', c.lighter) + P('M137,390 L194,390 L194,402 L136,402Z', c.light, 3)) + C(200, 321, 3.5, '#ffd36e', 2)),
    I('skirt', 'A-line skirt', c => P(skirtD, c.fill) + waist(c)),
    I('pleated', 'Pleated skirt', c => P(skirtD, c.fill) + waist(c) + S('M156,330 L140,388 M178,330 L170,392 M200,330 L200,394 M222,330 L230,392 M244,330 L260,388', OL, 2.6)),
    I('tutu', 'Tutu', c => P('M138,312 L262,312 L262,330 L138,330Z', c.dark, 3) +
      E(200, 352, 92, 26, c.lighter, 3.5) + E(200, 344, 84, 24, c.light, 3.5) + E(200, 336, 72, 18, c.fill, 3.5) + P('M138,312 L262,312 L262,330 L138,330Z', c.dark, 3) +
      TT.star(150, 352, 4, '#ffffff', 0) + TT.star(236, 360, 5, '#ffffff', 0) + TT.star(196, 364, 4, '#ffffff', 0)),
    I('overalls', 'Overalls', c => ({
      main: P(pantsD, c.fill),
      over: TUBE('M170,266 L162,244', 9, c.dark) + TUBE('M230,266 L238,244', 9, c.dark) + P('M164,262 L236,262 L240,324 L160,324Z', c.fill) + R(182, 276, 36, 24, 5, c.dark, 3) +
        C(170, 268, 4.5, '#ffd36e', 2.5) + C(230, 268, 4.5, '#ffd36e', 2.5) + stitch('M168,320 L232,320', c.lighter)
    })),
    I('leggings', 'Leggings', c => P('M136,314 L264,314 L262,346 L242,402 L204,402 L200,356 L196,402 L158,402 L138,346Z', c.fill) + P('M135,314 L265,314 L265,326 L135,326Z', c.dark, 3)),
    I('cargo', 'Cargo shorts', c => P('M132,316 L268,316 L274,384 L208,386 L200,352 L192,386 L126,384Z', c.fill) + waist(c) + R(130, 346, 22, 24, 4, c.dark, 3) + R(248, 346, 22, 24, 4, c.dark, 3)),
    I('joggers', 'Joggers', c => P('M134,316 L266,316 L262,396 L206,396 L200,358 L194,396 L138,396Z', c.fill) + waist(c) + E(166, 398, 30, 8, c.dark, 3) + E(234, 398, 30, 8, c.dark, 3) +
      S('M194,328 L190,346 M206,328 L210,346', '#ffffff', 3)),
    I('ballskirt', 'Ball gown skirt', c => P('M140,312 L260,312 Q322,370 320,414 Q200,430 80,414 Q78,370 140,312Z', c.fill) +
      [92, 118, 144, 170, 196, 222, 248, 274, 300].map(x => C(x, 414 + (x > 110 && x < 290 ? 4 : 0), 12, c.lighter, 3)).join('') +
      S('M160,330 Q140,370 132,404 M240,330 Q260,370 268,404', c.dark, 3) + waist(c)),
    I('bloomers', 'Puffy bloomers', c => P('M132,316 L268,316 Q292,350 268,378 Q238,386 206,372 L200,358 L194,372 Q162,386 132,378 Q108,350 132,316Z', c.fill) + waist(c) +
      S('M134,372 q8,6 16,0 q8,6 16,0 q8,6 16,0 M218,372 q8,6 16,0 q8,6 16,0 q8,6 16,0', '#ffffff', 3)),
    I('mermaid', 'Mermaid tail', c => P('M134,314 L266,314 Q264,362 236,396 L228,406 Q262,418 280,436 Q240,442 200,424 Q160,442 120,436 Q138,418 172,406 L164,396 Q136,362 134,314Z', c.fill) +
      [[160, 340], [200, 340], [240, 340], [180, 362], [220, 362], [200, 384]].map(([x, y]) => S(`M${x - 12},${y} Q${x},${y + 12} ${x + 12},${y}`, c.lighter, 3)).join('') +
      S('M176,416 L148,430 M224,416 L252,430 M200,424 L200,436', c.dark, 3) + waist(c), { hideFeet: true }),
    I('flares', 'Bell-bottoms', c => P('M134,316 L266,316 L278,404 L206,404 L200,358 L194,404 L122,404Z', c.fill) + waist(c) + TT.flower(158, 384, 8, '#ffffff', '#ffd34d', 2) + TT.flower(244, 380, 8, '#ffffff', '#ffd34d', 2)),
    I('hula', 'Grass skirt', c => {
      let s = '';
      for (let i = 0; i < 18; i++) {
        const x = 138 + i * 7.3;
        s += S(`M${x},322 Q${x + (i - 9) * 0.8},352 ${x + (i - 9) * 2.2},388`, i % 2 ? c.base : c.dark, 7);
      }
      return s + P('M134,312 L266,312 L266,328 L134,328Z', '#ffe9b8', 3) + TT.flower(152, 320, 8, '#ff9ec0', '#ffd34d', 2) + TT.flower(200, 320, 8, '#ffffff', '#ffd34d', 2) + TT.flower(248, 320, 8, '#ff9ec0', '#ffd34d', 2);
    }),
    I('pjpants', 'PJ pants', c => P(pantsD, c.fill) + waist(c) + TT.star(156, 350, 6, c.lighter, 0) + TT.star(240, 366, 6, c.lighter, 0) + TT.star(170, 384, 5, c.lighter, 0) +
      P('M236,336 a7,7 0 1,0 8,10 a6,6 0 1,1 -8,-10z', c.lighter, 0) + S('M136,392 L194,392 M206,392 L264,392', c.lighter, 4)),
    I('tiered', 'Frilly skirt', c => P('M136,314 L264,314 L284,390 Q200,402 116,390Z', c.light) + P('M138,314 L262,314 L274,358 Q200,370 126,358Z', c.fill) +
      S('M118,388 q10,8 20,0 q10,8 20,0 q10,8 20,0 q10,8 20,0 q10,8 20,0 q10,8 20,0 q10,8 20,0 q10,8 20,0', OL, 3) + waist(c))
  ];

  /* --- shoes: drawn for the left foot (174,408) and mirrored --- */
  const lowShoe = 'M148,414 Q146,394 168,394 Q192,394 201,410 Q202,422 188,422 L156,422 Q148,422 148,414Z';
  const sole = col => P('M147,412 L202,412 Q203,425 188,425 L156,425 Q147,425 147,412Z', col, 3.5);
  const shaft = (top, fill) => P(`M158,${top} L192,${top} L194,404 L156,404Z`, fill);
  TT.SHOES = [
    I('sneakers', 'Sneakers', c => SYM(P(lowShoe, c.fill) + sole('#ffffff') + S('M166,400 L178,404 M164,406 L182,402', OL, 2.5))),
    I('hightops', 'High-tops', c => SYM(shaft(374, c.fill) + P(lowShoe, c.fill) + sole('#ffffff') + C(172, 390, 7, '#ffffff', 2.5) + TT.star(172, 390, 5, c.dark, 0) + S('M162,380 L188,384 M162,370 L188,374', '#ffffff', 2.5))),
    I('boots', 'Ankle boots', c => SYM(shaft(372, c.fill) + P(lowShoe, c.fill) + P('M154,368 L196,368 L196,380 L154,380Z', c.dark, 3) + sole(c.darker))),
    I('rainboots', 'Rain boots', c => SYM(P('M156,362 L194,362 L196,404 Q204,424 186,424 L156,424 Q146,424 148,410Z', c.fill) + S('M164,370 L164,402', '#ffffff', 4, 'opacity=".7"') + P('M154,358 L196,358 L196,368 L154,368Z', c.dark, 3))),
    I('flats', 'Ballet flats', c => SYM(S('M178,396 L170,370 L186,350', c.dark, 3) + P('M150,414 Q150,400 170,400 Q194,400 200,412 Q200,420 188,420 L160,420 Q150,420 150,414Z', c.fill) + C(186, 404, 4.5, c.lighter, 2.5))),
    I('sandals', 'Sandals', c => SYM(P('M146,416 L202,416 Q204,426 190,426 L156,426 Q146,426 146,416Z', c.dark, 3) + S('M156,402 L192,412 M190,398 L162,412', c.fill, 6) + C(174, 404, 5, '#ffe17a', 2.5))),
    I('bunny', 'Bunny slippers', c => SYM(E(160, 386, 7, 16, c.lighter, 3.5, rot(-14, 160, 386)) + E(186, 386, 7, 16, c.lighter, 3.5, rot(14, 186, 386)) + E(174, 410, 29, 17, c.lighter, 4) + C(166, 406, 2.6, TT.INK, 0) + C(182, 406, 2.6, TT.INK, 0) + C(174, 412, 2.6, '#ff8fa8', 0))),
    I('skates', 'Roller skates', c => SYM(shaft(374, c.fill) + P(lowShoe, c.fill) + R(148, 416, 54, 7, 3, '#e4e0ee', 3) + C(160, 428, 7, '#ffe17a', 3) + C(190, 428, 7, '#ff9ec0', 3) + S('M162,380 L188,384 M162,370 L188,374', '#ffffff', 2.5))),
    I('flippers', 'Flippers', c => SYM(P('M154,400 L196,400 L212,434 Q176,446 136,434Z', c.fill) + S('M164,410 L156,434 M176,410 L176,438 M188,410 L196,434', c.dark, 3))),
    I('cowboy', 'Cowgirl boots', c => SYM(P('M156,364 L194,364 L196,404 L202,416 Q196,424 182,424 L150,422 Q144,414 156,404Z', c.fill) + TT.star(175, 382, 7, '#ffe17a', 2.5) + P('M154,358 L162,368 L172,358 L182,368 L194,358 L196,366 L154,366Z', c.dark, 3))),
    I('maryjanes', 'Mary Janes', c => SYM(TUBE('M174,360 L174,396', 30, '#ffffff') + S('M162,372 L186,372 M162,384 L186,384', '#ffd0df', 3) + P(lowShoe, c.fill) + S('M160,398 L190,398', c.dark, 5) + C(186, 398, 3, '#ffffff', 0) + E(166, 404, 6, 3, '#ffffff', 0, 'opacity=".7"'))),
    I('clogs', 'Comfy clogs', c => SYM(P('M146,414 Q144,392 172,392 Q202,394 202,414 Q202,424 186,424 L158,424 Q146,424 146,414Z', c.fill) + C(166, 402, 2.5, c.dark, 0) + C(178, 400, 2.5, c.dark, 0) + C(190, 404, 2.5, c.dark, 0) + TT.star(172, 410, 5, '#ffe17a', 2) + C(188, 412, 4, '#ff9ec0', 2))),
    I('lightup', 'Light-up kicks', c => SYM(P(lowShoe, c.fill) + R(147, 412, 13, 13, 3, '#ff9eb0', 2.5) + R(160, 412, 14, 13, 0, '#ffe98a', 0) + R(174, 412, 14, 13, 0, '#a8e8b8', 0) + P('M188,412 L202,412 Q203,425 188,425Z', '#9cd3ff', 0) + P('M147,412 L202,412 Q203,425 188,425 L156,425 Q147,425 147,412Z', 'none', 3.5) + S('M166,400 L178,404 M164,406 L182,402', OL, 2.5))),
    I('socks', 'Cozy socks', c => SYM(TUBE('M174,360 L174,400', 32, c.fill) + S('M160,368 L188,368 M160,382 L188,382', c.lighter, 5) + E(174, 410, 26, 15, c.fill) + E(160, 412, 8, 6, c.lighter, 0)))
  ];
})(window.TT);
