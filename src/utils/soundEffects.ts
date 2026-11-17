/**
 * Sound Effects & Ambient Space Audio Engine using Web Audio API
 * Generates tactile, sci-fi UI feedback and a subtle, low-volume continuous
 * 'ambient space' atmospheric drone loop without external audio dependencies.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.15; // Pleasant, non-intrusive UI SFX volume

  // Ambient Space Loop Nodes
  private ambientPlaying: boolean = false;
  private ambientMasterGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientNoiseSource: AudioBufferSourceNode | null = null;
  private ambientVolume: number = 0.038; // Subtle, low-volume atmospheric pad

  constructor() {
    try {
      const saved = localStorage.getItem('portfolio_sound_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
      const savedAmbient = localStorage.getItem('portfolio_ambient_space');
      if (savedAmbient === 'true' && !this.muted) {
        this.ambientPlaying = true;
      }
    } catch {
      this.muted = false;
    }
  }

  private notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ambient-audio-state-changed', {
          detail: {
            muted: this.muted,
            ambientPlaying: this.ambientPlaying
          }
        })
      );
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isAmbientPlaying(): boolean {
    return this.ambientPlaying && !this.muted;
  }

  /**
   * Starts the subtle, low-volume 'ambient space' audio loop.
   * Synthesizes a warm cosmic pad (A1/E2/A2/E3 harmonic drone + slow 0.08Hz LFO filter sweep + cosmic air texture).
   */
  public startAmbientSpace(): boolean {
    const ctx = this.initContext();
    if (!ctx) return false;

    this.muted = false;
    try {
      localStorage.setItem('portfolio_sound_muted', 'false');
      localStorage.setItem('portfolio_ambient_space', 'true');
    } catch {
      // ignore
    }

    // If nodes are already active, smoothly restore gain
    if (this.ambientMasterGain && this.ambientOscillators.length > 0) {
      try {
        const now = ctx.currentTime;
        this.ambientMasterGain.gain.cancelScheduledValues(now);
        this.ambientMasterGain.gain.setValueAtTime(this.ambientMasterGain.gain.value, now);
        this.ambientMasterGain.gain.linearRampToValueAtTime(this.ambientVolume, now + 0.8);
        this.ambientPlaying = true;
        this.notifyListeners();
        return true;
      } catch {
        this.cleanupAmbientNodes();
      }
    }

    try {
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(this.ambientVolume, now + 1.4);
      masterGain.connect(ctx.destination);
      this.ambientMasterGain = masterGain;

      // Low-pass filter modulated by a slow respiration LFO (0.085 Hz ~ 12s period)
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(260, now);
      padFilter.Q.setValueAtTime(1.8, now);
      padFilter.connect(masterGain);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.085, now); // Slow cosmic breathing pulse
      lfoGain.gain.setValueAtTime(110, now); // Sweeps cutoff between 150Hz and 370Hz
      lfo.connect(lfoGain);
      lfoGain.connect(padFilter.frequency);
      lfo.start(now);

      // Harmonic frequencies for a deep-space A-minor9 / suspended fifth chord pad
      const layers: Array<{ freq: number; type: OscillatorType; detune: number; gain: number }> = [
        { freq: 55.0, type: 'sine', detune: 0, gain: 0.45 },       // A1 deep sub-bass foundation
        { freq: 82.41, type: 'sine', detune: -4, gain: 0.32 },     // E2 fifth harmonic
        { freq: 110.0, type: 'triangle', detune: 5, gain: 0.22 },  // A2 warm body
        { freq: 164.81, type: 'sine', detune: -6, gain: 0.16 },    // E3 celestial shimmer
        { freq: 246.94, type: 'sine', detune: 8, gain: 0.09 }      // B3 airy 9th overtone
      ];

      const oscList: OscillatorNode[] = [lfo];

      layers.forEach((layer) => {
        const osc = ctx.createOscillator();
        const layerGain = ctx.createGain();
        osc.type = layer.type;
        osc.frequency.setValueAtTime(layer.freq, now);
        osc.detune.setValueAtTime(layer.detune, now);
        layerGain.gain.setValueAtTime(layer.gain, now);
        osc.connect(layerGain);
        layerGain.connect(padFilter);
        osc.start(now);
        oscList.push(osc);
      });

      // Subtle cosmic air texture using filtered noise loop
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(320, now);
      noiseFilter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseNode.start(now);

      this.ambientNoiseSource = noiseNode;
      this.ambientOscillators = oscList;
      this.ambientPlaying = true;
      this.notifyListeners();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Smoothly fades out and stops the ambient space audio loop.
   */
  public stopAmbientSpace(): void {
    this.ambientPlaying = false;
    try {
      localStorage.setItem('portfolio_ambient_space', 'false');
    } catch {
      // ignore
    }

    if (this.ctx && this.ambientMasterGain) {
      try {
        const now = this.ctx.currentTime;
        this.ambientMasterGain.gain.cancelScheduledValues(now);
        this.ambientMasterGain.gain.setValueAtTime(this.ambientMasterGain.gain.value, now);
        this.ambientMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.45);
        setTimeout(() => {
          if (!this.ambientPlaying) {
            this.cleanupAmbientNodes();
          }
        }, 500);
      } catch {
        this.cleanupAmbientNodes();
      }
    } else {
      this.cleanupAmbientNodes();
    }
    this.notifyListeners();
  }

  private cleanupAmbientNodes(): void {
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.ambientOscillators = [];

    if (this.ambientNoiseSource) {
      try {
        this.ambientNoiseSource.stop();
        this.ambientNoiseSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientNoiseSource = null;
    }

    if (this.ambientMasterGain) {
      try {
        this.ambientMasterGain.disconnect();
      } catch {
        // ignore
      }
      this.ambientMasterGain = null;
    }
  }

  /**
   * Toggles the ambient space loop (and unmutes audio when enabling).
   */
  public toggleAmbientSpace(): boolean {
    if (this.isAmbientPlaying()) {
      this.stopAmbientSpace();
      return false;
    } else {
      this.startAmbientSpace();
      this.playToggle(true);
      return true;
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('portfolio_sound_muted', String(this.muted));
    } catch {
      // ignore
    }
    if (this.muted) {
      this.stopAmbientSpace();
    } else {
      this.startAmbientSpace();
      this.playToggle(true);
    }
    this.notifyListeners();
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem('portfolio_sound_muted', String(this.muted));
    } catch {
      // ignore
    }
    if (muted) {
      this.stopAmbientSpace();
    }
    this.notifyListeners();
  }

  // --- Audio Generators ---

  /** Subtle micro hover sound */
  public playHover(freq = 1600) {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // silent catch
    }
  }

  /** Tactile high-tech micro click for buttons & links */
  public playClick(freq = 1200) {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // silent catch
    }
  }

  /** Soft tactile blip for switching tabs, filter pills */
  public playTab(freq = 880) {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq * 1.2, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // silent catch
    }
  }

  /** Mode toggle sound (Showcase / Grid / On / Off) */
  public playToggle(isOn = true) {
    if (this.muted && !isOn) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      if (isOn) {
        osc1.frequency.setValueAtTime(520, now);
        osc1.frequency.exponentialRampToValueAtTime(980, now + 0.08);
      } else {
        osc1.frequency.setValueAtTime(980, now);
        osc1.frequency.exponentialRampToValueAtTime(520, now + 0.08);
      }

      gain1.gain.setValueAtTime(this.volume * 0.9, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.1);
    } catch {
      // silent catch
    }
  }

  /** Speed preset change sound: pitch scales with 0.5x, 1.0x, 1.5x, 2.0x */
  public playSpeedChange(multiplier = 1.0) {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const baseFreq = 440;
      const targetFreq = baseFreq * Math.max(0.6, multiplier);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(targetFreq * 0.8, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq * 1.25, now + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // silent catch
    }
  }

  /** Futuristic modal open whoosh */
  public playModalOpen() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // silent catch
    }
  }

  /** Modal close chirp */
  public playModalClose() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.09);

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // silent catch
    }
  }

  /** Harmonic chime on success/message sent */
  public playSuccess() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(this.volume * 0.6, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } catch {
      // silent catch
    }
  }
}

export const soundFx = new SoundEffectsEngine();
