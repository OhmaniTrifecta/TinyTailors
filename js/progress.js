/* Tiny Tailors — stitches (the coins), unlocks, daily streaks, favorites and settings.
   Everything is saved on this device. */
(function (TT) {
  const KEY = 'tinytailors.progress';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const fresh = () => ({ stitches: 40, unlocked: [], daily: { date: '', best: 0 }, streak: 0, lastDaily: '', best: {}, perDay: {}, favs: [], fabrics: [], seen: {},
    settings: { sound: true, speak: false, calm: false, big: false } });
  const P = Object.assign(fresh(), load() || {});
  P.settings = Object.assign(fresh().settings, P.settings || {});
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { } };
  TT.progress = P;
  TT.saveProgress = save;

  /* ---------- unlocks ---------- */
  const key = (kind, id) => `${kind}:${id}`;
  TT.isLocked = (kind, obj) => !!(obj && obj.locked) && !P.unlocked.includes(key(kind, obj.id));
  TT.unlock = function (kind, obj) {
    if (!TT.isLocked(kind, obj)) return true;
    if (P.stitches < obj.locked) return false;
    P.stitches -= obj.locked;
    P.unlocked.push(key(kind, obj.id));
    save();
    return true;
  };
  /* lucky wheel: 10 spaces, each 1 in 10:
       the item · all your stitches back · half back · a free spin · 6 misses
     Refunds give back what that spin cost (a free spin cost nothing, so it refunds nothing).
     With refunds and free spins, winning takes about 7.65 spins' worth of stitches on average, so a spin
     costs about 16% of the item's price, and never so little that spinning beats just buying it.
     Only Rare items and up (SPIN_MIN_PRICE+) have a wheel.
     The result is decided (and saved) the moment you spin, so closing the window can't lose a prize. */
  TT.SPIN_MIN_PRICE = 80;
  TT.SPIN_SPACES = ['win', 'miss', 'refund', 'miss', 'again', 'miss', 'half', 'miss', 'miss', 'miss'];
  TT.spinCost = obj => {
    let c = Math.max(10, Math.round(obj.locked * 0.16 / 5) * 5);
    while (c * 7.65 <= obj.locked * 1.1) c += 5; // on average, always a bit more than buying
    return c;
  };
  TT.canWheel = obj => !!(obj && obj.locked >= TT.SPIN_MIN_PRICE);
  TT.freeSpins = () => P.freeSpins || 0;
  TT.spinFor = function (kind, obj) {
    const cost = TT.spinCost(obj);
    if (!TT.canWheel(obj) || !TT.isLocked(kind, obj)) return null;
    const free = (P.freeSpins || 0) > 0;
    if (!free && P.stitches < cost) return null;
    const paid = free ? 0 : cost;
    if (free) P.freeSpins--; else P.stitches -= cost;
    const space = Math.floor(Math.random() * TT.SPIN_SPACES.length);
    const outcome = TT.SPIN_SPACES[space];
    let back = 0;
    if (outcome === 'win') P.unlocked.push(key(kind, obj.id));
    if (outcome === 'refund') back = paid;
    if (outcome === 'half') back = Math.ceil(paid / 2);
    if (outcome === 'again') P.freeSpins = (P.freeSpins || 0) + 1;
    P.stitches += back;
    save();
    return { space, outcome, win: outcome === 'win', back, paid };
  };
  /* rarity tiers by price, shown on price tags and in the unlock window */
  TT.rarity = n => n >= 220 ? { id: 'legend', name: 'Legendary' } : n >= 150 ? { id: 'super', name: 'Super rare' } : n >= 80 ? { id: 'rare', name: 'Rare' } : { id: 'common', name: 'Common' };
  TT.countUnlockables = function () {
    let total = 0, got = 0;
    const visit = (kind, list) => list.forEach(o => { if (o.locked) { total++; if (!TT.isLocked(kind, o)) got++; } });
    for (const [slot, S] of Object.entries(TT.SLOTS)) visit(slot, S.items);
    visit('color', TT.COLORS); visit('fur', TT.FUR); visit('pattern', TT.PATTERNS);
    return { total, got };
  };

  /* ---------- earning stitches ---------- */
  TT.earn = function (n) { P.stitches += n; save(); return n; };
  // small daily rewards, e.g. first photo of the day
  TT.dailyBonus = function (what, n, maxPerDay = 1) {
    const day = TT.todayKey();
    const k = `${day}:${what}`;
    const used = P.perDay[k] || 0;
    if (used >= maxPerDay) return 0;
    P.perDay[k] = used + 1;
    // forget old days so storage stays small
    for (const kk of Object.keys(P.perDay)) if (!kk.startsWith(day)) delete P.perDay[kk];
    save();
    return TT.earn(n);
  };
  /* challenge rewards, with guards against spamming:
     - you must earn at least MIN_STARS stars (a score of 55+) to get anything
     - each challenge pays only once a day, and only for stars above your best today
     - regular challenges pay at most DAILY_CAP stitches a day (the daily challenge doesn't count toward it) */
  TT.MIN_STARS = 3;
  TT.MIN_SCORE = 55;
  TT.DAILY_CAP = 45;
  TT.challengeCapLeft = () => Math.max(0, TT.DAILY_CAP - (P.perDay[`${TT.todayKey()}:chcap`] || 0));
  TT.rewardChallenge = function (chId, stars, isDaily) {
    const day = TT.todayKey();
    const k = `${day}:${chId}`;
    for (const kk of Object.keys(P.best)) if (!kk.startsWith(day)) delete P.best[kk];
    for (const kk of Object.keys(P.perDay)) if (!kk.startsWith(day)) delete P.perDay[kk];
    const before = P.best[k] || 0;
    let earned = 0, streakUp = false, reason = null;
    if (stars < TT.MIN_STARS) reason = 'low';
    else if (stars <= before) reason = 'nobetter';
    else {
      const base = before >= TT.MIN_STARS ? before : 0;
      let pay = (stars - base) * 3 * (isDaily ? 2 : 1);
      if (!isDaily) {
        const left = TT.challengeCapLeft();
        if (left <= 0) { pay = 0; reason = 'cap'; }
        else if (pay > left) { pay = left; reason = 'capped'; }
        P.perDay[`${day}:chcap`] = (P.perDay[`${day}:chcap`] || 0) + pay;
      }
      P.best[k] = stars;
      earned += pay;
    }
    if (isDaily && stars >= TT.MIN_STARS && P.daily.date !== day) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yk = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      P.streak = P.lastDaily === yk ? P.streak + 1 : 1;
      P.lastDaily = day; P.daily = { date: day, best: stars };
      earned += Math.min(10, P.streak * 2);
      streakUp = true;
    }
    P.stitches += earned; save();
    return { earned, streak: P.streak, streakUp, reason, capLeft: TT.challengeCapLeft() };
  };
  TT.dailyDone = () => P.daily.date === TT.todayKey();

  /* mini-game rewards: each game pays up to GAME_EACH stitches a day, all games together up to GAME_CAP */
  TT.GAME_EACH = 12;
  TT.GAME_CAP = 40;
  TT.gameLeft = function (id) {
    const day = TT.todayKey();
    const all = P.perDay[`${day}:games`] || 0, one = P.perDay[`${day}:g-${id}`] || 0;
    return Math.max(0, Math.min(TT.GAME_EACH - one, TT.GAME_CAP - all));
  };
  TT.gamesLeftToday = () => Math.max(0, TT.GAME_CAP - (P.perDay[`${TT.todayKey()}:games`] || 0));
  TT.rewardGame = function (id, n) {
    n = Math.max(0, Math.round(n || 0));
    const day = TT.todayKey();
    for (const kk of Object.keys(P.perDay)) if (!kk.startsWith(day)) delete P.perDay[kk];
    const left = TT.gameLeft(id);
    const pay = Math.min(n, left);
    if (pay > 0) {
      P.perDay[`${day}:games`] = (P.perDay[`${day}:games`] || 0) + pay;
      P.perDay[`${day}:g-${id}`] = (P.perDay[`${day}:g-${id}`] || 0) + pay;
      P.stitches += pay;
    }
    save();
    return { earned: pay, reason: n > pay ? (pay ? 'capped' : 'cap') : null };
  };

  /* ---------- secret codes ----------
     Only scrambled (SHA-256) versions of the codes live here, so reading this file doesn't reveal them.
     Each code works once per device; redeemed codes are remembered in progress.codes. */
  const CODES = {
    'fbac01d514051220f0bba9851b896beadbc35d000e2bba534b6e0b3a13fc6905': { stitches: 100 },
    'a51a6c4012471ff411c5c35158020c874a5894a02d2bb09c454bc466d65ec6e8': { stitches: 100 },
    '8ba8444113bda17ffd81ea17ebb174cab8e990ae007890f992ec65e57a387da6': { stitches: 100 },
    'fa218879821a2eab19409d1791dc01b115af3256d9b7cacf1844a04e0d9ad9be': { stitches: 100 },
    'cff6f88510d5148db3a982c254f54374b260f4a38a98450c3779d69156c14f74': { stitches: 100 },
    '2aed3508c7b22a7c547d286750feeca81bbe542a3b1554b468e313e8ffaf78a0': { stitches: 100 },
    '664bb195ce3b655ceac3b28d70d8e3b16052d69e5c99bea75bebddbd7dc95898': { stitches: 100 },
    'ce448ef1dff0ecc0fc1780c64174659f0835244df6d7fa6093bc91216a58aeec': { stitches: 100 },
    'd44af9ff23da940c2a92d496439698e7e2826a548928e8967b75b6f9d76a6aaa': { stitches: 100 },
    'e0d4060201318b8598e0ae6ec4b5864307ba79b9678760f38d81bd18f678b017': { stitches: 100 },
    '2b5905ff86cae665e2e7a4b332580309465407279eae46dde8bd68c4cc584c65': { all: true }
  };
  // tiny SHA-256 (works everywhere, even where crypto.subtle isn't available)
  function sha256(str) {
    const K = [], H = [];
    let n = 2, c = 0;
    const frac = x => ((x - Math.floor(x)) * 4294967296) >>> 0;
    while (c < 64) { let p = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) { if (c < 8) H[c] = frac(Math.pow(n, 1 / 2)); K[c++] = frac(Math.pow(n, 1 / 3)); } n++; }
    const bytes = unescape(encodeURIComponent(str)).split('').map(ch => ch.charCodeAt(0));
    const bitLen = bytes.length * 8;
    bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bitLen >>> (i * 8)) & 255);
    const rotr = (x, s) => (x >>> s) | (x << (32 - s));
    for (let o = 0; o < bytes.length; o += 64) {
      const w = [];
      for (let i = 0; i < 16; i++) w[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let [a, b, cc, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & cc) ^ (b & cc))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = cc; cc = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, cc, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }
  TT.unlockEverything = function () {
    let n = 0;
    const visit = (kind, list) => list.forEach(o => { if (o.locked && TT.isLocked(kind, o)) { P.unlocked.push(key(kind, o.id)); n++; } });
    for (const [slot, S] of Object.entries(TT.SLOTS)) visit(slot === 'animal' ? 'animal' : slot, S.items);
    visit('color', TT.COLORS); visit('fur', TT.FUR); visit('pattern', TT.PATTERNS);
    save();
    return n;
  };
  /* returns { ok, stitches } or { ok, all, count } or { error: 'bad' | 'used' } */
  TT.redeemCode = function (text) {
    const word = String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!word) return { error: 'bad' };
    const h = sha256('tinytailors-secret:' + word);
    const prize = CODES[h];
    if (!prize) return { error: 'bad' };
    P.codes = P.codes || [];
    if (P.codes.includes(h)) return { error: 'used' };
    P.codes.push(h);
    if (prize.all) { const count = TT.unlockEverything(); return { ok: true, all: true, count }; }
    P.stitches += prize.stitches; save();
    return { ok: true, stitches: prize.stitches };
  };

  /* ---------- favorites ---------- */
  TT.isFav = (slot, id) => P.favs.includes(`${slot}:${id}`);
  TT.toggleFav = (slot, id) => { const k = `${slot}:${id}`; const i = P.favs.indexOf(k); i >= 0 ? P.favs.splice(i, 1) : P.favs.push(k); save(); return i < 0; };
})(window.TT);
