// ============================================================================
// arena-sfx.js — suara arena: efek (WebAudio, disintesis, tanpa berkas) dan
// pengumuman bersuara (Web Speech API, bahasa Indonesia, suara milik browser).
//
// Dipakai arena.html. Tiga tingkat, disimpan di browser ini saja:
//   0 mati · 1 efek · 2 efek + pengumuman
// Browser menolak bunyi sebelum ada sentuhan pengguna, jadi halaman memulai
// tingkat yang tersimpan hanya setelah klik pertama (tombol 🔊 atau di mana
// saja) — lihat `arm()`.
//
// Efek dibatasi lajunya: empat puluh roket yang menjawab bersamaan tidak boleh
// jadi hujan "whoosh". Pengumuman diantrekan; kalau menumpuk, yang lama
// dibuang — penonton butuh yang terbaru, bukan riwayat.
// ============================================================================

const LEVEL_KEY = 'lomba_arena_sound';

export function createArenaAudio() {
  let level = 0;
  try { level = Math.min(2, Math.max(0, +(localStorage.getItem(LEVEL_KEY) ?? 0) || 0)); } catch { /* privat */ }
  let armed = false;      // sudah ada sentuhan pengguna
  let ctx = null;
  let lastFx = {};        // nama → stempel waktu terakhir (pembatas laju)
  let voice = null;
  let voiceTried = false;

  // ── Konteks audio ─────────────────────────────────────────────────────────
  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function arm() {
    armed = true;
    if (level > 0) ac();
  }

  function setLevel(n) {
    level = Math.min(2, Math.max(0, n | 0));
    try { localStorage.setItem(LEVEL_KEY, String(level)); } catch { /* abaikan */ }
    if (level === 0) stopVoice();
    if (level > 0) ac();
  }

  // ── Pembangkit kecil ──────────────────────────────────────────────────────
  // Nada: osilator + amplop gain. `type` sine/triangle/square/sawtooth.
  function tone(freq, at, dur, { type = 'triangle', gain = 0.18, slideTo = null } = {}) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, at);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(c.destination);
    o.start(at); o.stop(at + dur + 0.05);
  }

  // Derau tersaring: untuk whoosh, gemuruh, drumroll.
  function noise(at, dur, { from = 400, to = 2600, gain = 0.25, q = 0.8 } = {}) {
    const c = ac(); if (!c) return;
    const n = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(from, at);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, to), at + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(at); src.stop(at + dur + 0.05);
  }

  const now = () => (ac()?.currentTime ?? 0);

  // ── Efek bernama ──────────────────────────────────────────────────────────
  const FX = {
    tick:    (t) => tone(880, t, 0.12, { type: 'sine', gain: 0.2 }),
    tock:    (t) => tone(660, t, 0.12, { type: 'sine', gain: 0.16 }),
    // Lepas landas: gemuruh naik + nada naik, 1,2 detik.
    liftoff: (t) => { noise(t, 1.2, { from: 80, to: 900, gain: 0.5, q: 0.5 }); tone(196, t, 1.0, { slideTo: 784, gain: 0.14, type: 'sawtooth' }); tone(392, t + 0.9, 0.5, { gain: 0.2 }); tone(523, t + 1.0, 0.6, { gain: 0.2 }); tone(784, t + 1.1, 0.8, { gain: 0.22 }); },
    // Boost: whoosh pendek (dibatasi: paling cepat tiap 250 ms).
    boost:   (t) => noise(t, 0.22, { from: 500, to: 3200, gain: 0.18 }),
    miss:    (t) => tone(220, t, 0.12, { type: 'sine', gain: 0.06 }),
    // Mendarat: tiga nada turun-lembut, seperti bel kedatangan.
    landing: (t) => { tone(784, t, 0.25, { gain: 0.16 }); tone(659, t + 0.14, 0.25, { gain: 0.16 }); tone(523, t + 0.28, 0.5, { gain: 0.18 }); },
    // Pimpinan berganti: dua nada naik, cerah.
    lead:    (t) => { tone(659, t, 0.16, { gain: 0.18 }); tone(988, t + 0.13, 0.35, { gain: 0.2 }); },
    school:  (t) => { tone(523, t, 0.14, { gain: 0.14 }); tone(659, t + 0.12, 0.3, { gain: 0.16 }); },
    minute:  (t) => { tone(880, t, 0.12, { type: 'sine', gain: 0.2 }); tone(880, t + 0.22, 0.12, { type: 'sine', gain: 0.2 }); },
    // Upacara: letupan kecil tiap baris 10→4.
    pop:     (t) => tone(1046, t, 0.09, { type: 'sine', gain: 0.12, slideTo: 1568 }),
    // Drumroll "Dan tiga besar…": derau pendek bertubi 2,2 detik.
    drumroll:(t) => { for (let i = 0; i < 22; i++) noise(t + i * 0.1, 0.09, { from: 150, to: 120, gain: 0.12 + i * 0.012, q: 1.2 }); },
    // Fanfare juara: triad naik + akor, 1,6 detik.
    fanfare: (t) => { const seq = [523, 659, 784, 1046]; seq.forEach((f, i) => tone(f, t + i * 0.14, 0.3, { gain: 0.2 })); [523, 659, 784, 1046].forEach(f => tone(f, t + 0.6, 1.0, { gain: 0.12 })); noise(t + 0.6, 1.0, { from: 3000, to: 6000, gain: 0.08, q: 0.3 }); },
    cheer:   (t) => { tone(659, t, 0.2, { gain: 0.16 }); tone(784, t + 0.15, 0.2, { gain: 0.16 }); tone(1046, t + 0.3, 0.5, { gain: 0.2 }); },
  };
  const MIN_GAP = { boost: 250, miss: 400, pop: 120, tick: 80 };

  function play(name) {
    if (level < 1 || !armed || !FX[name]) return;
    const gap = MIN_GAP[name] ?? 0;
    const t = Date.now();
    if (gap && t - (lastFx[name] ?? 0) < gap) return;
    lastFx[name] = t;
    try { FX[name](now() + 0.01); } catch { /* tanpa suara */ }
  }

  // ── Pengumuman (Web Speech) ───────────────────────────────────────────────
  function pickVoice() {
    if (voiceTried || !('speechSynthesis' in window)) return;
    const list = speechSynthesis.getVoices();
    if (!list.length) return;             // belum dimuat; coba lagi nanti
    voiceTried = true;
    const id = list.filter(v => /^id([-_]|$)/i.test(v.lang));
    // Suara daring Google lebih alami; kalau tidak ada, suara id-ID apa pun;
    // kalau tidak ada juga, biarkan browser memilih (aksen asing, tetap terbaca).
    voice = id.find(v => /google/i.test(v.name)) ?? id.find(v => !v.localService) ?? id[0] ?? null;
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.addEventListener?.('voiceschanged', () => { voiceTried = false; pickVoice(); });
  }

  /** "041" → "nol empat satu": nomor dieja per angka agar jelas di aula. */
  function ejaNomor(s) {
    const d = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    return String(s).replace(/\d/g, m => ' ' + d[+m]).trim();
  }
  /** Teks momen → kalimat yang enak dibaca: nomor dieja, simbol dibuang. */
  function humanise(text) {
    return String(text)
      .replace(/Peserta (\d{1,4})/g, (_, n) => `Peserta ${ejaNomor(n)}`)
      .replace(/·/g, ', ').replace(/—/g, ', ').replace(/\s+/g, ' ').trim();
  }

  const queue = [];
  let speaking = false;
  function pump() {
    if (speaking || !queue.length) return;
    const item = queue.shift();
    pickVoice();
    const u = new SpeechSynthesisUtterance(item.text);
    u.lang = voice?.lang ?? 'id-ID';
    if (voice) u.voice = voice;
    u.rate = item.rate ?? 1.0; u.pitch = 1.0; u.volume = 1.0;
    speaking = true;
    u.onend = u.onerror = () => { speaking = false; setTimeout(pump, 120); };
    try { speechSynthesis.speak(u); } catch { speaking = false; }
  }

  /** Ucapkan. `priority` membuang antrean lama (hitung mundur, podium). */
  function say(text, { priority = false, rate } = {}) {
    if (level < 2 || !armed || !('speechSynthesis' in window)) return;
    const t = humanise(text);
    if (!t) return;
    if (priority) { queue.length = 0; speechSynthesis.cancel(); speaking = false; }
    // Antrean maksimal 3: penonton butuh yang terbaru.
    if (queue.length >= 3) queue.shift();
    queue.push({ text: t, rate });
    pump();
  }

  function stopVoice() {
    queue.length = 0;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    speaking = false;
  }

  return {
    get level() { return level; },
    setLevel, arm, play, say, stopVoice, ejaNomor,
    get voiceAvailable() { return 'speechSynthesis' in window; },
  };
}
