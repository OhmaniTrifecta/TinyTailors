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

  /* ---------- favorites ---------- */
  TT.isFav = (slot, id) => P.favs.includes(`${slot}:${id}`);
  TT.toggleFav = (slot, id) => { const k = `${slot}:${id}`; const i = P.favs.indexOf(k); i >= 0 ? P.favs.splice(i, 1) : P.favs.push(k); save(); return i < 0; };
})(window.TT);
