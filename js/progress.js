/* Tiny Tailors — stitches (the coins), unlocks, daily streaks, favorites and settings.
   Everything is saved on this device. */
(function (TT) {
  const KEY = 'tinytailors.progress';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const fresh = () => ({ stitches: 25, unlocked: [], daily: { date: '', best: 0 }, streak: 0, lastDaily: '', best: {}, perDay: {}, favs: [], fabrics: [], seen: {},
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
  TT.countUnlockables = function () {
    let total = 0, got = 0;
    const visit = (kind, list) => list.forEach(o => { if (o.locked) { total++; if (!TT.isLocked(kind, o)) got++; } });
    for (const [slot, S] of Object.entries(TT.SLOTS)) visit(slot, S.items);
    visit('color', TT.COLORS); visit('fur', TT.FUR); visit('pattern', TT.PATTERNS); visit('pose', TT.POSES);
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
  // challenge rewards: 3 stitches per star, only the improvement over today's best for that challenge
  TT.rewardChallenge = function (chId, stars, isDaily) {
    const day = TT.todayKey();
    const k = `${day}:${chId}`;
    const before = P.best[k] || 0;
    for (const kk of Object.keys(P.best)) if (!kk.startsWith(day)) delete P.best[kk];
    let earned = 0, streakUp = false;
    if (stars > before) { P.best[k] = stars; earned += (stars - before) * 3 * (isDaily ? 2 : 1); }
    if (isDaily && stars >= 3 && P.daily.date !== day) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yk = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      P.streak = P.lastDaily === yk ? P.streak + 1 : 1;
      P.lastDaily = day; P.daily = { date: day, best: stars };
      earned += Math.min(10, P.streak * 2);
      streakUp = true;
    }
    P.stitches += earned; save();
    return { earned, streak: P.streak, streakUp };
  };
  TT.dailyDone = () => P.daily.date === TT.todayKey();

  /* ---------- favorites ---------- */
  TT.isFav = (slot, id) => P.favs.includes(`${slot}:${id}`);
  TT.toggleFav = (slot, id) => { const k = `${slot}:${id}`; const i = P.favs.indexOf(k); i >= 0 ? P.favs.splice(i, 1) : P.favs.push(k); save(); return i < 0; };
})(window.TT);
