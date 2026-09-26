/**
 * Web Audio API Sound Synthesizer
 * Zero-dependency, pure procedural audio engine for:
 * - Firework launch whoosh / whistle
 * - Explosion booms & sparkle crackles
 * - Balloon pop / float chimes
 * - Cake layer drop thuds (rising scale)
 * - Candle flame ignition
 * - Bubu blowing breath & flame extinguishing
 * - Celebratory Happy Birthday background melody
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;
    this.musicPlaying = false;
    this.musicTimeout = null;

    // Custom audio elements (supports mp3/wav files placed in assets/)
    this.duduLaughAudio = new Audio('assets/dudu_laugh.mp3');
    this.duduVoiceAudio = new Audio('assets/dudu_voice.mp3');
    this.duduLaughAudio.preload = 'auto';
    this.duduVoiceAudio.preload = 'auto';

    // Cached speech synthesis voice for Chinese cute mascot voice
    this.speechVoice = null;
    this.initSpeechSynthesis();

    // Happy Birthday notes (Note, Duration in beats)
    this.melody = [
      { note: 261.63, dur: 0.75 }, // C4
      { note: 261.63, dur: 0.25 },
      { note: 293.66, dur: 1.0 },  // D4
      { note: 261.63, dur: 1.0 },  // C4
      { note: 349.23, dur: 1.0 },  // F4
      { note: 329.63, dur: 2.0 },  // E4

      { note: 261.63, dur: 0.75 }, // C4
      { note: 261.63, dur: 0.25 },
      { note: 293.66, dur: 1.0 },  // D4
      { note: 261.63, dur: 1.0 },  // C4
      { note: 392.00, dur: 1.0 },  // G4
      { note: 349.23, dur: 2.0 },  // F4

      { note: 261.63, dur: 0.75 }, // C4
      { note: 261.63, dur: 0.25 },
      { note: 523.25, dur: 1.0 },  // C5
      { note: 440.00, dur: 1.0 },  // A4
      { note: 349.23, dur: 1.0 },  // F4
      { note: 329.63, dur: 1.0 },  // E4
      { note: 293.66, dur: 1.5 },  // D4

      { note: 466.16, dur: 0.75 }, // Bb4
      { note: 466.16, dur: 0.25 },
      { note: 440.00, dur: 1.0 },  // A4
      { note: 349.23, dur: 1.0 },  // F4
      { note: 392.00, dur: 1.0 },  // G4
      { note: 349.23, dur: 2.5 }   // F4
    ];
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          // Priority for cute, sweet Chinese voices (Xiaoxiao, Yaoyao, Chinese female/child voice)
          this.speechVoice = voices.find(v => 
            v.lang.startsWith('zh') && (v.name.includes('Xiaoxiao') || v.name.includes('Yaoyao') || v.name.includes('Natural') || v.name.includes('Female'))
          ) || voices.find(v => v.lang.startsWith('zh') || v.lang.includes('CN')) || null;
        } catch (e) {}
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicPlaying = false;
    } else if (this.enabled && !this.musicPlaying) {
      this.playBirthdaySong();
    }
    return this.enabled;
  }

  /**
   * Sound 1: Firework rocket launch whoosh
   */
  playLaunch() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.65);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.66);
    } catch (e) {}
  }

  /**
   * Sound 2: Firework detonation boom & crackle
   */
  playExplosion(pitch = 1.0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // Low frequency punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.51);

      // Noise buffer for crackle / boom texture
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200 * pitch, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.38);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.39);
    } catch (e) {}
  }

  /**
   * Sound 3: Balloon pop-in / inflate chirp
   */
  playBalloonPop(index = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51, 1396.91];
      const startFreq = freqs[index % freqs.length] || 523;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq * 0.7, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 1.3, now + 0.18);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  /**
   * Sound 4: Cake layer drop thump (musical ascending tones)
   */
  playCakeDrop(layer = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreqs = [220, 261.63, 329.63, 392.00, 440.00, 523.25];
      const f = baseFreqs[layer % baseFreqs.length];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * 1.2, now);
      osc.frequency.exponentialRampToValueAtTime(f, now + 0.08);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  /**
   * Sound 5: Candle flame ignition sparkle
   */
  playFlameIgnite() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.25);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {}
  }

  /**
   * Sound 6: Bubu blowing breath (gentle whoosh)
   */
  playBlowWind() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(650, now + 0.6);
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.7);
    } catch (e) {}
  }

  /**
   * Sound 7: Flame extinguishing (soft pfft)
   */
  playFlameExtinguish() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.21);
    } catch (e) {}
  }

  /**
   * Sound 7b: Dudu cute cheerful laughter after blowing out the candle flame!
   * Tries 'assets/dudu_laugh.mp3' first; automatically falls back to procedural giggle!
   */
  playDuduLaugh() {
    if (!this.enabled) return;
    this.resume();

    let playedFile = false;
    if (this.duduLaughAudio) {
      try {
        this.duduLaughAudio.currentTime = 0;
        const playPromise = this.duduLaughAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            playedFile = true;
          }).catch(() => {
            // Audio file absent or couldn't play; use procedural giggle
            this.playCuteCartoonGiggle();
          });
        }
      } catch (e) {
        this.playCuteCartoonGiggle();
      }
    } else {
      this.playCuteCartoonGiggle();
    }
  }

  /**
   * Procedural adorable cartoon baby giggle: "He-he-he-he-he!"
   * 5 playful jumping formant bursts simulating an adorable cartoon chuckling laugh
   */
  playCuteCartoonGiggle() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 5 bouncing giggle bursts: rapid, bouncy pitch trajectory (chuckle)
      const giggles = [
        { freq: 620, dur: 0.08, delay: 0.00 },
        { freq: 690, dur: 0.08, delay: 0.10 },
        { freq: 780, dur: 0.09, delay: 0.20 },
        { freq: 720, dur: 0.08, delay: 0.31 },
        { freq: 840, dur: 0.12, delay: 0.42 }
      ];

      giggles.forEach(g => {
        const t = now + g.delay;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Formant filter for cute open vocal laugh "he-he"
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(g.freq * 1.8, t);
        filter.Q.value = 3.2;

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(g.freq * 0.92, t);
        osc1.frequency.exponentialRampToValueAtTime(g.freq * 1.18, t + g.dur * 0.45);
        osc1.frequency.exponentialRampToValueAtTime(g.freq * 0.88, t + g.dur);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(g.freq * 2, t);
        osc2.frequency.exponentialRampToValueAtTime(g.freq * 2.1, t + g.dur * 0.5);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.20, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + g.dur);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + g.dur + 0.01);
        osc2.stop(t + g.dur + 0.01);
      });
    } catch (e) {}
  }

  /**
   * Sound 8: Dudu speaking "祝你生日快乐，希望你喜欢哦!"
   * 1. Plays custom audio file 'assets/dudu_voice.mp3' if present!
   * 2. Browser Web Speech API with cute cartoon pitch as voice synthesis!
   * 3. Celestial sparkle chime bell notes for magical atmosphere!
   */
  playDuduGreeting() {
    if (!this.enabled) return;
    this.resume();

    // Accompany with magical bell notes
    this.playCuteVoiceGreeting();

    // Try playing the voice audio file first
    let playedFile = false;
    if (this.duduVoiceAudio) {
      try {
        this.duduVoiceAudio.currentTime = 0;
        const playPromise = this.duduVoiceAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            playedFile = true;
          }).catch(() => {
            // Audio file absent or blocked, use cute SpeechSynthesis!
            this.speakGreetingText('祝你生日快乐，希望你喜欢哦！');
          });
        }
      } catch (e) {
        this.speakGreetingText('祝你生日快乐，希望你喜欢哦！');
      }
    } else {
      this.speakGreetingText('祝你生日快乐，希望你喜欢哦！');
    }
  }

  /**
   * Web Speech API: Real spoken Chinese with cute cartoon child/mascot pitch
   */
  speakGreetingText(text = '祝你生日快乐，希望你喜欢哦！') {
    if (!this.enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Clear any existing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.pitch = 1.75; // cute, sweet cartoon/child pitch
      utterance.rate = 1.05;  // lively natural speed
      utterance.volume = 1.0;

      if (this.speechVoice) {
        utterance.voice = this.speechVoice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        const zh = voices.find(v => v.lang.startsWith('zh') || v.lang.includes('CN'));
        if (zh) utterance.voice = zh;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  /**
   * Sound 8b: Cute cartoon mascot chime bell tones: "祝你生日快乐!"
   * 6 adorable, high-pitched vocal-formant bell tones
   */
  playCuteVoiceGreeting() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 6 cheerful syllables: Zhu(587Hz/D5), Ni(659Hz/E5), Sheng(784Hz/G5), Ri(659Hz/E5), Kuai(880Hz/A5), Le(1046Hz/C6)
      const syllables = [587.33, 659.25, 783.99, 659.25, 880.00, 1046.50];
      const step = 0.14; // rapid cute phrasing

      syllables.forEach((freq, idx) => {
        const t = now + idx * step;
        const osc = this.ctx.createOscillator();
        const oscHarmonic = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Vocal formant emulation
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, t);
        filter.Q.value = 3.0;

        osc.type = 'triangle';
        oscHarmonic.type = 'sine';

        // Cute upward pitch inflections
        osc.frequency.setValueAtTime(freq * 0.95, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
        oscHarmonic.frequency.setValueAtTime(freq * 2, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + step * 0.92);

        osc.connect(filter);
        oscHarmonic.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        oscHarmonic.start(t);
        osc.stop(t + step);
        oscHarmonic.stop(t + step);
      });
    } catch (e) {}
  }

  /**
   * Sound 9: Music Box Note for Birthday Melody
   */
  playMelodyNote(freq, duration) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.95);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {}
  }

  /**
   * Sound 10: Celestial Shooting Star & Wish Harp Chime
   * Dreamy celestial ascending arpeggio with shimmering resonance
   */
  playWishChime() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      // Dreamy ethereal pentatonic harp notes: C5, E5, G5, B5, D6, G6, B6
      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98, 1975.53];
      const step = 0.09;

      notes.forEach((freq, idx) => {
        const t = now + idx * step;
        const osc = this.ctx.createOscillator();
        const oscOvertone = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(300, t);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, t + 0.8);

        oscOvertone.type = 'triangle';
        oscOvertone.frequency.setValueAtTime(freq * 2, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

        osc.connect(filter);
        oscOvertone.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        oscOvertone.start(t);
        osc.stop(t + 1.22);
        oscOvertone.stop(t + 1.22);
      });
    } catch (e) {}
  }

  /**
   * Play the full "Happy Birthday" tune in background
   */
  playBirthdaySong() {
    if (!this.enabled || !this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;

    let index = 0;
    const tempo = 450; // ms per beat

    const step = () => {
      if (!this.enabled || !this.musicPlaying) return;

      if (index >= this.melody.length) {
        index = 0; // Loop after pause
        this.musicTimeout = setTimeout(step, 4000);
        return;
      }

      const item = this.melody[index];
      const durationSec = (item.dur * tempo) / 1000;
      this.playMelodyNote(item.note, durationSec);

      index++;
      this.musicTimeout = setTimeout(step, item.dur * tempo);
    };

    step();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }
}

// Global sound singleton
window.soundEngine = new SoundEngine();
