/* Tiny Tailors — the critter house.
   Decorate rooms with furniture, wallpaper and floors, then invite your saved critters to live there.
   Drag anything to move it. Tap something to pick it: then paint it, flip it, resize it or put it away.
   Furniture costs stitches (buy it once, place as many as you like). Some pieces are gifts from your
   tailor career, and event furniture can only be bought during its month. */
(function (TT) {
  const { P, C, E, S, R, OL, INK, SYM } = TT;
  const PR = TT.progress;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const sh = (c, t) => TT.shade(c, t), ti = (c, t) => TT.tint(c, t);
  const GOLD = '#ffd84d';
  const PAINT = ['#ff9ec0', '#9ee6c0', '#9cd3ff', '#ffe17a', '#cfa8ff', '#ffb38a', '#fffdf9', '#b88a6e'];

  /* furniture: drawn around (0,0). Floor things stand on y=0; wall things are centered on (0,0).
     F(id, name, price, layer, tags, draw(color), hit box [x, y, w, h], extra) */
  const F = (id, name, price, layer, tags, draw, box, o = {}) => Object.assign({ id, name, price, layer, tags, draw, box }, o);
  const FURN = [
    F('bed', 'Comfy bed', 0, 'floor', 'sleepy cozy', c => R(-66, -78, 18, 78, 8, '#d9a074', 3) + R(-60, -34, 126, 34, 8, '#d9a074', 3) + R(-54, -46, 118, 18, 9, '#fffdf9', 3) + R(-28, -54, 92, 28, 12, c, 3) + S('M-20,-40 L56,-40', sh(c, 0.2), 2.5) + E(-36, -52, 16, 9, '#ffffff', 3) + C(66, -2, 5, '#b98a6d', 2) + C(-62, -2, 5, '#b98a6d', 2), [-70, -82, 140, 84]),
    F('rug', 'Round rug', 0, 'rug', 'cozy', c => E(0, 0, 70, 20, c, 3) + E(0, 0, 50, 13, ti(c, 0.45), 0) + E(0, 0, 26, 6, c, 0), [-70, -20, 140, 40]),
    F('lamp', 'Floor lamp', 0, 'floor', 'cozy', c => S('M0,0 L0,-84', OL, 4) + E(0, -2, 16, 5, '#b98a6d', 3) + P('M-20,-84 L20,-84 L12,-112 L-12,-112Z', c, 3) + C(0, -76, 5, '#fff3a8', 0, 'opacity=".8"'), [-22, -114, 44, 116]),
    F('plant', 'Potted plant', 0, 'floor', 'garden nature', c => P('M-16,0 L16,0 L20,-26 L-20,-26Z', c, 3) + R(-22, -30, 44, 8, 3, sh(c, 0.15), 3) + P('M0,-30 Q-26,-52 -18,-74 Q-4,-56 0,-30Z M0,-30 Q22,-58 14,-80 Q2,-60 0,-30Z M0,-30 Q-6,-64 4,-88 Q10,-62 0,-30Z', '#7fcf8f', 3), [-24, -90, 48, 92]),
    F('table', 'Little table', 0, 'floor', 'food', c => R(-44, -48, 88, 12, 6, c, 3) + R(-36, -38, 8, 38, 3, sh(c, 0.2), 3) + R(28, -38, 8, 38, 3, sh(c, 0.2), 3) + E(-10, -52, 10, 4, '#fffdf9', 2.5) + C(16, -56, 6, '#ff9ec0', 2), [-46, -60, 92, 62]),
    F('chair', 'Chair', 0, 'floor', 'school', c => R(-18, -70, 8, 70, 3, sh(c, 0.2), 3) + R(-18, -70, 36, 10, 4, c, 3) + R(-20, -34, 40, 10, 4, c, 3) + R(12, -26, 6, 26, 2, sh(c, 0.2), 3), [-22, -72, 44, 74]),
    F('window', 'Window', 0, 'wall', 'nature', c => R(-44, -40, 88, 80, 10, '#cfeaff', 4) + C(20, -14, 10, '#ffe17a', 0) + C(-18, 14, 9, '#ffffff', 0) + C(-6, 10, 11, '#ffffff', 0) + S('M0,-40 L0,40 M-44,0 L44,0', c, 5) + P('M-52,-46 Q-40,0 -52,46 L-40,46 Q-30,0 -40,-46Z M52,-46 Q40,0 52,46 L40,46 Q30,0 40,-46Z', c, 3), [-54, -48, 108, 96]),
    F('painting', 'Heart painting', 0, 'wall', 'fancy art', c => R(-34, -26, 68, 52, 6, '#d9a074', 4) + R(-26, -18, 52, 36, 3, '#fffdf9', 3) + TT.heart(0, 0, 12, c, 2.5), [-36, -28, 72, 56]),
    F('sofa', 'Squishy sofa', 30, 'floor', 'cozy', c => R(-74, -56, 148, 40, 18, c, 3) + R(-82, -38, 24, 38, 10, sh(c, 0.12), 3) + R(58, -38, 24, 38, 10, sh(c, 0.12), 3) + R(-58, -30, 116, 22, 8, ti(c, 0.3), 3) + S('M0,-28 L0,-10', sh(c, 0.2), 2.5) + C(-30, -44, 9, '#fffdf9', 2.5) + R(-66, -6, 8, 8, 2, '#b98a6d', 2) + R(58, -6, 8, 8, 2, '#b98a6d', 2), [-84, -58, 168, 60]),
    F('armchair', 'Armchair', 20, 'floor', 'cozy', c => R(-34, -62, 68, 40, 16, c, 3) + R(-42, -40, 18, 38, 8, sh(c, 0.12), 3) + R(24, -40, 18, 38, 8, sh(c, 0.12), 3) + R(-26, -30, 52, 20, 7, ti(c, 0.3), 3), [-44, -64, 88, 66]),
    F('rugrect', 'Striped rug', 15, 'rug', 'cozy', c => R(-70, -18, 140, 36, 8, c, 3) + S('M-50,-18 L-50,18 M-20,-18 L-20,18 M10,-18 L10,18 M40,-18 L40,18', ti(c, 0.5), 6), [-70, -18, 140, 36]),
    F('bookshelf', 'Bookshelf', 35, 'floor', 'school', c => R(-40, -118, 80, 118, 6, c, 3) + S('M-40,-80 L40,-80 M-40,-42 L40,-42', sh(c, 0.25), 4) +
      [['#ff9ec0', -32], ['#9cd3ff', -22], ['#ffe17a', -12], ['#9ee6c0', 0], ['#cfa8ff', 10]].map(([col, x], i) => R(x, -112 + (i % 2) * 4, 9, 30 - (i % 2) * 4, 2, col, 2.5) + R(x + 2, -74 + (i % 3) * 3, 9, 30 - (i % 3) * 3, 2, PAINT[(i + 2) % 6], 2.5)).join('') + C(24, -24, 8, '#ffb38a', 2.5), [-42, -120, 84, 122]),
    F('dresser', 'Dresser', 30, 'floor', 'fancy', c => R(-46, -70, 92, 66, 8, c, 3) + R(-40, -62, 80, 24, 5, ti(c, 0.25), 2.5) + R(-40, -34, 80, 24, 5, ti(c, 0.25), 2.5) + C(0, -50, 3.5, GOLD, 2) + C(0, -22, 3.5, GOLD, 2) + R(-42, -6, 8, 6, 2, '#b98a6d', 2) + R(34, -6, 8, 6, 2, '#b98a6d', 2) + E(24, -76, 12, 6, '#fffdf9', 2.5) + C(-22, -80, 8, '#9cd3ff', 2.5), [-48, -88, 96, 90]),
    F('toybox', 'Toy box', 25, 'floor', 'party', c => R(-38, -44, 76, 44, 8, c, 3) + R(-42, -54, 84, 14, 6, sh(c, 0.15), 3) + TT.star(0, -24, 10, '#ffe17a', 2.5) + C(-24, -60, 10, '#9cd3ff', 2.5) + R(14, -70, 16, 18, 3, '#ff9ec0', 2.5), [-44, -72, 88, 74]),
    F('teddy', 'Big teddy', 15, 'floor', 'sleepy cozy', c => C(-14, -46, 9, c, 3) + C(14, -46, 9, c, 3) + E(0, -18, 22, 20, c, 3) + C(0, -40, 18, c, 3) + E(0, -35, 8, 6, ti(c, 0.5), 0) + C(-6, -42, 2.2, INK, 0) + C(6, -42, 2.2, INK, 0) + C(0, -36, 2.4, INK, 0) + TT.heart(0, -14, 6, '#ff6f96', 2), [-26, -58, 52, 60]),
    F('piano', 'Piano', 60, 'floor', 'music fancy', c => R(-60, -84, 120, 62, 10, c, 3) + R(-54, -46, 108, 16, 2, '#fffdf9', 2.5) + [-44, -28, -12, 12, 28, 44].map(x => R(x - 3, -46, 6, 9, 1, INK, 0)).join('') + R(-56, -24, 8, 24, 2, sh(c, 0.3), 2.5) + R(48, -24, 8, 24, 2, sh(c, 0.3), 2.5) + S('M-30,-70 l0,-10 l8,-3 M-10,-66 l0,-12', '#fffdf9', 2.5), [-62, -86, 124, 88]),
    F('fishtank', 'Fish tank', 45, 'floor', 'sea', c => R(-40, -16, 80, 16, 4, '#b98a6d', 3) + R(-42, -76, 84, 60, 8, '#cfeaff', 3, 'fill-opacity=".85"') + P('M-38,-30 Q-20,-36 0,-30 Q20,-24 38,-30 L38,-20 L-38,-20Z', '#e8d8a8', 0) + P('M-10,-52 Q4,-62 16,-52 Q4,-42 -10,-52Z M-12,-52 L-20,-58 L-20,-46Z', c, 2.5) + C(10, -54, 1.6, INK, 0) + S('M-28,-22 Q-34,-40 -26,-56 M28,-22 Q32,-36 26,-48', '#7fcf8f', 3) + C(22, -66, 3, '#fff', 1.5), [-44, -78, 88, 80]),
    F('fireplace', 'Fireplace', 70, 'floor', 'cozy winter', c => R(-62, -100, 124, 100, 6, c, 3) + R(-70, -108, 140, 14, 5, sh(c, 0.2), 3) + P('M-34,0 L-34,-50 Q0,-76 34,-50 L34,0Z', '#5b3f58', 3) + P('M-16,0 Q-20,-24 -4,-40 Q0,-24 8,-34 Q20,-16 14,0Z', '#ffb347', 2.5) + P('M-6,0 Q-8,-14 2,-22 Q8,-10 6,0Z', '#ffe17a', 0) + C(-40, -116, 7, '#ff9ec0', 2) + R(28, -126, 14, 18, 3, '#9ee6c0', 2), [-72, -128, 144, 130]),
    F('stove', 'Little stove', 40, 'floor', 'chef food', c => R(-38, -70, 76, 70, 8, c, 3) + R(-28, -48, 56, 36, 6, '#5b3f58', 3) + C(-18, -62, 4, '#fffdf9', 2) + C(0, -62, 4, '#fffdf9', 2) + C(18, -62, 4, '#fffdf9', 2) + R(-20, -94, 40, 22, 6, '#c9cede', 3) + S('M-12,-100 q4,-6 0,-12 M8,-100 q4,-6 0,-12', '#ffffff', 2.5), [-40, -112, 80, 114]),
    F('fridge', 'Fridge', 40, 'floor', 'food chef', c => R(-30, -130, 60, 130, 10, c, 3) + S('M-30,-84 L30,-84', sh(c, 0.25), 3) + R(18, -120, 5, 24, 2, '#c9cede', 2) + R(18, -72, 5, 24, 2, '#c9cede', 2) + TT.heart(-10, -108, 6, '#ff6f96', 2) + TT.star(-8, -60, 7, '#ffe17a', 2), [-32, -132, 64, 134]),
    F('cake', 'Cake stand', 20, 'floor', 'food party', c => S('M0,0 L0,-30', OL, 4) + E(0, -2, 14, 4, '#c9cede', 2.5) + E(0, -32, 26, 5, '#fffdf9', 3) + R(-20, -62, 40, 28, 8, c, 3) + P('M-20,-56 q5,8 10,0 q5,8 10,0 q5,8 10,0 q5,8 10,0', 'none', 0) + S('M-20,-54 q5,8 10,0 q5,8 10,0 q5,8 10,0 q5,8 10,0', '#fffdf9', 3) + C(0, -68, 6, '#ff5c7a', 2.5), [-28, -76, 56, 78]),
    F('easel', 'Art easel', 30, 'floor', 'art school', c => S('M-24,0 L0,-100 L24,0 M0,-100 L0,0', '#b98a6d', 5) + R(-34, -96, 68, 56, 4, '#fffdf9', 3) + C(-12, -74, 9, c, 0) + C(8, -64, 7, '#9cd3ff', 0) + S('M-24,-52 Q0,-60 24,-50', '#ffe17a', 4), [-36, -102, 72, 104]),
    F('telescope', 'Telescope', 50, 'floor', 'space science', c => S('M-22,0 L0,-40 L22,0 M0,-40 L0,0', OL, 4) + R(-40, -66, 70, 20, 10, c, 3, TT.rot(-28, 0, -50)) + TT.star(36, -100, 7, '#ffe17a', 2), [-42, -108, 84, 110]),
    F('tent', 'Play tent', 45, 'floor', 'adventure nature', c => P('M-64,0 L0,-96 L64,0Z', c, 3) + P('M-14,0 L0,-60 L14,0Z', '#5b3f58', 3) + S('M0,-96 L0,-110', OL, 3) + P('M0,-110 L16,-104 L0,-98Z', '#ffe17a', 2) + S('M-40,-36 L-28,-54 M40,-36 L28,-54', ti(c, 0.4), 4), [-66, -112, 132, 114]),
    F('beanbag', 'Beanbag', 20, 'floor', 'cozy', c => P('M-38,0 Q-46,-42 -8,-50 Q30,-56 38,-18 Q40,0 30,0Z', c, 3) + S('M-20,-30 Q0,-40 18,-28', ti(c, 0.4), 4), [-44, -54, 86, 56]),
    F('horse', 'Rocking horse', 35, 'floor', 'party', c => S('M-40,0 Q0,16 40,0', '#b98a6d', 6) + S('M-24,0 L-18,-30 M24,0 L18,-30', '#b98a6d', 5) + E(0, -38, 30, 14, c, 3) + P('M20,-46 L34,-78 L50,-70 L40,-44Z', c, 3) + C(42, -70, 2.4, INK, 0) + P('M30,-76 Q24,-90 36,-86Z', sh(c, 0.3), 2) + S('M-28,-42 q-10,-4 -12,8', sh(c, 0.3), 4), [-44, -90, 98, 94]),
    F('flowerbed', 'Flower bed', 15, 'floor', 'garden spring', c => R(-46, -16, 92, 16, 6, '#b98a6d', 3) + [-32, -12, 10, 30].map((x, i) => S(`M${x},-16 L${x},-38`, '#6bb27a', 3) + TT.flower(x, -42, 10, i % 2 ? c : '#ffffff', '#ffe17a', 2)).join(''), [-48, -54, 96, 56]),
    F('tree', 'Little tree', 30, 'floor', 'nature garden', c => R(-8, -50, 16, 50, 5, '#c69c7a', 3) + C(0, -80, 34, '#9ad98f', 3) + C(-24, -60, 20, '#9ad98f', 3) + C(24, -60, 20, '#9ad98f', 3) + C(-12, -84, 5, c, 2) + C(14, -70, 5, c, 2) + C(4, -100, 5, c, 2), [-46, -116, 92, 118]),
    F('pond', 'Lily pond', 35, 'rug', 'sea nature garden', c => E(0, 0, 70, 22, '#9cd3ff', 3) + E(-6, -2, 50, 12, '#b8e2ff', 0) + E(-30, 2, 12, 5, '#7fcf8f', 2.5) + E(26, -4, 10, 4, '#7fcf8f', 2.5) + TT.flower(26, -8, 6, c, '#ffe17a', 1.5), [-70, -22, 140, 44]),
    F('bench', 'Garden bench', 20, 'floor', 'garden', c => R(-52, -40, 104, 10, 4, c, 3) + R(-52, -62, 104, 10, 4, c, 3) + R(-46, -30, 8, 30, 3, '#b98a6d', 3) + R(38, -30, 8, 30, 3, '#b98a6d', 3), [-54, -64, 108, 66]),
    F('fountain', 'Fountain', 80, 'floor', 'royal fancy', c => E(0, -8, 56, 14, c, 3) + R(-56, -20, 112, 14, 6, c, 3) + R(-8, -66, 16, 48, 4, ti(c, 0.3), 3) + E(0, -66, 26, 7, c, 3) + S('M-6,-74 Q-20,-92 -32,-66 M6,-74 Q20,-92 32,-66', '#9cd3ff', 4) + E(0, -18, 46, 5, '#9cd3ff', 0), [-58, -94, 116, 96]),
    F('mushroom', 'Mushroom stool', 15, 'floor', 'fairy garden', c => R(-10, -26, 20, 26, 6, '#fff3e4', 3) + P('M-30,-24 Q-30,-56 0,-56 Q30,-56 30,-24Z', c, 3) + C(-12, -40, 5, '#fff', 2) + C(10, -46, 4, '#fff', 2), [-32, -58, 64, 60]),
    F('throne', 'Royal throne', 120, 'floor', 'royal fancy', c => P('M-40,-130 L-26,-110 L-12,-134 L0,-110 L12,-134 L26,-110 L40,-130 L40,-50 L-40,-50Z', GOLD, 3) + R(-32, -112, 64, 60, 10, c, 3) + R(-50, -60, 100, 24, 8, GOLD, 3) + R(-42, -40, 84, 16, 6, c, 3) + R(-44, -24, 10, 24, 3, GOLD, 3) + R(34, -24, 10, 24, 3, GOLD, 3) + C(0, -88, 7, '#ff6f96', 2.5), [-52, -136, 104, 138]),
    F('clock', 'Wall clock', 15, 'wall', 'school', c => C(0, 0, 28, c, 4) + C(0, 0, 21, '#fffdf9', 3) + S('M0,0 L0,-14 M0,0 L10,4', OL, 3) + C(0, 0, 2.5, OL, 0), [-30, -30, 60, 60]),
    F('wallshelf', 'Plant shelf', 20, 'wall', 'garden nature', c => R(-50, 10, 100, 10, 4, '#d9a074', 3) + P('M-36,10 L-20,10 L-22,-6 L-34,-6Z', c, 2.5) + P('M-28,-6 Q-40,-22 -32,-32 Q-26,-18 -28,-6Z M-28,-6 Q-16,-26 -20,-34 Q-28,-20 -28,-6Z', '#7fcf8f', 2.5) + R(4, -16, 12, 26, 2, '#9cd3ff', 2.5) + R(18, -10, 12, 20, 2, '#ffe17a', 2.5) + C(40, 2, 7, '#ff9ec0', 2.5), [-52, -36, 104, 58]),
    F('lights', 'String lights', 20, 'wall', 'party cozy', c => S('M-90,-6 Q-45,16 0,-2 Q45,16 90,-6', OL, 2.5) + [-74, -48, -22, 6, 32, 58, 82].map((x, i) => C(x, (i % 2 ? 8 : 4), 6, [c, '#ffe17a', '#9ee6c0', '#9cd3ff'][i % 4], 2.5)).join(''), [-92, -12, 184, 30]),
    F('mirror', 'Fancy mirror', 25, 'wall', 'fancy', c => E(0, 0, 30, 42, c, 4) + E(0, 0, 22, 34, '#e6f6ff', 3) + S('M-8,-18 L4,-26 M-10,-6 L8,-20', '#ffffff', 3), [-32, -44, 64, 88]),
    F('poster', 'Star poster', 10, 'wall', 'space rock', c => R(-26, -34, 52, 68, 4, c, 3) + TT.star(0, -6, 16, '#ffe17a', 2.5) + S('M-14,20 L14,20', '#fffdf9', 4), [-28, -36, 56, 72]),
    F('curtains', 'Curtains', 15, 'wall', 'cozy fancy', c => R(-62, -50, 124, 8, 4, '#b98a6d', 3) + P('M-58,-44 Q-40,0 -52,46 L-28,46 Q-30,0 -20,-44Z M58,-44 Q40,0 52,46 L28,46 Q30,0 20,-44Z', c, 3), [-64, -52, 128, 100]),
    // event furniture (only for sale during its month)
    F('jacko', 'Jack-o\'-lantern', 25, 'floor', 'spooky halloween autumn', c => E(-14, -24, 18, 22, '#ffa05c', 3) + E(14, -24, 18, 22, '#ffa05c', 3) + E(0, -24, 18, 24, '#ffa05c', 3) + S('M0,-48 L4,-58', '#6bb27a', 4) + P('M-12,-30 l6,-8 l6,8z M4,-30 l6,-8 l6,8z', '#ffe17a', 2) + P('M-12,-18 Q0,-6 12,-18 L8,-14 L4,-18 L0,-13 L-4,-18 L-8,-14Z', '#ffe17a', 2), [-34, -60, 68, 62], { event: 'masquerade' }),
    F('haybale', 'Hay bale & pumpkins', 25, 'floor', 'harvest autumn nature', c => R(-44, -40, 88, 40, 10, '#ffd27a', 3) + S('M-36,-26 L36,-26 M-36,-12 L36,-12', '#e8b04e', 3) + E(-20, -52, 14, 12, '#ffa05c', 3) + E(16, -50, 10, 9, '#ffc38a', 3) + S('M-20,-62 L-18,-70', '#6bb27a', 3), [-46, -72, 92, 74], { event: 'harvest' }),
    // gifts from your tailor career (can't be bought)
    F('portrait', 'Duchess\'s portrait', null, 'wall', 'royal fancy', c => R(-34, -40, 68, 80, 6, GOLD, 4) + R(-26, -32, 52, 64, 3, '#efe4ff', 3) + C(0, -6, 16, '#fffaf5', 3) + P('M-14,-16 L-14,-30 L-4,-20Z M14,-16 L14,-30 L4,-20Z', '#fffaf5', 3) + P('M-12,-26 L-8,-36 L0,-30 L8,-36 L12,-26Z', GOLD, 2) + R(-16, 10, 32, 18, 8, '#cfa8ff', 3), [-36, -42, 72, 84], { gift: 1 }),
    F('shipwheel', 'Captain\'s wheel', null, 'wall', 'sea pirate', c => C(0, 0, 30, 'none', 6) + C(0, 0, 30, 'none', 0) + S([0, 45, 90, 135].map(a => { const r = a * Math.PI / 180; return `M${(-40 * Math.cos(r)).toFixed(1)},${(-40 * Math.sin(r)).toFixed(1)} L${(40 * Math.cos(r)).toFixed(1)},${(40 * Math.sin(r)).toFixed(1)}`; }).join(' '), '#b98a6d', 6) + C(0, 0, 28, 'none', 0) + `<circle r="28" fill="none" stroke="#c69c7a" stroke-width="8"/>` + C(0, 0, 8, GOLD, 3), [-42, -42, 84, 84], { gift: 1 }),
    F('lamp2', 'Professor\'s lamp', null, 'floor', 'school detective', c => E(0, -2, 18, 5, '#5b3f58', 3) + S('M0,-2 L0,-60 L24,-80', OL, 4) + P('M14,-86 L42,-74 L36,-62 L10,-74Z', '#9ee6c0', 3) + C(30, -66, 6, '#fff3a8', 0, 'opacity=".8"'), [-20, -90, 66, 92], { gift: 1 }),
    F('record', 'Golden record', null, 'wall', 'music rock', c => R(-36, -36, 72, 72, 6, '#fffdf9', 4) + C(0, 0, 26, GOLD, 3) + C(0, 0, 18, 'none', 0) + `<circle r="18" fill="none" stroke="#e8b33a" stroke-width="2"/>` + C(0, 0, 6, '#ff6f96', 2), [-38, -38, 76, 76], { gift: 1 }),
    F('lilychair', 'Lily pad chair', null, 'floor', 'garden nature', c => S('M0,0 L0,-24', '#6bb27a', 6) + E(0, -28, 40, 12, '#7fcf8f', 3) + P('M0,-28 L30,-36 L26,-24Z', '#9ad98f', 0) + TT.flower(-22, -40, 9, '#ffc4d9', '#ffe17a', 2), [-42, -52, 84, 54], { gift: 1 }),
    F('starjar', 'Jar of starlight', null, 'floor', 'magic space', c => R(-20, -52, 40, 52, 10, '#e6f6ff', 3, 'fill-opacity=".85"') + R(-16, -60, 32, 10, 3, '#cfa8ff', 3) + TT.star(-4, -28, 8, '#ffe17a', 2) + TT.star(8, -14, 5, '#fff', 1.5) + TT.star(6, -40, 4, '#ff9ec0', 1.5), [-22, -62, 44, 64], { gift: 1 }),
    F('trophy1', 'Bronze trophy', null, 'floor', 'sporty hero', c => R(-18, -12, 36, 12, 3, '#b98a6d', 3) + R(-4, -30, 8, 18, 2, '#d99a6e', 2.5) + P('M-20,-62 L20,-62 Q20,-32 0,-30 Q-20,-32 -20,-62Z', '#d99a6e', 3) + S('M-20,-56 q-12,2 -8,14 M20,-56 q12,2 8,14', '#d99a6e', 3.5), [-30, -64, 60, 66], { gift: 1 }),
    F('trophy2', 'Silver trophy', null, 'floor', 'sporty hero', c => R(-20, -12, 40, 12, 3, '#b98a6d', 3) + R(-4, -32, 8, 20, 2, '#cfd5e3', 2.5) + P('M-24,-70 L24,-70 Q24,-34 0,-32 Q-24,-34 -24,-70Z', '#cfd5e3', 3) + S('M-24,-62 q-14,2 -10,16 M24,-62 q14,2 10,16', '#cfd5e3', 3.5) + TT.star(0, -52, 7, '#fff', 2), [-36, -72, 72, 74], { gift: 1 }),
    F('trophy3', 'Golden trophy', null, 'floor', 'royal hero', c => R(-22, -12, 44, 12, 3, '#b98a6d', 3) + R(-5, -34, 10, 22, 2, GOLD, 2.5) + P('M-28,-80 L28,-80 Q28,-36 0,-34 Q-28,-36 -28,-80Z', GOLD, 3) + S('M-28,-72 q-16,2 -12,18 M28,-72 q16,2 12,18', GOLD, 3.5) + TT.star(0, -58, 9, '#fff3a8', 2), [-42, -82, 84, 84], { gift: 1 })
  ];
  const furn = id => FURN.find(f => f.id === id);
  // owned if bought, won on the lucky wheel, or a gift
  const ownsF = f => (PR.house && PR.house.owned || []).includes(f.id) || f.price === 0 || PR.unlocked.includes('furn:' + f.id);
  const furnBox = f => `${f.box[0] - 6} ${f.box[1] - 6} ${Math.max(f.box[2], f.box[3]) + 12} ${Math.max(f.box[2], f.box[3]) + 12}`;
  const furnPreview = f => TT.svg(f.draw(PAINT[0]), furnBox(f));
  const CR_S = 0.3; // critters in the house are drawn at this size

  const WALLS = [
    { id: 'pink', name: 'Strawberry', col: '#ffe2ea' }, { id: 'mint', name: 'Mint', col: '#dff5ea' }, { id: 'sky', name: 'Sky', col: '#e0efff' }, { id: 'butter', name: 'Butter', col: '#fff3cf' },
    { id: 'lilac', name: 'Lilac', col: '#efe4ff' }, { id: 'peach', name: 'Peach', col: '#ffe6d6' }, { id: 'cream', name: 'Cream', col: '#fff8ec' }, { id: 'night', name: 'Starry night', col: '#4b4370' }
  ];
  const WALL_PATS = ['plain', 'stripes', 'dots', 'hearts', 'stars'];
  const FLOORS = [
    { id: 'wood', name: 'Wood', col: '#f3d3b8', line: '#e3b896' }, { id: 'tile', name: 'Checks', col: '#fffdf9', line: '#ffc4d6' }, { id: 'pinkcarpet', name: 'Pink carpet', col: '#ffc4d6', line: '#ffb3c8' },
    { id: 'bluecarpet', name: 'Blue carpet', col: '#bfe0ff', line: '#a8d0f5' }, { id: 'grass', name: 'Grass', col: '#b6e8a8', line: '#9ad98f' }, { id: 'marble', name: 'Marble', col: '#eef0f6', line: '#d8dce8' }
  ];
  const ROOMS = [
    { id: 'bedroom', name: 'Bedroom', price: 0, wall: 'pink', floor: 'wood', start: [['bed', 270, 262], ['rug', 160, 268], ['lamp', 60, 250], ['window', 120, 90]] },
    { id: 'living', name: 'Living room', price: 0, wall: 'butter', floor: 'wood', start: [['table', 200, 266], ['chair', 130, 262], ['plant', 330, 254], ['painting', 200, 86]] },
    { id: 'garden', name: 'Garden', price: 0, wall: 'sky', floor: 'grass', outdoor: true, start: [['plant', 80, 258]] },
    { id: 'kitchen', name: 'Kitchen', price: 60, wall: 'mint', floor: 'tile', start: [] },
    { id: 'playroom', name: 'Playroom', price: 90, wall: 'lilac', floor: 'bluecarpet', start: [] },
    { id: 'loft', name: 'Star loft', price: 150, wall: 'night', floor: 'pinkcarpet', start: [] }
  ];
  TT.HOUSE = { FURN, ROOMS };

  /* ---------------- state ---------------- */
  function H() {
    const h = PR.house = PR.house || {};
    h.owned = h.owned || FURN.filter(f => f.price === 0).map(f => f.id);
    h.rooms = h.rooms || {};
    h.open = h.open || ROOMS.filter(r => !r.price).map(r => r.id);
    ROOMS.forEach(r => { if (r.price && !h.open.includes(r.id) && PR.unlocked.includes('room:' + r.id)) h.open.push(r.id); });
    ROOMS.forEach(r => { if (h.open.includes(r.id) && !h.rooms[r.id]) h.rooms[r.id] = { wall: r.wall, pat: 'plain', floor: r.floor, items: r.start.map(([f, x, y]) => ({ f, x, y, s: 1, flip: 0, c: 0 })), critters: [] }; });
    h.cur = h.cur && h.rooms[h.cur] ? h.cur : 'bedroom';
    return h;
  }
  const save = () => TT.saveProgress();
  TT.houseStats = function () {
    const h = H(), rs = Object.entries(h.rooms);
    const start = id => (ROOMS.find(r => r.id === id) || { start: [] }).start.length;
    return {
      items: rs.reduce((n, [id, r]) => n + Math.max(0, r.items.length - start(id)), 0),
      critters: rs.reduce((n, [, r]) => n + r.critters.length, 0),
      party: rs.some(([, r]) => r.critters.length >= 4),
      painted: rs.some(([id, r]) => { const d = ROOMS.find(x => x.id === id); return d && r.wall !== d.wall && r.floor !== d.floor; }),
      rooms: h.open.length
    };
  };
  TT.houseGift = function (id) { const h = H(); if (!h.owned.includes(id) && furn(id)) { h.owned.push(id); save(); } };

  /* ---------------- drawing ---------------- */
  function wallSVG(r, def) {
    const w = WALLS.find(x => x.id === r.wall) || WALLS[0];
    const fl = FLOORS.find(x => x.id === r.floor) || FLOORS[0];
    const dark = w.id === 'night';
    let s = `<rect x="-10" y="-10" width="420" height="320" fill="${w.col}"/>`;
    const acc = dark ? '#5e5588' : TT.shade(w.col, 0.06);
    if (def.outdoor && r.wall === def.wall) s += C(330, 60, 30, '#ffe17a', 0) + C(90, 60, 14, '#fff', 0) + C(108, 54, 18, '#fff', 0) + C(126, 62, 12, '#fff', 0);
    else if (r.pat === 'stripes') for (let x = 10; x < 400; x += 40) s += S(`M${x},0 L${x},196`, acc, 14);
    else if (r.pat === 'dots') { for (let y = 20; y < 190; y += 34) for (let x = (y / 34) % 2 ? 20 : 37; x < 400; x += 34) s += C(x, y, 4, acc, 0); }
    else if (r.pat === 'hearts') { for (let y = 26; y < 190; y += 44) for (let x = (y / 44) % 2 ? 24 : 46; x < 400; x += 44) s += TT.heart(x, y, 6, acc, 0); }
    else if (r.pat === 'stars') { for (let y = 26; y < 190; y += 44) for (let x = (y / 44) % 2 ? 24 : 46; x < 400; x += 44) s += TT.star(x, y, 7, dark ? '#fff3a8' : acc, 0); }
    if (dark) s += TT.star(60, 40, 6, '#fff3a8', 0) + TT.star(330, 70, 5, '#fff3a8', 0);
    if (def.outdoor && r.floor === 'grass') s += P('M-10,196 Q100,170 200,190 Q300,172 410,192 L410,310 L-10,310Z', fl.col, 0) + S('M-10,196 Q100,170 200,190 Q300,172 410,192', fl.line, 4);
    else {
      s += R(-10, 196, 420, 120, 0, fl.col, 0);
      if (fl.id === 'wood') for (let i = 0; i < 9; i++) s += S(`M${-10 + i * 52},196 L${-40 + i * 52},310`, fl.line, 3);
      else if (fl.id === 'tile') { for (let y = 196; y < 300; y += 26) for (let x = ((y - 196) / 26) % 2 ? 0 : 26; x < 400; x += 52) s += R(x, y, 26, 26, 0, fl.line, 0, 'opacity=".55"'); }
      else if (fl.id === 'marble') s += S('M20,230 Q80,220 120,250 M240,214 Q300,240 380,226 M140,284 Q200,270 260,290', fl.line, 3);
      else s += TT.S('M-10,206 L410,206', fl.line, 3);
      s += S('M-10,196 L410,196', TT.shade(fl.col, 0.15), 5);
    }
    return s;
  }
  const itemSVG = (it, i, on) => {
    const f = furn(it.f); if (!f) return '';
    const col = PAINT[(it.c || 0) % PAINT.length];
    const [bx, by, bw, bh] = f.box;
    return `<g class="ho-it" data-hk="f" data-hi="${i}" transform="translate(${it.x} ${it.y}) scale(${it.flip ? -it.s : it.s} ${it.s})">${on ? `<rect x="${bx - 6}" y="${by - 6}" width="${bw + 12}" height="${bh + 12}" rx="12" fill="none" stroke="#ff6f96" stroke-width="${3 / it.s}" stroke-dasharray="7 5"/>` : ''}<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="transparent"/>${f.draw(col)}</g>`;
  };
  const critterSVG = (cr, i, on, pfx) => {
    const st = TT.app ? TT.app.sanitize(cr.look) : cr.look;
    const body = TT.compose(st, { pfx: `${pfx}${i}-`, animated: true, scene: false, pet: false, fx: false });
    return `<g class="ho-cr" data-hk="c" data-hi="${i}" transform="translate(${cr.x} ${cr.y}) scale(${cr.flip ? -CR_S : CR_S} ${CR_S})">${on ? `<rect x="-190" y="-430" width="380" height="460" rx="40" fill="none" stroke="#ff6f96" stroke-width="12" stroke-dasharray="26 20"/>` : ''}<rect x="-160" y="-420" width="320" height="440" fill="transparent"/><g class="ho-bob"><g transform="translate(-200 -420)">${body}</g></g></g>`;
  };
  function roomSVG(room, sel, pfx = 'hr-') {
    const h = H(), r = h.rooms[room], def = ROOMS.find(x => x.id === room);
    let s = wallSVG(r, def);
    const order = ['wall', 'rug', 'floor'];
    order.forEach(layer => r.items.forEach((it, i) => { const f = furn(it.f); if (f && f.layer === layer) s += itemSVG(it, i, sel && sel.k === 'f' && sel.i === i); }));
    r.critters.forEach((cr, i) => { s += critterSVG(cr, i, sel && sel.k === 'c' && sel.i === i, pfx); });
    return s;
  }
  TT.houseRoomPreview = def => TT.svg(wallSVG({ wall: def.wall, pat: 'plain', floor: def.floor }, def), '0 0 400 300');
  TT.houseRoomSVG = room => TT.svg(roomSVG(room, null, 'hp-'), '0 0 400 300');

  /* ---------------- the house screen ---------------- */
  let shell = null, sel = null, panel = 'furniture', drag = null, say = null;
  const SND = () => TT.Sound;
  TT.openHouse = function (sh2) { shell = sh2; sel = null; draw(); };

  function draw() {
    shell.go(draw);
    const h = H(), room = h.cur, r = h.rooms[room];
    shell.setBar('Critter house', `<span class="g-pill">${TT.SPOOL}${PR.stitches}</span>`);
    shell.body().innerHTML = `<div class="ho">
      <div class="ho-rooms" role="tablist">${ROOMS.map(rm => { const open = h.open.includes(rm.id); return `<button class="ho-room${open ? '' : ' locked'}" type="button" data-room="${rm.id}" aria-selected="${rm.id === room}">${esc(rm.name)}${open ? '' : ` <span class="price r-common">${TT.SPOOL}${rm.price}</span>`}</button>`; }).join('')}</div>
      <div class="ho-stage"><svg id="hoSvg" viewBox="0 0 400 300" role="img" aria-label="${esc(ROOMS.find(x => x.id === room).name)}">${roomSVG(room, sel)}</svg>
        <div class="ho-say" id="hoSay" hidden></div>
        <div class="ho-tools${sel && sel.k === 'c' ? ' for-critter' : ''}" id="hoTools"${sel ? '' : ' hidden'}><button class="mini" type="button" data-ht="paint" aria-label="Change color">🎨</button><button class="mini" type="button" data-ht="flip" aria-label="Flip">⇆</button>
          <button class="mini" type="button" data-ht="smaller" aria-label="Smaller">−</button><button class="mini" type="button" data-ht="bigger" aria-label="Bigger">+</button>
          <button class="mini" type="button" data-ht="front" aria-label="Move in front or behind">⇅</button><button class="mini" type="button" data-ht="del" aria-label="Put away">🗑</button></div></div>
      <div class="ho-panel-tabs" role="tablist"><button class="mini" type="button" data-hp="furniture">🛋️ Furniture</button><button class="mini" type="button" data-hp="walls">🎨 Walls & floors</button><button class="mini" type="button" data-hp="critters">🐾 Critters</button></div>
      <div class="ho-panel" id="hoPanel"></div>
      <p class="ho-msg" id="hoMsg" role="status" aria-live="polite"></p></div>`;
    drawPanel();
    bindStage();
  }
  const msg = t => { const m = shell.body().querySelector('#hoMsg'); if (m) m.textContent = t; };
  function redrawRoom() {
    const svg = shell.body().querySelector('#hoSvg'); if (!svg) return;
    svg.innerHTML = roomSVG(H().cur, sel);
    const tools = shell.body().querySelector('#hoTools');
    tools.hidden = !sel;
    tools.classList.toggle('for-critter', !!sel && sel.k === 'c');
  }
  function drawPanel() {
    const h = H(), r = h.rooms[h.cur];
    shell.body().querySelectorAll('[data-hp]').forEach(b => b.setAttribute('aria-pressed', b.dataset.hp === panel));
    const box = shell.body().querySelector('#hoPanel');
    if (panel === 'furniture') {
      const list = FURN.filter(f => !f.gift || ownsF(f)).filter(f => !f.event || ownsF(f) || TT.eventOpen(f.event));
      box.innerHTML = `<div class="ho-grid">${list.map(f => { const own = ownsF(f); return `<button class="ho-f${own ? '' : ' shop'}" type="button" data-hf="${f.id}" aria-label="${esc(f.name)}${own ? '' : `, ${f.price} stitches`}">
        ${TT.svg(f.draw(PAINT[0]), furnBox(f))}<span>${esc(f.name)}</span>${own ? '' : `<em class="price r-${TT.rarity(f.price).id}">${TT.SPOOL}${f.price}</em>`}${f.event ? `<i class="ev-badge">${TT.eventById(f.event).emoji}</i>` : ''}</button>`; }).join('')}</div>`;
    } else if (panel === 'walls') {
      box.innerHTML = `<div class="row-label">Wallpaper</div><div class="swatches">${WALLS.map(w => `<button class="swatch" type="button" data-hw="${w.id}" style="background:${w.col}" aria-label="${esc(w.name)}" aria-pressed="${r.wall === w.id}"></button>`).join('')}</div>
        <div class="row-label">Pattern</div><div class="ho-pats">${WALL_PATS.map(p => `<button class="mini" type="button" data-hpat="${p}" aria-pressed="${r.pat === p}">${p[0].toUpperCase() + p.slice(1)}</button>`).join('')}</div>
        <div class="row-label">Floor</div><div class="swatches">${FLOORS.map(f => `<button class="swatch" type="button" data-hfl="${f.id}" style="background:${f.col}" aria-label="${esc(f.name)}" aria-pressed="${r.floor === f.id}"></button>`).join('')}</div>`;
    } else {
      const looks = shell.ctx.closet().slice(0, 30);
      const me = shell.ctx.look();
      box.innerHTML = `<p class="modal-sub">Invite critters to live in this room (up to 6). Tap one in the room to say hi!</p>
        <div class="ho-grid">${[me].concat(looks).map((lk, i) => `<button class="ho-f" type="button" data-hc="${i}" aria-label="Invite ${esc(lk.name || 'this critter')}">${TT.svg(TT.compose(lk, { pfx: `hc${i}-`, animated: false, scene: false, pet: false, fx: false }), '40 0 320 440')}<span>${esc(lk.name || 'No name')}${i === 0 ? ' (now)' : ''}</span></button>`).join('')}</div>
        ${looks.length ? '' : '<p class="modal-sub">Save looks in the studio (the ♥ Save look button) to invite more critters.</p>'}`;
    }
  }
  function bindStage() {
    const b = shell.body();
    b.querySelectorAll('[data-room]').forEach(x => x.addEventListener('click', () => {
      const h = H(), id = x.dataset.room, def = ROOMS.find(r => r.id === id);
      if (!h.open.includes(id)) {
        if (PR.stitches < def.price) { msg(`The ${def.name.toLowerCase()} costs ${def.price} stitches. You need ${def.price - PR.stitches} more.`); SND().undo(); return; }
        // rooms unlock with the same unlock window (and lucky wheel) as the wardrobe
        const obj = { id, name: def.name, locked: def.price };
        if (TT.isLocked('room', obj)) {
          const open = () => { if (!h.open.includes(id)) h.open.push(id); h.cur = id; sel = null; save(); H(); SND().cheer(); TT.albumPing && TT.albumPing(); };
          TT.app.askUnlock('room', obj, () => { open(); draw(); }, TT.houseRoomPreview(def), { wearLabel: 'Go to the room!', onClose: () => { if (!TT.isLocked('room', obj)) open(); draw(); } });
          return;
        }
        h.open.push(id); save(); H(); TT.albumPing && TT.albumPing();
      }
      h.cur = id; sel = null; save(); SND().tap(); draw();
    }));
    b.querySelectorAll('[data-hp]').forEach(x => x.addEventListener('click', () => { panel = x.dataset.hp; SND().tap(); drawPanel(); }));
    b.querySelector('#hoPanel').addEventListener('click', e => {
      const h = H(), r = h.rooms[h.cur];
      const fb = e.target.closest('[data-hf]');
      if (fb) {
        const f = furn(fb.dataset.hf);
        if (!ownsF(f)) {
          // same unlock window (and lucky wheel for Rare things, 80+) as the wardrobe
          const obj = { id: f.id, name: f.name, locked: f.price };
          TT.app.askUnlock('furn', obj, () => { place(f); }, furnPreview(f), { wearLabel: 'Put it in the room!', onClose: () => { draw(); } });
          return;
        }
        place(f);
        return;
      }
      function place(f) {
        const h = H(), r = h.rooms[h.cur];
        if (!h.owned.includes(f.id)) h.owned.push(f.id);
        if (r.items.length >= 30) { draw(); msg('This room is full! Put something away first.'); return; }
        const y = f.layer === 'wall' ? 90 + Math.random() * 30 : f.layer === 'rug' ? 250 + Math.random() * 20 : 230 + Math.random() * 50;
        r.items.push({ f: f.id, x: Math.round(80 + Math.random() * 240), y: Math.round(y), s: 1, flip: 0, c: 0 });
        sel = { k: 'f', i: r.items.length - 1 }; save(); SND().pop(); draw(); msg(`Drag the ${f.name.toLowerCase()} where you want it.`); TT.albumPing && TT.albumPing();
      }
      const w = e.target.closest('[data-hw]'); if (w) { r.wall = w.dataset.hw; save(); SND().swatch(); redrawRoom(); drawPanel(); TT.albumPing && TT.albumPing(); return; }
      const pt = e.target.closest('[data-hpat]'); if (pt) { r.pat = pt.dataset.hpat; save(); SND().swatch(); redrawRoom(); drawPanel(); return; }
      const fl = e.target.closest('[data-hfl]'); if (fl) { r.floor = fl.dataset.hfl; save(); SND().swatch(); redrawRoom(); drawPanel(); TT.albumPing && TT.albumPing(); return; }
      const cb = e.target.closest('[data-hc]');
      if (cb) {
        if (r.critters.length >= 6) { msg('Six critters is a full room! Tap one and put it away to make space.'); SND().undo(); return; }
        const i = +cb.dataset.hc;
        const lk = i === 0 ? shell.ctx.look() : shell.ctx.closet()[i - 1];
        const look = clone(lk); look.petPos = null;
        r.critters.push({ look, x: Math.round(90 + Math.random() * 220), y: Math.round(250 + Math.random() * 30), flip: 0 });
        sel = { k: 'c', i: r.critters.length - 1 }; save(); SND().sparkle(); redrawRoom();
        msg(`${look.name || 'Your critter'} moved in!`); TT.albumPing && TT.albumPing();
      }
    });
    b.querySelector('#hoTools').addEventListener('click', e => {
      const t = e.target.closest('[data-ht]'); if (!t || !sel) return;
      const h = H(), r = h.rooms[h.cur];
      const list = sel.k === 'f' ? r.items : r.critters, it = list[sel.i]; if (!it) return;
      const k = t.dataset.ht;
      if (k === 'paint' && sel.k === 'f') it.c = ((it.c || 0) + 1) % PAINT.length;
      if (k === 'flip') it.flip = it.flip ? 0 : 1;
      if (k === 'bigger' && sel.k === 'f') it.s = Math.min(2, +(it.s * 1.15).toFixed(2));
      if (k === 'smaller' && sel.k === 'f') it.s = Math.max(0.5, +(it.s / 1.15).toFixed(2));
      if (k === 'front') {
        // things only overlap others on the same layer (wall, rug or floor), so front/back is within that layer
        const layerOf = x => sel.k === 'c' ? 'c' : (furn(x.f) || {}).layer;
        const same = list.map((x, i) => i).filter(i => layerOf(list[i]) === layerOf(it));
        const name = sel.k === 'c' ? (it.look.name || 'Your critter') : furn(it.f).name;
        if (same.length < 2) msg(sel.k === 'c' ? 'Front/back moves critters in front of or behind other critters.' : `Nothing to move in front of. Front/back works when ${furn(it.f).layer === 'wall' ? 'wall things' : furn(it.f).layer === 'rug' ? 'rugs' : 'furniture pieces'} overlap.`);
        else if (sel.i === same[same.length - 1]) { list.unshift(list.splice(sel.i, 1)[0]); sel.i = 0; msg(`${name} moved to the back.`); }
        else { list.push(list.splice(sel.i, 1)[0]); sel.i = list.length - 1; msg(`${name} moved to the front.`); }
      }
      if (k === 'del') { list.splice(sel.i, 1); sel = null; SND().undo(); }
      else SND().tap();
      save(); redrawRoom();
    });
    // drag things around the room
    const svg = b.querySelector('#hoSvg');
    const toSvg = ev => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    svg.addEventListener('pointerdown', ev => {
      const g = ev.target.closest && ev.target.closest('[data-hk]');
      if (!g) { if (sel) { sel = null; redrawRoom(); } return; }
      ev.preventDefault();
      const h = H(), r = h.rooms[h.cur];
      const k = g.dataset.hk, i = +g.dataset.hi, it = (k === 'f' ? r.items : r.critters)[i];
      const p = toSvg(ev);
      drag = { k, i, dx: it.x - p.x, dy: it.y - p.y, moved: false, sx: p.x, sy: p.y, g };
      svg.setPointerCapture(ev.pointerId);
    });
    svg.addEventListener('pointermove', ev => {
      if (!drag) return;
      const h = H(), r = h.rooms[h.cur], list = drag.k === 'f' ? r.items : r.critters, it = list[drag.i];
      const p = toSvg(ev);
      if (!drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) < 4) return;
      drag.moved = true;
      const f = drag.k === 'f' ? furn(it.f) : null;
      const minY = f ? (f.layer === 'wall' ? 30 : 200) : 214;
      const maxY = f && f.layer === 'wall' ? 170 : 300;
      it.x = Math.round(Math.max(10, Math.min(390, p.x + drag.dx))); it.y = Math.round(Math.max(minY, Math.min(maxY, p.y + drag.dy)));
      const s = drag.k === 'f' ? it.s : CR_S;
      drag.g.setAttribute('transform', `translate(${it.x} ${it.y}) scale(${it.flip ? -s : s} ${s})`);
    });
    const end = () => {
      if (!drag) return;
      const d = drag; drag = null;
      const h = H();
      if (d.moved) { save(); sel = { k: d.k, i: d.i }; redrawRoom(); return; }
      // a tap: pick it (and critters say something)
      sel = { k: d.k, i: d.i }; redrawRoom(); SND().pop();
      if (d.k === 'c') talk(h.rooms[h.cur].critters[d.i]);
    };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', () => { drag = null; });
  }
  /* critters chat about the room: they notice furniture they love */
  function talk(cr) {
    const h = H(), r = h.rooms[h.cur];
    const op = TT.opinionOf(cr.look.animal.id);
    const loved = r.items.map(it => furn(it.f)).filter(f => f && f.tags.split(' ').some(t => op.loves.includes(t)));
    const name = cr.look.name || 'Your critter';
    const lines = loved.length ? [`I love the ${loved[0].name.toLowerCase()}!`, `This ${loved[Math.floor(Math.random() * loved.length)].name.toLowerCase()} is my favorite thing in the house!`]
      : [`Can we get some ${TT.THEME_WORD[op.loves[0]]} in here?`, 'Home sweet home!', `I wish we had ${TT.THEME_WORD[op.loves[1]]}…`, 'This room is so cozy!'];
    if (r.critters.length >= 3) lines.push('It\'s a party! 🎉');
    const box = shell.body().querySelector('#hoSay');
    if (!box) return;
    box.hidden = false;
    box.innerHTML = `<b>${esc(name)}:</b> ${esc(lines[Math.floor(Math.random() * lines.length)])}`;
    clearTimeout(say); say = setTimeout(() => { if (box.isConnected) box.hidden = true; }, 2600);
    const g = shell.body().querySelector(`.ho-cr[data-hi="${r.critters.indexOf(cr)}"] .ho-bob`);
    if (g) { g.classList.remove('hop'); void g.getBoundingClientRect(); g.classList.add('hop'); }
  }
})(window.TT);
