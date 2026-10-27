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
    undo() { this.tone(600, 0.12, 'sine', 0.12, 0, 0.6); }
  };
  TT.Sound = Sound;
})(window.TT);
