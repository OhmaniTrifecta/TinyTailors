/* Tiny Tailors — monthly events.
   Every month has a themed event: a scene, a few new items, event challenges and an album page.
   Event items can only be earned during their month. Once you own one you keep it forever,
   and the event comes back next year.

   IMPORTANT: event items are pushed onto the END of their wardrobe lists, in the order they are
   written in this file. Share codes store each item's position, so never reorder or delete them;
   add next month's items below the last ones. */
(function (TT) {
  const { P, C, E, S, R, TUBE, SYM, rot, OL, INK } = TT;
  const T = TT.TOPKIT;
  const GOLD = '#ffd84d';
  const I = (id, name, draw, o = {}) => Object.assign({ id, name, draw }, o);
  const bg = col => `<rect x="-10" y="-10" width="420" height="490" fill="${col}"/>`;
  const ground = (y, col, sw = 0) => P(`M0,${y} Q100,${y - 10} 200,${y} Q300,${y + 10} 400,${y} L400,470 L0,470Z`, col, sw);
  const dots = (seed, n, col, r0, r1, y0 = 0, y1 = 460, op = 1) => { const r = TT.rng(seed); let s = ''; for (let i = 0; i < n; i++) s += C((r() * 400).toFixed(1), (y0 + r() * (y1 - y0)).toFixed(1), (r0 + r() * (r1 - r0)).toFixed(1), col, 0, `opacity="${op}"`); return s; };
  const leaf = (x, y, a, col, sw = 2.5, k = 1) => P(`M${x},${y} q${10 * k},${-13 * k} ${22 * k},${-4 * k} q${-9 * k},${13 * k} ${-22 * k},${4 * k}z`, col, sw, rot(a, x, y));
  const pumpkin = (x, y, s, col = '#ffa05c', face = true) =>
    E(x - 13 * s, y, 15 * s, 18 * s, col, 3) + E(x + 13 * s, y, 15 * s, 18 * s, col, 3) + E(x, y, 15 * s, 19 * s, col, 3) +
    S(`M${x},${y - 18 * s} L${x + 3 * s},${y - 27 * s}`, '#6bb27a', 4) +
    (face ? P(`M${x - 10 * s},${y - 3 * s} l5,-6 l5,6z M${x + 2 * s},${y - 3 * s} l5,-6 l5,6z`, '#5b3f58', 0) + S(`M${x - 8 * s},${y + 6 * s} Q${x},${y + 12 * s} ${x + 8 * s},${y + 6 * s}`, '#5b3f58', 2.5) : '');

  /* ---------------- the calendar ----------------
     ready: true once the month has its own items and challenges. */
  TT.EVENTS = [
    { month: 0, id: 'icepalace', name: 'Ice Palace Snow Day', emoji: '❄️', color: '#cfe9ff', ink: '#4a78b8', blurb: 'Ice skates, snow forts and a sparkly ice palace.' },
    { month: 1, id: 'bakery', name: 'Sweetheart Bakery', emoji: '💗', color: '#ffd6e5', ink: '#d94f7c', blurb: 'Bake heart cookies and dress up for a sweet party.' },
    { month: 2, id: 'rainbow', name: 'Rainbow Lucky Clover', emoji: '🌈', color: '#d9f5d0', ink: '#3f9a5a', blurb: 'Hunt for four-leaf clovers at the end of the rainbow.' },
    { month: 3, id: 'gardenparty', name: 'Rainy Day Garden Party', emoji: '🌷', color: '#e3f0ff', ink: '#5a7fc0', blurb: 'Puddle-jumping, tulips and a picnic under umbrellas.' },
    { month: 4, id: 'fairytea', name: 'Fairy Tea Party', emoji: '🫖', color: '#f0e3ff', ink: '#8a5cc8', blurb: 'Tiny teacups, mushroom tables and fairy guests.' },
    { month: 5, id: 'beachbash', name: 'Beach Bash', emoji: '🐚', color: '#d4f3f0', ink: '#2f9a94', blurb: 'Sandcastles, surfboards and a sunset beach party.' },
    { month: 6, id: 'camp', name: 'Camp Critter', emoji: '🏕️', color: '#e2f0d3', ink: '#5d8a3a', blurb: 'Tents, s\'mores and fireflies under the stars.' },
    { month: 7, id: 'galaxy', name: 'Galaxy Explorers', emoji: '🚀', color: '#e0dcff', ink: '#5b4fb0', blurb: 'Blast off to a planet made of candy and stars.' },
    { month: 8, id: 'school', name: 'School Spirit Week', emoji: '🎒', color: '#fff0c2', ink: '#c08a1e', blurb: 'Crazy hat day, pajama day and team colors.' },
    { month: 9, id: 'masquerade', name: 'Monster Masquerade', emoji: '🎃', color: '#ffd9bf', ink: '#c8602a', blurb: 'Cute costumes, a pumpkin patch and a trick-or-treat parade.', ready: true, scene: 'pumpkinpatch',
      items: [['hat', 'pumpkinhat'], ['top', 'mummy'], ['back', 'vampcape'], ['hold', 'candybucket'], ['pet', 'jackpal']] },
    { month: 10, id: 'harvest', name: 'Cozy Harvest', emoji: '🍂', color: '#ffe4c4', ink: '#b8662e', blurb: 'Chunky sweaters, apple pie and a farm full of pumpkins.', ready: true, scene: 'harvestfarm',
      items: [['hat', 'leafcrown'], ['top', 'chunkyknit'], ['neck', 'blanketscarf'], ['hold', 'applepie'], ['pet', 'squirrel']] },
    { month: 11, id: 'toyshop', name: 'Twinkle Toy Workshop', emoji: '🎁', color: '#ffe0e0', ink: '#c0444f', blurb: 'Help the toymakers wrap presents under twinkly lights.' }
  ];
  TT.eventById = id => TT.EVENTS.find(e => e.id === id) || null;
  TT.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  TT.currentEvent = () => TT.EVENTS[new Date().getMonth()];
  TT.nextEvent = () => TT.EVENTS[(new Date().getMonth() + 1) % 12];
  TT.eventOpen = id => TT.currentEvent().id === id;
  TT.daysLeftInMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1; };
  /* is this item an event item you can't get right now? */
  TT.outOfSeason = (kind, it) => !!(it && it.event) && TT.isLocked(kind, it) && !TT.eventOpen(it.event);

  /* ================= October: Monster Masquerade ================= */
  TT.HATS.push(I('pumpkinhat', 'Pumpkin hat', () => E(156, 88, 40, 32, '#ffa05c', 4) + E(244, 88, 40, 32, '#ffa05c', 4) + E(200, 82, 44, 38, '#ffa05c', 4) +
    S('M178,56 Q172,82 180,112 M222,56 Q228,82 220,112', '#e8803e', 3) + R(193, 30, 14, 20, 5, '#8bc67a', 3) + P('M206,40 Q230,22 242,40 Q226,48 206,40Z', '#a8e6a1', 3) +
    S('M196,30 Q186,16 196,10', '#6bb27a', 3) + P('M186,84 l6,-8 l6,8z M204,84 l6,-8 l6,8z', '#5b3f58', 0) + S('M188,96 Q200,104 212,96', '#5b3f58', 3), { event: 'masquerade', locked: 70, fixed: 1 }));
  TT.TOPS.push(I('mummy', 'Mummy wraps', c => T.longSl(c.fill, c.dark) + T.sl(S('M136,268 L152,282 M127,286 L143,298 M121,302 L135,312', c.dark, 3)) + T.body(350, c.fill) +
    S('M130,270 L270,290 M130,296 L270,276 M130,318 L270,330 M130,338 L240,320 M170,248 L270,262', c.dark, 3) + P('M242,326 Q262,338 256,366 Q246,352 236,350Z', c.fill, 3) +
    TT.heart(176, 306, 7, '#ff8fb1', 2.5), { event: 'masquerade', locked: 85, evColor: 'cream' }));
  TT.BACK.push(I('vampcape', 'Vampire cape', c => ({
    back: SYM(P('M152,250 L104,182 Q126,196 138,208 L146,176 Q160,214 178,246Z', '#e2557a')) +
      P('M146,246 L254,246 Q302,330 314,430 Q200,446 86,430 Q98,330 146,246Z', c.fill) + P('M150,256 Q118,330 104,422 L118,426 Q130,332 160,256Z M250,256 Q282,330 296,422 L282,426 Q270,332 240,256Z', '#e2557a', 0) +
      S('M200,262 Q196,350 200,436', c.dark, 2.5),
    front: S('M160,252 Q200,266 240,252', GOLD, 3) + C(200, 260, 8, '#e2557a', 3) + C(197, 257, 2, '#ffffff', 0)
  }), { event: 'masquerade', locked: 95, evColor: 'grape' }));
  TT.HOLD.push(I('candybucket', 'Candy pail', c => S('M266,352 Q284,300 304,352', OL, 3.5) + E(285, 374, 26, 23, c.fill) + S('M270,360 Q268,376 272,392 M300,360 Q302,376 298,392', c.dark, 2.5) +
    C(276, 350, 6, '#9cd3ff', 2.5) + C(290, 347, 6, '#ff9ec0', 2.5) + R(296, 344, 10, 8, 3, '#ffe17a', 2.5) + E(285, 354, 23, 6, 'none', 3.5) +
    P('M274,372 l5,-7 l5,7z M287,372 l5,-7 l5,7z', '#5b3f58', 0) + S('M276,382 Q285,388 294,382', '#5b3f58', 2.5), { event: 'masquerade', locked: 60, evColor: 'peach' }));
  TT.PETS.push(I('jackpal', 'Jack-o\'-pal', c => pumpkin(70, 412, 1.25, '#ffa05c', false) + C(58, 410, 3, INK, 0) + C(82, 410, 3, INK, 0) + S('M64,420 Q70,425 76,420', OL, 2.5) +
    E(52, 418, 5, 3, '#ff7d8c', 0, 'opacity=".6"') + E(88, 418, 5, 3, '#ff7d8c', 0, 'opacity=".6"') + P('M78,380 Q90,370 96,382 Q86,388 78,380Z', c.fill, 2.5), { event: 'masquerade', locked: 110 }));
  TT.SCENES.push(I('pumpkinpatch', 'Pumpkin patch', () => bg('#5b4a8a') + `<rect x="-10" y="180" width="420" height="200" fill="#ff9f6b" opacity=".35"/>` +
    C(318, 86, 40, '#fff3c2', 0) + C(318, 86, 54, '#fff3c2', 0, 'opacity=".25"') + dots(901, 22, '#ffffff', 0.8, 2.2, 0, 220, 0.8) +
    P('M-10,300 Q80,250 170,300 Q260,256 410,296 L410,380 L-10,380Z', '#3d3466', 0) +
    // string lights
    S('M-10,60 Q100,110 200,70 Q300,30 410,80', '#2e2850', 2.5) + [[30, 76, '#ffe17a'], [80, 94, '#ff9f5a'], [130, 92, '#9ee6c0'], [180, 76, '#ff9ec0'], [230, 60, '#ffe17a'], [280, 50, '#cfa8ff'], [340, 58, '#ff9f5a'], [390, 72, '#9ee6c0']]
      .map(([x, y, col]) => C(x, y + 6, 6, col, 2.5) + C(x, y + 6, 11, col, 0, 'opacity=".3"')).join('') +
    // little bats
    [[90, 150, 1], [250, 130, 0.8]].map(([x, y, s]) => P(`M${x},${y} q-10,-10 -22,-4 q6,4 4,10 q8,-6 18,-2z M${x},${y} q10,-10 22,-4 q-6,4 -4,10 q-8,-6 -18,-2z`, '#2e2850', 0) + C(x, y + 2, 5 * s, '#2e2850', 0)).join('') +
    // fence
    [20, 70, 330, 380].map(x => R(x - 7, 300, 14, 64, 4, '#c69c7a', 3) + P(`M${x - 7},302 L${x},290 L${x + 7},302Z`, '#c69c7a', 3)).join('') +
    R(10, 318, 80, 9, 3, '#d9a074', 3) + R(320, 318, 80, 9, 3, '#d9a074', 3) +
    ground(364, '#6b5a8a') + dots(902, 16, '#7d6c9c', 3, 6, 372, 460) +
    S('M-10,430 Q60,404 120,432 Q200,452 280,428 Q350,406 410,430', '#6bb27a', 4) +
    pumpkin(44, 404, 1.2) + pumpkin(340, 410, 1.5) + pumpkin(372, 446, 0.9) + pumpkin(120, 446, 0.8, '#ffc38a', false)));

  /* ================= November: Cozy Harvest ================= */
  TT.HATS.push(I('leafcrown', 'Leaf crown', c => {
    let s = TUBE('M118,124 Q126,82 200,76 Q274,82 282,124', 5, '#b98a6d');
    const cols = ['#ff9f5a', '#ffcf5a', '#ff7d6b', '#ffb36b'];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, x = 118 + 164 * t, y = 124 - 46 * Math.sin(Math.PI * t);
      s += leaf(x.toFixed(1), y.toFixed(1), -150 + 120 * t + (i % 2 ? 30 : -10), cols[i % 4], 3, 1.6);
    }
    s += [[150, 92], [250, 92]].map(([x, y]) => E(x, y + 4, 8, 9, '#c8996e', 3) + P(`M${x - 9},${y} Q${x},${y - 10} ${x + 9},${y}Z`, '#8a6448', 3)).join('');
    return s + [[176, 80], [224, 80], [200, 74]].map(([x, y]) => C(x, y, 5.5, c.fill, 2.5)).join('');
  }, { event: 'harvest', locked: 65, evColor: 'strawberry' }));
  TT.TOPS.push(I('chunkyknit', 'Chunky knit sweater', c => T.longSl(c.fill, c.dark) + T.sl(S('M140,270 L130,288 M134,282 L124,300', c.dark, 2.5)) + T.body(350, c.fill) +
    R(164, 228, 72, 28, 12, c.dark) + S('M176,232 L176,252 M188,232 L188,254 M200,232 L200,254 M212,232 L212,254 M224,232 L224,252', c.darker, 2) +
    [166, 200, 234].map(x => S(`M${x},262 q8,8 0,16 q-8,8 0,16 q8,8 0,16 q-8,8 0,16 q8,8 0,16`, c.dark, 3) + S(`M${x},262 q-8,8 0,16 q8,8 0,16 q-8,8 0,16 q8,8 0,16 q-8,8 0,16`, c.dark, 3)).join('') +
    P('M129,334 L271,334 L272,352 L128,352Z', c.dark, 3), { event: 'harvest', locked: 90, evColor: 'peach' }));
  TT.NECK.push(I('blanketscarf', 'Blanket scarf', c => P('M150,246 Q200,280 250,246 L230,318 Q200,330 170,318Z', c.fill) + S('M174,322 l-2,9 M186,326 l-1,9 M200,328 l0,9 M214,326 l1,9 M226,322 l2,9', OL, 3) +
    P('M132,236 Q200,266 268,236 L272,262 Q200,298 128,262Z', c.fill) + S('M140,250 Q200,276 260,250', c.dark, 2.5, 'stroke-dasharray="6 6"'), { event: 'harvest', locked: 75, evColor: 'strawberry' }));
  TT.HOLD.push(I('applepie', 'Apple pie', c => E(292, 344, 34, 10, '#ffffff') + P('M260,338 Q262,322 292,318 Q322,322 324,338 Q292,348 260,338Z', '#f2c07a') +
    S('M270,334 L300,322 M282,338 L312,324 M276,324 L306,340 M290,322 L316,334', '#d9944e', 3) + P('M258,338 Q292,352 326,338 L322,348 Q292,360 262,348Z', c.fill, 3) +
    S('M286,312 q-4,-8 0,-14 M298,312 q4,-8 0,-14', '#ffffff', 2.5, 'opacity=".9"'), { event: 'harvest', locked: 55, evColor: 'cloud' }));
  TT.PETS.push(I('squirrel', 'Nutmeg the squirrel', c => P('M86,424 Q118,410 112,374 Q108,346 86,350 Q102,366 92,384 Q84,398 78,410Z', '#d9945e') + S('M96,372 Q104,386 92,400', '#f3c494', 3) +
    E(64, 416, 20, 17, '#d9945e') + E(64, 420, 10, 10, '#ffe1c8', 0) + C(60, 392, 16, '#d9945e') + P('M48,382 L46,368 L56,378Z M70,378 L74,366 L76,382Z', '#d9945e', 3) +
    C(54, 390, 2.6, INK, 0) + C(66, 390, 2.6, INK, 0) + E(60, 397, 2.4, 1.8, INK, 0) + E(48, 396, 4, 2.5, '#ff9ec0', 0) +
    E(72, 414, 7, 8, '#c8996e', 2.5) + P('M64,410 Q72,402 80,410Z', '#8a6448', 2.5) + TT.heart(84, 372, 5, c.fill, 2), { event: 'harvest', locked: 105 }));
  TT.SCENES.push(I('harvestfarm', 'Harvest farm', () => bg('#ffe2b8') + C(80, 80, 34, '#ffe17a', 0) + C(80, 80, 48, '#ffe17a', 0, 'opacity=".35"') +
    P('M-10,290 Q100,240 210,286 Q300,252 410,280 L410,380 L-10,380Z', '#e8c27a', 0) + S('M-10,310 Q100,280 210,306 Q300,282 410,300', '#d9a86c', 4) +
    // red barn
    P('M250,180 L310,140 L370,180 L370,330 L250,330Z', '#e2667a', 3.5) + P('M240,184 L310,134 L380,184', 'none', 6) + R(286, 250, 48, 80, 4, '#fff3e4', 3) + S('M286,250 L334,330 M334,250 L286,330', '#e2667a', 3) +
    R(296, 176, 28, 24, 4, '#fff3e4', 3) + S('M310,176 L310,200 M296,188 L324,188', '#e2667a', 2) +
    // hay bales
    [[40, 320], [92, 330]].map(([x, y]) => R(x - 30, y - 22, 60, 44, 12, '#ffd27a', 3) + S(`M${x - 22},${y - 8} L${x + 22},${y - 8} M${x - 22},${y + 6} L${x + 22},${y + 6}`, '#e8b04e', 3)).join('') +
    // sunflowers
    [[150, 300], [178, 290], [206, 304]].map(([x, y]) => S(`M${x},${y} L${x},${y + 70}`, '#6bb27a', 5) + TT.flower(x, y, 16, '#ffcf3a', '#9c6f58', 2.5)).join('') +
    ground(366, '#c8a06a') + dots(911, 18, '#b88a56', 3, 5, 372, 460) + dots(912, 14, '#ff9f5a', 3, 5, 372, 460) +
    pumpkin(330, 414, 1.4) + pumpkin(370, 446, 0.9, '#ffc38a', false) + pumpkin(36, 440, 1, '#ffb36b', false) +
    leaf(120, 420, 20, '#ff9f5a') + leaf(260, 446, -30, '#ffcf5a') + leaf(200, 452, 60, '#ff7d6b')));

  /* ---------------- theme tags for event items ---------------- */
  Object.assign(TT.TAGS.hat, { pumpkinhat: 'spooky autumn party halloween', leafcrown: 'autumn nature harvest fairy' });
  Object.assign(TT.TAGS.top, { mummy: 'spooky halloween', chunkyknit: 'cozy autumn winter harvest' });
  Object.assign(TT.TAGS.back, { vampcape: 'spooky fancy halloween' });
  Object.assign(TT.TAGS.neck, { blanketscarf: 'cozy autumn winter harvest' });
  Object.assign(TT.TAGS.hold, { candybucket: 'spooky party food halloween', applepie: 'food chef autumn harvest' });
  Object.assign(TT.TAGS.pet, { jackpal: 'spooky autumn halloween', squirrel: 'autumn nature harvest' });
  Object.assign(TT.TAGS.scene, { pumpkinpatch: 'spooky autumn halloween party', harvestfarm: 'autumn nature garden harvest' });

  /* ---------------- event challenges ----------------
     These pay like regular challenges. The first time you get 4 stars or more on one during the
     event, you also win its prize item for free. */
  const tg = (tags, min, w, label, tip) => ({ type: 'tags', tags: tags.split(' '), min, w, label, tip });
  const sc = (tags, w, tip) => ({ type: 'scene', tags: tags.split(' '), w, tip });
  const dr = (w = 15) => ({ type: 'dressed', w, tip: 'Finish the outfit: a top, something on the bottom and shoes.' });
  TT.EVENT_CHALLENGES = {
    masquerade: [
      { id: 'ev-trickortreat', text: 'Join the trick-or-treat parade', prize: ['hat', 'pumpkinhat'], rules: [tg('halloween spooky', 2, 35, 'costume pieces', 'Wear a costume: a pumpkin hat, mummy wraps, a vampire cape or bat wings.'), { type: 'hold', tags: ['food', 'halloween'], w: 25, tip: 'Carry a candy pail to collect treats!' }, sc('halloween spooky', 20, 'Head to the pumpkin patch.'), dr(20)] },
      { id: 'ev-masqueball', text: 'Dance at the Monster Masquerade ball', prize: ['back', 'vampcape'], rules: [tg('spooky', 2, 30, 'spooky things', 'Monsters wear capes, masks and witch hats.'), tg('fancy', 2, 30, 'fancy things', 'It\'s a ball, so add fancy touches: a bow tie, pearls or a gown.'), { type: 'notStand', w: 15, tip: 'Strike a dance pose!' }, dr(25)] },
      { id: 'ev-pumpkinphoto', text: 'Pose for a pumpkin patch photo', prize: ['pet', 'jackpal'], rules: [sc('halloween', 30, 'Pick the pumpkin patch scene.'), { type: 'someColors', families: ['orange', 'purple', 'dark'], min: 3, w: 30, tip: 'Use pumpkin colors: orange, purple and midnight.' }, tg('halloween autumn', 1, 20, 'pumpkin things', 'Add something from the patch.'), dr(20)] }
    ],
    harvest: [
      { id: 'ev-harvestfest', text: 'Help out at the harvest festival', prize: ['hat', 'leafcrown'], rules: [tg('harvest autumn', 3, 40, 'harvest things', 'Try a leaf crown, a chunky sweater or a blanket scarf.'), sc('harvest autumn', 25, 'Head to the harvest farm or the autumn park.'), { type: 'someColors', families: ['orange', 'brown', 'yellow', 'red'], min: 2, w: 15, tip: 'Use leafy colors: orange, red, yellow or brown.' }, dr(20)] },
      { id: 'ev-cocoa', text: 'Cozy up with cocoa on a chilly day', prize: ['top', 'chunkyknit'], rules: [tg('cozy', 3, 45, 'cozy things', 'Bundle up: a chunky sweater, a scarf, slippers or a beanie.'), { type: 'hold', tags: ['food', 'cozy', 'sleepy'], w: 20, tip: 'Hold something warm and snuggly, like a teacup or a pie.' }, { type: 'eyes', ids: ['happy', 'sleepy', 'sparkle'], w: 15, tip: 'Make your critter look happy and cozy.' }, dr(20)] },
      { id: 'ev-feast', text: 'Bring a pie to the thankful feast', prize: ['pet', 'squirrel'], rules: [{ type: 'hold', tags: ['harvest', 'food'], w: 30, tip: 'Bring something yummy, like an apple pie.' }, tg('fancy harvest', 2, 30, 'nice things', 'Dress a little nice for the feast: a bow, a scarf or a sweater.'), sc('harvest autumn cozy', 20, 'The harvest farm is perfect.'), dr(20)] }
    ]
  };
  TT.eventChallenges = id => TT.EVENT_CHALLENGES[id] || [];
  /* event progress lives in progress.events: { [eventId]: { prizes: [challengeId…], stars: {challengeId: best} } } */
  TT.eventState = id => { const P = TT.progress; P.events = P.events || {}; return (P.events[id] = P.events[id] || { prizes: [], stars: {} }); };
  /* called after judging an event challenge; returns the prize item if one was just won */
  TT.eventJudged = function (ch, stars) {
    const ev = TT.currentEvent();
    if (!TT.eventChallenges(ev.id).includes(ch)) return null;
    const es = TT.eventState(ev.id);
    es.stars[ch.id] = Math.max(es.stars[ch.id] || 0, stars);
    let won = null;
    if (stars >= 4 && ch.prize && !es.prizes.includes(ch.id)) {
      es.prizes.push(ch.id);
      const [slot, id] = ch.prize;
      const it = TT.itemOf(slot, id);
      if (it && TT.isLocked(slot, it)) { TT.progress.unlocked.push(`${slot}:${id}`); won = { slot, item: it }; }
      else if (it) won = { slot, item: it, had: true };
    }
    TT.saveProgress();
    return won;
  };
  /* a thumbnail of an event item in its own nice color */
  TT.eventThumb = function (slot, it, look) {
    const s2 = JSON.parse(JSON.stringify(look));
    s2[slot] = Object.assign({}, s2[slot] || {}, { id: it.id, color: it.evColor || (s2[slot] && s2[slot].color) || 'bubblegum', color2: null, pattern: 'solid' });
    return TT.thumb(slot, it, s2);
  };
  TT.eventItems = ev => (ev.items || []).map(([slot, id]) => ({ slot, item: TT.itemOf(slot, id) })).filter(x => x.item);
})(window.TT);
