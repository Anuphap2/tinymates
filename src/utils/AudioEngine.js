export const AudioEngine = {
    ctx: null,
    nodes: [],

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
        return this.ctx;
    },

    stopAll() {
        this.nodes.forEach((node) => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (e) { }
        });
        this.nodes = [];
    },

    createNoise(type = "white", bufferSize) {
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (type === "pink") {
                data[i] = (lastOut + 0.02 * white) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            } else if (type === "brown") {
                data[i] = (lastOut + 0.02 * white) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            } else {
                data[i] = white;
            }
        }
        return buffer;
    },

    playRain(vol) {
        this.stopAll();
        const ctx = this.init();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = this.createNoise("pink", bufferSize);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 800;
        const gain = ctx.createGain();
        gain.gain.value = vol * 0.8;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        this.nodes.push(noise, gain, filter);
        return gain;
    },

    playFire(vol) {
        this.stopAll();
        const ctx = this.init();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = this.createNoise("brown", bufferSize);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 500;
        const crackleGain = ctx.createGain();
        crackleGain.gain.value = vol;
        noise.connect(filter);
        filter.connect(crackleGain);
        crackleGain.connect(ctx.destination);
        noise.start();
        this.nodes.push(noise, filter, crackleGain);
        return crackleGain;
    },

    playWaves(vol) {
        this.stopAll();
        const ctx = this.init();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = this.createNoise("pink", bufferSize);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.Q.value = 1;
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 600;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        filter.frequency.value = 400;
        const mainGain = ctx.createGain();
        mainGain.gain.value = vol * 0.5;
        noise.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);
        noise.start();
        lfo.start();
        this.nodes.push(noise, filter, lfo, lfoGain, mainGain);
        return mainGain;
    },

    playCrickets(vol) {
        this.stopAll();
        const ctx = this.init();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = this.createNoise("white", bufferSize);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 2000;
        const mainGain = ctx.createGain();
        mainGain.gain.value = vol * 0.05;
        noise.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);
        noise.start();
        this.nodes.push(noise, filter, mainGain);
        return mainGain;
    },

    playWhite(vol) {
        this.stopAll();
        const ctx = this.init();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = this.createNoise("white", bufferSize);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 500;
        const gain = ctx.createGain();
        gain.gain.value = vol * 0.5;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        this.nodes.push(noise, filter, gain);
        return gain;
    },
};
