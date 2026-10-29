/* Tiny Tailors — interactive scenes.
   Tap a scene and it reacts (bubbles under the sea, snow puffs, popping flowers…).
   Every scene also hides a tiny friend somewhere. Find them all for the sticker album! */
(function (TT) {
  const { C, E, P, S, R, OL, INK } = TT;
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
  const CONF = ['#ff9ec0', '#ffe17a', '#9ee6c0', '#9cd3ff', '#cfa8ff', '#ffb38a'];

  /* which kind of tap reaction a scene gets, from its theme tags */
  const KINDS = [
    ['sea', 'bubbles'], ['beach', 'splash'], ['winter', 'snow'], ['halloween', 'bats'], ['spooky', 'bats'], ['space', 'stars'], ['harvest', 'leaves'], ['autumn', 'leaves'],
    ['party', 'confetti'], ['food', 'candy'], ['music', 'notes'], ['rainbow', 'rainbow'], ['magic', 'sparkle'], ['garden', 'flowers'], ['spring', 'flowers'], ['nature', 'flowers'],
    ['sleepy', 'zzz'], ['cozy', 'hearts'], ['rainy', 'rain'], ['fancy', 'sparkle']
  ];
  TT.tapKind = function (sceneId) {
    const tags = (((TT.TAGS.scene || {})[sceneId]) || '').split(' ');
    for (const [t, k] of KINDS) if (tags.includes(t)) return k;
    return 'sparkle';
  };
  const bit = (x, y, dx, dy, d, inner, delay = 0, spin = 0) =>
    `<g class="tfx" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--rot:${spin}deg;animation-duration:${d}s;animation-delay:${delay}s"><g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${inner}</g></g>`;
  /* the little burst of things that appears where you tapped (SVG markup) */
  TT.tapBurst = function (kind, x, y) {
    let s = '';
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.6, r = 30 + Math.random() * 30;
      const dx = Math.cos(a) * r, dy = Math.sin(a) * r;
      const col = CONF[i % CONF.length], k = 0.7 + Math.random() * 0.6;
      switch (kind) {
        case 'bubbles': s += bit(x, y, dx * 0.4, -60 - Math.random() * 60, 1.4, `<circle r="${(5 + 6 * k).toFixed(1)}" fill="#e6f6ff" fill-opacity=".5" stroke="#fff" stroke-width="2.5"/>`, i * 0.04); break;
        case 'splash': s += bit(x, y, dx, -30 - Math.random() * 40, 0.9, E(0, 0, 4 * k, 7 * k, '#9cd3ff', 2), 0); break;
        case 'snow': s += bit(x, y, dx, dy, 1.2, C(0, 0, 3 + 4 * k, '#ffffff', 2) + S('M-4,0 L4,0 M0,-4 L0,4', '#cfe3ff', 1.5)); break;
        case 'bats': if (i < 3) s += bit(x, y, dx * 1.5, -50 - i * 20, 1.4, P('M0,0 q-10,-10 -22,-4 q6,4 4,10 q8,-6 18,-2z M0,0 q10,-10 22,-4 q-6,4 -4,10 q-8,-6 -18,-2z', '#5a4a8a', 2) + C(0, 2, 5, '#5a4a8a', 2) + C(-2, 1, 1, '#fff', 0) + C(2, 1, 1, '#fff', 0), i * 0.08); break;
        case 'stars': s += bit(x, y, dx, dy, 1.1, TT.star(0, 0, 6 * k + 3, i % 2 ? '#fff3a8' : '#ffffff', 2), 0, 90); break;
        case 'leaves': s += bit(x, y, dx, dy + 30, 1.4, P('M0,0 q8,-10 16,0 q-8,10 -16,0z', ['#ff9f5a', '#ffcf5a', '#ff7d6b'][i % 3], 2), 0, 200); break;
        case 'confetti': s += bit(x, y, dx * 1.2, dy * 1.2, 1.1, R(-3, -6, 6, 12, 2, col, 0), 0, 300); break;
        case 'candy': s += bit(x, y, dx, dy, 1.1, C(0, 0, 6, col, 2) + P('M-6,0 l-6,-4 l0,8z M6,0 l6,-4 l0,8z', col, 2), 0, 180); break;
        case 'notes': if (i < 4) s += bit(x, y, dx * 0.6, -50 - i * 14, 1.4, S('M0,0 L0,-16 L9,-19', col, 3) + E(-4, 0, 6, 4.5, col, 2), i * 0.07); break;
        case 'rainbow': s += bit(x, y, dx, dy, 1.1, TT.star(0, 0, 5 * k + 2, col, 1.5, 0.4, 4), 0, 90); break;
        case 'flowers': s += bit(x, y, dx * 0.8, dy * 0.8 - 10, 1.2, TT.flower(0, 0, 8 * k, ['#ffffff', '#ff9ec0', '#ffe17a', '#cfa8ff'][i % 4], '#ffb347', 2)); break;
        case 'zzz': if (i < 3) s += bit(x, y, 20 + i * 10, -40 - i * 18, 1.5, `<text font-family="Sniglet, sans-serif" font-weight="800" font-size="${18 + i * 4}" fill="#9cd3ff" stroke="${OL}" stroke-width="1.5">z</text>`, i * 0.15); break;
        case 'hearts': s += bit(x, y, dx * 0.7, -40 - Math.random() * 30, 1.2, TT.heart(0, 0, 6 * k + 2, col, 2)); break;
        case 'rain': s += bit(x, y, dx * 0.3, 40 + Math.random() * 20, 0.9, P('M0,-8 Q5,0 0,4 Q-5,0 0,-8Z', '#9cd3ff', 1.5)); break;
        default: s += bit(x, y, dx, dy, 1, TT.star(0, 0, 5 * k + 2, i % 2 ? '#fff3a8' : '#ffffff', 1.5, 0.35, 4), 0, 90);
      }
    }
    return `<g class="tap-burst" pointer-events="none">${s}</g>`;
  };

  /* ---------------- hidden friends ---------------- */
  // places a friend can hide: corners and edges, away from where the critter stands
  // (not bottom-left, where the pet sits, or bottom-right, where the full-screen button is)
  const SPOTS = [[38, 70], [362, 64], [30, 210], [372, 196], [110, 52], [292, 46], [26, 330], [376, 322], [140, 444], [262, 446]];
  const FRIENDS = [
    { name: 'a peeking mouse', draw: () => C(-12, -14, 8, '#d8cce6', 3) + C(12, -14, 8, '#d8cce6', 3) + C(-12, -14, 4, '#ffc4d6', 0) + C(12, -14, 4, '#ffc4d6', 0) + E(0, 0, 16, 14, '#e9e0f2', 3) + C(-5, -2, 2.2, INK, 0) + C(5, -2, 2.2, INK, 0) + C(0, 4, 2.6, '#ff8fb1', 0) },
    { name: 'a ladybug', draw: () => C(0, -12, 7, '#5b4a66', 3) + E(0, 2, 15, 13, '#ff6f86', 3) + S('M0,-10 L0,15', OL, 2.5) + C(-6, 0, 3, '#4b3a50', 0) + C(6, 4, 3, '#4b3a50', 0) + C(-3, -13, 1.4, '#fff', 0) + C(3, -13, 1.4, '#fff', 0) },
    { name: 'a star friend', draw: () => TT.star(0, 0, 18, '#ffe17a', 3) + C(-5, -2, 2, INK, 0) + C(5, -2, 2, INK, 0) + S('M-3,4 Q0,7 3,4', OL, 2) },
    { name: 'a snail', draw: () => P('M-20,10 Q-18,0 -8,0 L18,1 Q22,10 14,11 L-18,12Z', '#ffd8b8', 3) + C(4, -4, 12, '#cfa8ff', 3) + S('M4,-4 m-6,0 a6,6 0 1,1 6,6', '#9b7fd6', 2.5) + S('M-12,0 L-16,-12 M-7,0 L-7,-12', OL, 2) + C(-16, -13, 2.2, INK, 0) + C(-7, -13, 2.2, INK, 0) },
    { name: 'a tiny ghost', draw: () => P('M-14,10 Q-14,-16 0,-16 Q14,-16 14,10 L9,6 L4,10 L0,6 L-4,10 L-9,6Z', '#ffffff', 3) + C(-5, -4, 2, INK, 0) + C(5, -4, 2, INK, 0) + E(-9, 2, 3, 2, '#ff9ec0', 0) + E(9, 2, 3, 2, '#ff9ec0', 0) },
    { name: 'a little chick', draw: () => C(0, 0, 14, '#ffe27a', 3) + C(-4, -3, 2, INK, 0) + C(5, -3, 2, INK, 0) + P('M-2,1 L4,0 L1,5Z', '#ffa23f', 1.5) + P('M-4,-14 Q0,-20 4,-14', 'none', 2.5) },
    { name: 'a shiny gem', draw: () => P('M0,-16 L14,-4 L0,16 L-14,-4Z', '#9cd3ff', 3) + P('M0,-16 L6,-4 L0,16 L-6,-4Z', '#cfeaff', 0) + S('M-14,-4 L14,-4', OL, 2) + C(4, -9, 2, '#fff', 0) }
  ];
  TT.sceneSecret = function (sceneId) {
    const h = hash('secret:' + sceneId);
    const [x, y] = SPOTS[h % SPOTS.length];
    const f = FRIENDS[(h >>> 8) % FRIENDS.length];
    return { x, y, friend: f };
  };
  TT.secretFound = id => !!((TT.progress.album || {}).secrets || {})[id];
  /* tap at (x,y) on scene `id`: returns { burst, secret: {x,y,friend,isNew}|null } */
  TT.sceneTap = function (sceneId, x, y) {
    const sec = TT.sceneSecret(sceneId);
    let found = null;
    if (Math.hypot(x - sec.x, y - sec.y) < 36) {
      const A = TT.progress.album = TT.progress.album || {};
      A.secrets = A.secrets || {};
      const isNew = !A.secrets[sceneId];
      A.secrets[sceneId] = 1; TT.saveProgress();
      found = Object.assign({ isNew }, sec);
    }
    return { burst: TT.tapBurst(TT.tapKind(sceneId), x, y), secret: found };
  };
  TT.secretArt = sec => `<g class="secret-pop" pointer-events="none" transform="translate(${sec.x} ${sec.y})"><g class="secret-in">${sec.friend.draw()}</g></g>`;
  TT.secretCount = () => { const s = (TT.progress.album || {}).secrets || {}; return { got: TT.SCENES.filter(x => s[x.id]).length, total: TT.SCENES.length }; };
})(window.TT);
