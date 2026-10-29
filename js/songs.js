/* Tiny Tailors — the song library for Runway Rhythm and the fashion show.
   Every song is built from its note chart: the lead melody IS the chart (each star plays its own note),
   with drums, bass and soft chords around it. So the notes always land right on the music. */
(function (TT) {
  const MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  // 'C5', 'F#3', 'Bb4' → frequency
  const hz = name => { const m = /^([A-G])([#b]?)(\d)$/.exec(name); const n = MIDI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12; return 440 * Math.pow(2, (n - 69) / 12); };

  /* level 1 = easy (fewer stars), 2 = medium, 3 = tricky (some half-beat stars).
     bass: one root note per bar, repeating. lanes: the four pose notes, low to high. */
  TT.SONGS = [
    { id: 'strut', name: 'Runway Strut', mood: 'Bouncy catwalk tune', level: 2, beat: 360, bar: 4, style: 'pop', lead: 'triangle', lanes: ['C5', 'E5', 'G5', 'C6'], bass: ['C3', 'F3', 'D3', 'G3'], color: '#ffd1e0' },
    { id: 'bubblegum', name: 'Bubblegum Pop', mood: 'Sweet and sparkly', level: 1, beat: 400, bar: 4, style: 'pop', lead: 'triangle', lanes: ['G4', 'B4', 'D5', 'G5'], bass: ['G2', 'E3', 'C3', 'D3'], color: '#ffd6ec' },
    { id: 'disco', name: 'Disco Kitty', mood: 'Shiny dance floor', level: 2, beat: 330, bar: 4, style: 'disco', lead: 'square', lanes: ['A4', 'C5', 'E5', 'A5'], bass: ['A2', 'F2', 'C3', 'G2'], minor: true, color: '#e6dcff' },
    { id: 'pixel', name: 'Pixel Party', mood: 'Retro video game beeps', level: 3, beat: 340, bar: 4, style: 'chip', lead: 'square', lanes: ['E5', 'G5', 'B5', 'E6'], bass: ['E3', 'C3', 'D3', 'B2'], minor: true, color: '#d5ecff' },
    { id: 'rock', name: "Rock 'n' Roll Bunny", mood: 'Loud and fast', level: 3, beat: 300, bar: 4, style: 'rock', lead: 'sawtooth', lanes: ['D5', 'F#5', 'A5', 'D6'], bass: ['D3', 'G3', 'A3', 'D3'], color: '#ffd9c7' },
    { id: 'tango', name: 'Tropical Tango', mood: 'Sunny beach rhythm', level: 2, beat: 380, bar: 4, style: 'latin', lead: 'triangle', lanes: ['F4', 'A4', 'C5', 'F5'], bass: ['F2', 'Bb2', 'C3', 'F2'], color: '#d7f3e6' },
    { id: 'march', name: 'Marching Mice', mood: 'Left, right, left!', level: 1, beat: 420, bar: 4, style: 'march', lead: 'square', lanes: ['Bb4', 'D5', 'F5', 'Bb5'], bass: ['Bb2', 'Eb3', 'F3', 'Bb2'], color: '#fff0c2' },
    { id: 'jazz', name: 'Jazz Paws', mood: 'Cool and swingy', level: 2, beat: 390, bar: 4, style: 'jazz', lead: 'sine', lanes: ['D5', 'F5', 'A5', 'C6'], bass: ['D3', 'G3', 'C3', 'A2'], minor: true, color: '#e3e0ff' },
    { id: 'hiphop', name: 'Hip-Hop Hamster', mood: 'Chill head-bopper', level: 2, beat: 440, bar: 4, style: 'hiphop', lead: 'triangle', lanes: ['C5', 'Eb5', 'G5', 'Bb5'], bass: ['C3', 'Ab2', 'Eb3', 'Bb2'], minor: true, color: '#f0e2ff' },
    { id: 'waltz', name: 'Moonlight Waltz', mood: 'Twirly 1-2-3', level: 1, beat: 420, bar: 3, style: 'waltz', lead: 'sine', lanes: ['G4', 'B4', 'D5', 'G5'], bass: ['G2', 'C3', 'D3', 'G2'], color: '#dfe8ff' },
    { id: 'lullaby', name: 'Sleepy Lullaby', mood: 'Slow and dreamy', level: 1, beat: 520, bar: 4, style: 'lullaby', lead: 'sine', lanes: ['E5', 'G5', 'A5', 'C6'], bass: ['C3', 'A2', 'F2', 'G2'], color: '#e8f4ff' }
  ];
  TT.songById = id => TT.SONGS.find(s => s.id === id) || TT.SONGS[0];
  TT.SONG_LEVEL = ['', 'Easy', 'Medium', 'Tricky'];

  const seedOf = id => [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  /* the stars: always the same for a given song, so you can practice it */
  TT.songChart = function (song) {
    const rnd = TT.rng(seedOf(song.id));
    const bars = song.bar === 3 ? 20 : 16;
    const notes = [];
    let lane = 1;
    const step = () => {
      const r = rnd();
      lane = r < 0.4 ? lane + 1 : r < 0.8 ? lane - 1 : Math.floor(rnd() * 4);
      if (lane > 3) lane = 2; if (lane < 0) lane = 1;
      return lane;
    };
    for (let bar = 0; bar < bars - 1; bar++) {
      const part = bar / (bars - 1); // 0 → 1 through the song: it gets busier
      for (let beat = 0; beat < song.bar; beat++) {
        const e = (bar * song.bar + beat) * 2; // in half-beats
        let on;
        if (song.level === 1) on = part < 0.3 ? beat % 2 === 0 : (beat !== song.bar - 1 || bar % 2 === 0);
        else if (song.level === 2) on = part < 0.25 ? beat % 2 === 0 : (beat !== song.bar - 1 || rnd() < 0.5);
        else on = part < 0.2 ? beat % 2 === 0 : true;
        if (on) notes.push({ e, lane: step() });
        // tricky songs add quick half-beat stars later on
        if (song.level === 3 && part > 0.45 && beat % 2 === 1 && rnd() < 0.45) notes.push({ e: e + 1, lane: step() });
      }
    }
    return { notes, bars };
  };

  /* turn a song into scheduled sound events.
     opts: { bars (how long), chart (use these stars as the melody), countIn (clicks before the start), volume } */
  TT.songEvents = function (song, opts = {}) {
    const B = song.beat / 1000, H = B / 2;
    const chart = opts.chart || TT.songChart(song);
    const bars = opts.bars || chart.bars;
    const ev = [];
    const add = (t, f, d, type, v, slide) => ev.push({ t, f, d, type, v: v * (opts.volume || 1), slide });
    const swing = song.style === 'jazz' ? 0.17 * B : 0; // jazz: off-beats come a little late
    const half = (beat, k) => beat * B + k * H + (k % 2 ? swing : 0);
    const kick = (t, v = 0.32) => add(t, 150, 0.16, 'sine', v, 0.35);
    const snare = (t, v = 0.12) => { add(t, 1400, 0.13, 'noise', v); add(t, 220, 0.07, 'triangle', v * 0.6); };
    const hat = (t, v = 0.04) => add(t, 7000, 0.035, 'noise', v);
    const third = song.minor ? 3 : 4;
    const semi = (f, n) => f * Math.pow(2, n / 12);

    if (opts.countIn) for (let k = 0; k < song.bar; k++) add((k - song.bar) * B, k === song.bar - 1 ? 1568 : 1175, 0.06, 'square', 0.05);

    for (let bar = 0; bar < bars; bar++) {
      const root = hz(song.bass[bar % song.bass.length]);
      const b0 = bar * song.bar; // first beat of this bar
      // soft chord under everything
      [2, 2 * Math.pow(2, third / 12), 3].forEach(m => add(b0 * B, root * m, song.bar * B * 0.95, 'triangle', 0.018));
      for (let beat = 0; beat < song.bar; beat++) {
        const bt = b0 + beat, t = bt * B;
        switch (song.style) {
          case 'pop':
            if (beat % 2 === 0) kick(t); else snare(t);
            hat(half(bt, 1));
            add(t, root, B * 0.8, 'sine', beat % 2 ? 0.07 : 0.12);
            break;
          case 'disco':
            kick(t); if (beat % 2) snare(t, 0.1);
            add(half(bt, 1), 9000, 0.09, 'noise', 0.05); // open hi-hat
            add(t, root, H * 0.9, 'sine', 0.12); add(half(bt, 1), root * 2, H * 0.9, 'sine', 0.09);
            break;
          case 'chip':
            kick(t, 0.25); if (beat % 2) add(t, 2000, 0.08, 'noise', 0.08);
            add(t, root, H * 0.8, 'square', 0.035); add(half(bt, 1), root * 2, H * 0.8, 'square', 0.03);
            break;
          case 'rock':
            if (beat === 0 || beat === 2 || (beat === 3 && bar % 2)) kick(t, 0.36); if (beat % 2) snare(t, 0.15);
            hat(t, 0.035); hat(half(bt, 1), 0.035);
            add(t, root, H * 0.85, 'sawtooth', 0.04); add(half(bt, 1), root, H * 0.85, 'sawtooth', 0.04);
            break;
          case 'latin':
            if (beat === 0 || beat === 2) kick(t, 0.28);
            if ([0, 3].includes(beat) || beat === 1 && bar % 2) add(beat === 1 ? half(bt, 1) : t, 2500, 0.03, 'square', 0.03); // clave clicks
            hat(half(bt, 1), 0.03);
            add(beat === 1 ? half(bt, 1) : t, beat === 1 ? semi(root, 7) : root, B * 0.6, 'sine', 0.12);
            break;
          case 'march':
            if (beat % 2 === 0) kick(t, 0.3); snare(t, beat % 2 ? 0.12 : 0.05); snare(half(bt, 1), 0.04);
            add(t, beat % 2 ? semi(root, 7) : root, B * 0.5, 'square', 0.04);
            break;
          case 'jazz':
            if (beat === 0 || beat === 2) kick(t, 0.18);
            add(t, 4500, 0.08, 'noise', 0.03); if (beat % 2) add(half(bt, 1), 4500, 0.05, 'noise', 0.025); // ride cymbal
            add(t, semi(root, [0, third, 7, 9][beat]), B * 0.9, 'sine', 0.13); // walking bass
            break;
          case 'hiphop':
            if (beat === 0) kick(t, 0.36); if (beat === 1 && bar % 2 === 0) kick(half(bt, 1), 0.3); if (beat === 2) kick(half(bt, 1), 0.28);
            if (beat % 2) snare(t, 0.14);
            hat(t, 0.03); hat(half(bt, 1), 0.03);
            if (beat === 0) add(t, root, B * 1.6, 'sine', 0.15);
            break;
          case 'waltz':
            if (beat === 0) { kick(t, 0.2); add(t, root, B * 0.9, 'sine', 0.14); }
            else { add(t, root * 2 * Math.pow(2, third / 12), B * 0.4, 'triangle', 0.035); add(t, root * 3, B * 0.4, 'triangle', 0.03); }
            break;
          case 'lullaby':
            if (beat === 0) add(t, root, B * 3.5, 'sine', 0.12);
            add(t, root * 4, 0.25, 'sine', 0.02); // music-box twinkle
            break;
        }
      }
    }
    // the melody: one note per star, exactly when it lands
    const lanes = song.lanes.map(hz);
    chart.notes.forEach(n => { if (n.e / 2 < bars * song.bar) add(half(Math.floor(n.e / 2), n.e % 2), lanes[n.lane], Math.min(0.3, B * 0.7), song.lead, song.lead === 'square' || song.lead === 'sawtooth' ? 0.06 : 0.14); });
    return { events: ev.filter(e => e.t >= -song.bar * B), chart, msOf: n => half(Math.floor(n.e / 2), n.e % 2) * 1000 };
  };

  /* background music for a stretch of time (fashion show) */
  TT.songFor = function (song, seconds) {
    const chart = TT.songChart(song);
    const songBars = chart.bars;
    const bars = Math.ceil(seconds / (song.beat / 1000 * song.bar));
    // repeat the chart as many times as needed
    const notes = [];
    for (let rep = 0; rep * songBars < bars; rep++) chart.notes.forEach(n => notes.push({ e: n.e + rep * songBars * song.bar * 2, lane: n.lane }));
    return TT.songEvents(song, { bars, chart: { notes, bars }, volume: 0.8 }).events;
  };
})(window.TT);
