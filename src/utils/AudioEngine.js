import rainSound from '../assets/sounds/rain.ogg';
import fireSound from '../assets/sounds/fire.ogg';
import wavesSound from '../assets/sounds/ocean-waves-376898.mp3';
import cricketsSound from '../assets/sounds/crickets-26444.mp3';

export const AudioEngine = {
    ctx: null,
    // Map to store active ambient sounds: id -> { source, gain, nodes: [], multiplier: 1, loading: boolean }
    activeAmbients: new Map(),

    // Global volume state
    masterAmbientVolume: 0.5,
    masterMusicVolume: 0.3,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {
                // Ignore autoplay policy errors, will resume on user interaction
            });
        }
        return this.ctx;
    },

    stopAll() {
        this.activeAmbients.forEach((sound, id) => {
            this.stopAmbient(id);
        });
        this.activeAmbients.clear();
    },

    stopAmbient(id) {
        const sound = this.activeAmbients.get(id);
        if (sound) {
            // If it's fully loaded, stop it
            if (!sound.loading) {
                try {
                    if (sound.source && sound.source.stop) sound.source.stop();
                    if (sound.nodes) sound.nodes.forEach((node) => node.disconnect());
                } catch (e) { }
            }
            // Remove from map (effectively cancelling load if still loading)
            this.activeAmbients.delete(id);
        }
    },

    noiseBuffer: null,

    createNoise(type = "white", bufferSize) {
        if (this.noiseBuffer) return this.noiseBuffer;
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
        this.noiseBuffer = buffer;
        return buffer;
    },

    // Cache for decoded audio buffers
    buffers: {},

    async loadSound(url) {
        if (this.buffers[url]) return this.buffers[url];
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers[url] = audioBuffer;
            return audioBuffer;
        } catch (error) {
            console.error("Failed to load sound:", url, error);
            return null;
        }
    },

    // Generic play function for ambient sounds
    async playAmbient(id, url, masterVol, multiplier = 1.0) {
        // If already playing or loading, stop it first to restart (or just return if we want to ignore duplicates)
        // For toggle behavior, we usually stop before play in App.jsx, but let's be safe.
        if (this.activeAmbients.has(id)) {
            this.stopAmbient(id);
        }

        // Mark as loading
        this.activeAmbients.set(id, { loading: true, multiplier });

        const ctx = this.init();
        const buffer = await this.loadSound(url);

        // Check if still active (wasn't stopped while loading)
        if (!this.activeAmbients.has(id)) return null;

        if (!buffer) {
            this.activeAmbients.delete(id);
            return null;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        // Use current master volume, ignoring the passed masterVol if we want to be strictly global-state driven,
        // but usually masterVol passed from App.jsx is the current state. 
        // Let's use the internal state if available to ensure sync.
        const currentVol = this.masterAmbientVolume;
        gainNode.gain.value = currentVol * multiplier;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();

        // Update map with actual nodes
        this.activeAmbients.set(id, {
            loading: false,
            source,
            gain: gainNode,
            nodes: [source, gainNode],
            multiplier
        });

        return gainNode;
    },

    playRain(vol) {
        return this.playAmbient("sound_rain", rainSound, vol, 1.0);
    },

    playFire(vol) {
        return this.playAmbient("sound_fire", fireSound, vol, 1.0);
    },

    playWaves(vol) {
        return this.playAmbient("sound_waves", wavesSound, vol, 1.0);
    },

    playCrickets(vol) {
        return this.playAmbient("sound_night", cricketsSound, vol, 0.2);
    },

    playWind(vol) {
        return this.playAmbient("sound_wind", rainSound, vol, 0.5);
    },

    playWhite(vol) {
        const id = "sound_white";
        if (this.activeAmbients.has(id)) this.stopAmbient(id);

        // Mark loading (though white noise is sync-ish, good practice)
        this.activeAmbients.set(id, { loading: true, multiplier: 0.3 });

        const ctx = this.init();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = this.createNoise("white", bufferSize);

        // Check if cancelled
        if (!this.activeAmbients.has(id)) return null;

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 800; // Softer
        const gain = ctx.createGain();
        const multiplier = 0.3;

        const currentVol = this.masterAmbientVolume;
        gain.gain.value = currentVol * multiplier;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();

        this.activeAmbients.set(id, {
            loading: false,
            source: noise,
            gain: gain,
            nodes: [noise, filter, gain],
            multiplier
        });
        return gain;
    },

    setAmbientVolume(vol) {
        this.masterAmbientVolume = vol;
        if (!this.ctx) return;
        this.activeAmbients.forEach((sound) => {
            if (!sound.loading && sound.gain) {
                const targetVol = vol * sound.multiplier;
                try {
                    sound.gain.gain.cancelScheduledValues(this.ctx.currentTime);
                    sound.gain.gain.setValueAtTime(targetVol, this.ctx.currentTime);
                } catch (e) {
                    sound.gain.gain.value = targetVol;
                }
            }
        });
    },

    // Music Layer
    musicNode: null,
    musicGain: null,
    musicLoading: false,

    async playMusic(url, vol) {
        if (this.musicNode || this.musicLoading) return; // Already playing or loading

        this.musicLoading = true;
        const ctx = this.init();
        const buffer = await this.loadSound(url);

        if (!this.musicLoading) return null; // Cancelled while loading

        if (!buffer) {
            this.musicLoading = false;
            return null;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        const currentVol = this.masterMusicVolume;
        gainNode.gain.value = currentVol;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start();

        this.musicNode = source;
        this.musicGain = gainNode;
        this.musicLoading = false;
        return gainNode;
    },

    stopMusic() {
        this.musicLoading = false; // Cancel load if happening
        if (this.musicNode) {
            try {
                this.musicNode.stop();
                this.musicNode.disconnect();
                this.musicGain.disconnect();
            } catch (e) { }
            this.musicNode = null;
            this.musicGain = null;
        }
    },

    setMusicVolume(vol) {
        this.masterMusicVolume = vol;
        if (!this.ctx) return;
        if (this.musicGain) {
            try {
                this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
                this.musicGain.gain.setValueAtTime(vol, this.ctx.currentTime);
            } catch (e) {
                this.musicGain.gain.value = vol;
            }
        }
    },
};
