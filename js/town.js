/* Tiny Tailors — Town: one full-screen window for the monthly event, the tailor shop,
   the critter house and the sticker album. */
(function (TT) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const Sound = () => TT.Sound;
  let root = null, ctx = null, stack = [], timers = [], cleanups = [];

  const clearPage = () => { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = []; cleanups.forEach(f => { try { f(); } catch (e) { } }); cleanups = []; };
  /* the little toolkit each Town page uses */
  const shell = {
    body: () => root && root.querySelector('.game-body'),
    setBar(title, hud = '') { if (!root) return; root.querySelector('.game-title').textContent = title; root.querySelector('.game-hud').innerHTML = hud; root.querySelector('.game-back span').textContent = stack.length > 1 ? 'Back' : 'Studio'; },
    // show a page: pages call shell.go(themselves) so Back knows where to return
    go(fn) { clearPage(); const at = stack.indexOf(fn); if (at >= 0) stack.length = at + 1; else stack.push(fn); const b = shell.body(); if (b) b.scrollTop = 0; },
    every(fn, ms) { const t = setInterval(fn, ms); timers.push(t); return t; },
    later(fn, ms) { const t = setTimeout(fn, ms); timers.push(t); return t; },
    cleanup(f) { cleanups.push(f); },
    wallet() { ctx && ctx.wallet && ctx.wallet(); },
    guard: null,
    get ctx() { return ctx; }
  };
  function back() {
    if (shell.guard) { if (!shell.guard()) return; shell.guard = null; }
    Sound().tap();
    clearPage();
    stack.pop();
    const prev = stack.pop();
    if (prev) prev(); else close();
  }
  function close() {
    clearPage(); stack = [];
    if (root) root.remove();
    root = null; document.body.classList.remove('gaming');
    document.removeEventListener('keydown', onKey);
    ctx && ctx.onClose && ctx.onClose();
  }
  function onKey(e) {
    if (!root || document.querySelector('.modal:not([hidden])')) return;
    if (e.key === 'Escape') { e.preventDefault(); back(); }
  }
  TT.openTown = function (context, page) {
    ctx = context;
    if (root) close();
    root = document.createElement('div');
    root.className = 'game town';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Town');
    root.innerHTML = `<div class="game-bar"><button class="chip game-back" type="button" data-tback><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span>Studio</span></button>
      <strong class="game-title"></strong><div class="game-hud" aria-live="polite"></div></div><div class="game-body"></div>`;
    document.body.appendChild(root);
    document.body.classList.add('gaming');
    root.querySelector('[data-tback]').addEventListener('click', back);
    document.addEventListener('keydown', onKey);
    stack = [];
    Sound().wake(); Sound().whoosh();
    hub();
    if (page === 'event') eventPage();
    if (page === 'album') album();
  };
  TT.closeTown = () => { if (root) close(); };

  /* ---------------- hub ---------------- */
  function hub() {
    shell.go(hub);
    const ev = TT.currentEvent(), c = TT.careerState(), al = TT.albumCount(), hs = TT.houseStats();
    const me = ctx.look();
    shell.setBar('Town', `<span class="g-pill">${TT.SPOOL}${TT.progress.stitches}</span>`);
    const evArt = ev.ready && ev.scene ? TT.svg(TT.itemOf('scene', ev.scene).draw(null, 'tw-'), '0 40 400 400', 'preserveAspectRatio="xMidYMid slice"') : `<span class="tw-emoji">${ev.emoji}</span>`;
    const shopArt = TT.svg(TT.compose(Object.assign(JSON.parse(JSON.stringify(me)), { scene: { id: 'tailor' } }), { pfx: 'tws-', animated: false, pet: false, fx: false }), '0 40 400 400', 'preserveAspectRatio="xMidYMid slice"');
    const houseArt = TT.houseRoomSVG(TT.progress.house && TT.progress.house.cur || 'bedroom');
    const unseen = (TT.progress.album || {}).unseen || 0;
    shell.body().innerHTML = `<div class="g-hub tw-hub">
      <p class="g-intro">Welcome to town, <b>${esc(me.name || 'friend')}</b>! Where to?</p>
      <div class="g-cards">
        <button class="g-card tw-card tw-ev" type="button" data-go="event" style="--card:${ev.color}"><span class="g-art">${evArt}</span><span class="g-name">${ev.emoji} ${esc(ev.name)}</span>
          <span class="g-blurb">${ev.ready ? `This month's event! ${esc(ev.blurb)}` : esc(ev.blurb)}</span><span class="g-meta">${ev.ready ? `${TT.daysLeftInMonth()} days left` : 'Coming soon'}</span></button>
        <button class="g-card tw-card" type="button" data-go="career" style="--card:#ffe0cc"><span class="g-art">${shopArt}</span><span class="g-name">Tailor shop</span>
          <span class="g-blurb">Run your own shop! Dress customers, earn tips and become the Royal Tailor.</span><span class="g-meta">${esc(TT.CAREER.RANKS[c.rank].name)} · ${c.days} days open</span></button>
        <button class="g-card tw-card" type="button" data-go="house" style="--card:#d7f3e6"><span class="g-art">${houseArt}</span><span class="g-name">Critter house</span>
          <span class="g-blurb">Decorate rooms and invite your critters to move in.</span><span class="g-meta">${hs.items} things placed · ${hs.critters} roommates</span></button>
        <button class="g-card tw-card" type="button" data-go="album" style="--card:#e6dcff"><span class="g-art tw-album-art">${TT.svg(TT.R(14, 10, 72, 80, 10, '#ff9ec0', 4) + TT.R(22, 18, 56, 64, 6, '#fffdf9', 3) + TT.star(38, 38, 10, '#ffe17a', 2.5) + TT.heart(62, 40, 8, '#ff6f96', 2.5) + TT.C(40, 64, 8, '#9ee6c0', 2.5) + TT.C(62, 64, 8, '#9cd3ff', 2.5), '0 0 100 100')}${unseen ? `<i class="tw-new">${unseen} new</i>` : ''}</span><span class="g-name">Sticker album</span>
          <span class="g-blurb">Collect stickers for everything you do. Full pages win stitches!</span><span class="g-meta">📒 ${al.got} of ${al.total} stickers</span></button>
      </div></div>`;
    shell.body().querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      Sound().tap();
      const k = b.dataset.go;
      if (k === 'event') eventPage();
      if (k === 'career') TT.openCareer(shell);
      if (k === 'house') TT.openHouse(shell);
      if (k === 'album') album();
    }));
  }
  function album() { shell.go(album); TT.openAlbum(shell); }

  /* ---------------- this month's event ---------------- */
  function eventPage() {
    shell.go(eventPage);
    const ev = TT.currentEvent(), nx = TT.nextEvent();
    shell.setBar(`${ev.emoji} ${ev.name}`, `<span class="g-pill">${TT.SPOOL}${TT.progress.stitches}</span>`);
    if (!ev.ready) {
      shell.body().innerHTML = `<div class="ev"><div class="ev-hero" style="--ev:${ev.color};--evink:${ev.ink}"><span class="tw-emoji big">${ev.emoji}</span><h3>${esc(ev.name)}</h3><p>${esc(ev.blurb)}</p><p class="ev-soon">The ${esc(TT.MONTHS[ev.month])} event is still being sewn. Check back soon!</p></div>${calendar()}</div>`;
      return;
    }
    const es = TT.eventState(ev.id);
    const items = TT.eventItems(ev);
    const look = ctx.look();
    const chs = TT.eventChallenges(ev.id);
    shell.body().innerHTML = `<div class="ev">
      <div class="ev-hero" style="--ev:${ev.color};--evink:${ev.ink}">
        <div class="ev-scene">${TT.svg(TT.itemOf('scene', ev.scene).draw(null, 'evh-'), '0 40 400 400', 'preserveAspectRatio="xMidYMid slice"')}</div>
        <div class="ev-txt"><h3>${ev.emoji} ${esc(ev.name)}</h3><p>${esc(ev.blurb)}</p><p class="ev-left"><b>${TT.daysLeftInMonth()}</b> days left! Event items can only be won this month, and you keep them forever.</p></div></div>
      <div class="row-label">Event challenges <em>· get 4 stars or more to win the prize</em></div>
      <div class="ev-chs">${chs.map(ch => {
        const won = es.prizes.includes(ch.id), best = es.stars[ch.id] || 0;
        const [slot, id] = ch.prize, it = TT.itemOf(slot, id);
        return `<button class="ev-ch${won ? ' won' : ''}" type="button" data-evch="${ch.id}"><span class="ev-prize">${TT.eventThumb(slot, it, look)}</span>
          <span class="ev-ch-txt"><b>${esc(ch.text)}</b><span>Prize: ${esc(it.name)} ${won ? '✓ won!' : ''}</span>${best ? `<span class="ev-best">Best: ${'★'.repeat(best)}</span>` : ''}</span></button>`;
      }).join('')}</div>
      <div class="row-label">Event shop <em>· or win them in the challenges</em></div>
      <div class="ev-items">${items.map(({ slot, item }) => { const own = !TT.isLocked(slot, item); return `<button class="item${own ? '' : ' is-locked'}" type="button" data-evitem="${slot}:${item.id}" aria-label="${esc(item.name)}${own ? ', yours' : `, ${item.locked} stitches`}">${TT.eventThumb(slot, item, look)}<span>${esc(item.name)}</span>${own ? '<i class="ev-own">✓</i>' : `<span class="price r-${TT.rarity(item.locked).id}">${TT.SPOOL}${item.locked}</span>`}</button>`; }).join('')}
        <button class="item scene-item" type="button" data-evscene="${ev.scene}"><span class="ev-sc">${TT.thumb('scene', TT.itemOf('scene', ev.scene), look)}</span><span>${esc(TT.itemOf('scene', ev.scene).name)} (free!)</span></button></div>
      <p class="modal-sub">The event also has its own photo booth stickers and frame, house furniture, and a page in your sticker album.</p>
      ${calendar()}</div>`;
    const b = shell.body();
    b.querySelectorAll('[data-evch]').forEach(x => x.addEventListener('click', () => { const ch = chs.find(c => c.id === x.dataset.evch); close(); ctx.startChallenge(ch); }));
    b.querySelectorAll('[data-evitem]').forEach(x => x.addEventListener('click', () => { const [slot, id] = x.dataset.evitem.split(':'); close(); ctx.wear(slot, id); }));
    b.querySelectorAll('[data-evscene]').forEach(x => x.addEventListener('click', () => { close(); ctx.wear('scene', x.dataset.evscene); }));
  }
  function calendar() {
    const m = new Date().getMonth();
    return `<div class="row-label">This year's events</div><div class="ev-cal">${TT.EVENTS.map(e => `<div class="ev-mo${e.month === m ? ' now' : ''}" style="--ev:${e.color}"><span>${e.emoji}</span><b>${TT.MONTHS[e.month].slice(0, 3)}</b><em>${esc(e.name)}</em></div>`).join('')}</div>`;
  }
})(window.TT);
