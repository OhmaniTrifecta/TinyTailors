/* Tiny Tailors — style challenges and the judge.
   Every item carries theme tags. A challenge is a list of rules; each rule is worth
   points, and the judge adds up how well the outfit meets each rule (no dice rolls). */
(function (TT) {
  /* ---------- theme tags for every item ---------- */
  const TAGS = {
    top: {
      tee: 'casual sporty summer', tank: 'summer beach sporty', hoodie: 'cozy sporty casual adventure', sweater: 'cozy winter autumn',
      cardigan: 'cozy autumn school', sundress: 'summer beach garden spring', gown: 'royal fancy ballet', raincoat: 'rainy adventure',
      denim: 'casual rock adventure', sailor: 'sea pirate school', hawaiian: 'beach summer', puffer: 'winter adventure',
      astro: 'space adventure', knight: 'knight royal hero', pajama: 'sleepy cozy', jersey: 'sporty', labcoat: 'school detective science',
      chef: 'chef', bee: 'bee nature garden', kimono: 'fancy spring', leotard: 'ballet sporty', wizard: 'magic spooky',
      vest: 'fancy music detective', hero: 'hero', tux: 'fancy music', ruffle: 'fancy royal',
      dinohoodie: 'cozy adventure spooky', royalrobe: 'royal fancy', starlight: 'fancy royal magic space', shelltop: 'sea beach'
    },
    bottom: {
      shorts: 'summer sporty beach', pants: 'casual school', jeans: 'casual rock adventure', skirt: 'school spring', pleated: 'school fancy',
      tutu: 'ballet fancy', overalls: 'garden adventure casual', leggings: 'sporty ballet cozy', cargo: 'adventure summer', joggers: 'sporty cozy',
      ballskirt: 'royal fancy', bloomers: 'royal spring', mermaid: 'sea beach magic', flares: 'music rock', hula: 'beach summer',
      pjpants: 'sleepy cozy', tiered: 'spring fancy', rainbowtutu: 'ballet rainbow fancy', cloudskirt: 'magic rainy'
    },
    shoes: {
      sneakers: 'sporty casual', hightops: 'sporty rock', boots: 'autumn adventure winter', rainboots: 'rainy garden', flats: 'ballet fancy',
      sandals: 'beach summer', bunny: 'sleepy cozy', skates: 'sporty music', flippers: 'beach sea', cowboy: 'adventure music',
      maryjanes: 'school fancy', clogs: 'garden chef casual', lightup: 'party sporty', socks: 'cozy sleepy winter',
      glass: 'royal fancy magic', rocket: 'space hero'
    },
    hat: {
      beanie: 'winter cozy', cap: 'sporty summer', tophat: 'fancy magic', crown: 'royal', tiara: 'royal fancy ballet', party: 'party',
      witch: 'spooky magic', flowers: 'spring garden fairy', bow: 'fancy spring', beret: 'fancy autumn', chef: 'chef', bucket: 'beach summer garden adventure',
      cowboy: 'adventure music', headphones: 'music', viking: 'knight adventure', propeller: 'party school', wizard: 'magic', halo: 'magic fairy',
      sunhat: 'beach summer garden', grad: 'school', pirate: 'pirate', astro: 'space', strawberry: 'garden spring', mushroom: 'fairy autumn nature garden',
      santa: 'winter party', bunnyband: 'spring party', antennae: 'bee nature space',
      icecreamhat: 'party summer', unicornband: 'magic fairy rainbow', froghat: 'rainy nature garden', cupcakehat: 'party chef', starhalo: 'magic space royal'
    },
    hair: {},
    face: {
      round: 'school detective', hearts: 'beach summer party', stars: 'party rock', shades: 'beach summer rock', cateye: 'fancy',
      monocle: 'fancy detective', goggles: 'sea beach sporty', patch: 'pirate', mask: 'hero spooky', '3d': 'party', mustache: 'detective chef',
      clown: 'party', bandaid: 'sporty adventure', rainbow: 'rainbow party', whiskers: 'spooky party', diamond: 'fancy royal', galaxygoggles: 'space'
    },
    neck: {
      bowtie: 'fancy music', scarf: 'winter autumn cozy', pearls: 'fancy royal', medal: 'sporty hero', bandana: 'pirate adventure', tie: 'fancy school detective',
      locket: 'fancy', bell: 'winter party', lei: 'beach summer', ruffle: 'royal fancy', bigbow: 'fancy party', goldchain: 'royal rock', butterflyneck: 'fairy garden'
    },
    back: {
      angel: 'magic fairy', butterfly: 'fairy garden spring', fairy: 'fairy magic', bat: 'spooky', dragon: 'magic knight adventure', bee: 'bee nature',
      cape: 'hero royal', backpack: 'school adventure', jetpack: 'space hero', shell: 'sea nature', rainbow: 'rainbow magic', balloonpack: 'party',
      phoenix: 'magic hero', galaxycape: 'space magic royal', bubblewings: 'sea fairy'
    },
    hold: {
      balloon: 'party', icecream: 'summer food beach', lollipop: 'party food', wand: 'magic fairy', bouquet: 'garden spring', teddy: 'sleepy cozy',
      umbrella: 'rainy', sword: 'knight pirate hero', book: 'school sleepy detective', boba: 'food summer', cupcake: 'party food chef', magnifier: 'detective science',
      mic: 'music rock', brush: 'school art', bubbles: 'summer party sea', kite: 'summer adventure', donut: 'food chef', carrot: 'garden food chef',
      fish: 'sea food', teacup: 'royal fancy food', orb: 'magic spooky', trophy: 'sporty hero', starballoon: 'party space'
    },
    pet: {
      chick: 'spring garden', snail: 'garden rainy nature', bunny: 'spring garden', kitten: 'cozy', puppy: 'cozy adventure', ladybug: 'garden nature',
      butterfly: 'garden fairy spring', fishbowl: 'sea', dragon: 'magic knight', ghost: 'spooky', cloud: 'rainy magic', hedgehog: 'autumn nature',
      shroom: 'fairy autumn nature', bee: 'bee garden', turtle: 'sea beach nature', babyunicorn: 'magic fairy rainbow', phoenixchick: 'magic',
      starbuddy: 'space magic', whale: 'sea'
    },
    scene: {
      tailor: 'fancy', studio: 'fancy', meadow: 'garden spring nature bee', beach: 'beach summer sea pirate', forest: 'nature adventure fairy', space: 'space',
      candy: 'party food', sea: 'sea pirate', snow: 'winter', city: 'rock music', rainbow: 'rainbow magic', party: 'party', castle: 'royal knight magic fairy',
      bedroom: 'sleepy cozy', autumn: 'autumn', sakura: 'spring garden', stage: 'music ballet rock fancy', spooky: 'spooky', clouds: 'magic fairy rainy',
      aurora: 'winter magic space', volcano: 'beach adventure summer', crystal: 'magic spooky adventure'
    },
    fx: {
      sparkles: 'magic fancy', hearts: 'party', bubbles: 'sea', confetti: 'party', stars: 'space magic', snow: 'winter', petals: 'spring garden',
      notes: 'music', fireflies: 'nature spooky', leaves: 'autumn', glitter: 'party rainbow', goldsparkle: 'royal fancy', comets: 'space', balloonfx: 'party'
    }
  };
  TT.TAGS = TAGS;
  const WEAR = ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold', 'pet', 'hair'];
  const CLOTHES = ['top', 'bottom', 'shoes', 'hat', 'neck', 'back'];
  const tagsOf = (slot, id) => ((TAGS[slot] || {})[id] || '').split(' ').filter(Boolean);

  /* ---------- colour families from a hex colour ---------- */
  TT.colorFamily = function (hex) {
    const h0 = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h0.slice(i, i + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    if (s < 0.18 || d < 0.08) return l > 0.82 ? 'white' : l < 0.42 ? 'dark' : 'gray';
    if (l < 0.3) return 'dark';
    if ((h < 18 || h >= 335)) return l > 0.7 ? 'pink' : 'red';
    if (h < 45) return (l < 0.58 && s < 0.6) ? 'brown' : 'orange';
    if (h < 68) return 'yellow';
    if (h < 165) return 'green';
    if (h < 255) return 'blue';
    if (h < 300) return 'purple';
    return 'pink';
  };
  TT.FAMILY_NAMES = { pink: 'pink', red: 'red', orange: 'orange', brown: 'brown', yellow: 'yellow', green: 'green', blue: 'blue', purple: 'purple', white: 'white', gray: 'gray', dark: 'dark' };

  /* ---------- facts about an outfit the rules can look at ---------- */
  function facts(st) {
    const worn = [];
    for (const slot of WEAR) {
      const e = st[slot];
      if (!e || !e.id) continue;
      const it = TT.itemOf(slot, e.id);
      if (!it) continue;
      const colored = TT.SLOTS[slot].palette && !it.fixed && slot !== 'pet';
      worn.push({ slot, id: e.id, name: it.name, tags: tagsOf(slot, e.id).concat(e.pattern === 'rainbow' ? ['rainbow'] : []),
        family: colored ? TT.colorFamily(TT.colorHex(slot, e.color)) : null, pattern: TT.SLOTS[slot].patterns ? (e.pattern || 'solid') : null });
    }
    const top = TT.itemOf('top', st.top.id), bottom = TT.itemOf('bottom', st.bottom.id);
    const dressLike = top && ['sundress', 'gown', 'wizard', 'labcoat', 'royalrobe', 'starlight', 'raincoat'].includes(top.id);
    const hasTop = !!top, hasBottom = !!bottom || dressLike;
    const hasShoes = !!st.shoes.id || (bottom && bottom.hideFeet);
    const sceneTags = tagsOf('scene', st.scene.id), fxTags = st.fx && st.fx.id ? tagsOf('fx', st.fx.id) : [];
    return { worn, hasTop, hasBottom, hasShoes, sceneTags, fxTags, st };
  }
  const countTag = (f, tags) => f.worn.filter(w => w.tags.some(t => tags.includes(t))).length + (f.fxTags.some(t => tags.includes(t)) ? 1 : 0);

  /* ---------- rule types ---------- */
  const RULES = {
    // wear at least `min` things tagged with any of `tags`
    tags: (f, r) => { const n = countTag(f, r.tags); return { got: Math.min(1, n / r.min), note: `${Math.min(n, r.min)} of ${r.min} ${r.label}` }; },
    scene: (f, r) => ({ got: f.sceneTags.some(t => r.tags.includes(t)) ? 1 : 0 }),
    avoid: (f, r) => { const bad = f.worn.filter(w => w.tags.some(t => r.tags.includes(t))); return { got: bad.length ? Math.max(0, 1 - bad.length * 0.5) : 1, bad: bad.map(b => b.name) }; },
    dressed: f => ({ got: ([f.hasTop, f.hasBottom, f.hasShoes].filter(Boolean).length) / 3 }),
    oneColor: f => {
      const fams = f.worn.filter(w => w.family).map(w => w.family);
      if (fams.length < 2) return { got: 0 };
      const counts = {}; fams.forEach(x => counts[x] = (counts[x] || 0) + 1);
      return { got: Math.max(...Object.values(counts)) / fams.length };
    },
    onlyColors: (f, r) => { const fams = f.worn.filter(w => w.family).map(w => w.family); if (!fams.length) return { got: 0 }; return { got: fams.filter(x => r.families.includes(x)).length / fams.length }; },
    someColors: (f, r) => { const n = f.worn.filter(w => w.family && r.families.includes(w.family)).length; return { got: Math.min(1, n / r.min) }; },
    rainbow: (f, r) => { const fams = new Set(f.worn.filter(w => w.family && !['white', 'gray', 'dark', 'brown'].includes(w.family)).map(w => w.family)); return { got: Math.min(1, fams.size / r.min), note: `${fams.size} colors` }; },
    patterns: (f, r) => { const p = new Set(f.worn.filter(w => w.pattern && w.pattern !== 'solid').map(w => w.pattern)); return { got: Math.min(1, p.size / r.min) }; },
    many: (f, r) => ({ got: Math.min(1, f.worn.length / r.min) }),
    hold: (f, r) => { const h = f.worn.find(w => w.slot === 'hold'); return { got: h && h.tags.some(t => r.tags.includes(t)) ? 1 : 0 }; },
    pose: (f, r) => ({ got: r.ids.includes((f.st.pose && f.st.pose.id) || 'stand') ? 1 : 0 }),
    notStand: f => ({ got: (f.st.pose && f.st.pose.id && f.st.pose.id !== 'stand') ? 1 : 0 }),
    eyes: (f, r) => ({ got: r.ids.includes(f.st.eyes.id) ? 1 : 0 }),
    pet: f => ({ got: f.st.pet && f.st.pet.id ? 1 : 0 }),
    petMatch: f => {
      const pe = f.st.pet;
      if (!pe || !pe.id) return { got: 0 };
      const fam = TT.colorFamily(TT.colorHex('pet', pe.color));
      const n = f.worn.filter(w => w.slot !== 'pet' && w.family === fam).length;
      return { got: Math.min(1, n / 2) };
    }
  };

  /* ---------- the challenges ---------- */
  const tg = (tags, min, w, label, tip) => ({ type: 'tags', tags: tags.split(' '), min, w, label, tip });
  const sc = (tags, w, tip) => ({ type: 'scene', tags: tags.split(' '), w, tip });
  const av = (tags, w, tip) => ({ type: 'avoid', tags: tags.split(' '), w, tip });
  const dr = (w = 15) => ({ type: 'dressed', w, tip: 'Finish the outfit: a top, something on the bottom and shoes.' });
  TT.CHALLENGES = [
    { id: 'beach', text: 'Pack for a sunny beach day', rules: [tg('beach summer', 3, 45, 'beachy things', 'Add beach things, like sandals, a sun hat, shades or an aloha shirt.'), sc('beach', 25, 'Pick a beach or under-the-sea scene.'), av('winter', 15, 'Snow clothes are way too warm for the beach!'), dr()] },
    { id: 'tea', text: 'Get ready for a royal tea party', rules: [tg('royal fancy', 3, 40, 'fancy things', 'Royals love fancy things: a crown, pearls, a gown or a ruffle collar.'), { type: 'hold', tags: ['food', 'royal'], w: 20, tip: 'Bring something for the tea party, like a teacup or a cupcake.' }, sc('royal fancy party', 20, 'Try the castle or the birthday scene.'), dr(20)] },
    { id: 'space', text: 'Blast off as a space explorer', rules: [tg('space', 2, 45, 'space things', 'Astronauts need gear: a space suit, a space helmet or a jetpack.'), sc('space', 30, 'Pick the outer space scene.'), av('beach', 10, 'Flip-flops in space? Leave the beach gear at home.'), dr()] },
    { id: 'pajama', text: 'Throw the coziest pajama party', rules: [tg('sleepy cozy', 3, 45, 'cozy things', 'Grab cozy things: PJs, bunny slippers, a teddy bear.'), sc('sleepy cozy', 25, 'The cozy bedroom is perfect for this.'), { type: 'eyes', ids: ['sleepy', 'happy'], w: 15, tip: 'Make your critter look sleepy or happy.' }, dr()] },
    { id: 'spooky', text: 'Spooky... but make it cute', rules: [tg('spooky', 2, 40, 'spooky things', 'Try bat wings, a witch hat, a ghost pal or a hero mask.'), sc('spooky', 25, 'Pick the not-so-spooky scene.'), { type: 'someColors', families: ['purple', 'dark', 'orange'], min: 2, w: 20, tip: 'Spooky colors: purple, orange or midnight.' }, dr()] },
    { id: 'rainbow', text: 'Rainbow everything!', rules: [{ type: 'rainbow', min: 5, w: 50, tip: 'Use at least 5 different colors.' }, tg('rainbow', 1, 25, 'rainbow things', 'Add something rainbow: rainbow fabric, a rainbow aura or rainbow glitter.'), dr(25)] },
    { id: 'onecolor', text: 'Wear one color from head to toe', rules: [{ type: 'oneColor', w: 70, tip: 'Make all your clothes the same color.' }, { type: 'many', min: 5, w: 30, tip: 'Wear at least 5 things.' }] },
    { id: 'patterns', text: 'Mix three different patterns', rules: [{ type: 'patterns', min: 3, w: 70, tip: 'Use 3 different fabrics, like stripes, dots and gingham.' }, dr(30)] },
    { id: 'hero', text: 'Superhero to the rescue', rules: [tg('hero', 2, 50, 'hero things', 'Heroes need a super suit, a cape or a hero mask.'), { type: 'pose', ids: ['hooray', 'tada', 'jump', 'superstar', 'point'], w: 25, tip: 'Strike a hero pose, like Hooray! or Jump!' }, dr(25)] },
    { id: 'dinner', text: 'Dress up for a fancy dinner', rules: [tg('fancy', 3, 50, 'fancy things', 'Fancy means a bow tie, pearls, a tuxedo or a gown.'), av('sporty sleepy', 20, 'Sports clothes and PJs are not fancy-dinner clothes.'), dr(30)] },
    { id: 'fairy', text: 'Become a garden fairy', rules: [tg('fairy garden', 3, 45, 'fairy things', 'Fairies love wings, flower crowns and a magic wand.'), sc('garden nature spring fairy', 25, 'Pick the meadow, forest or cherry blossoms.'), { type: 'someColors', families: ['green', 'pink', 'purple'], min: 2, w: 15, tip: 'Use garden colors like green, pink or lavender.' }, dr()] },
    { id: 'pirate', text: 'Sail the seas as a pirate captain', rules: [tg('pirate', 2, 45, 'pirate things', 'Pirates wear a pirate hat, an eye patch and a bandana.'), sc('pirate sea', 25, 'Head to the beach or under the sea.'), dr(30)] },
    { id: 'snow', text: 'Snow day adventure', rules: [tg('winter', 3, 45, 'warm things', 'Bundle up with a beanie, a scarf, a puffer jacket and boots.'), sc('winter', 25, 'Pick the snow day scene.'), av('beach', 15, 'Brrr! Beach clothes are too chilly for snow.'), dr()] },
    { id: 'rockstar', text: 'Rock star on the big stage', rules: [tg('music rock', 2, 40, 'rock star things', 'Grab a microphone, headphones, cool shades or a jean jacket.'), sc('music rock', 25, 'Play on the spotlight stage or in the city.'), { type: 'notStand', w: 15, tip: 'Rock stars strike a pose!' }, dr(20)] },
    { id: 'chef', text: 'Head chef in a busy kitchen', rules: [tg('chef', 2, 45, 'chef things', 'Chefs wear a chef coat and a chef hat.'), { type: 'hold', tags: ['food'], w: 25, tip: 'Hold something yummy you cooked.' }, dr(30)] },
    { id: 'ballet', text: 'Ballet recital tonight', rules: [tg('ballet', 2, 45, 'ballet things', 'Try a tutu, a leotard, ballet flats or a tiara.'), sc('ballet', 25, 'Dance on the spotlight stage.'), { type: 'pose', ids: ['hooray', 'tada', 'ballerina'], w: 15, tip: 'Strike a dance pose.' }, dr()] },
    { id: 'wizard', text: 'First day at wizard school', rules: [tg('magic', 3, 50, 'magic things', 'Wizards need a wizard hat, a robe and a magic wand.'), sc('royal magic', 20, 'The castle is a great wizard school.'), dr(30)] },
    { id: 'sea', text: 'Under the sea explorer', rules: [tg('sea', 2, 45, 'ocean things', 'Try a mermaid tail, swim goggles, flippers or a fish pal.'), sc('sea', 35, 'Dive under the sea.'), dr(20)] },
    { id: 'birthday', text: 'Birthday party guest of honor', rules: [tg('party', 3, 45, 'party things', 'Party time: a party hat, a balloon, confetti or a cupcake.'), sc('party', 25, 'Pick the birthday bash scene.'), dr(30)] },
    { id: 'bedtime', text: 'Sleepy bedtime story', rules: [tg('sleepy cozy', 2, 35, 'cozy things', 'Put on PJs or bunny slippers.'), { type: 'hold', tags: ['school', 'sleepy'], w: 20, tip: 'Hold a storybook or a teddy.' }, sc('sleepy', 25, 'Pick the cozy bedroom.'), { type: 'eyes', ids: ['sleepy'], w: 20, tip: 'Give your critter sleepy eyes.' }] },
    { id: 'game', text: 'Big game day!', rules: [tg('sporty', 3, 50, 'sporty things', 'Wear a jersey, sneakers and a ball cap.'), { type: 'pose', ids: ['hooray', 'jump', 'tada', 'superstar'], w: 25, tip: 'Cheer with a Hooray! or Jump! pose.' }, dr(25)] },
    { id: 'picnic', text: 'Picnic under the cherry blossoms', rules: [sc('spring', 30, 'Pick the cherry blossoms or the meadow.'), tg('spring garden', 2, 30, 'spring things', 'Add flowers, a sun hat or a sundress.'), { type: 'someColors', families: ['pink'], min: 2, w: 20, tip: 'Wear some pink, like the blossoms.' }, dr(20)] },
    { id: 'knight', text: 'Knight guarding the castle', rules: [tg('knight', 2, 50, 'knight things', 'Knights wear armor and a helmet, and carry a sword.'), sc('knight', 30, 'Guard the castle.'), dr(20)] },
    { id: 'autumn', text: 'Autumn walk in the park', rules: [sc('autumn', 30, 'Pick the autumn park.'), tg('autumn cozy', 2, 30, 'autumn things', 'Try a cozy sweater, a scarf, boots or a beret.'), { type: 'someColors', families: ['orange', 'brown', 'yellow', 'red'], min: 2, w: 20, tip: 'Use leafy colors: orange, red, yellow or brown.' }, dr(20)] },
    { id: 'petmatch', text: 'Match your pet pal', rules: [{ type: 'pet', w: 30, tip: 'Bring a pet pal!' }, { type: 'petMatch', w: 50, tip: 'Make 2 or more clothes the same color as your pet.' }, dr(20)] },
    { id: 'pastel', text: 'Only pinks and purples', rules: [{ type: 'onlyColors', families: ['pink', 'purple'], w: 70, tip: 'Every color should be pink or purple.' }, { type: 'many', min: 4, w: 30, tip: 'Wear at least 4 things.' }] },
    { id: 'camping', text: 'Ready for a camping trip', rules: [tg('adventure nature', 3, 50, 'outdoor things', 'Campers need a backpack, boots, a hoodie or a bucket hat.'), sc('nature adventure', 30, 'Head into the forest.'), dr(20)] },
    { id: 'runway', text: 'Fashion week runway look', rules: [tg('fancy', 2, 25, 'fancy things', 'Add something fancy.'), { type: 'patterns', min: 2, w: 20, tip: 'Use at least 2 fun fabrics.' }, { type: 'many', min: 7, w: 25, tip: 'Accessorize! Wear 7 or more things.' }, { type: 'notStand', w: 15, tip: 'Strike a runway pose.' }, sc('music fancy', 15, 'Walk the spotlight stage.')] },
    { id: 'bee', text: 'Busy bee in the meadow', rules: [tg('bee', 2, 50, 'bee things', 'Try the bumble bee top, bee wings or bug antennae.'), sc('bee', 30, 'Buzz over to the sunny meadow.'), { type: 'someColors', families: ['yellow'], min: 2, w: 20, tip: 'Bees love yellow!' }] },
    { id: 'rainy', text: 'Splashing on a rainy day', rules: [tg('rainy', 2, 50, 'rain gear', 'Grab a raincoat, rain boots and an umbrella.'), av('beach', 20, 'Sandals will get soggy!'), dr(30)] },
    { id: 'detective', text: 'Detective on a secret case', rules: [tg('detective', 3, 55, 'detective things', 'Detectives carry a magnifying glass and wear a tie, specs or a monocle.'), dr(25), { type: 'eyes', ids: ['determined', 'dot', 'surprised'], w: 20, tip: 'Give your critter a focused look.' }] },
    { id: 'magiccastle', text: 'Royal ball at the castle', rules: [tg('royal', 2, 40, 'royal things', 'Wear a crown or tiara and a gown or royal robe.'), sc('royal', 25, 'Head to the castle.'), tg('fancy', 3, 20, 'fancy things', 'Add fancy touches like pearls or glass slippers.'), dr()] }
  ];

  /* ---------- the judge ---------- */
  TT.judge = function (st, ch) {
    const f = facts(st);
    let total = 0, max = 0;
    const lines = ch.rules.map(r => {
      const res = RULES[r.type](f, r);
      const pts = Math.round(r.w * res.got);
      total += pts; max += r.w;
      const good = res.got >= 0.999;
      let msg;
      if (good) msg = r.type === 'tags' ? `Great ${r.label}!` : r.type === 'scene' ? 'Perfect scene!' : r.type === 'dressed' ? 'Outfit is complete.' : r.type === 'avoid' ? 'Nothing out of place.' : 'Nailed it!';
      else msg = r.tip + (res.bad && res.bad.length ? ` (${res.bad.join(', ')})` : '') + (res.note ? ` · ${res.note}` : '');
      return { good, pts, w: r.w, msg };
    });
    const score = Math.round(total / max * 100);
    const stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 55 ? 3 : score >= 35 ? 2 : 1;
    return { score, stars, lines };
  };

  /* style score for the fashion show crowd: rewards a complete, well-coordinated look */
  TT.styleScore = function (st) {
    const f = facts(st);
    let s = 0;
    s += ([f.hasTop, f.hasBottom, f.hasShoes].filter(Boolean).length) * 12;
    s += Math.min(5, f.worn.length) * 5;
    const fams = f.worn.filter(w => w.family).map(w => w.family);
    const distinct = new Set(fams).size;
    if (fams.length) s += distinct <= 3 ? 20 : distinct >= 5 ? 18 : 10;
    const themes = {};
    f.worn.forEach(w => w.tags.forEach(t => themes[t] = (themes[t] || 0) + 1));
    const best = Math.max(0, ...Object.values(themes));
    s += Math.min(3, best) * 5;
    if (f.sceneTags.some(t => themes[t])) s += 5;
    return Math.min(100, s);
  };

  /* daily challenge: same one for everybody on a given day */
  TT.todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  TT.dailyChallenge = function () {
    const d = new Date(); const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return TT.CHALLENGES[(day * 7 + 3) % TT.CHALLENGES.length];
  };
})(window.TT);
