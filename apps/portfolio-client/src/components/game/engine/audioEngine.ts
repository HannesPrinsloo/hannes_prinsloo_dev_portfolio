// Web Audio API helper for zero-latency synthesized sound effects without external files.
class AudioEngine {
    private ctx: AudioContext | null = null;
    private isInitialized = false;

    init() {
        if (this.isInitialized) return;
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    playJumpSound() {
        if (!this.ctx || !this.isInitialized) return;

        // Create an oscillator for a retro "piiiong" sound
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime); // start
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1); // zip up

        gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playCrashSound() {
        if (!this.ctx || !this.isInitialized) return;

        // Create a harsh sawtooth buzz
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3); // slide down

        gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playVictoryChime() {
        if (!this.ctx || !this.isInitialized) return;

        // Arpeggio
        const freqs = [440, 554.37, 659.25, 880]; // A maj chord
        for (let i = 0; i < freqs.length; i++) {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freqs[i], this.ctx.currentTime + i * 0.1);

            gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.3);

            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
        }
    }
}

export const audioEngine = new AudioEngine();
