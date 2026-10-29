/* Tiny Tailors — tiny synth sounds (no audio files needed). */
(function (TT) {
  let ctx = null;
  const Sound = {
    on: true,
    wake() {
      if (!ctx) {
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
      }
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    tone(freq, dur = 0.12, type = 'sine', vol = 0.18, when = 0, slide = 0) {
      if (!this.on || !ctx) return;
      const t = ctx.currentTime + when;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    },
    pop() { this.tone(520 + Math.random() * 260, 0.14, 'sine', 0.2, 0, 1.9); },
    tap() { this.tone(880, 0.05, 'triangle', 0.08); },
    swatch() { this.tone(660 + Math.random() * 200, 0.09, 'triangle', 0.12, 0, 1.3); },
    sparkle() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.12, i * 0.06)); },
    whoosh() { [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.12, i * 0.045)); },
    shutter() {
      if (!this.on || !ctx) return;
      const len = 0.08, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = ctx.createBufferSource(), g = ctx.createGain(); g.gain.value = 0.25;
      s.buffer = buf; s.connect(g).connect(ctx.destination); s.start();
      this.tone(1320, 0.1, 'sine', 0.1, 0.06);
    },
    cheer() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.14, i * 0.09)); },
    undo() { this.tone(600, 0.12, 'sine', 0.12, 0, 0.6); },
    coin() { [988, 1319].forEach((f, i) => this.tone(f, 0.12, 'square', 0.06, i * 0.08)); },
    /* a bouncy little loop for dancing and the runway */
    music: null,
    startMusic() {
      this.stopMusic(); this.wake();
      const mel = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 988, 784, 659, 587];
      const bass = [131, 131, 175, 175, 147, 147, 196, 196];
      let i = 0;
      this.music = setInterval(() => {
        if (!this.on) return;
        this.tone(mel[i % mel.length], 0.16, 'triangle', 0.07);
        if (i % 2 === 0) this.tone(bass[(i / 2) % bass.length], 0.22, 'sine', 0.1);
        if (i % 4 === 2) this.tone(2200, 0.03, 'square', 0.02);
        i++;
      }, 180);
    },
    stopMusic() { if (this.music) clearInterval(this.music); this.music = null; if (this.song) { this.song.stop(); this.song = null; } },
    /* A whole song scheduled on the audio clock, so it never drifts from a game's notes.
       events: [{ t: seconds from start, f: freq, d: duration, type, v: volume, slide }]
       Returns { start (audio-clock seconds), clockMs() → ms since the song started, as heard, stop() }. */
    song: null,
    playSong(events, leadSec) {
      this.stopMusic(); this.wake();
      const fallback0 = performance.now() + leadSec * 1000;
      if (!ctx) {
        const s = { clockMs: () => performance.now() - fallback0, stop() { } };
        this.song = s; return s;
      }
      const bus = ctx.createGain(); bus.gain.value = this.on ? 1 : 0; bus.connect(ctx.destination);
      const start = ctx.currentTime + leadSec;
      // what we hear lags what we schedule by the device's output latency (bigger on Bluetooth)
      const lat = (ctx.outputLatency || ctx.baseLatency || 0) * 1000;
      events.forEach(e => {
        const t = start + e.t;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = e.type || 'triangle';
        o.frequency.setValueAtTime(e.f, t);
        if (e.slide) o.frequency.exponentialRampToValueAtTime(e.f * e.slide, t + e.d);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(e.v || 0.1, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + e.d);
        o.connect(g).connect(bus);
        o.start(t); o.stop(t + e.d + 0.03);
      });
      const s = {
        // if the browser hasn't let audio start yet, keep time with the regular clock so the game never freezes
        clockMs: () => ctx.state === 'running' ? (ctx.currentTime - start) * 1000 - lat : performance.now() - fallback0,
        stop: () => { try { bus.gain.cancelScheduledValues(ctx.currentTime); bus.gain.setValueAtTime(0, ctx.currentTime); bus.disconnect(); } catch (e) { } }
      };
      this.song = s;
      return s;
    },
    say(text) {
      try {
        if (!('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.pitch = 1.3;
        speechSynthesis.speak(u);
      } catch (e) { }
    }
  };
  TT.Sound = Sound;
})(window.TT);
