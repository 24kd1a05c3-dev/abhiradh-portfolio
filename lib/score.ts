// Original generative composition: "After Hours" — mellow lo-fi at 72 BPM. Browser audio only.
export class PortfolioScore {
  private context: AudioContext;
  private output: GainNode;
  private bus: GainNode;
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 0;
  private step = 0;
  private level = .45;
  private voices = new Set<OscillatorNode | AudioBufferSourceNode>();
  constructor() {
    this.context = new AudioContext();
    this.bus = this.context.createGain();
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -20; compressor.ratio.value = 4;
    this.output = this.context.createGain(); this.output.gain.value = 0;
    const warmth = this.context.createBiquadFilter(); warmth.type = 'lowpass'; warmth.frequency.value = 1800; warmth.Q.value = .4;
    this.bus.connect(warmth); warmth.connect(compressor); compressor.connect(this.output); this.output.connect(this.context.destination);
    const delay = this.context.createDelay(2), feedback = this.context.createGain(), wet = this.context.createGain();
    delay.delayTime.value = .4167; feedback.gain.value = .12; wet.gain.value = .07;
    this.bus.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(compressor);
  }
  private note(midi: number, time: number, duration: number, gain: number, type: OscillatorType = 'sine') {
    const oscillator = this.context.createOscillator(), envelope = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(gain, time + Math.min(.25, duration * .15));
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(envelope); envelope.connect(this.bus); this.voices.add(oscillator);
    oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(time); oscillator.stop(time + duration + .02);
  }
  private percussion(time: number, kind: 'kick' | 'snare' | 'hat') {
    const envelope = this.context.createGain(); envelope.connect(this.bus);
    if (kind === 'kick') {
      const oscillator = this.context.createOscillator();
      oscillator.frequency.setValueAtTime(105,time); oscillator.frequency.exponentialRampToValueAtTime(43,time+.13);
      envelope.gain.setValueAtTime(.15,time); envelope.gain.exponentialRampToValueAtTime(.0001,time+.28);
      oscillator.connect(envelope); this.voices.add(oscillator);
      oscillator.onended=()=>{this.voices.delete(oscillator);oscillator.disconnect();envelope.disconnect();};
      oscillator.start(time); oscillator.stop(time+.3); return;
    }
    const duration = kind === 'snare' ? .16 : .055;
    const buffer=this.context.createBuffer(1,Math.ceil(this.context.sampleRate*duration),this.context.sampleRate);
    const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
    const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter();source.buffer=buffer;
    filter.type=kind==='snare'?'bandpass':'highpass';filter.frequency.value=kind==='snare'?1100:3300;filter.Q.value=.6;
    envelope.gain.setValueAtTime(kind==='snare'?.065:.018,time);envelope.gain.exponentialRampToValueAtTime(.0001,time+duration);
    source.connect(filter);filter.connect(envelope);this.voices.add(source);
    source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();envelope.disconnect();};
    source.start(time);source.stop(time+duration);
  }
  private schedule = () => {
    const chords = [[48,55,59,62,64], [45,52,55,59,60], [41,53,57,60,64], [43,53,57,59,64]];
    while (this.next < this.context.currentTime + .3) {
      const bar = Math.floor(this.step / 16), position = this.step % 16;
      const chord = chords[bar % 4];
      // Soft electric-piano voicings, sparse melody and swung drum timing.
      if (position === 0 || position === 11) {
        chord.slice(1).forEach((pitch,i) => {
          this.note(pitch, this.next + i*.012, position===0?3.5:1.7, position===0?.038:.023);
          this.note(pitch, this.next + i*.012, 1.6, .009, 'triangle');
        });
      }
      if (position === 0 || position === 8) this.note(chord[0],this.next,2.2,.12);
      if ([0,7,10].includes(position)) this.percussion(this.next,'kick');
      if (position === 4 || position === 12) this.percussion(this.next+.018,'snare');
      if (position % 2 === 0) this.percussion(this.next+.008,'hat');
      if (bar % 2 === 1 && position === 6) this.note(chord[3]+12,this.next,1.3,.018);
      this.next += (60/72/2) * (position%2===0?1.12:.88); this.step++;
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

