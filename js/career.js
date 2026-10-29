/* Tiny Tailors — tailor career.
   Run your own tailor shop: dress customers (who each have their own likes and dislikes),
   earn tips and reputation, buy shop upgrades, help regular customers through their stories,
   and pass the Royal Inspector's test to climb from Apprentice to Royal Tailor.

   Stitches: a shop day pays through TT.rewardGame('career', stars), so it follows the same game
   formula as everything else. Tips are the shop's own money and only buy shop upgrades. */
(function (TT) {
  const P = TT.progress;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const tagsOf = (slot, id) => (((TT.TAGS[slot] || {})[id]) || '').split(' ').filter(Boolean);
  const W = k => TT.THEME_WORD[k] || k;

  /* ---------------- ranks ---------------- */
  const RANKS = [
    { name: 'Apprentice', rep: 0 }, { name: 'Junior Tailor', rep: 15 }, { name: 'Tailor', rep: 40 }, { name: 'Senior Tailor', rep: 80 },
    { name: 'Head Tailor', rep: 130 }, { name: 'Master Tailor', rep: 190 }, { name: 'Famous Designer', rep: 270 }, { name: 'Royal Tailor', rep: 370 }
  ];
  // what each new rank brings
  const RANK_NEWS = [
    '',
    'Customers can now ask for their favorite color. Look for the 🎨 in their wish!',
    'Some customers now say what they DON\'T want. Watch for the 🚫!',
    'Rush orders! Some customers are in a hurry, so a timer runs. ⏱️',
    'VIP customers! They\'re picky, but they tip double. 👑',
    'Double wishes: some customers want two things at once.',
    'Celebrities visit your shop now, and they tell everyone about you.',
    'You are the Royal Tailor! The whole kingdom wears your designs.'
  ];

  /* ---------------- shop upgrades (paid with tips) ---------------- */
  const UPGRADES = [
    { id: 'notes', name: 'Style notebook', icon: '📓', levels: [{ cost: 30, rank: 0 }], desc: 'Shows what each customer loves and dislikes.' },
    { id: 'rack', name: 'Bigger clothes rack', icon: '🧥', levels: [{ cost: 20, rank: 0 }, { cost: 45, rank: 1 }, { cost: 80, rank: 3 }], desc: 'Two more choices in every drawer.' },
    { id: 'drawers', name: 'More drawers', icon: '🗄️', levels: [{ cost: 25, rank: 0 }, { cost: 50, rank: 1 }, { cost: 75, rank: 2 }], desc: 'Level 1: neckwear and specs. Level 2: things to hold and wings. Level 3: pet pals.' },
    { id: 'dye', name: 'Dye station', icon: '🎨', levels: [{ cost: 50, rank: 1 }], desc: 'Change the color of anything you pick.' },
    { id: 'machine', name: 'Speedy sewing machine', icon: '🧵', levels: [{ cost: 35, rank: 3 }], desc: '15 more seconds on rush orders.' },
    { id: 'chairs', name: 'Comfy waiting chairs', icon: '🛋️', levels: [{ cost: 60, rank: 4 }], desc: 'Happy customers tip a little more.' },
    { id: 'window', name: 'Window display', icon: '🪟', levels: [{ cost: 25, rank: 1 }], desc: 'Shows your favorite customer in the shop window.' },
    { id: 'mirror', name: 'Golden mirror', icon: '🪞', levels: [{ cost: 90, rank: 5 }], desc: 'Shows a live score while you dress.' }
  ];
  const PAINTS = [
    { id: 'pink', name: 'Strawberry', wall: '#ffe2ea', stripe: '#ffd2df', cost: 0 }, { id: 'mint', name: 'Mint', wall: '#dff5ea', stripe: '#cdeedd', cost: 15 },
    { id: 'sky', name: 'Sky', wall: '#e0efff', stripe: '#cfe3fb', cost: 15 }, { id: 'butter', name: 'Butter', wall: '#fff3cf', stripe: '#ffe9b0', cost: 15 },
    { id: 'lilac', name: 'Lilac', wall: '#efe4ff', stripe: '#e2d3fb', cost: 15 }, { id: 'night', name: 'Starry', wall: '#4b4370', stripe: '#433c66', cost: 30 }
  ];
  const BASE_SLOTS = ['top', 'bottom', 'shoes', 'hat'];
  const DRAWER_SLOTS = [['neck', 'face'], ['hold', 'back'], ['pet']];

  /* ---------------- regular customers and their stories ---------------- */
  const REGULARS = [
    { id: 'duchess', name: 'Duchess Pickles', animal: 'cat', fur: 'snow', eyes: 'sparkle', rank: 0, op: { loves: ['fancy', 'royal'], dislikes: ['sporty'], color: 'purple' },
      chapters: [
        { say: 'I\'ve been invited to the Royal Ball! But first, the Queen wants me at her tea party.', ch: 'tea', thanks: 'The Queen loved my outfit! She asked where I got it.' },
        { say: 'Tonight is a fancy dinner with the Duke of Doughnuts. I must look elegant.', ch: 'dinner', thanks: 'The Duke said I was the most elegant cat in the room!' },
        { say: 'The Royal Ball is TONIGHT! Make me the star of the castle!', ch: 'magiccastle', thanks: 'I danced with the prince all night long!' },
        { say: 'I danced so much my paws hurt. Something cozy for a lazy day, please.', ch: 'pajama', thanks: 'Ahh, perfect. You\'re the best tailor in town, darling. Here, a portrait for your house!' }
      ] },
    { id: 'bao', name: 'Captain Bao', animal: 'otter', fur: 'natural', eyes: 'determined', rank: 1, op: { loves: ['sea', 'pirate'], dislikes: ['space'], color: 'blue' },
      chapters: [
        { say: 'Ahoy! I just bought a boat. Dress me like a real captain!', ch: 'pirate', thanks: 'The crew salutes me now! Well, the crew is two ducks.' },
        { say: 'We found a map to an underwater city! Get me ready to dive.', ch: 'sea', thanks: 'The mermaids gave me a seashell. They said I looked dashing!' },
        { say: 'A storm blew us to a sunny island. I need beach clothes!', ch: 'beach', thanks: 'I built a sandcastle with a moat! Best day ever.' },
        { say: 'Next stop: the North Pole! Brrr, bundle me up.', ch: 'snow', thanks: 'The penguins threw me a party! Here, take my old ship\'s wheel.' }
      ] },
    { id: 'fig', name: 'Professor Fig', animal: 'owl', fur: 'natural', eyes: 'dot', rank: 2, op: { loves: ['school', 'detective'], dislikes: ['party'], color: 'green' },
      chapters: [
        { say: 'Someone took the museum\'s golden acorn! I need a detective look.', ch: 'detective', thanks: 'I found clues everywhere. The thief left crumbs!' },
        { say: 'The clues lead to the wizard school. I must blend in!', ch: 'wizard', thanks: 'The wizards taught me a spell that makes tea!' },
        { say: 'The crumbs lead… to the moon?! I need to go to space.', ch: 'space', thanks: 'It was a space mouse who loves acorns! We\'re friends now.' },
        { say: 'Now I must explain it all to my students. Make me look smart and cozy.', ch: 'bedtime', thanks: 'Case closed! Please take my magnifying lamp for your house.' }
      ] },
    { id: 'rosie', name: 'Rosie Rumble', animal: 'pig', fur: 'natural', eyes: 'happy', rank: 3, op: { loves: ['rock', 'music'], dislikes: ['sleepy'], color: 'pink' },
      chapters: [
        { say: 'I\'m starting a band! Our first show is in the city. Make me a rock star!', ch: 'rockstar', thanks: 'Seven critters came! My mom was one of them.' },
        { say: 'We got invited to play at a birthday party!', ch: 'birthday', thanks: 'Everyone danced on the cake. Well, near the cake.' },
        { say: 'A fashion magazine wants to photograph us on the runway!', ch: 'runway', thanks: 'We\'re on the cover! Look! That\'s my snout!' },
        { say: 'Our big concert on the spotlight stage! This is the biggest night of my life!', ch: 'ballet', thanks: 'We sold out! Here, our golden record for your wall!' }
      ] },
    { id: 'sprout', name: 'Sir Sprout', animal: 'frog', fur: 'natural', eyes: 'sparkle', rank: 4, op: { loves: ['knight', 'garden'], dislikes: ['winter'], color: 'green' },
      chapters: [
        { say: 'I want to be a knight! First I must guard the castle.', ch: 'knight', thanks: 'Nobody stole the castle! I\'m very good at this.' },
        { say: 'The garden fairies need a knight to protect the flowers.', ch: 'fairy', thanks: 'The fairies made me an honorary fairy. I have tiny wings now!' },
        { say: 'It\'s raining on the day of the big garden show! Help!', ch: 'rainy', thanks: 'I jumped in every puddle. A frog\'s dream!' },
        { say: 'The Queen will knight me at a picnic under the cherry blossoms!', ch: 'picnic', thanks: 'I\'m SIR Sprout now! Please take my lily pad chair.' }
      ] },
    { id: 'nova', name: 'Princess Nova', animal: 'unicorn', fur: 'natural', eyes: 'sparkle', rank: 5, op: { loves: ['magic', 'rainbow'], dislikes: ['rock'], color: 'purple' },
      chapters: [
        { say: 'I\'m a princess from a faraway star. I need an outfit for my space trip home!', ch: 'space', thanks: 'The stars twinkled when they saw me!' },
        { say: 'My kingdom is having a rainbow festival. Everything must be rainbow!', ch: 'rainbow', thanks: 'Even the clouds were jealous of my colors!' },
        { say: 'I have to choose who rules after me. Make me look truly royal.', ch: 'magiccastle', thanks: 'Everyone bowed! I almost giggled.' },
        { say: 'I chose YOU to be the kingdom\'s tailor! Dress me for the celebration!', ch: 'runway', thanks: 'Here is a star from my sky, for your house. You\'ll always be our tailor!' }
      ] }
  ];

  /* the furniture each regular gives at the end of their story (see house.js) */
  const REG_GIFT = { duchess: 'portrait', bao: 'shipwheel', fig: 'lamp2', rosie: 'record', sprout: 'lilychair', nova: 'starjar' };

  /* ---------------- state ---------------- */
  TT.careerState = function () {
    const c = P.career = P.career || {};
    Object.assign(c, Object.assign({ rank: 0, rep: 0, tips: 0, days: 0, served: 0, fives: 0, up: {}, reg: {}, regLast: '', fame: [], reviews: [], shopName: '', paint: 'pink', paints: ['pink'], best: 0 }, c));
    return c;
  };
  const C = TT.careerState;
  const OL_ = TT.OL;
  const FRIENDLY_EYES = ['sparkle', 'dot', 'happy', 'wink', 'star', 'heart', 'button'];
  const save = () => TT.saveProgress();
  const lvl = id => C().up[id] || 0;
  const slotsNow = () => BASE_SLOTS.concat(...DRAWER_SLOTS.slice(0, lvl('drawers')));
  const examReady = () => { const c = C(); return c.rank < RANKS.length - 1 && c.rep >= RANKS[c.rank + 1].rep; };
  TT.CAREER = { RANKS, REGULARS, UPGRADES };

  /* ---------------- customers ---------------- */
  const NAMES = ['Muffin', 'Pickles', 'Waffles', 'Noodle', 'Bean', 'Sprinkles', 'Biscuit', 'Pudding', 'Clover', 'Pumpkin', 'Button', 'Nugget', 'Marshmallow', 'Taco', 'Cupcake', 'Bubbles', 'Peaches', 'Toffee', 'Dumpling', 'Pebble', 'Maple', 'Jellybean', 'Bao', 'Poppy', 'Fig', 'Gizmo', 'Tofu', 'Socks', 'Wiggles', 'Mango'];
  const SHOP_RULES = ['tags', 'hold', 'avoid', 'dressed', 'many', 'pet'];
  const COLOR_RULES = ['someColors', 'onlyColors', 'oneColor'];
  const pool = () => TT.CHALLENGES.map(ch => ({ id: ch.id, text: ch.text, rules: ch.rules.filter(r => SHOP_RULES.includes(r.type) || (lvl('dye') && COLOR_RULES.includes(r.type))).filter(r => r.type !== 'pet' || lvl('drawers') >= 3).filter(r => r.type !== 'hold' || lvl('drawers') >= 2) }))
    .filter(ch => ch.rules.some(r => r.type === 'tags'));
  const FAM_LIST = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white'];
  const COL_OF_FAM = { pink: 'bubblegum', red: 'strawberry', orange: 'peach', yellow: 'butter', green: 'mint', blue: 'sky', purple: 'lavender', white: 'cloud', brown: 'cocoa', gray: 'cloud', dark: 'night' };
  // only ask for a color the shop's swatches can actually make (e.g. there is no gray swatch)
  const famsNow = () => new Set(TT.COLORS.filter(x => !x.locked).map(x => TT.colorFamily(x.hex)));
  const wearableFam = f => famsNow().has(f) ? f : pick(FAM_LIST.filter(x => famsNow().has(x)));
  const lower = s => s.charAt(0).toLowerCase() + s.slice(1);

  function baseLook(animal, fur, eyes, name) {
    const st = TT.app ? clone(TT.app.state) : {};
    st.animal = { id: animal, color: fur || 'natural' };
    st.eyes = { id: TT.itemOf('eyes', eyes) ? eyes : TT.EYES[0].id }; st.mouth = { id: TT.MOUTHS[0].id }; st.blush = { id: (TT.BLUSH[0] || {}).id || null };
    st.hair = { id: null, color: 'cocoa' };
    ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold', 'pet'].forEach(s => { st[s] = { id: null, color: 'bubblegum', color2: null, pattern: 'solid' }; });
    st.pose = { id: 'stand' }; st.scene = { id: 'tailor' }; st.fx = { id: null }; st.petPos = null; st.name = name;
    return st;
  }
  function makeCustomer(kind, dayNo) {
    const c = C();
    const ps = pool();
    if (kind === 'regular') {
      const rg = REGULARS.find(r => r.id === dayNo);
      const chap = rg.chapters[c.reg[rg.id] || 0];
      const base = TT.CHALLENGES.find(x => x.id === chap.ch);
      const ch = ps.find(x => x.id === chap.ch) || { id: base.id, text: base.text, rules: base.rules.filter(r => r.type === 'tags' || r.type === 'dressed') };
      return { kind, rg, chap, name: rg.name, animal: rg.animal, st: baseLook(rg.animal, rg.fur, rg.eyes, rg.name), op: rg.op, ch, twists: [], text: chap.say };
    }
    if (kind === 'exam') {
      const two = shuffle(ps).slice(0, 2);
      const fam = pick(FAM_LIST);
      const ch = { id: 'exam', text: `${two[0].text}, and ${lower(two[1].text)}`, rules: two[0].rules.filter(r => r.type === 'tags').concat(two[1].rules.filter(r => r.type === 'tags'), [{ type: 'dressed', w: 15, tip: 'Finish the outfit: a top, something on the bottom and shoes.' }]) };
      const st = baseLook('owl', 'smoke', 'determined', 'The Royal Inspector');
      st.face = { id: TT.itemOf('face', 'monocle') ? 'monocle' : null, color: 'butter', color2: null };
      return { kind, name: 'The Royal Inspector', animal: 'owl', st, op: { loves: ['royal', 'hero'], dislikes: ['sleepy'], color: fam }, ch, twists: [{ type: 'color', fam }], text: `Hmm. So you want to be a ${RANKS[c.rank + 1].name}? Show me what you can do. My wish: “${ch.text}!”` };
    }
    // a walk-in critter
    const animal = pick(TT.ANIMALS.filter(a => !a.locked || !TT.isLocked('animal', a)));
    const op = TT.opinionOf(animal.id);
    let ch = pick(ps);
    const twists = [];
    const r = c.rank;
    if (r >= 5 && Math.random() < 0.3) {
      const other = pick(ps.filter(x => x.id !== ch.id));
      ch = { id: ch.id + '+' + other.id, text: `${ch.text}, and ${lower(other.text)}`, rules: ch.rules.concat(other.rules.filter(x => x.type === 'tags')) };
    }
    if (r >= 1 && Math.random() < 0.35) twists.push({ type: 'color', fam: wearableFam(op.color) });
    const noSlots = slotsNow().filter(s => !['top', 'bottom', 'shoes'].includes(s));
    if (r >= 2 && noSlots.length && Math.random() < 0.3) twists.push({ type: 'no', slot: pick(noSlots) });
    if (r >= 3 && Math.random() < 0.3) twists.push({ type: 'rush' });
    const vip = r >= 4 && Math.random() < 0.18;
    const celeb = r >= 6 && Math.random() < 0.15;
    const nm = vip ? `VIP ${pick(NAMES)}` : celeb ? `Superstar ${pick(NAMES)}` : pick(NAMES);
    return { kind: 'walkin', name: nm, animal: animal.id, st: baseLook(animal.id, Math.random() < 0.7 ? 'natural' : pick(TT.FUR.filter(f => !f.locked)).id, pick(TT.EYES.filter(e => !e.locked && FRIENDLY_EYES.includes(e.id)).concat(TT.EYES.slice(0, 1))).id, nm), op, ch, twists, vip, celeb,
      text: `“${ch.text}!”` };
  }
  const twistText = t => t.type === 'color' ? `🎨 Please use my favorite color, ${TT.COLOR_WORD[t.fam]}!` : t.type === 'no' ? `🚫 No ${TT.SLOTS[t.slot].label.toLowerCase().replace('specs & face fun', 'specs').replace('wings & capes', 'wings or capes').replace('holding', 'things to hold').replace('pet pal', 'pets')}, please!` : t.type === 'rush' ? '⏱️ I\'m in a hurry!' : '';

  /* score a finished outfit for a customer: the judge + their personality + their twists */
  function scoreFor(cu, st) {
    const res = TT.judge(st, cu.ch);
    const hp = TT.happiness(st, cu.op);
    let bonus = Math.min(18, hp.loves * 6) - hp.dislikes * 10 + (hp.colors ? 4 : 0);
    const notes = [];
    if (hp.loves) notes.push({ good: true, msg: `${cu.name} loves the ${hp.lovedNames.slice(0, 2).join(' and ').toLowerCase()}!` });
    if (hp.dislikes) notes.push({ good: false, msg: `${cu.name} isn't a fan of the ${hp.dislikedNames[0].toLowerCase()}.` });
    cu.twists.forEach(t => {
      if (t.type === 'color') { const n = ['top', 'bottom', 'shoes', 'hat', 'neck', 'back', 'face', 'hold'].filter(s => st[s] && st[s].id && TT.SLOTS[s].palette && !(TT.itemOf(s, st[s].id) || {}).fixed && TT.colorFamily(TT.colorHex(s, st[s].color)) === t.fam).length; if (n >= 2) { bonus += 12; notes.push({ good: true, msg: `Lots of ${TT.COLOR_WORD[t.fam]}, just like they asked!` }); } else { bonus -= 10; notes.push({ good: false, msg: `They wanted more ${TT.COLOR_WORD[t.fam]}.` }); } }
      if (t.type === 'no') { if (st[t.slot] && st[t.slot].id) { bonus -= 20; notes.push({ good: false, msg: `They asked for no ${TT.SLOTS[t.slot].label.toLowerCase()}!` }); } else bonus += 5; }
    });
    const score = Math.max(0, Math.min(100, res.score + bonus));
    const stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 55 ? 3 : score >= 35 ? 2 : 1;
    return { score, stars, lines: res.lines, notes, hp };
  }

  /* ---------------- shop drawing ---------------- */
  const paintOf = () => PAINTS.find(p => p.id === C().paint) || PAINTS[0];
  function shopArt(cu) {
    const pt = paintOf(), c = C();
    let s = `<rect x="-10" y="-10" width="420" height="300" fill="${pt.wall}"/>`;
    for (let x = 10; x < 400; x += 40) s += TT.S(`M${x},0 L${x},200`, pt.stripe, 14);
    // sign
    s += TT.R(110, 14, 180, 40, 14, '#fffdf9', 4) + `<text x="200" y="41" text-anchor="middle" font-family="Sniglet, sans-serif" font-weight="800" font-size="${(c.shopName || 'Tiny Tailors').length > 16 ? 14 : 18}" fill="#e64f7c">${esc(c.shopName || 'Tiny Tailors')}</text>`;
    // window with a little view outside
    s += TT.R(22, 66, 110, 104, 10, '#cfeaff', 4) + TT.C(100, 94, 10, '#ffe17a', 0) + TT.C(46, 104, 9, '#fff', 0) + TT.C(58, 100, 12, '#fff', 0) + TT.C(70, 106, 8, '#fff', 0) + TT.P('M24,150 Q60,136 92,148 Q114,140 130,148 L130,168 L24,168Z', '#b6e8a8', 0) + TT.S('M77,66 L77,170 M22,118 L132,118', '#fffdf9', 5) + TT.R(16, 164, 122, 10, 4, '#d9a074', 3);
    if (lvl('window') && c.fame.length) s += `<svg x="30" y="70" width="94" height="98" viewBox="40 0 320 440">${TT.compose(c.fame[0], { pfx: 'win-', animated: false, scene: false, pet: false, fx: false })}</svg>`;
    // fame wall
    c.fame.slice(0, 4).forEach((lk, i) => { const x = 160 + i * 58, y = 76 + (i % 2) * 8; s += TT.R(x, y, 48, 56, 4, '#fffdf9', 3, TT.rot(i % 2 ? 4 : -4, x + 24, y + 28)) + `<svg x="${x + 4}" y="${y + 4}" width="40" height="44" viewBox="60 40 280 280">${TT.compose(lk, { pfx: `fm${i}-`, animated: false, scene: false, pet: false, fx: false })}</svg>`; });
    if (!c.fame.length && !cu) s += `<text x="270" y="110" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="700" font-size="13" fill="#b08aa8">5-star customers hang here</text>`;
    // floor, dress form, counter with a sewing machine, and the clothes rack
    s += TT.R(-10, 200, 420, 100, 0, '#f3d3b8', 0) + Array.from({ length: 9 }, (_, i) => TT.S(`M${-10 + i * 52},200 L${-30 + i * 52},290`, '#e8c2a2', 3)).join('') + TT.S('M-10,200 L410,200', '#e3b896', 5);
    s += TT.P('M88,140 Q100,134 112,140 Q118,160 110,176 Q118,196 114,214 L86,214 Q82,196 90,176 Q82,160 88,140Z', '#ffd0dc', 3) + TT.S('M100,214 L100,250 M88,250 L112,250', '#c69c7a', 4) + TT.S('M88,164 Q100,170 112,164', '#ff8fb1', 2, 'stroke-dasharray="3 3"');
    s += TT.R(250, 214, 150, 56, 8, '#d9a074', 3) + TT.R(250, 208, 150, 12, 5, '#c08a5e', 3) + TT.P('M280,208 L280,182 Q280,174 288,174 L330,174 Q338,174 338,182 L338,196 L322,196 L322,208Z', '#fffdf9', 3) + TT.R(286, 180, 30, 8, 3, '#ff9ec0', 0) + TT.S('M330,196 L330,206', OL_, 3) + TT.C(354, 196, 9, '#9cd3ff', 2.5) + TT.C(372, 200, 7, '#ffe17a', 2.5) + TT.R(262, 230, 40, 26, 4, '#e3b896', 2.5);
    s += TT.S('M282,82 L384,82 M292,82 L292,168 M374,82 L374,168', '#b98a6d', 5) + ['#ff9ec0', '#9ee6c0', '#9cd3ff', '#ffe17a'].map((col, i) => TT.S(`M${310 + i * 18},82 l0,6`, OL_, 2) + TT.P(`M${310 + i * 18},88 l-9,42 l18,0z`, col, 2.5)).join('');
    if (lvl('chairs')) s += TT.R(150, 222, 54, 28, 10, '#cfa8ff', 3) + TT.R(146, 196, 62, 30, 12, '#cfa8ff', 3) + TT.R(158, 250, 6, 12, 2, '#b98a6d', 2) + TT.R(190, 250, 6, 12, 2, '#b98a6d', 2);
    if (lvl('mirror')) s += TT.E(150, 120, 18, 26, '#ffd84d', 4) + TT.E(150, 120, 12, 19, '#e6f6ff', 2);
    if (cu) s += `<svg x="130" y="60" width="150" height="220" viewBox="40 0 320 440">${TT.compose(cu, { pfx: 'cu-', animated: true, scene: false, fx: false })}</svg>`;
    return TT.svg(s, '0 0 400 280', 'class="sh-art"');
  }
  TT.careerRegularArt = rg => { const st = baseLook(rg.animal, rg.fur, rg.eyes, rg.name); return TT.thumb('animal', TT.animalById(rg.animal), st); };

  /* ================= screens ================= */
  let shell = null;
  const SND = () => TT.Sound;
  TT.openCareer = function (sh) { shell = sh; home(); };

  function hudHTML() { const c = C(); return `<span class="g-pill" title="Tips">🪙 ${c.tips}</span><span class="g-pill">${TT.SPOOL}${P.stitches}</span>`; }
  function rankBar() {
    const c = C(), cur = RANKS[c.rank], nxt = RANKS[c.rank + 1];
    const pct = nxt ? Math.min(100, (c.rep - cur.rep) / (nxt.rep - cur.rep) * 100) : 100;
    return `<div class="cr-rank"><span class="cr-badge">${TT.svg(TT.star(50, 50, 40, ['#fff', '#ffe17a', '#ffc38a', '#9ee6c0', '#9cd3ff', '#cfa8ff', '#ff9ec0', '#ffd84d'][c.rank], 5) + `<text x="50" y="60" text-anchor="middle" font-family="Sniglet, sans-serif" font-weight="800" font-size="28" fill="#5b3f58">${c.rank + 1}</text>`, '0 0 100 100')}</span>
      <div class="cr-rank-txt"><b>${cur.name}</b><span>${nxt ? `${c.rep} / ${nxt.rep} ★ to ${nxt.name}` : `${c.rep} ★ · top rank!`}</span><div class="al-bar"><span style="width:${pct}%"></span></div></div></div>`;
  }

  function home() {
    shell.go(home); shell.guard = null;
    const c = C();
    shell.setBar('Tailor shop', hudHTML());
    const ready = examReady();
    const regsOpen = REGULARS.filter(r => r.rank <= c.rank);
    shell.body().innerHTML = `<div class="cr">
      <div class="cr-top">${rankBar()}</div>
      <div class="cr-shop">${shopArt()}</div>
      ${ready ? `<div class="cr-exam"><b>👑 The Royal Inspector wants to visit!</b><span>Pass the test (4 stars or more) to become a ${RANKS[c.rank + 1].name}.</span><button class="btn-big" type="button" data-exam>Take the test</button></div>` : ''}
      <div class="cr-actions">
        <button class="btn-big" type="button" data-open>Open the shop!</button>
        <button class="btn-soft" type="button" data-up>🔨 Upgrades</button>
        <button class="btn-soft" type="button" data-regs>📖 Regulars</button>
        <button class="btn-soft" type="button" data-reviews>💬 Reviews</button>
        <button class="btn-soft" type="button" data-name>✏️ Name your shop</button>
      </div>
      <p class="cr-stats">Days open: <b>${c.days}</b> · Customers: <b>${c.served}</b> · 5-star looks: <b>${c.fives}</b> · Regulars: <b>${regsOpen.length}</b> of ${REGULARS.length} met</p>
      ${c.days === 0 ? `<p class="cr-help">Customers come in with a wish. Dress them up, and the happier they are, the more tips and ★ reputation you earn. Every critter has things it loves and things it doesn't. Spend tips on upgrades to grow your shop!</p>` : ''}
    </div>`;
    const b = shell.body();
    b.querySelector('[data-open]').addEventListener('click', () => startDay());
    b.querySelector('[data-up]').addEventListener('click', upgrades);
    b.querySelector('[data-regs]').addEventListener('click', regulars);
    b.querySelector('[data-reviews]').addEventListener('click', reviews);
    b.querySelector('[data-name]').addEventListener('click', nameShop);
    const ex = b.querySelector('[data-exam]'); if (ex) ex.addEventListener('click', () => startDay(true));
  }

  /* ---------------- a day in the shop ---------------- */
  let day = null;
  function startDay(exam) {
    const c = C();
    const count = exam ? 1 : c.rank >= 5 ? 5 : c.rank >= 2 ? 4 : 3;
    const queue = [];
    if (exam) queue.push(makeCustomer('exam'));
    else {
      // at most one regular a day, and not the same one twice in a row
      const avail = REGULARS.filter(r => r.rank <= c.rank && (c.reg[r.id] || 0) < r.chapters.length && r.id !== c.regLast);
      const rgPick = avail.length ? avail.sort((a, b) => (c.reg[a.id] || 0) - (c.reg[b.id] || 0))[0] : null;
      for (let i = 0; i < count; i++) queue.push(i === 1 && rgPick ? makeCustomer('regular', rgPick.id) : makeCustomer('walkin'));
      if (rgPick && count < 2) queue.push(makeCustomer('regular', rgPick.id));
    }
    day = { queue, i: 0, results: [], tips: 0, rep: 0, exam: !!exam };
    shell.guard = () => window.confirm('Close the shop early? The customers will leave and today won\'t count.');
    SND().whoosh();
    intro();
  }
  function intro() {
    shell.go(intro);
    const cu = day.queue[day.i];
    shell.setBar(day.exam ? 'Royal test' : `Customer ${day.i + 1}/${day.queue.length}`, hudHTML());
    const notes = lvl('notes') ? `<p class="cr-notes">📓 Loves <b>${esc(W(cu.op.loves[0]))}</b> and <b>${esc(W(cu.op.loves[1]))}</b> · not a fan of <b>${esc(W(cu.op.dislikes[0]))}</b> · favorite color <b>${esc(TT.COLOR_WORD[cu.op.color])}</b></p>` : `<p class="cr-notes dim">📓 Get the Style notebook upgrade to see what customers love.</p>`;
    const tag = cu.kind === 'regular' ? `<span class="cr-tag reg">Regular · chapter ${(C().reg[cu.rg.id] || 0) + 1} of ${cu.rg.chapters.length}</span>` : cu.kind === 'exam' ? '<span class="cr-tag vip">Royal Inspector</span>' : cu.vip ? '<span class="cr-tag vip">VIP · tips double</span>' : cu.celeb ? '<span class="cr-tag vip">Superstar · tells everyone</span>' : '';
    shell.body().innerHTML = `<div class="cr-intro">
      <div class="cr-shop small">${shopArt(cu.st)}</div>
      <div class="cr-bubble">${tag}<span class="cr-who">${esc(cu.name)} the ${esc(TT.animalById(cu.animal).name.toLowerCase())}</span>
        <p class="cr-say">${esc(cu.text)}</p>${cu.kind === 'regular' ? `<p class="cr-wish">Wish: <b>${esc(cu.ch.text)}</b></p>` : ''}
        ${cu.twists.filter(t => t.type !== 'rush' || true).map(t => `<p class="cr-twist">${esc(twistText(t))}</p>`).join('')}
        ${notes}
        <button class="btn-big" type="button" data-dress>Let's get sewing!</button></div></div>`;
    shell.body().querySelector('[data-dress]').addEventListener('click', dress);
    SND().sparkle();
  }

  function dress() {
    const cu = day.queue[day.i];
    const st = cu.st;
    const slots = slotsNow();
    const per = 6 + lvl('rack') * 2;
    const goodTags = new Set(cu.ch.rules.filter(r => r.type === 'tags' || r.type === 'hold').flatMap(r => r.tags).concat(cu.op.loves));
    const owned = (s, it) => !TT.isLocked(s, it) && !TT.outOfSeason(s, it);
    const cols = TT.COLORS.filter(x => !x.locked);
    const opts = {};
    slots.forEach(s => {
      const items = TT.SLOTS[s].items.filter(it => owned(s, it));
      const fits = shuffle(items.filter(i => tagsOf(s, i.id).some(t => goodTags.has(t)))).slice(0, Math.min(3, Math.ceil(per / 3)));
      const rest = shuffle(items.filter(i => !fits.includes(i))).slice(0, per - fits.length);
      opts[s] = shuffle(fits.concat(rest)).map(i => ({ id: i.id, color: pick(cols).id }));
    });
    // a "favorite color" wish: make sure a few offered pieces already come in that color (needed before the dye station)
    cu.twists.filter(t => t.type === 'color').forEach(t => {
      const famCols = cols.filter(x => TT.colorFamily(x.hex) === t.fam);
      if (!famCols.length) return;
      const dyeable = s => TT.SLOTS[s].palette && opts[s].some(o => !(TT.itemOf(s, o.id) || {}).fixed);
      const sl = ['top', 'bottom', 'shoes', 'hat', 'neck', 'back', 'face', 'hold'].filter(s => opts[s] && dyeable(s));
      sl.slice(0, 4).forEach(s => {
        const can = opts[s].filter(o => !(TT.itemOf(s, o.id) || {}).fixed);
        shuffle(can).slice(0, 2).forEach(o => { o.color = pick(famCols).id; });
      });
    });
    const rushT = cu.twists.find(t => t.type === 'rush');
    const TIME = rushT ? 45 + (lvl('machine') ? 15 : 0) : 0;
    let tab = slots[0], left = TIME, done = false, dyeFor = null;
    shell.setBar(`${cu.name}`, hudHTML());
    shell.body().innerHTML = `<div class="ru cr-dress">
      <div class="ru-shop"><div class="ru-stage" id="crStage"></div>
        <div class="ru-ask"><span class="ru-who">${esc(cu.name)} wants:</span><strong>${esc(cu.ch.text)}</strong>
          ${cu.twists.filter(t => t.type !== 'rush').map(t => `<span class="cr-twist small">${esc(twistText(t))}</span>`).join('')}
          ${lvl('notes') ? `<span class="cr-notes small">📓 Loves ${esc(W(cu.op.loves[0]))} & ${esc(W(cu.op.loves[1]))} · not ${esc(W(cu.op.dislikes[0]))}</span>` : ''}
          ${TIME ? '<div class="g-timer"><span id="crTime"></span></div>' : ''}
          ${lvl('mirror') ? '<span class="cr-mirror" id="crMirror"></span>' : ''}
          <span class="cr-react" id="crReact" aria-live="polite"></span></div></div>
      <div class="ru-tabs" role="tablist">${slots.map(s => `<button class="ru-tab" type="button" role="tab" data-tab="${s}">${TT.SLOTS[s].label.replace('Specs & face fun', 'Specs').replace('Wings & capes', 'Wings').replace('Neckwear', 'Neck').replace('Pet pal', 'Pet')}</button>`).join('')}</div>
      <div class="ru-items" id="crItems"></div>
      <div class="cr-dye" id="crDye" hidden></div>
      <button class="btn-big ru-done" type="button" data-done>All done!</button></div>`;
    const $ = sel => shell.body().querySelector(sel);
    const drawStage = () => { $('#crStage').innerHTML = TT.svg(TT.compose(st, { pfx: `cr${day.i}-`, animated: false, fx: false }), '0 0 400 460'); if (lvl('mirror')) { const sc = scoreFor(cu, st); $('#crMirror').innerHTML = `🪞 ${'★'.repeat(sc.stars)}<span>${'★'.repeat(5 - sc.stars)}</span>`; } };
    const drawItems = () => {
      shell.body().querySelectorAll('.ru-tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab));
      $('#crItems').innerHTML = opts[tab].map((o, i) => {
        const it = TT.itemOf(tab, o.id);
        const s2 = Object.assign(clone(st), { [tab]: { id: o.id, color: o.color, color2: null, pattern: 'solid' } });
        return `<button class="g-opt" type="button" data-i="${i}" aria-pressed="${st[tab].id === o.id}">${TT.thumb(tab, it, s2)}<span>${esc(it.name)}</span></button>`;
      }).join('');
      drawDye();
    };
    const drawDye = () => {
      const box = $('#crDye');
      const e = st[tab];
      // without the Dye station, a customer with a favorite-color wish still lets you dye in that color
      const wish = cu.twists.find(t => t.type === 'color');
      const wishCols = wish ? cols.filter(x => TT.colorFamily(x.hex) === wish.fam) : [];
      const dyeCols = lvl('dye') ? cols : wishCols;
      if (!dyeCols.length || !e.id || !TT.SLOTS[tab].palette || (TT.itemOf(tab, e.id) || {}).fixed) { box.hidden = true; return; }
      box.hidden = false;
      box.innerHTML = `<span>🎨 ${lvl('dye') ? 'Dye' : `${esc(TT.COLOR_WORD[wish.fam])} dye`}:</span>` + dyeCols.map(cc => `<button class="swatch" type="button" data-dye="${cc.id}" style="background:${cc.hex}" aria-label="${cc.name}" aria-pressed="${e.color === cc.id}"></button>`).join('');
    };
    const react = (slot, id) => {
      const el = $('#crReact'); if (!el) return;
      const t = tagsOf(slot, id);
      const love = t.find(x => cu.op.loves.includes(x)), hate = t.find(x => cu.op.dislikes.includes(x));
      el.className = 'cr-react' + (hate ? ' nope' : love ? ' love' : '');
      el.textContent = hate ? `“Hmm, not ${W(hate)}…”` : love ? `“Ooh, I love ${W(love)}!”` : '';
    };
    const drawTime = () => { const el = $('#crTime'); if (el) { el.style.width = (left / TIME * 100) + '%'; el.classList.toggle('low', left <= 10); } };
    drawStage(); drawItems(); drawTime();
    const onClick = e => {
      const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; SND().tap(); drawItems(); return; }
      const b = e.target.closest('#crItems [data-i]');
      if (b) {
        const o = opts[tab][+b.dataset.i];
        const on = st[tab].id === o.id;
        st[tab] = on ? { id: null, color: o.color, color2: null, pattern: 'solid' } : { id: o.id, color: o.color, color2: null, pattern: 'solid' };
        SND().pop(); drawStage(); drawItems(); if (!on) react(tab, o.id); return;
      }
      const dy = e.target.closest('[data-dye]');
      if (dy) { st[tab].color = dy.dataset.dye; const o = opts[tab].find(x => x.id === st[tab].id); if (o) o.color = dy.dataset.dye; SND().swatch(); drawStage(); drawItems(); return; }
      if (e.target.closest('[data-done]')) finishCustomer();
    };
    shell.body().addEventListener('click', onClick);
    shell.cleanup(() => shell.body() && shell.body().removeEventListener('click', onClick));
    let tick = null;
    if (TIME) tick = shell.every(() => { left -= 0.25; drawTime(); if (left <= 0) finishCustomer(); }, 250);
    function finishCustomer() {
      if (done) return; done = true; if (tick) clearInterval(tick);
      shell.body().removeEventListener('click', onClick);
      result(cu, scoreFor(cu, st));
    }
  }

  function result(cu, sc) {
    const c = C();
    const st = cu.st;
    const stars = sc.stars;
    let tips = stars * 3 + sc.hp.loves * 2;
    if (cu.vip) tips *= 2;
    if (lvl('chairs') && stars >= 3) tips = Math.round(tips * 1.25);
    let rep = stars + (stars === 5 ? 1 : 0) + (cu.celeb && stars >= 4 ? 3 : 0);
    let story = '';
    if (cu.kind === 'exam') { tips = 0; rep = 0; }
    day.tips += tips; day.rep += rep; day.results.push({ cu, stars });
    c.tips += tips; c.served++;
    // reputation fills up to the next rank; past that you need the Royal Inspector's test
    const cap = c.rank < RANKS.length - 1 ? RANKS[c.rank + 1].rep : Infinity;
    c.rep = Math.min(cap, c.rep + rep);
    if (stars === 5) { c.fives++; const lk = clone(st); lk.pose = { id: 'tada' }; c.fame.unshift(lk); c.fame = c.fame.slice(0, 8); }
    let examMsg = '';
    if (cu.kind === 'regular') {
      if (stars >= 3) {
        c.reg[cu.rg.id] = (c.reg[cu.rg.id] || 0) + 1; c.regLast = cu.rg.id;
        story = cu.chap.thanks;
        if (c.reg[cu.rg.id] >= cu.rg.chapters.length) {
          TT.earn(15);
          const g = REG_GIFT[cu.rg.id]; if (g && TT.houseGift) TT.houseGift(g);
          story += ` (Story complete! +15 stitches and a gift for your critter house.)`;
        }
      } else { c.regLast = cu.rg.id; story = 'Hmm, that\'s not quite it. Let\'s try again another day!'; }
    }
    if (cu.kind === 'exam') {
      if (stars >= 4) {
        c.rank++; const gift = 15 + c.rank * 5; TT.earn(gift);
        if (TT.houseGift) TT.houseGift('trophy' + Math.min(3, Math.ceil(c.rank / 2.5)));
        examMsg = `<p class="cr-rankup">🎉 You passed! You are now a <b>${RANKS[c.rank].name}</b>! +${gift} stitches.</p><p class="modal-sub">${RANK_NEWS[c.rank]}</p>`;
      } else examMsg = `<p class="cr-rankup no">Not this time. You need 4 stars or more. Open the shop to practice, then try again!</p>`;
    }
    const quote = cu.kind === 'regular' && story ? story : ['', 'Hmm… not quite what I wanted.', 'It\'s okay, I guess!', 'I like it!', 'I love it!', 'This is PERFECT! Thank you!'][stars];
    if (cu.kind !== 'exam') {
      c.reviews.unshift({ s: stars, t: reviewLine(cu, stars), who: `${cu.name} the ${TT.animalById(cu.animal).name.toLowerCase()}` }); c.reviews = c.reviews.slice(0, 12);
    }
    save();
    st.pose = { id: stars >= 4 ? 'hooray' : stars >= 3 ? 'wave' : 'shy' };
    if (!TT.itemOf('pose', st.pose.id)) st.pose = { id: TT.POSES[0].id };
    st.eyes = { id: stars >= 4 ? 'happy' : stars >= 3 ? 'sparkle' : 'sleepy' };
    if (!TT.itemOf('eyes', st.eyes.id)) st.eyes = { id: TT.EYES[0].id };
    const tips2 = sc.lines.filter(l => !l.good).slice(0, 2).map(l => ({ good: false, msg: l.msg })).concat(sc.notes).slice(0, 4);
    const last = day.i + 1 >= day.queue.length;
    shell.setBar(cu.name, hudHTML());
    shell.body().innerHTML = `<div class="ru-result"><div class="ru-stage">${TT.svg(TT.compose(st, { pfx: `crr${day.i}-`, animated: true }), '0 0 400 460')}</div>
      <div class="ru-verdict">${'<span class="g-stars">' + '★'.repeat(stars) + '<span>' + '★'.repeat(5 - stars) + '</span></span>'}
        <p class="g-say">“${esc(quote)}”</p>
        ${tips2.length ? `<ul class="ru-tips">${tips2.map(l => `<li class="${l.good ? 'ok' : ''}">${esc(l.msg)}</li>`).join('')}</ul>` : ''}
        ${cu.kind !== 'exam' ? `<p class="cr-earn">🪙 +${tips} tips · ★ +${rep} reputation</p>` : ''}${examMsg}
        <form class="ru-save" id="crSave"><label for="crName">Keep this critter? Give it a name:</label>
          <div class="ru-save-row"><input id="crName" class="text-in" maxlength="24" value="${esc(st.name)}" autocomplete="off" aria-label="Critter name"><button class="btn-soft" type="submit">Save to closet</button></div><p class="ru-saved" id="crSaved" role="status" aria-live="polite"></p></form>
        <button class="btn-big" type="button" data-next>${last ? 'Close the shop' : 'Next customer'}</button></div></div>`;
    stars >= 4 ? SND().cheer() : stars >= 3 ? SND().sparkle() : SND().undo();
    shell.body().querySelector('[data-next]').addEventListener('click', () => { day.i++; if (day.i < day.queue.length) intro(); else endDay(); });
    shell.body().querySelector('#crSave').addEventListener('submit', e => {
      e.preventDefault();
      const name = TT.cleanName(shell.body().querySelector('#crName').value.trim().slice(0, 24), st.name);
      const lk = clone(st); lk.name = name; lk.pose = { id: 'wave' };
      shell.ctx.saveLook(lk, saved => { const m = shell.body().querySelector('#crSaved'); if (!m) return; m.textContent = saved ? `${name} is hanging in your closet!` : 'Not saved.'; if (saved) { SND().sparkle(); shell.body().querySelector('#crSave button').disabled = true; } });
    });
  }
  function reviewLine(cu, stars) {
    const nm = cu.name;
    return pick([
      ['', 'Hmm, maybe next time.', 'It was okay!', 'Nice shop, nice clothes!', 'I felt SO stylish!', 'Best tailor in the whole world!'][stars],
      ['', 'Not my style, but they tried.', 'Pretty good!', `${nm} would come back!`, 'My friends all asked where I got my outfit!', 'I cried happy tears. Five stars!'][stars]
    ]);
  }
  function endDay() {
    shell.guard = null;
    const c = C();
    if (day.exam) { home(); return; }
    c.days++;
    const avg = day.results.reduce((n, r) => n + r.stars, 0) / Math.max(1, day.results.length);
    const stars = Math.max(1, Math.round(avg));
    const rw = TT.rewardGame('career', stars);
    save();
    shell.wallet();
    shell.setBar('Closing time', hudHTML());
    shell.body().innerHTML = `<div class="g-end cr-end">
      <span class="g-stars">${'★'.repeat(stars)}<span>${'★'.repeat(5 - stars)}</span></span>
      <p class="g-end-word">${['', 'A slow day.', 'Not bad!', 'A good day!', 'A great day!', 'What a day!'][stars]}</p>
      <div class="cr-sum">${day.results.map(r => `<div class="cr-sum-row">${TT.thumb('animal', TT.animalById(r.cu.animal), r.cu.st)}<span>${esc(r.cu.name)}</span><b>${'★'.repeat(r.stars)}</b></div>`).join('')}</div>
      <p class="cr-earn">🪙 +${day.tips} tips · ★ +${day.rep} reputation${rw.earned ? ` · ${TT.SPOOL} +${rw.earned} stitches` : ''}</p>
      ${examReady() ? `<p class="cr-rankup">👑 You have enough reputation for the next rank! Take the Royal Inspector's test.</p>` : ''}
      ${rankBar()}
      <div class="g-end-actions"><button class="btn-big" type="button" data-home>Back to the shop</button></div></div>`;
    SND().cheer();
    shell.body().querySelector('[data-home]').addEventListener('click', home);
    if (TT.albumPing) TT.albumPing();
  }

  /* ---------------- upgrades ---------------- */
  function upgrades() {
    shell.go(upgrades);
    const c = C();
    shell.setBar('Upgrades', hudHTML());
    shell.body().innerHTML = `<div class="cr-ups"><p class="g-intro">Spend your tips 🪙 to make your shop better.</p>
      <div class="cr-up-list">${UPGRADES.map(u => {
        const l = lvl(u.id), nxt = u.levels[l];
        const maxed = !nxt, needRank = nxt && nxt.rank > c.rank;
        return `<div class="cr-up"><span class="cr-up-ic">${u.icon}</span><div><b>${esc(u.name)}${u.levels.length > 1 ? ` <em>level ${l}/${u.levels.length}</em>` : ''}</b><span>${esc(u.desc)}</span></div>
          ${maxed ? '<span class="cr-own">✓ Got it</span>' : needRank ? `<span class="cr-lock">🔒 ${RANKS[nxt.rank].name}</span>` : `<button class="btn-soft" type="button" data-buy="${u.id}" ${c.tips < nxt.cost ? 'disabled' : ''}>🪙 ${nxt.cost}</button>`}</div>`;
      }).join('')}</div>
      <div class="row-label">Shop paint</div>
      <div class="cr-paints">${PAINTS.map(p => { const own = c.paints.includes(p.id); return `<button class="cr-paint" type="button" data-paint="${p.id}" aria-pressed="${c.paint === p.id}" style="--w:${p.wall};--s:${p.stripe}"><i></i><span>${esc(p.name)}</span><em>${own ? (c.paint === p.id ? 'on' : 'owned') : '🪙 ' + p.cost}</em></button>`; }).join('')}</div>
      <p class="cr-msg" id="crMsg" role="status" aria-live="polite"></p></div>`;
    shell.body().querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
      const u = UPGRADES.find(x => x.id === b.dataset.buy), nxt = u.levels[lvl(u.id)];
      if (!nxt || c.tips < nxt.cost || nxt.rank > c.rank) return;
      c.tips -= nxt.cost; c.up[u.id] = lvl(u.id) + 1; save(); SND().sparkle(); upgrades();
      const m = shell.body().querySelector('#crMsg'); if (m) m.textContent = `${u.name} installed!`;
    }));
    shell.body().querySelectorAll('[data-paint]').forEach(b => b.addEventListener('click', () => {
      const p = PAINTS.find(x => x.id === b.dataset.paint);
      if (!c.paints.includes(p.id)) { if (c.tips < p.cost) { const m = shell.body().querySelector('#crMsg'); if (m) m.textContent = `You need ${p.cost - c.tips} more tips.`; SND().undo(); return; } c.tips -= p.cost; c.paints.push(p.id); }
      c.paint = p.id; save(); SND().swatch(); upgrades();
    }));
  }

  /* ---------------- regulars ---------------- */
  function regulars() {
    shell.go(regulars);
    const c = C();
    shell.setBar('Regular customers', hudHTML());
    shell.body().innerHTML = `<div class="cr-regs"><p class="g-intro">Regulars visit your shop with a story to tell. Help them through every chapter (3 stars or more) to finish their story and get a gift for your critter house.</p>
      ${REGULARS.map(rg => {
        const open = rg.rank <= c.rank, n = c.reg[rg.id] || 0, done = n >= rg.chapters.length;
        return `<div class="cr-reg${open ? '' : ' locked'}"><span class="cr-reg-art">${open ? TT.careerRegularArt(rg) : '<i class="al-q">?</i>'}</span>
          <div><b>${open ? esc(rg.name) : '???'}</b><span>${open ? (done ? 'Story complete! ✓' : `Chapter ${n + 1} of ${rg.chapters.length}: “${esc(rg.chapters[n].say)}”`) : `Meets you when you're a ${RANKS[rg.rank].name}.`}</span>
          ${open ? `<div class="cr-dots">${rg.chapters.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>` : ''}</div></div>`;
      }).join('')}</div>`;
  }
  function reviews() {
    shell.go(reviews);
    const c = C();
    shell.setBar('Reviews', hudHTML());
    shell.body().innerHTML = `<div class="cr-revs">${c.reviews.length ? c.reviews.map(r => `<div class="cr-rev"><span class="g-stars sm">${'★'.repeat(r.s)}<span>${'★'.repeat(5 - r.s)}</span></span><p>“${esc(r.t)}”</p><em>— ${esc(r.who)}</em></div>`).join('') : '<div class="empty">No reviews yet. Open the shop to meet your first customers!</div>'}</div>`;
  }
  function nameShop() {
    shell.go(nameShop);
    const c = C();
    shell.setBar('Name your shop', hudHTML());
    shell.body().innerHTML = `<div class="cr-name"><div class="cr-shop">${shopArt()}</div>
      <form id="crNameForm" class="code-in"><input id="crShopName" class="text-in" maxlength="22" placeholder="Tiny Tailors" value="${esc(c.shopName)}" autocomplete="off" aria-label="Shop name"><button class="btn-big" type="submit">Hang the sign</button></form>
      <p class="modal-sub">Please don't use your real name or your school's name.</p></div>`;
    shell.body().querySelector('#crNameForm').addEventListener('submit', e => { e.preventDefault(); c.shopName = TT.cleanName(shell.body().querySelector('#crShopName').value.trim().slice(0, 22)); save(); SND().sparkle(); home(); });
  }
})(window.TT);
