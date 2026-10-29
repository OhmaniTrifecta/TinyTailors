/* Tiny Tailors — the sticker album.
   Pages fill up with stickers as you play: critters you dress, critters you make super happy,
   things you wear, games, challenges, scene secrets, your tailor career, your critter house and
   each monthly event. A full page pays a one-time stitch prize. */
(function (TT) {
  const P = TT.progress;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const A = () => { const a = P.album = P.album || {}; ['animals', 'happy', 'worn', 'games', 'ch', 'secrets', 'claimed'].forEach(k => { a[k] = a[k] || {}; }); a.known = a.known || []; return a; };
  const clone = o => JSON.parse(JSON.stringify(o));
  const WEAR = ['hair', 'top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold', 'pet', 'scene', 'fx'];

  /* ---------------- tracking ---------------- */
  TT.albumTrackLook = function (st) {
    const a = A();
    let changed = false;
    if (st.animal && st.animal.id && !a.animals[st.animal.id]) { a.animals[st.animal.id] = 1; changed = true; }
    for (const slot of WEAR) {
      const e = st[slot]; if (!e || !e.id) continue;
      const w = a.worn[slot] = a.worn[slot] || {};
      if (!w[e.id]) { w[e.id] = 1; changed = true; }
    }
    if (TT.happiness && st.animal && !a.happy[st.animal.id] && TT.happiness(st).super) { a.happy[st.animal.id] = 1; changed = true; }
    if (changed) { TT.saveProgress(); TT.albumPing(); }
  };
  // games and challenges: remember the best stars
  const rg = TT.rewardGame;
  TT.rewardGame = function (id, stars) {
    const r = rg(id, stars);
    const a = A();
    if ((TT.GAME_LIST || []).some(g => g.id === id) && stars > (a.games[id] || 0)) { a.games[id] = stars; TT.saveProgress(); TT.albumPing(); }
    return r;
  };
  const rc = TT.rewardChallenge;
  TT.rewardChallenge = function (chId, stars, daily) {
    const r = rc(chId, stars, daily);
    const a = A();
    if (stars > (a.ch[chId] || 0)) { a.ch[chId] = stars; TT.saveProgress(); TT.albumPing(); }
    return r;
  };

  /* ---------------- sticker art ---------------- */
  let baseLook = null;
  const look = () => {
    if (!baseLook) {
      baseLook = TT.app ? clone(TT.app.state) : null;
      if (baseLook) ['top', 'bottom', 'shoes', 'hat', 'hair', 'face', 'neck', 'back', 'hold', 'pet'].forEach(s => { baseLook[s].color = 'bubblegum'; baseLook[s].color2 = null; baseLook[s].pattern = 'solid'; });
    }
    return baseLook;
  };
  const thumb = (slot, id) => { const it = TT.itemOf(slot, id); return it && look() ? TT.thumb(slot, it, look()) : ''; };
  const critterArt = id => { const st = look(); if (!st) return ''; const s2 = clone(st); s2.animal = { id, color: 'natural' }; return TT.thumb('animal', TT.animalById(id), s2); };
  const badge = (inner, bgc = '#ffe17a') => TT.svg(TT.C(50, 50, 40, bgc, 5) + inner, '0 0 100 100');
  const numArt = (n, col) => badge(`<text x="50" y="62" text-anchor="middle" font-family="Sniglet, 'Baloo 2', sans-serif" font-weight="800" font-size="${n >= 100 ? 30 : 36}" fill="#5b3f58">${n}</text>`, col);
  const rankArt = (i) => badge(TT.star(50, 46, 26, ['#fff', '#ffe17a', '#ffc38a', '#9ee6c0', '#9cd3ff', '#cfa8ff', '#ff9ec0', '#ffd84d'][i] || '#ffe17a', 4) + `<text x="50" y="56" text-anchor="middle" font-family="Sniglet, sans-serif" font-weight="800" font-size="20" fill="#5b3f58">${i + 1}</text>`, '#fff3c2');
  const houseArt = k => badge(TT.P('M26,54 L50,30 L74,54 L74,78 L26,78Z', '#ff9ec0', 4) + TT.R(43, 60, 14, 18, 3, '#fffdf9', 3) + (k ? `<text x="50" y="24" text-anchor="middle" font-family="Sniglet, sans-serif" font-weight="800" font-size="18" fill="#5b3f58">${k}</text>` : ''), '#d7f3e6');

  /* ---------------- the pages ---------------- */
  const SLOT_WORD = { hair: 'hairstyles', top: 'tops', bottom: 'bottoms', shoes: 'pairs of shoes', hat: 'hats', face: 'specs', neck: 'neckwear', back: 'wings & capes', hold: 'things to hold', pet: 'pet pals', scene: 'scenes', fx: 'magic effects' };
  const SLOT_ICON = { hair: 'buns', top: 'tee', bottom: 'skirt', shoes: 'sneakers', hat: 'crown', face: 'hearts', neck: 'bowtie', back: 'butterfly', hold: 'icecream', pet: 'chick', scene: 'meadow', fx: null };
  const wornCount = () => Object.values(A().worn).reduce((n, w) => n + Object.keys(w).length, 0);
  const ownsItem = (slot, it) => it && !TT.isLocked(slot, it);

  function pages() {
    const a = A();
    const list = [];
    list.push({ id: 'critters', title: 'Critter friends', color: '#ffd1e0', reward: 40, tip: 'Dress up each critter to collect its sticker.',
      stickers: TT.ANIMALS.map(an => ({ id: 'critter:' + an.id, name: an.name, how: an.locked ? `Unlock the ${an.name.toLowerCase()} and dress it up.` : `Pick the ${an.name.toLowerCase()} in the Critter drawer.`, art: () => critterArt(an.id), got: !!a.animals[an.id], ghost: true })) });
    list.push({ id: 'happy', title: 'Super happy critters', color: '#fff0c2', reward: 60, tip: 'Every critter loves two kinds of things. Dress it in 3 things it loves (and nothing it dislikes) to make it super happy. Tap your critter to hear what it likes!',
      stickers: TT.ANIMALS.map(an => { const op = TT.opinionOf(an.id); return { id: 'happy:' + an.id, name: `Happy ${an.name.toLowerCase()}`, how: `Make the ${an.name.toLowerCase()} super happy. It loves ${TT.THEME_WORD[op.loves[0]]} and ${TT.THEME_WORD[op.loves[1]]}.`, art: () => critterArt(an.id) + '', got: !!a.happy[an.id], ghost: true, heart: true }; }) });
    const wc = wornCount();
    list.push({ id: 'wardrobe', title: 'Wardrobe', color: '#e6dcff', reward: 40, tip: 'Try on lots of different things.',
      stickers: [10, 25, 50, 100, 200, 300].map((n, i) => ({ id: 'wear:' + n, name: `${n} things tried`, how: `Try on ${n} different things (you've tried ${wc}).`, art: () => numArt(n, ['#ffe17a', '#9ee6c0', '#9cd3ff', '#cfa8ff', '#ff9ec0', '#ffd84d'][i]), got: wc >= n }))
        .concat(Object.keys(SLOT_WORD).map(slot => { const n = Object.keys(a.worn[slot] || {}).length; return { id: 'slot10:' + slot, name: `10 ${SLOT_WORD[slot]}`, how: `Try 10 different ${SLOT_WORD[slot]} (${Math.min(n, 10)} so far).`, art: () => SLOT_ICON[slot] ? thumb(slot, SLOT_ICON[slot]) : badge(TT.star(50, 50, 26, '#ffe17a', 4), '#efe6fb'), got: n >= 10 }; })) });
    list.push({ id: 'games', title: 'Game stars', color: '#d7f3e6', reward: 40, tip: 'Get 3 stars or more in each game. 5 stars makes the sticker shine gold!',
      stickers: (TT.GAME_LIST || []).map(g => ({ id: 'game:' + g.id, name: g.name, how: `Get 3 stars or more in ${g.name}.`, art: () => badge(`<text x="50" y="60" text-anchor="middle" font-family="Sniglet, sans-serif" font-weight="800" font-size="30" fill="#5b3f58">${esc(g.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</text>`, g.color || '#ffe17a'), got: (a.games[g.id] || 0) >= 3, gold: (a.games[g.id] || 0) >= 5 })) });
    list.push({ id: 'challenges', title: 'Style challenges', color: '#ffe0cc', reward: 50, tip: 'Get 3 stars or more in each style challenge.',
      stickers: TT.CHALLENGES.map((c, i) => ({ id: 'ch:' + c.id, name: c.text, how: `Get 3 stars or more on “${c.text}”.`, art: () => badge(TT.star(50, 50, 28, ['#ffe17a', '#ff9ec0', '#9ee6c0', '#9cd3ff', '#cfa8ff', '#ffb38a'][i % 6], 4), '#fffdf9'), got: (a.ch[c.id] || 0) >= 3, gold: (a.ch[c.id] || 0) >= 5 })) });
    list.push({ id: 'secrets', title: 'Scene secrets', color: '#d5ecff', reward: 50, tip: 'Every scene hides a tiny friend. Tap around the scene behind your critter to find it!',
      stickers: TT.SCENES.map(sc => ({ id: 'secret:' + sc.id, name: sc.name, how: TT.isLocked('scene', sc) ? `Unlock ${sc.name}, then tap around it to find its hidden friend.` : `Pick ${sc.name}, then tap around the scene to find its hidden friend.`, art: () => thumb('scene', sc.id), got: !!a.secrets[sc.id], ghost: true, square: true })) });
    if (TT.CAREER) {
      const c = TT.careerState();
      list.push({ id: 'career', title: 'Tailor career', color: '#ffd9bf', reward: 60, tip: 'Open your tailor shop in Town. Rank up and help the regular customers with their stories.',
        stickers: TT.CAREER.RANKS.slice(1).map((r, i) => ({ id: 'rank:' + (i + 1), name: r.name, how: `Reach the rank of ${r.name}.`, art: () => rankArt(i + 1), got: c.rank >= i + 1 }))
          .concat(TT.CAREER.REGULARS.map(rg => ({ id: 'regular:' + rg.id, name: rg.name, how: `Help ${rg.name} with every chapter of their story.`, art: () => TT.careerRegularArt(rg), got: (c.reg[rg.id] || 0) >= rg.chapters.length, ghost: true }))) });
    }
    if (TT.HOUSE) {
      const h = TT.houseStats();
      list.push({ id: 'house', title: 'Critter house', color: '#d7f3e6', reward: 30, tip: 'Decorate your critter house in Town.',
        stickers: [
          { id: 'house:first', name: 'First furniture', how: 'Put something in a room of your critter house.', art: () => houseArt(1), got: h.items >= 1 },
          { id: 'house:10', name: '10 things placed', how: `Place 10 things in your house (${h.items} so far).`, art: () => houseArt(10), got: h.items >= 10 },
          { id: 'house:30', name: '30 things placed', how: `Place 30 things in your house (${h.items} so far).`, art: () => houseArt(30), got: h.items >= 30 },
          { id: 'house:movein', name: 'First roommate', how: 'Invite a critter to live in your house.', art: () => badge(TT.heart(50, 54, 24, '#ff6f96', 4), '#ffd1e0'), got: h.critters >= 1 },
          { id: 'house:party', name: 'House party', how: 'Have 4 critters in one room.', art: () => badge(TT.star(36, 40, 14, '#ffe17a', 3) + TT.star(64, 60, 14, '#ff9ec0', 3), '#efe6fb'), got: h.party },
          { id: 'house:paint', name: 'Interior designer', how: 'Change the wallpaper and the floor of a room.', art: () => badge(TT.R(30, 30, 40, 40, 8, '#9cd3ff', 4) + TT.S('M30,50 L70,50', '#fff', 5), '#fff3c2'), got: h.painted },
          { id: 'house:newroom', name: 'Moving up', how: 'Unlock a new room.', art: () => houseArt('+'), got: h.rooms > 3 }
        ] });
    }
    // one page for every event that has its own items (they stay in your album forever)
    TT.EVENTS.filter(ev => ev.ready).forEach(ev => {
      const es = TT.eventState(ev.id);
      list.push({ id: 'ev:' + ev.id, title: `${ev.emoji} ${ev.name}`, color: ev.color, reward: 30, event: ev,
        tip: TT.eventOpen(ev.id) ? `This month's event! ${TT.daysLeftInMonth()} days left.` : `This event comes back in ${TT.MONTHS[ev.month]}.`,
        stickers: TT.eventItems(ev).map(({ slot, item }) => ({ id: `evitem:${slot}:${item.id}`, name: item.name, how: TT.eventOpen(ev.id) ? `Get the ${item.name.toLowerCase()} during ${ev.name}.` : `Get the ${item.name.toLowerCase()} when ${ev.name} comes back in ${TT.MONTHS[ev.month]}.`, art: () => look() ? TT.eventThumb(slot, item, look()) : '', got: ownsItem(slot, item), ghost: true }))
          .concat(TT.eventChallenges(ev.id).map(c => ({ id: 'evch:' + c.id, name: c.text, how: `Get 3 stars or more on “${c.text}” during ${ev.name}.`, art: () => badge(`<text x="50" y="64" text-anchor="middle" font-size="40">${ev.emoji}</text>`, ev.color), got: (es.stars[c.id] || 0) >= 3, gold: (es.stars[c.id] || 0) >= 5 }))) });
    });
    return list;
  }
  TT.albumPages = pages;
  TT.albumCount = () => { let got = 0, total = 0; pages().forEach(p => p.stickers.forEach(s => { total++; if (s.got) got++; })); return { got, total }; };

  /* new stickers since last time → a little toast (set TT.albumNotify to show it) */
  let pingTimer = null;
  TT.albumPing = function () {
    clearTimeout(pingTimer);
    pingTimer = setTimeout(() => {
      const a = A();
      const fresh = [];
      const known = new Set(a.known);
      const first = !a.known.length && !a.started;
      pages().forEach(p => p.stickers.forEach(s => { if (s.got && !known.has(s.id)) { fresh.push(s); a.known.push(s.id); } }));
      a.started = 1;
      if (fresh.length) { a.unseen = (a.unseen || 0) + fresh.length; TT.saveProgress(); if (!first && TT.albumNotify) TT.albumNotify(fresh); }
    }, 350);
  };

  /* ---------------- the album screen (inside the Town window) ---------------- */
  let curPage = 'critters', info = '';
  TT.openAlbum = function (shell) {
    const a = A(); a.unseen = 0; TT.saveProgress();
    baseLook = null;
    const draw = () => {
      const ps = pages();
      if (!ps.some(p => p.id === curPage)) curPage = ps[0].id;
      const pg = ps.find(p => p.id === curPage);
      const got = pg.stickers.filter(s => s.got).length, total = pg.stickers.length;
      const all = TT.albumCount();
      const claimed = !!a.claimed[pg.id], full = got === total && total > 0;
      shell.setBar('Sticker album', `<span class="g-pill">📒 ${all.got}/${all.total}</span>`);
      shell.body().innerHTML = `<div class="al">
        <div class="al-tabs" role="tablist">${ps.map(p => { const g = p.stickers.filter(s => s.got).length; return `<button class="al-tab" type="button" role="tab" data-page="${p.id}" aria-selected="${p.id === curPage}" style="--pg:${p.color}"><span>${esc(p.title)}</span><b>${g}/${p.stickers.length}</b>${a.claimed[p.id] ? '<i aria-label="complete">✓</i>' : ''}</button>`; }).join('')}</div>
        <section class="al-page" style="--pg:${pg.color}">
          <div class="al-head"><h3>${esc(pg.title)}</h3><span class="al-count">${got} of ${total}</span></div>
          <p class="al-tip">${esc(pg.tip)}</p>
          <div class="al-bar"><span style="width:${total ? got / total * 100 : 0}%"></span></div>
          <div class="al-reward">${claimed ? `<span class="al-done">Page complete! ✓</span>` : full ? `<button class="btn-big" type="button" data-claim="${pg.id}">Claim ${TT.SPOOL}${pg.reward} stitches!</button>` : `<span>Fill the page to win ${TT.SPOOL}<b>${pg.reward}</b> stitches</span>`}</div>
          <div class="al-grid">${pg.stickers.map((s, i) => `<button class="al-st${s.got ? ' got' : ''}${s.gold ? ' gold' : ''}${s.square ? ' sq' : ''}" type="button" data-st="${i}" style="--tilt:${((i * 37) % 9) - 4}deg" aria-label="${esc(s.name)}${s.got ? '' : ', not yet'}">
            <span class="al-art">${s.got || s.ghost ? s.art() : '<i class="al-q">?</i>'}</span>${s.heart && s.got ? '<i class="al-heart">♥</i>' : ''}<span class="al-name">${s.got || s.ghost ? esc(s.name) : '???'}</span></button>`).join('')}</div>
          <p class="al-info" id="alInfo" role="status" aria-live="polite">${info}</p>
        </section></div>`;
      shell.body().querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => { curPage = b.dataset.page; info = ''; TT.Sound.tap(); draw(); shell.body().scrollTop = 0; }));
      shell.body().querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', () => {
        const s = pg.stickers[+b.dataset.st];
        info = s.got ? `<b>${esc(s.name)}</b> ${s.gold ? '· gold!' : '✓'}` : `<b>How to get it:</b> ${esc(s.how)}`;
        const el = shell.body().querySelector('#alInfo'); if (el) el.innerHTML = info;
        TT.Sound.pop();
      }));
      const cl = shell.body().querySelector('[data-claim]');
      if (cl) cl.addEventListener('click', () => {
        if (a.claimed[pg.id]) return;
        a.claimed[pg.id] = 1; TT.earn(pg.reward); TT.Sound.cheer();
        info = `<b>+${pg.reward} stitches!</b> What a page!`;
        shell.wallet(); draw();
      });
    };
    draw();
  };
})(window.TT);
