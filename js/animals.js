/* Tiny Tailors — critters: bodies, heads, ears, faces and tails.
   Shared skeleton (viewBox 0 0 400 460):
     head  ellipse (200,165) 98x86      eyes (162,172) (238,172)
     torso 134..266 x 240..362           arms (152,266)->(116,326) / (248,266)->(284,326)
     legs  x 178 / 222, y 350..398       feet (174,408) (226,408) */
(function (TT) {
  const { P, C, E, S, R, TUBE, SYM, rot, OL, INK, shade, tint } = TT;

  TT.SKEL = {
    torso: 'M154,244 Q200,236 246,244 Q262,250 264,272 L266,336 Q266,360 240,362 L160,362 Q134,360 134,336 L136,272 Q138,250 154,244Z',
    armL: 'M152,266 L116,326', armR: 'M248,266 L284,326',
    handL: [115, 329], handR: [285, 329]
  };

  /* ---------------- critter list ---------------- */
  const A = (id, name, o) => Object.assign({ id, name, alt: '#fff6ec', inner: '#ffb3c4', nose: '#ff8fa8', muzzle: 'cat', tail: 'stub', marks: [], mouthY: 210 }, o);
  TT.ANIMALS = [
    A('cat', 'Kitty', { fur: '#ffc98f', ears: 'cat', marks: ['tabby'], whiskers: 1, tail: 'cat' }),
    A('bunny', 'Bunny', { tall: 1, fur: '#fff6f8', ears: 'bunny', tail: 'puff', whiskers: 1 }),
    A('dog', 'Puppy', { fur: '#f3cf9e', ears: 'floppy', earColor: '#bf8a66', muzzle: 'dog', marks: ['spot'], tail: 'dog', mouthY: 212 }),
    A('bear', 'Bear', { fur: '#c99674', alt: '#f6dfc6', ears: 'round', muzzle: 'bear', mouthY: 212 }),
    A('panda', 'Panda', { fur: '#ffffff', ears: 'round', earColor: '#56506a', limb: '#56506a', marks: ['panda'], muzzle: 'small', tail: 'stub' }),
    A('fox', 'Fox', { tall: 1, fur: '#ffa463', alt: '#fffaf2', inner: '#fff1e2', ears: 'fox', muzzle: 'fox', tail: 'fox', limb: '#8a5f5f', limbOnly: 'feet' }),
    A('pig', 'Piglet', { fur: '#ffc8d2', inner: '#ff9fb2', ears: 'pig', muzzle: 'pig', tail: 'curl', mouthY: 216 }),
    A('frog', 'Froggy', { fur: '#a6e394', alt: '#effad2', ears: 'frog', muzzle: 'none', tail: 'none', mouthY: 200, eyeDY: -64, hatDY: -30, hatScale: 0.86 }),
    A('koala', 'Koala', { fur: '#bdb8ca', alt: '#f2eef8', inner: '#ffffff', ears: 'koala', muzzle: 'koala', mouthY: 218 }),
    A('mouse', 'Mouse', { fur: '#d9d3e2', ears: 'mouse', whiskers: 1, tail: 'mouse' }),
    A('hamster', 'Hamster', { fur: '#ffd7a0', alt: '#fffaf0', ears: 'small', marks: ['cheeks'], whiskers: 1 }),
    A('raccoon', 'Raccoon', { fur: '#b5adbf', alt: '#f6f2f8', ears: 'raccoon', marks: ['mask'], muzzle: 'small', tail: 'ringed', ringColor: '#6e6680' }),
    A('tiger', 'Tiger', { fur: '#ffb35c', alt: '#fff4e4', ears: 'small', marks: ['tiger'], whiskers: 1, tail: 'tiger' }),
    A('lion', 'Lion', { fur: '#ffd27a', alt: '#fff3d6', ears: 'small', extra: ['mane'], mane: '#ec9a5c', tail: 'lion' }),
    A('penguin', 'Penguin', { fur: '#5d6286', alt: '#ffffff', ears: 'none', marks: ['penguin'], muzzle: 'beak', tail: 'bird', foot: '#ffb347', mouthY: 222 }),
    A('owl', 'Owlet', { fur: '#c9a98f', alt: '#f6ebda', ears: 'tufts', marks: ['owl'], muzzle: 'beak', tail: 'bird', foot: '#ffb347', mouthY: 222 }),
    A('duck', 'Duckling', { fur: '#ffe27a', alt: '#fff6c9', ears: 'none', extra: ['ducktuft'], muzzle: 'bill', tail: 'bird', foot: '#ffa23f', mouthY: null }),
    A('unicorn', 'Unicorn', { tall: 1, fur: '#fff8fc', alt: '#ffeef6', inner: '#ffc4dc', ears: 'horse', muzzle: 'horse', extra: ['horn', 'unimane'], tail: 'unicorn', mouthY: 222 }),
    A('axolotl', 'Axolotl', { fur: '#ffc8e0', alt: '#ffe6f1', ears: 'gills', muzzle: 'none', tail: 'axo', mouthY: 206 }),
    A('sheep', 'Lamb', { fur: '#fffaf2', alt: '#ffe9da', ears: 'sheep', earColor: '#f2d4c0', extra: ['wool'], muzzle: 'small', tail: 'fluff' }),
    A('cow', 'Moo Cow', { tall: 1, fur: '#ffffff', alt: '#ffc4cf', ears: 'cow', marks: ['cow'], muzzle: 'cow', tail: 'tuft', mouthY: 226 }),
    A('deer', 'Fawn', { tall: 1, fur: '#dca578', alt: '#fff3e4', ears: 'deer', extra: ['antlers'], marks: ['fawn'], muzzle: 'small', tail: 'puff' }),
    A('monkey', 'Monkey', { fur: '#b98a6d', alt: '#ffe1c8', ears: 'monkey', marks: ['monkeyface'], muzzle: 'nostrils', tail: 'monkey', mouthY: 214 }),
    A('dragon', 'Dragon', { tall: 1, fur: '#a8e6c8', alt: '#fff4c2', ears: 'dragon', muzzle: 'nostrils', tail: 'dragon', extra: ['spikes'], mouthY: 212 }),
    A('redpanda', 'Red Panda', { fur: '#ff9a62', alt: '#ffffff', inner: '#ffffff', ears: 'redpanda', marks: ['redpanda'], muzzle: 'small', limb: '#6b4a52', tail: 'ringed', ringColor: '#c4643f' }),
    A('elephant', 'Elephant', { fur: '#c5cbea', alt: '#eef0ff', inner: '#ffc6d6', ears: 'elephant', muzzle: 'trunk', tail: 'tuft', mouthY: null }),
    A('giraffe', 'Giraffe', { tall: 1, fur: '#ffd47e', alt: '#fff3d6', ears: 'giraffe', extra: ['ossicones'], marks: ['giraffe'], muzzle: 'horse', tail: 'tuft', mouthY: 222 })
  ];
  TT.ANIMAL_DEF = A;
  TT.animalById = id => TT.ANIMALS.find(a => a.id === id) || TT.ANIMALS[0];

  /* ---------------- ears & things behind the head ---------------- */
  function ears(a, F) {
    const ec = a.earColor || F, I = a.inner, back = [], front = [];
    switch (a.ears) {
      case 'cat':
        back.push(SYM(P('M116,130 L110,52 Q114,44 124,48 L184,92 Z', ec) + P('M128,112 L124,66 L166,95 Z', I, 0)));
        break;
      case 'fox':
        back.push(SYM(P('M114,140 L100,34 Q104,26 114,30 L188,92 Z', ec) + P('M124,118 L114,52 L166,96 Z', I, 0) + P('M100,34 Q104,26 114,30 L132,46 L108,62 Z', '#6d4b55', 0)));
        break;
      case 'bunny':
        back.push(SYM(E(158, 56, 21, 52, F, 4, rot(-12, 158, 56)) + E(158, 60, 10, 38, I, 0, rot(-12, 158, 60))));
        break;
      case 'round':
        back.push(SYM(C(130, 98, 30, ec) + C(132, 100, 16, a.earColor ? shade(ec, 0.15) : I, 0)));
        break;
      case 'small':
        back.push(SYM(C(132, 102, 24, ec) + C(133, 104, 12, I, 0)));
        break;
      case 'mouse':
        back.push(SYM(C(114, 98, 44, ec) + C(116, 100, 28, I, 0)));
        break;
      case 'koala':
        back.push(SYM(C(110, 112, 42, F) + C(114, 116, 26, tint(F, 0.6), 0)));
        break;
      case 'raccoon':
        back.push(SYM(P('M118,124 Q112,62 134,58 Q156,60 180,92 Z', F) + P('M128,112 Q126,76 138,74 Q152,78 166,96 Z', '#f6f2f8', 0)));
        break;
      case 'redpanda':
        back.push(SYM(P('M114,128 Q104,60 130,54 Q156,56 184,92 Z', '#ffffff') + P('M126,114 Q120,74 136,70 Q152,74 168,96 Z', '#6b4a52', 0)));
        break;
      case 'floppy':
        front.push(SYM(P('M118,104 Q94,98 86,124 Q74,182 98,214 Q116,228 126,204 Q134,160 146,112 Z', ec)));
        break;
      case 'pig':
        back.push(SYM(P('M124,116 L112,58 L172,90 Z', F) + P('M130,106 L122,72 L160,92 Z', I, 0)));
        break;
      case 'sheep':
        front.push(SYM(E(98, 146, 30, 15, ec, 4, rot(24, 98, 146)) + E(102, 148, 17, 7, a.inner, 0, rot(24, 102, 148))));
        break;
      case 'cow':
        back.push(SYM(P('M150,96 Q140,70 146,52 Q156,62 164,86 Z', '#fff1c6')));
        front.push(SYM(E(98, 136, 30, 15, F, 4, rot(22, 98, 136)) + E(100, 138, 17, 7, '#ffc4cf', 0, rot(22, 100, 138))));
        break;
      case 'deer':
        back.push(SYM(E(100, 128, 34, 15, F, 4, rot(-28, 100, 128)) + E(102, 128, 20, 7, I, 0, rot(-28, 102, 128))));
        break;
      case 'monkey':
        back.push(SYM(C(104, 170, 27, F) + C(105, 170, 15, a.alt, 0)));
        break;
      case 'frog':
        front.push(SYM(C(162, 112, 31, F) + E(162, 132, 26, 8, F, 0)));
        break;
      case 'crest':
        front.push(P('M176,98 Q154,66 168,42 Q172,70 190,94Z', shade(F, 0.06)) + P('M186,92 Q168,44 196,14 Q190,48 204,88Z', F) + P('M200,88 Q198,38 230,20 Q212,52 214,92Z', shade(F, 0.04)) +
          S('M190,80 Q186,56 194,34 M206,78 Q208,54 222,34', shade(F, 0.2), 2.5));
        break;
      case 'bat':
        back.push(SYM(P('M118,140 L84,40 Q92,34 100,40 L184,96 Z', F) + P('M126,120 L100,58 L166,98 Z', a.inner, 0)));
        break;
      case 'alpaca':
        back.push(SYM(E(130, 70, 13, 30, F, 4, rot(-18, 130, 70)) + E(130, 74, 6, 20, a.inner, 0, rot(-18, 130, 74))));
        break;
      case 'tufts':
        back.push(SYM(P('M120,120 L104,58 Q120,66 168,94 Z', shade(F, 0.12))));
        break;
      case 'horse':
        back.push(SYM(P('M130,110 Q118,54 132,44 Q158,64 176,94 Z', F) + P('M138,100 Q130,66 136,60 Q154,74 164,94 Z', I, 0)));
        break;
      case 'gills':
        back.push(SYM(
          E(96, 112, 30, 11, '#ff8fbf', 4, rot(-30, 96, 112)) +
          E(86, 146, 30, 11, '#ff8fbf', 4, rot(-8, 86, 146)) +
          E(92, 180, 28, 11, '#ff8fbf', 4, rot(16, 92, 180))));
        break;
      case 'dragon':
        back.push(SYM(P('M150,96 Q132,60 112,52 Q134,46 168,86 Z', '#fff4c2') + P('M110,138 L80,112 L122,118 Z', shade(F, 0.15))));
        break;
      case 'elephant':
        back.push(SYM(E(98, 160, 52, 64, F) + E(104, 162, 34, 46, I, 0)));
        break;
      case 'giraffe':
        back.push(SYM(E(104, 130, 30, 13, F, 4, rot(-24, 104, 130)) + E(106, 130, 17, 6, '#ffb3c4', 0, rot(-24, 106, 130))));
        break;
    }
    return { back: back.join(''), front: front.join('') };
  }

  function behindHead(a, F) {
    let s = '';
    const ex = a.extra || [];
    if (ex.includes('mane')) {
      let m = '';
      for (let i = 0; i < 16; i++) {
        const t = i / 16 * Math.PI * 2;
        m += C((200 + 112 * Math.cos(t)).toFixed(1), (168 + 100 * Math.sin(t)).toFixed(1), 32, a.mane);
      }
      s += m + E(200, 168, 118, 106, a.mane, 0);
    }
    if (ex.includes('antlers')) {
      s += SYM(TUBE('M150,96 Q138,60 120,40 M134,66 Q118,64 106,56 M127,50 Q132,36 140,28', 7, '#c8956a'));
    }
    if (ex.includes('ossicones')) {
      s += SYM(TUBE('M168,90 L160,46', 9, F) + C(159, 42, 10, '#c8834a'));
    }
    if (ex.includes('unimane')) {
      s += P('M270,96 Q318,120 312,190 Q306,240 286,262 Q300,200 280,150 Z', '#c9a8ff') +
           P('M262,90 Q300,110 300,170 Q296,210 280,236 Q290,180 270,130 Z', '#ffb3d1');
    }
    if (ex.includes('spikes')) {
      s += P('M178,84 L190,56 L202,80 L214,52 L226,82 Z', '#7fd0b0');
    }
    return s;
  }

  /* ---------------- markings on the face ---------------- */
  function marks(a, F) {
    let s = '';
    const dk = shade(F, 0.28);
    for (const m of a.marks) {
      switch (m) {
        case 'tabby': s += S('M200,88 L200,106', dk, 6) + S('M182,92 L186,106', dk, 6) + S('M218,92 L214,106', dk, 6); break;
        case 'spot': s += E(158, 166, 30, 27, '#c9926c', 0, rot(-10, 158, 166)); break;
        case 'panda': s += SYM(E(160, 172, 23, 30, '#56506a', 0, rot(-28, 160, 172))); break;
        case 'mask': s += P('M106,178 Q124,138 168,154 Q200,166 232,154 Q276,138 294,178 Q272,200 236,194 Q200,186 164,194 Q128,200 106,178Z', '#6e6680', 0); break;
        case 'tiger': s += S('M200,84 L200,104', '#c8643c', 7) + S('M180,90 Q186,98 183,108', '#c8643c', 6) + S('M220,90 Q214,98 217,108', '#c8643c', 6) +
          SYM(S('M104,156 L126,162', '#c8643c', 6) + S('M104,176 L124,178', '#c8643c', 6)); break;
        case 'penguin': s += P('M200,150 C180,116 120,122 122,176 C124,224 170,240 200,240 C230,240 276,224 278,176 C280,122 220,116 200,150Z', a.alt, 0); break;
        case 'owl': s += SYM(C(162, 172, 31, a.alt, 0)) + S('M150,138 L196,152 M250,138 L204,152', shade(F, 0.3), 5); break;
        case 'cheeks': s += SYM(E(122, 206, 30, 24, a.alt, 0)); break;
        case 'cow': s += P('M118,124 Q132,92 162,100 Q174,116 154,128 Q134,140 118,124Z', '#6d6585', 0) + P('M262,96 Q290,98 290,126 Q278,140 262,128 Q250,112 262,96Z', '#6d6585', 0); break;
        case 'fawn': s += C(176, 108, 5, '#fff3e4', 0) + C(200, 98, 6, '#fff3e4', 0) + C(224, 108, 5, '#fff3e4', 0); break;
        case 'monkeyface': s += P('M200,140 C178,116 126,126 126,178 C126,226 170,246 200,246 C230,246 274,226 274,178 C274,126 222,116 200,140Z', a.alt, 0); break;
        case 'redpanda': s += SYM(E(158, 142, 13, 8, '#ffffff', 0)) + E(200, 214, 50, 34, '#ffffff', 0) + SYM(S('M152,192 Q150,208 140,218', '#b8553c', 6)); break;
        case 'cockatiel': s += SYM(C(130, 196, 19, '#ffa36c', 0)) + P('M150,150 Q200,128 250,150 Q240,124 200,118 Q160,124 150,150Z', tint(F, 0.4), 0); break;
      case 'sloth': s += P('M200,130 C170,116 112,130 116,176 C120,228 168,246 200,246 C232,246 280,228 284,176 C288,130 230,116 200,130Z', a.alt, 0) + SYM(P('M128,170 Q140,150 172,160 Q190,170 186,186 Q168,198 140,190 Q126,184 128,170Z', '#8a6b5a', 0)); break;
        case 'narwhal': s += C(150, 110, 5, tint(F, 0.5), 0) + C(170, 98, 4, tint(F, 0.5), 0) + C(244, 104, 5, tint(F, 0.5), 0) + C(262, 124, 3.5, tint(F, 0.5), 0); break;
        case 'giraffe': s += P('M136,112 q14,-10 24,0 q4,14 -10,16 q-14,0 -14,-16z', '#e2a052', 0) + P('M244,104 q16,-6 22,6 q0,12 -14,12 q-12,-2 -8,-18z', '#e2a052', 0) + P('M262,206 q12,-6 18,4 q-2,12 -12,10 q-10,-4 -6,-14z', '#e2a052', 0); break;
      }
    }
    return s;
  }

  function muzzle(a, F) {
    const al = a.alt;
    switch (a.muzzle) {
      case 'cat': return E(188, 204, 14, 11, al, 0) + E(212, 204, 14, 11, al, 0) +
        P('M193,192 Q200,188 207,192 Q204,199 200,201 Q196,199 193,192Z', a.nose, 2.5);
      case 'dog': return E(200, 208, 32, 23, al, 3.5) + E(200, 197, 12, 8.5, '#4b3a50', 0) + E(197, 194.5, 4, 2.2, '#fff', 0);
      case 'bear': return E(200, 208, 30, 22, al, 3.5) + E(200, 198, 11, 8, '#5b4050', 0) + E(197, 195.5, 3.6, 2, '#fff', 0);
      case 'small': return E(200, 198, 9, 6.5, '#4f4560', 0) + E(198, 196, 3, 1.8, '#fff', 0);
      case 'pig': return E(200, 204, 25, 18, a.inner, 3.5) + E(193, 204, 3.6, 5.5, shade(a.inner, 0.35), 0) + E(207, 204, 3.6, 5.5, shade(a.inner, 0.35), 0);
      case 'beak': return P('M186,198 Q200,188 214,198 Q208,214 200,217 Q192,214 186,198Z', '#ffb347', 3);
      case 'bill': return P('M172,202 Q200,190 228,202 Q232,216 200,220 Q168,216 172,202Z', '#ffb347', 3.5) + S('M180,208 Q200,213 220,208', shade('#ffb347', 0.35), 3);
      case 'trunk': return P('M184,186 Q182,226 194,246 Q204,262 220,252 Q228,244 218,238 Q206,234 210,214 Q214,196 216,186 Z', F, 4) +
        S('M190,222 Q200,226 210,222', shade(F, 0.3), 3) + S('M193,236 Q203,240 212,234', shade(F, 0.3), 3);
      case 'horse': return E(200, 212, 40, 27, al, 3.5) + E(188, 208, 3.5, 5, shade(al, 0.4), 0) + E(212, 208, 3.5, 5, shade(al, 0.4), 0);
      case 'cow': return E(200, 212, 44, 26, al, 3.5) + E(186, 208, 5, 7, shade(al, 0.35), 0) + E(214, 208, 5, 7, shade(al, 0.35), 0);
      case 'koala': return E(200, 198, 16, 20, '#5d5468', 3) + E(195, 190, 4, 6, '#fff', 0, 'opacity=".7"');
      case 'fox': return P('M116,188 Q160,176 200,202 Q240,176 284,188 Q266,242 200,250 Q134,242 116,188Z', al, 0) + E(200, 198, 9, 6.5, '#4f4560', 0);
      case 'smallbeak': return P('M190,196 Q200,188 210,196 Q207,210 200,213 Q193,210 190,196Z', '#c9a7a0', 3) + S('M193,199 Q200,196 207,199', '#a8857e', 2);
      case 'capy': return E(200, 208, 50, 32, al, 3.5) + E(186, 198, 4, 6, shade(al, 0.45), 0) + E(214, 198, 4, 6, shade(al, 0.45), 0);
      case 'otter': return SYM(E(184, 206, 18, 14, al, 0)) + E(200, 196, 12, 8.5, '#4b3a50', 0) + E(197, 193.5, 4, 2.2, '#fff', 0);
      case 'nostrils': return C(193, 198, 2.6, shade(F, 0.45), 0) + C(207, 198, 2.6, shade(F, 0.45), 0);
      default: return '';
    }
  }

  function frontExtras(a, F) {
    let s = '';
    const ex = a.extra || [];
    if (ex.includes('horn')) {
      s += P('M186,96 L200,30 L214,96 Q200,102 186,96Z', '#ffe08a') + S('M190,82 L210,74 M193,66 L207,60 M196,50 L204,46', '#e8b84a', 3);
    }
    if (ex.includes('unimane')) {
      s += P('M200,82 Q236,72 262,96 Q236,94 226,108 Q214,92 200,82Z', '#c9a8ff', 4) + P('M214,84 Q246,80 270,106 Q248,104 240,116 Q232,96 214,84Z', '#ffb3d1', 4);
    }
    if (ex.includes('wool')) {
      let w = '';
      [[150, 92], [174, 80], [200, 76], [226, 80], [250, 92], [164, 104], [200, 98], [236, 104]].forEach(([x, y]) => { w += C(x, y, 22, a.fur); });
      s += w + [[164, 104], [200, 98], [236, 104]].map(([x, y]) => C(x, y, 20, a.fur, 0)).join('');
    }
    if (ex.includes('yuzu')) {
      s += C(200, 78, 17, '#ffb347') + P('M200,62 Q208,50 220,54 Q212,64 200,62Z', '#7fcf8f', 3) + C(195, 73, 4, '#ffd9a0', 0);
    }
    if (ex.includes('tusk')) {
      s += P('M192,88 L214,8 L208,90 Q200,94 192,88Z', '#fff7e6') + S('M196,74 L211,66 M199,56 L212,48 M202,38 L213,30', '#e8d6b8', 3);
    }
    if (ex.includes('alpacawool')) {
      let w = '';
      [[160, 92], [184, 80], [210, 78], [236, 86], [174, 102], [204, 96], [228, 104]].forEach(([x, y]) => { w += C(x, y, 20, a.fur); });
      s += w + [[174, 102], [204, 96], [228, 104]].map(([x, y]) => C(x, y, 18, a.fur, 0)).join('');
    }
    if (ex.includes('ducktuft')) {
      s += P('M196,84 Q186,56 200,52 Q194,66 206,74 Q212,56 222,60 Q210,70 210,84 Z', F, 4);
    }
    return s;
  }

  /* ---------------- faces ---------------- */
  const EX = [162, 238], EY = 172;
  const eye = {
    dot: (x, y) => E(x, y, 8.5, 11, INK, 0) + C(x - 2.5, y - 4, 3.2, '#fff', 0),
    sparkle: (x, y) => E(x, y, 13, 16, INK, 0) + E(x, y + 6, 8, 6, '#8b6fd0', 0, 'opacity=".8"') + C(x - 4, y - 6, 5, '#fff', 0) + C(x + 4.5, y + 5, 2.2, '#fff', 0),
    happy: (x, y) => S(`M${x - 11},${y + 3} Q${x},${y - 10} ${x + 11},${y + 3}`, INK, 5),
    wink: (x, y, i) => i === 0 ? eye.sparkle(x, y) : S(`M${x + 10},${y - 7} L${x - 7},${y} L${x + 10},${y + 7}`, INK, 5),
    star: (x, y) => TT.star(x, y, 15, '#ffcf3f', 3) + C(x - 3, y - 3, 2.5, '#fff', 0),
    heart: (x, y) => TT.heart(x, y, 12.5, '#ff5c8a', 3) + C(x - 4, y - 3, 2.6, '#fff', 0),
    sleepy: (x, y) => S(`M${x - 11},${y} Q${x},${y + 9} ${x + 11},${y}`, INK, 5) + S(`M${x - 11},${y} l-4,4 M${x + 11},${y} l4,4`, INK, 3),
    surprised: (x, y) => C(x, y, 13, '#fff', 3.5) + C(x, y + 1, 6.5, INK, 0) + C(x - 2, y - 2, 2, '#fff', 0),
    determined: (x, y, i) => eye.dot(x, y) + S(i === 0 ? `M${x - 13},${y - 22} L${x + 9},${y - 15}` : `M${x + 13},${y - 22} L${x - 9},${y - 15}`, INK, 5),
    button: (x, y) => C(x, y, 11, '#6e5a8a', 0) + C(x, y, 7.5, 'none', 0, `stroke="#8f7bb0" stroke-width="1.6"`) +
      C(x - 2.6, y - 2.6, 1.6, '#e8defa', 0) + C(x + 2.6, y - 2.6, 1.6, '#e8defa', 0) + C(x - 2.6, y + 2.6, 1.6, '#e8defa', 0) + C(x + 2.6, y + 2.6, 1.6, '#e8defa', 0) +
      S(`M${x - 2.6},${y - 2.6} L${x + 2.6},${y + 2.6} M${x + 2.6},${y - 2.6} L${x - 2.6},${y + 2.6}`, '#fff6ff', 1.4),
    teary: (x, y) => eye.sparkle(x, y) + P(`M${x + 9},${y + 12} q5,8 0,12 q-5,-4 0,-12z`, '#9cd3ff', 2) + S(`M${x - 12},${y - 21} L${x + 8},${y - 24}`, INK, 4)
  };
  TT.EYES = [
    ['sparkle', 'Sparkly'], ['dot', 'Button-cute'], ['happy', 'Happy'], ['wink', 'Wink'], ['star', 'Star-struck'],
    ['heart', 'Love'], ['sleepy', 'Sleepy'], ['surprised', 'Surprised'], ['determined', 'Brave'], ['button', 'Sewn buttons'], ['teary', 'Teary']
  ].map(([id, name]) => ({ id, name, draw: () => EX.map((x, i) => eye[id](x, EY, i)).join('') }));

  const mouth = {
    smile: y => S(`M189,${y} Q200,${y + 10} 211,${y}`, OL, 3.5),
    cat: y => S(`M187,${y} Q193.5,${y + 8} 200,${y} Q206.5,${y + 8} 213,${y}`, OL, 3.5),
    open: y => P(`M187,${y} Q200,${y + 24} 213,${y} Z`, '#e8607a', 3.5) + E(200, y + 11, 5.5, 3.5, '#ffa3b6', 0),
    tongue: y => S(`M189,${y} Q200,${y + 10} 211,${y}`, OL, 3.5) + P(`M201,${y + 5} q1,11 8,9 q4,-3 1,-10z`, '#ff8fa8', 2.5),
    o: y => E(200, y + 5, 5.5, 7, '#e8607a', 3),
    grin: y => P(`M183,${y - 1} Q200,${y + 4} 217,${y - 1} Q213,${y + 17} 200,${y + 17} Q187,${y + 17} 183,${y - 1}Z`, '#fff', 3.5),
    smirk: y => S(`M190,${y + 4} Q203,${y + 8} 213,${y - 2}`, OL, 3.5),
    fang: y => mouth.cat(y) + P(`M204,${y + 3} L207,${y + 11} L210,${y + 3.5}Z`, '#fff', 2),
    frown: y => S(`M190,${y + 8} Q200,${y - 2} 210,${y + 8}`, OL, 3.5),
    wobbly: y => S(`M186,${y + 4} q4.5,-5 9,0 q4.5,5 9,0 q4.5,-5 9,0`, OL, 3.2)
  };
  TT.MOUTHS = [
    ['cat', 'Kitty smile'], ['smile', 'Smile'], ['open', 'Yay!'], ['tongue', 'Silly'], ['o', 'Ooh'], ['grin', 'Big grin'], ['smirk', 'Smirk'], ['fang', 'Lil fang'], ['frown', 'Grumpy'], ['wobbly', 'Wobbly']
  ].map(([id, name]) => ({ id, name, draw: (a) => (a && a.beakMouth) ? beakMouth(id) : (a && a.mouthY === null) ? '' : mouth[id]((a && a.mouthY) || 210) }));

  /* birds whose beak IS the mouth (cockatiel): closed for calm faces, open for happy or surprised ones */
  function beakMouth(id) {
    const B = '#dcbcb3', BD = '#b58f86';
    const upper = (dy = 0) => P(`M186,${190 + dy} Q200,${181 + dy} 214,${190 + dy} Q215,${203 + dy} 203,${213 + dy} Q200,${216 + dy} 198,${212 + dy} Q186,${203 + dy} 186,${190 + dy}Z`, B, 3) + S(`M193,${193 + dy} Q200,${190 + dy} 207,${193 + dy}`, '#f2dcd6', 2.5);
    if (['open', 'grin', 'o', 'tongue'].includes(id)) {
      const wide = id === 'grin' ? 9 : id === 'o' ? 6 : 8;
      return E(200, 214, wide, id === 'o' ? 8 : 7, '#ff8fa8', 3) + (id === 'tongue' ? E(200, 219, 4.5, 3.5, '#ff6f86', 0) : '') +
        P(`M${200 - wide},214 Q200,${id === 'o' ? 230 : 228} ${200 + wide},214 Q200,221 ${200 - wide},214Z`, BD, 3) + upper(-4);
    }
    const lower = P('M192,207 Q200,213 208,207 Q206,217 200,218 Q194,217 192,207Z', BD, 3);
    const extra = id === 'frown' ? S('M190,224 Q200,219 210,224', '#5b3f58', 2.5) : id === 'smirk' ? S('M204,220 Q210,221 213,217', '#5b3f58', 2.5) : '';
    return lower + upper() + extra;
  }

  TT.BLUSH = [
    ['rosy', 'Rosy', () => SYM(E(130, 200, 17, 9.5, '#ff9ec0', 0, 'opacity=".8"'))],
    ['shy', 'Shy', () => SYM(E(130, 200, 17, 9.5, '#ffb3cc', 0, 'opacity=".6"') + S('M120,204 l6,-9 M129,205 l6,-9 M138,205 l6,-9', '#ff6f96', 2.6))],
    ['freckles', 'Freckles', () => SYM(C(124, 198, 2.6, '#d98a6a', 0) + C(134, 194, 2.6, '#d98a6a', 0) + C(132, 204, 2.6, '#d98a6a', 0) + C(142, 199, 2.6, '#d98a6a', 0))],
    ['hearts', 'Heart cheeks', () => SYM(TT.heart(130, 200, 7, '#ff8fb1', 0))],
    ['stars', 'Star stickers', () => SYM(TT.star(130, 202, 9, '#ffd34d', 2.5))]
  ].map(([id, name, f]) => ({ id, name, draw: f }));

  /* ---------------- tails ---------------- */
  function tail(a, F) {
    const dk = shade(F, 0.25);
    switch (a.tail) {
      case 'cat': return TUBE('M252,338 Q300,336 302,296 Q304,266 322,262', 14, F) + TUBE('M314,264 Q320,262 324,262', 14, dk);
      case 'dog': return TUBE('M254,340 Q290,334 298,302', 16, F);
      case 'fox': return P('M248,344 Q300,356 332,306 Q348,268 324,246 Q318,292 290,302 Q262,312 246,322Z', F) + P('M332,306 Q348,268 324,246 Q324,280 312,300 Z', '#fffaf2', 0);
      case 'puff': return C(264, 344, 18, tint(F, 0.4));
      case 'stub': return C(262, 346, 13, F);
      case 'curl': return S('M256,342 q16,0 16,-14 q0,-12 -10,-10 q-8,3 -2,10 q8,8 20,0', OL, 13) + S('M256,342 q16,0 16,-14 q0,-12 -10,-10 q-8,3 -2,10 q8,8 20,0', F, 6);
      case 'mouse': return S('M254,346 Q320,350 318,300 Q316,270 296,276', OL, 12) + S('M254,346 Q320,350 318,300 Q316,270 296,276', '#ffb3c4', 5);
      case 'ringed': {
        const rc = a.ringColor;
        return P('M246,340 Q296,360 330,312 Q350,276 330,252 Q322,250 314,258 Q314,294 290,306 Q264,316 246,322Z', F) +
          P('M322,284 Q330,270 328,256 L340,262 Q342,276 334,290Z', rc, 0) + P('M300,312 Q314,302 320,292 L332,300 Q324,314 310,322Z', rc, 0) + P('M274,322 Q288,318 296,312 L304,326 Q292,334 278,336Z', rc, 0);
      }
      case 'tiger': return TUBE('M252,340 Q300,340 304,296 Q306,268 324,262', 14, F) + S('M286,334 l6,10 M300,316 l11,4 M304,290 l12,0', '#c8643c', 5);
      case 'lion': return TUBE('M252,342 Q300,342 306,302', 9, F) + C(308, 292, 14, a.mane || '#ec9a5c');
      case 'bird': return P('M250,336 L282,326 L276,344 L286,354 L252,356Z', shade(F, 0.1));
      case 'unicorn': return P('M250,330 Q300,320 320,360 Q300,348 286,352 Q300,372 292,392 Q276,362 250,354Z', '#c9a8ff') + P('M252,336 Q290,332 304,360 Q286,350 270,352 Z', '#ffb3d1', 0) + P('M262,344 Q282,346 288,372 Q278,358 264,354Z', '#9cd3ff', 0);
      case 'axo': return P('M248,330 Q300,316 336,334 Q310,342 300,352 Q290,362 252,356Z', tint(F, 0.25)) + S('M262,340 Q292,334 320,336', shade(F, 0.15), 3);
      case 'fluff': return C(262, 342, 14, F) + C(272, 352, 12, F) + C(258, 354, 11, F);
      case 'tuft': return S('M254,344 Q290,348 300,318', OL, 12) + S('M254,344 Q290,348 300,318', F, 5) + P('M292,322 Q296,300 310,304 Q310,318 300,326 Z', '#7a6080', 3);
      case 'monkey': return TUBE('M252,342 Q314,344 314,292 Q314,262 290,266 Q276,270 284,286', 10, F);
      case 'longbird': return P('M246,330 Q292,344 300,404 Q284,396 276,372 Q272,404 258,418 Q258,382 246,356Z', '#b8b2c6') + S('M256,348 Q278,370 280,398', '#9e97ae', 2.5);
      case 'otter': return P('M248,336 Q300,340 328,300 Q332,314 318,334 Q296,358 250,356Z', F);
      case 'whale': return TUBE('M250,344 Q292,346 306,320', 16, F) + P('M300,322 Q290,300 300,290 Q310,304 308,316 Q322,304 336,306 Q326,318 312,326Z', F);
      case 'dragon': return TUBE('M250,344 Q306,354 320,316 Q326,298 340,290', 18, F) + P('M332,282 L362,276 L346,302 Z', '#7fd0b0') + P('M286,342 L296,326 L304,342 Z M310,320 L324,312 L322,330Z', '#7fd0b0', 3);
      default: return '';
    }
  }

  /* ---------------- body parts used by the renderer ---------------- */
  function limbColor(a, F) { return a.limb && a.limbOnly !== 'feet' ? a.limb : F; }
  function footColor(a, F) { return a.foot || (a.limb ? a.limb : F); }

  TT.critter = {
    tail: (a, F) => tail(a, F),
    legs: (a, F) => {
      const L = limbColor(a, F);
      return TUBE('M178,346 L178,398', 32, L) + TUBE('M222,346 L222,398', 32, L);
    },
    feet: (a, F) => {
      const f = footColor(a, F);
      return E(174, 408, 24, 14, f) + E(226, 408, 24, 14, f);
    },
    torso: (a, F) => {
      let belly = a.marks.includes('penguin') ? E(200, 306, 50, 50, a.alt, 0) : E(200, 312, 40, 36, a.alt, 0);
      return P(TT.SKEL.torso, F) + belly;
    },
    arms: (a, F) => TUBE(TT.SKEL.armL, 26, limbColor(a, F)) + TUBE(TT.SKEL.armR, 26, limbColor(a, F)),
    paws: (a, F) => C(115, 329, 15, limbColor(a, F)) + C(285, 329, 15, limbColor(a, F)),
    headBack: (a, F) => behindHead(a, F) + ears(a, F).back,
    head: (a, F) => E(200, 165, 98, 86, F) + marks(a, F),
    headFront: (a, F) => ears(a, F).front + muzzle(a, F) +
      (a.whiskers ? SYM(S('M118,198 L150,203 M120,214 L150,209', OL, 2.4, 'opacity=".55"')) : '') + frontExtras(a, F)
  };
})(window.TT);
