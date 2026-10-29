/* Tiny Tailors — critters with opinions.
   Every critter loves two kinds of things, isn't a fan of one kind, and has a favorite color.
   It reacts while you dress it, and wearing lots of things it loves makes it super happy. */
(function (TT) {
  // id: [loves, loves, not a fan of, favorite color family]
  const O = {
    cat: ['fancy', 'cozy', 'rainy', 'pink'], bunny: ['garden', 'spring', 'spooky', 'white'], dog: ['sporty', 'adventure', 'fancy', 'blue'],
    bear: ['cozy', 'food', 'beach', 'brown'], panda: ['food', 'sleepy', 'sporty', 'green'], fox: ['autumn', 'magic', 'school', 'orange'],
    pig: ['party', 'food', 'knight', 'pink'], frog: ['rainy', 'garden', 'winter', 'green'], koala: ['sleepy', 'nature', 'rock', 'gray'],
    mouse: ['food', 'fairy', 'pirate', 'yellow'], hamster: ['sporty', 'food', 'sleepy', 'orange'], raccoon: ['detective', 'rock', 'royal', 'dark'],
    tiger: ['hero', 'sporty', 'ballet', 'orange'], lion: ['royal', 'hero', 'sleepy', 'yellow'], penguin: ['winter', 'fancy', 'summer', 'blue'],
    owl: ['school', 'magic', 'party', 'purple'], duck: ['rainy', 'sea', 'space', 'yellow'], unicorn: ['rainbow', 'magic', 'rock', 'purple'],
    axolotl: ['sea', 'party', 'adventure', 'pink'], sheep: ['cozy', 'spring', 'spooky', 'white'], cow: ['garden', 'music', 'chef', 'green'],
    deer: ['nature', 'fairy', 'rock', 'brown'], monkey: ['party', 'adventure', 'school', 'yellow'], dragon: ['knight', 'magic', 'rainy', 'red'],
    redpanda: ['autumn', 'cozy', 'sporty', 'red'], elephant: ['music', 'sea', 'spooky', 'blue'], giraffe: ['royal', 'garden', 'winter', 'yellow'],
    capybara: ['sleepy', 'beach', 'rock', 'orange'], otter: ['sea', 'food', 'school', 'brown'], sloth: ['sleepy', 'cozy', 'sporty', 'green'],
    alpaca: ['fancy', 'music', 'rainy', 'white'], narwhal: ['sea', 'magic', 'rock', 'blue'], bat: ['spooky', 'music', 'summer', 'purple'],
    cockatiel: ['music', 'party', 'sleepy', 'yellow']
  };
  // how a critter says each kind of thing
  const WORD = {
    fancy: 'fancy things', cozy: 'cozy stuff', rainy: 'rainy-day gear', garden: 'garden things', spring: 'springtime things', spooky: 'spooky stuff',
    sporty: 'sporty stuff', adventure: 'adventure gear', food: 'yummy snacks', sleepy: 'sleepy things', beach: 'beach stuff', autumn: 'autumn things',
    magic: 'magic things', school: 'school stuff', party: 'party things', knight: 'knight gear', winter: 'winter stuff', nature: 'nature things',
    rock: 'rock star stuff', fairy: 'fairy things', pirate: 'pirate gear', detective: 'detective gear', royal: 'royal things', hero: 'hero stuff',
    ballet: 'ballet things', summer: 'summer stuff', sea: 'ocean things', space: 'space stuff', rainbow: 'rainbow things', music: 'music things',
    chef: 'chef stuff', halloween: 'Halloween costumes', harvest: 'harvest things'
  };
  TT.THEME_WORD = WORD;
  const COLOR_WORD = { pink: 'pink', red: 'red', orange: 'orange', brown: 'brown', yellow: 'yellow', green: 'green', blue: 'blue', purple: 'purple', white: 'white', gray: 'gray', dark: 'midnight' };
  TT.COLOR_WORD = COLOR_WORD;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const hash = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  const ALL = Object.keys(WORD).filter(k => !['halloween', 'harvest'].includes(k));
  const FAMS = Object.keys(COLOR_WORD);

  /* opinions for any critter (new critters get stable made-up ones until they're listed above) */
  TT.opinionOf = function (animalId) {
    const o = O[animalId];
    if (o) return { loves: [o[0], o[1]], dislikes: [o[2]], color: o[3] };
    const h = hash(animalId);
    const a = ALL[h % ALL.length], b = ALL[(h >>> 4) % ALL.length], c = ALL[(h >>> 8) % ALL.length];
    return { loves: [a, b === a ? ALL[(h + 3) % ALL.length] : b], dislikes: [c === a || c === b ? ALL[(h + 7) % ALL.length] : c], color: FAMS[(h >>> 12) % FAMS.length] };
  };
  const tagsOf = (slot, id) => (((TT.TAGS[slot] || {})[id]) || '').split(' ').filter(Boolean);
  const WEAR = ['top', 'bottom', 'shoes', 'hat', 'face', 'neck', 'back', 'hold', 'pet', 'hair'];
  const famOf = (st, slot) => {
    const e = st[slot]; if (!e || !e.id) return null;
    const it = TT.itemOf(slot, e.id); if (!it || it.fixed || !TT.SLOTS[slot].palette || slot === 'pet') return null;
    return TT.colorFamily(TT.colorHex(slot, e.color));
  };

  /* how happy is this critter with its whole outfit? */
  TT.happiness = function (st, op) {
    op = op || TT.opinionOf(st.animal.id);
    let loves = 0, dislikes = 0, colors = 0;
    const lovedNames = [], dislikedNames = [];
    for (const slot of WEAR) {
      const e = st[slot]; if (!e || !e.id) continue;
      const it = TT.itemOf(slot, e.id); if (!it) continue;
      const t = tagsOf(slot, e.id);
      if (t.some(x => op.loves.includes(x))) { loves++; lovedNames.push(it.name); }
      if (t.some(x => op.dislikes.includes(x))) { dislikes++; dislikedNames.push(it.name); }
      if (famOf(st, slot) === op.color) colors++;
    }
    const sceneTags = tagsOf('scene', st.scene && st.scene.id);
    const sceneLove = sceneTags.some(x => op.loves.includes(x));
    const score = loves * 2 + Math.min(2, colors) + (sceneLove ? 1 : 0) - dislikes * 3;
    const hearts = Math.max(0, Math.min(5, Math.round(score / 1.6)));
    return { loves, dislikes, colors, sceneLove, score, hearts, super: loves >= 3 && dislikes === 0, lovedNames, dislikedNames };
  };

  /* a quick reaction to something just put on (or null if the critter doesn't mind) */
  TT.reactTo = function (st, slot, id) {
    if (!id || !st.animal) return null;
    const op = TT.opinionOf(st.animal.id);
    if (slot === 'animal') return { kind: 'hello', line: TT.introLine(st) };
    const t = tagsOf(slot, id);
    const hate = t.find(x => op.dislikes.includes(x));
    if (hate) return { kind: 'nope', line: pick([`Hmm… ${WORD[hate]} isn't really my thing.`, `Ehh, not my style!`, `Are you sure? I'm not a fan of ${WORD[hate]}.`, `Hmm, maybe something else?`]) };
    const love = t.find(x => op.loves.includes(x));
    const hp = TT.happiness(st, op);
    if (hp.super && love) return { kind: 'super', line: pick(['This is the best outfit EVER!', 'I feel SO fabulous!', 'I never want to take this off!']) };
    if (love) return { kind: 'love', line: pick([`Ooh, I LOVE ${WORD[love]}!`, `Yes, yes, YES!`, `My favorite!`, `This is so me!`]) };
    if (['top', 'bottom', 'shoes', 'neck', 'back'].includes(slot) && famOf(st, slot) === op.color && Math.random() < 0.6) return { kind: 'color', line: `Ooh, ${COLOR_WORD[op.color]} is my favorite color!` };
    if (slot === 'scene' && hp.sceneLove) return { kind: 'love', line: 'I love it here!' };
    return null;
  };
  TT.introLine = function (st) {
    const a = TT.animalById(st.animal.id), op = TT.opinionOf(st.animal.id);
    const nm = (st.name || '').trim();
    return `Hi! I'm ${nm || 'a'} ${nm ? 'the ' : ''}${a.name.toLowerCase()}. I love ${WORD[op.loves[0]]} and ${WORD[op.loves[1]]}, and ${COLOR_WORD[op.color]} is my favorite color. I'm not a fan of ${WORD[op.dislikes[0]]}.`;
  };
  /* something to say when you tap the critter */
  TT.tapLine = function (st) {
    const hp = TT.happiness(st);
    if (Math.random() < 0.35) return TT.introLine(st);
    if (hp.super) return pick(['I love this outfit SO much!', 'Best. Outfit. Ever.', 'Hee hee, I feel fabulous!']);
    if (hp.dislikes) return pick([`Can we change the ${hp.dislikedNames[0].toLowerCase()}?`, `The ${hp.dislikedNames[0].toLowerCase()} isn't really me…`]);
    if (hp.loves) return pick([`I love my ${hp.lovedNames[0].toLowerCase()}!`, 'Hee hee! That tickles!', 'Wheee!', 'Let\'s go somewhere fun!']);
    const op = TT.opinionOf(st.animal.id);
    return pick(['Hee hee! That tickles!', `Got any ${WORD[op.loves[0]]}?`, 'Boop!', 'Wheee!', `Ooh, something ${COLOR_WORD[op.color]} would be nice!`]);
  };
})(window.TT);
