// Original generative composition: "First Light" — original cinematic ambience at 68 BPM. Browser audio only.
export class PortfolioScore {
  private context: AudioContext;
  private output: GainNode;
  private bus: GainNode;
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 0;
  private step = 0;
  private level = .45;
  private voices = new Set<OscillatorNode>();
  constructor() {
    this.context = new AudioContext();
    this.bus = this.context.createGain();
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -20; compressor.ratio.value = 4;
    this.output = this.context.createGain(); this.output.gain.value = 0;
    const warmth = this.context.createBiquadFilter(); warmth.type = 'lowpass'; warmth.frequency.value = 1300; warmth.Q.value = .4;
    this.bus.connect(warmth); warmth.connect(compressor); compressor.connect(this.output); this.output.connect(this.context.destination);
    const delay = this.context.createDelay(2), feedback = this.context.createGain(), wet = this.context.createGain();
    delay.delayTime.value = .88235; feedback.gain.value = .26; wet.gain.value = .14;
    this.bus.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(compressor);
  }
  private note(midi: number, time: number, duration: number, gain: number, type: OscillatorType = 'sine', attack = .15, pan = 0) {
    const oscillator = this.context.createOscillator(), envelope = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(gain, time + Math.min(attack, duration * .4));
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    const panner = this.context.createStereoPanner(); panner.pan.value = pan;
    oscillator.connect(envelope); envelope.connect(panner); panner.connect(this.bus); this.voices.add(oscillator);
    oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); panner.disconnect(); };
    oscillator.start(time); oscillator.stop(time + duration + .02);
  }
  private schedule = () => {
    // Common tones and extended voicings keep each transition gentle.
    const chords = [[48,55,59,62,64], [45,55,59,60,64], [41,53,57,60,64], [43,55,57,60,64],
      [48,55,59,62,64], [52,55,59,62,66], [41,53,57,60,64], [43,55,59,62,64]];
    const phrase = [67,64,65,64,67,66,65,62];
    while (this.next < this.context.currentTime + .3) {
      const bar = Math.floor(this.step / 16) % 8, position = this.step % 16;
      const chord = chords[bar], swell = .72 + .28 * Math.sin(Math.PI * bar / 7) ** 2;
      if (position === 0) {
        // Eleven-second envelopes overlap seven-second harmonic changes.
        this.note(chord[0] - 12,this.next,11,.075*swell,'sine',2.4);
        chord.slice(1).forEach((pitch,i) => {
          this.note(pitch,this.next+i*.08,11,.032*swell,'sine',2.5,(i-1.5)*.22);
          this.note(pitch+12,this.next+i*.08,10,.008*swell,'triangle',3,(1.5-i)*.18);
        });
      }
      // A quiet low pulse replaces drums; melody only enters twice per phrase.
      if (position === 0 || position === 8) this.note(chord[0],this.next,2,.025,'sine',.25);
      if (position === 6 && bar % 2 === 0) this.note(phrase[bar],this.next,5,.021,'sine',.9,-.15);
      if (position === 12 && bar === 4) this.note(69,this.next,5,.014,'sine',1,.2);
      this.next += 60/68/2; this.step++;
    }
  };
  async play() {
    await this.context.resume();
    this.next = this.context.currentTime + .05;
    this.output.gain.cancelScheduledValues(this.context.currentTime);
    this.output.gain.setTargetAtTime(this.level, this.context.currentTime, .6);
    if (!this.timer) { this.schedule(); this.timer = setInterval(this.schedule, 100); }
  }
  async pause() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.output.gain.cancelScheduledValues(this.context.currentTime);
    this.output.gain.setTargetAtTime(0, this.context.currentTime, .08);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (this.context.state !== 'closed') await this.context.suspend();
    this.voices.forEach(voice => { try { voice.stop(); } catch {} });
  }
  setVolume(value: number) { this.level = value; if (this.timer) this.output.gain.setTargetAtTime(value, this.context.currentTime, .1); }
  dispose() { if (this.timer) clearInterval(this.timer); this.timer = null; void this.context.close(); }
}


